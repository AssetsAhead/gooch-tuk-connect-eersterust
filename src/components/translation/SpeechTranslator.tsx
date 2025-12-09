import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Mic, MicOff, Volume2, Loader2, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SUPPORTED_LANGUAGES = [
  { code: 'en-ZA', name: 'English', speechCode: 'en-ZA' },
  { code: 'af-ZA', name: 'Afrikaans', speechCode: 'af-ZA' },
  { code: 'zu-ZA', name: 'isiZulu', speechCode: 'zu-ZA' },
  { code: 'xh-ZA', name: 'isiXhosa', speechCode: 'xh-ZA' },
  { code: 'nso-ZA', name: 'Sepedi', speechCode: 'nso-ZA' },
  { code: 'tn-ZA', name: 'Setswana', speechCode: 'tn-ZA' },
  { code: 'st-ZA', name: 'Sesotho', speechCode: 'st-ZA' },
  { code: 'ts-ZA', name: 'Xitsonga', speechCode: 'ts-ZA' },
  { code: 'ss-ZA', name: 'siSwati', speechCode: 'ss-ZA' },
  { code: 've-ZA', name: 'Tshivenda', speechCode: 've-ZA' },
  { code: 'nr-ZA', name: 'isiNdebele', speechCode: 'nr-ZA' },
  { code: 'fr-FR', name: 'French', speechCode: 'fr-FR' },
  { code: 'de-DE', name: 'German', speechCode: 'de-DE' },
  { code: 'pt-PT', name: 'Portuguese', speechCode: 'pt-PT' },
];

const COMMON_PHRASES = [
  { category: 'Greetings', phrases: [
    { text: 'Hello, where would you like to go?', icon: '👋' },
    { text: 'Good morning!', icon: '🌅' },
    { text: 'Thank you for the ride!', icon: '🙏' },
  ]},
  { category: 'Directions', phrases: [
    { text: 'Turn left here please', icon: '⬅️' },
    { text: 'Turn right at the next street', icon: '➡️' },
    { text: 'Go straight ahead', icon: '⬆️' },
    { text: 'Stop here please', icon: '🛑' },
    { text: 'Please slow down', icon: '🐢' },
  ]},
  { category: 'Payment', phrases: [
    { text: 'How much is the fare?', icon: '💰' },
    { text: 'Can I pay with cash?', icon: '💵' },
    { text: 'Keep the change', icon: '🪙' },
  ]},
  { category: 'Emergency', phrases: [
    { text: 'I need help', icon: '🆘' },
    { text: 'Please call the police', icon: '🚔' },
    { text: 'I feel unwell', icon: '🤒' },
  ]},
];

interface SpeechTranslatorProps {
  onTranslation?: (original: string, translated: string, targetLang: string) => void;
  compact?: boolean;
}

export const SpeechTranslator = ({ onTranslation, compact = false }: SpeechTranslatorProps) => {
  const [sourceLanguage, setSourceLanguage] = useState('en-ZA');
  const [targetLanguage, setTargetLanguage] = useState('zu-ZA');
  const [autoDetect, setAutoDetect] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [activeTab, setActiveTab] = useState('speak');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    // Use a broad language setting for auto-detect, or specific language
    recognitionRef.current.lang = autoDetect ? 'en-ZA' : sourceLanguage;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setOriginalText('');
      setTranslatedText('');
      setDetectedLang('');
    };

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setOriginalText(transcript);
      setIsListening(false);
      await translateText(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in your browser settings.');
      } else if (event.error !== 'aborted') {
        toast.error('Speech recognition failed. Please try again.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Failed to start listening');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const translateText = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-speech', {
        body: {
          text,
          sourceLanguage: autoDetect ? undefined : sourceLanguage,
          targetLanguage,
          detectLanguage: autoDetect,
        },
      });

      if (error) throw error;

      const translated = data.translatedText;
      setTranslatedText(translated);
      
      if (data.sourceLanguage && autoDetect) {
        setDetectedLang(data.sourceLanguage);
      }
      
      onTranslation?.(text, translated, targetLanguage);
      
      // Automatically speak the translation
      speakText(translated, targetLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const translatePhrase = async (phrase: string) => {
    setOriginalText(phrase);
    setActiveTab('speak');
    await translateText(phrase);
  };

  const speakText = (text: string, langCode: string) => {
    if (!synthRef.current || !text) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    setOriginalText('');
    setTranslatedText('');
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Translate</span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-detect-compact" className="text-xs text-muted-foreground">Auto-detect</Label>
            <Switch
              id="auto-detect-compact"
              checked={autoDetect}
              onCheckedChange={setAutoDetect}
              className="scale-75"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!autoDetect && (
            <>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={swapLanguages}>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </>
          )}
          
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className={`h-8 text-xs ${autoDetect ? 'flex-1' : 'flex-1'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Common phrases - compact */}
        <div className="flex flex-wrap gap-1">
          {COMMON_PHRASES[0].phrases.slice(0, 2).map((phrase, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => translatePhrase(phrase.text)}
              disabled={isTranslating}
            >
              {phrase.icon} {phrase.text.slice(0, 15)}...
            </Button>
          ))}
        </div>

        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isTranslating}
          variant={isListening ? "destructive" : "default"}
          className="w-full"
          size="sm"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              {autoDetect ? 'Speak (Auto-detect)' : 'Speak to Translate'}
            </>
          )}
        </Button>

        {(originalText || translatedText) && (
          <div className="space-y-2 text-xs">
            {originalText && (
              <div className="p-2 bg-background rounded border">
                <span className="text-muted-foreground">
                  Original{detectedLang ? ` (${detectedLang})` : ''}: 
                </span>
                {originalText}
              </div>
            )}
            {translatedText && (
              <div className="p-2 bg-primary/10 rounded border border-primary/20 flex items-start justify-between gap-2">
                <div>
                  <span className="text-primary font-medium">Translated: </span>
                  {translatedText}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => speakText(translatedText, targetLanguage)}
                  disabled={isSpeaking}
                >
                  <Volume2 className={`h-3 w-3 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Languages className="h-5 w-5 text-primary" />
          Speech Translator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="speak" className="flex items-center gap-1">
              <Mic className="h-3 w-3" />
              Speak
            </TabsTrigger>
            <TabsTrigger value="phrases" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Phrases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speak" className="space-y-4 mt-4">
            {/* Auto-detect toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label htmlFor="auto-detect" className="text-sm font-medium">Auto-detect language</Label>
              </div>
              <Switch
                id="auto-detect"
                checked={autoDetect}
                onCheckedChange={setAutoDetect}
              />
            </div>

            <div className="flex items-center gap-3">
              {!autoDetect && (
                <>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Speak in</label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="mt-5"
                    onClick={swapLanguages}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <div className={autoDetect ? "w-full" : "flex-1"}>
                <label className="text-xs text-muted-foreground mb-1 block">Translate to</label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isTranslating}
              variant={isListening ? "destructive" : "default"}
              className="w-full"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Translating...
                </>
              ) : isListening ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Tap to Stop
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  {autoDetect ? 'Tap to Speak (Auto-detect)' : 'Tap to Speak'}
                </>
              )}
            </Button>

            {isListening && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening...
              </div>
            )}

            {(originalText || translatedText) && (
              <div className="space-y-3">
                {originalText && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Original{detectedLang ? ` (${detectedLang})` : ''}
                    </div>
                    <p className="text-sm">{originalText}</p>
                  </div>
                )}
                {translatedText && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-primary font-medium">Translation</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => speakText(translatedText, targetLanguage)}
                        disabled={isSpeaking}
                      >
                        <Volume2 className={`h-4 w-4 mr-1 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                        {isSpeaking ? 'Speaking...' : 'Play'}
                      </Button>
                    </div>
                    <p className="text-sm font-medium">{translatedText}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="phrases" className="space-y-4 mt-4">
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1 block">Translate to</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {COMMON_PHRASES.map((category) => (
                <div key={category.category}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {category.category}
                  </h4>
                  <div className="grid gap-2">
                    {category.phrases.map((phrase, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="justify-start h-auto py-2 px-3 text-left"
                        onClick={() => translatePhrase(phrase.text)}
                        disabled={isTranslating}
                      >
                        <span className="mr-2">{phrase.icon}</span>
                        <span className="text-sm">{phrase.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {translatedText && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-primary font-medium">Translation</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => speakText(translatedText, targetLanguage)}
                    disabled={isSpeaking}
                  >
                    <Volume2 className={`h-4 w-4 mr-1 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                    {isSpeaking ? 'Speaking...' : 'Play'}
                  </Button>
                </div>
                <p className="text-sm font-medium">{translatedText}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
