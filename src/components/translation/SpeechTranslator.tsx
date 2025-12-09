import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Mic, MicOff, Volume2, Loader2, ArrowRight } from 'lucide-react';
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

interface SpeechTranslatorProps {
  onTranslation?: (original: string, translated: string, targetLang: string) => void;
  compact?: boolean;
}

export const SpeechTranslator = ({ onTranslation, compact = false }: SpeechTranslatorProps) => {
  const [sourceLanguage, setSourceLanguage] = useState('en-ZA');
  const [targetLanguage, setTargetLanguage] = useState('zu-ZA');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
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
    recognitionRef.current.lang = sourceLanguage;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setOriginalText('');
      setTranslatedText('');
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
          sourceLanguage,
          targetLanguage,
        },
      });

      if (error) throw error;

      const translated = data.translatedText;
      setTranslatedText(translated);
      
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

  const speakText = (text: string, langCode: string) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
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
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Translate</span>
        </div>
        
        <div className="flex items-center gap-2">
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
          
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
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
              Speak to Translate
            </>
          )}
        </Button>

        {(originalText || translatedText) && (
          <div className="space-y-2 text-xs">
            {originalText && (
              <div className="p-2 bg-background rounded border">
                <span className="text-muted-foreground">Original: </span>
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
        <div className="flex items-center gap-3">
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
          
          <div className="flex-1">
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
              Tap to Speak
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
                <div className="text-xs text-muted-foreground mb-1">Original</div>
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
      </CardContent>
    </Card>
  );
};
