import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceHailButtonProps {
  onDestinationDetected: (destination: string) => void;
  onHailTriggered?: () => void;
  disabled?: boolean;
}

const SUPPORTED_LANGUAGES = [
  // South African Official Languages
  { code: 'en-ZA', name: 'English (SA)', flag: '🇿🇦' },
  { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu-ZA', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh-ZA', name: 'isiXhosa', flag: '🇿🇦' },
  { code: 'nso-ZA', name: 'Sepedi', flag: '🇿🇦' },
  { code: 'tn-ZA', name: 'Setswana', flag: '🇿🇦' },
  { code: 'st-ZA', name: 'Sesotho', flag: '🇿🇦' },
  { code: 'ts-ZA', name: 'Xitsonga', flag: '🇿🇦' },
  { code: 'ss-ZA', name: 'siSwati', flag: '🇿🇦' },
  { code: 've-ZA', name: 'Tshivenda', flag: '🇿🇦' },
  { code: 'nr-ZA', name: 'isiNdebele', flag: '🇿🇦' },
  // International Languages
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
];

// Multilingual patterns for destination extraction
const DESTINATION_PATTERNS: Record<string, RegExp[]> = {
  'en': [
    /(?:hail|get|call|book|find|take me|go|ride|taxi)\s*(?:a\s*)?(?:ride|taxi|tuk|tuktuk)?\s*(?:to|for)?\s*(?:the\s*)?(.*)/i,
    /(?:i\s*(?:need|want)\s*(?:a\s*)?(?:ride|taxi|tuk)?\s*(?:to|for)?\s*(?:the\s*)?)(.*)/i,
    /(?:take me to\s*(?:the\s*)?)(.*)/i,
    /(?:going to\s*(?:the\s*)?)(.*)/i,
  ],
  'af': [
    /(?:ry|gaan|neem my|taxi)\s*(?:na|tot)?\s*(?:die\s*)?(.*)/i,
    /(?:ek wil|ek soek)\s*(?:'n\s*)?(?:rit|taxi)?\s*(?:na|tot)?\s*(?:die\s*)?(.*)/i,
  ],
  'zu': [
    /(?:ngisa|ngiya|hamba)\s*(?:e|ku)?\s*(.*)/i,
    /(?:ngifuna|ngidinga)\s*(?:ukuya)?\s*(?:e|ku)?\s*(.*)/i,
  ],
  'xh': [
    /(?:ndisa|ndiya|hamba)\s*(?:e|ku)?\s*(.*)/i,
    /(?:ndifuna|ndidinga)\s*(?:ukuya)?\s*(?:e|ku)?\s*(.*)/i,
  ],
  'fr': [
    /(?:emmène-moi|amène-moi|aller|va)\s*(?:à|au|aux)?\s*(?:la|le|l')?\s*(.*)/i,
    /(?:je veux|je voudrais)\s*(?:aller)?\s*(?:à|au|aux)?\s*(?:la|le|l')?\s*(.*)/i,
  ],
  'de': [
    /(?:bring mich|fahr mich|geh|fahre)\s*(?:zu|zum|zur|nach)?\s*(?:dem|der|den)?\s*(.*)/i,
    /(?:ich will|ich möchte)\s*(?:zu|zum|zur|nach)?\s*(?:dem|der|den)?\s*(.*)/i,
  ],
  'pt': [
    /(?:leva-me|vai|ir)\s*(?:para|ao|à|a)?\s*(?:o|a)?\s*(.*)/i,
    /(?:eu quero|preciso)\s*(?:ir)?\s*(?:para|ao|à|a)?\s*(?:o|a)?\s*(.*)/i,
  ],
};

const VoiceHailButton: React.FC<VoiceHailButtonProps> = ({
  onDestinationDetected,
  onHailTriggered,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [selectedLang, setSelectedLang] = useState('en-ZA');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = selectedLang;
        setRecognition(recognitionInstance);
      }
    }
  }, [selectedLang]);

  const extractDestination = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase();
    const langPrefix = selectedLang.split('-')[0];
    
    // Get patterns for selected language, fallback to English
    const patterns = DESTINATION_PATTERNS[langPrefix] || DESTINATION_PATTERNS['en'];

    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        const destination = match[1].trim();
        if (destination.length > 2) {
          return destination.replace(/\b\w/g, l => l.toUpperCase());
        }
      }
    }

    // If no pattern matched but text is short, treat whole thing as destination
    if (lowerText.length > 2 && lowerText.length < 50) {
      return text.trim().replace(/\b\w/g, l => l.toUpperCase());
    }

    return null;
  }, [selectedLang]);

  const startListening = useCallback(() => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    // Update language before starting
    recognition.lang = selectedLang;
    
    setIsListening(true);
    setTranscript('');
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      setTranscript(transcriptText);

      if (result.isFinal) {
        setIsProcessing(true);
        const destination = extractDestination(transcriptText);
        
        if (destination) {
          toast.success(`Destination: ${destination}`);
          onDestinationDetected(destination);
          onHailTriggered?.();
        } else {
          const langName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'your language';
          toast.info(`Say your destination in ${langName}`);
        }
        
        setIsProcessing(false);
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in settings.');
      } else if (event.error === 'language-not-supported') {
        toast.error('This language may not be fully supported by your browser.');
      } else if (event.error !== 'aborted') {
        toast.error('Voice recognition error. Please try again.');
      }
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';
      toast.info(`Listening in ${langName}...`);
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [recognition, selectedLang, extractDestination, onDestinationDetected, onHailTriggered]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  if (!recognition) {
    return null;
  }

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedLang} onValueChange={setSelectedLang} disabled={isListening}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue>
              {currentLang && `${currentLang.flag} ${currentLang.name}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="text-xs text-muted-foreground px-2 py-1 font-medium">South African</div>
            {SUPPORTED_LANGUAGES.filter(l => l.code.endsWith('-ZA')).map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-sm">
                {lang.flag} {lang.name}
              </SelectItem>
            ))}
            <div className="text-xs text-muted-foreground px-2 py-1 font-medium mt-1">International</div>
            {SUPPORTED_LANGUAGES.filter(l => !l.code.endsWith('-ZA')).map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-sm">
                {lang.flag} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mic Button */}
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="lg"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || isProcessing}
        className="h-16 w-16 rounded-full p-0 transition-all duration-200"
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      <span className="text-xs text-muted-foreground text-center">
        {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Hail'}
      </span>
      
      {transcript && isListening && (
        <p className="text-sm text-muted-foreground italic max-w-48 text-center">
          "{transcript}"
        </p>
      )}
    </div>
  );
};

export default VoiceHailButton;
