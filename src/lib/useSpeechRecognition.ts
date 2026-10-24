import { useState, useEffect, useRef, useCallback } from 'react';
import { SupportedLocale } from './i18n';

interface SpeechRecognitionOptions {
  locale: SupportedLocale;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

// Map app locales to BCP-47 speech recognition language tags
const LOCALE_TO_SPEECH_LANG: Record<SupportedLocale, string> = {
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  nl: 'nl-NL',
  pt: 'pt-PT',
  th: 'th-TH',
};

/**
 * Normalizes spoken phrases into standard ingredient formatting:
 * e.g. "ci seven seven two six six" -> "CI 77266"
 * e.g. "comma" / "komma" / "virgule" -> ", "
 */
export function formatSpokenIngredientText(raw: string): string {
  let formatted = raw;

  // Replace spoken punctuation in multiple languages
  formatted = formatted
    .replace(/\b(?:comma|komma|virgule|virgola|v[ií]rgula)\b/gi, ', ')
    .replace(/\b(?:period|punkt|point|punto|ponto)\b/gi, '. ')
    .replace(/\b(?:new line|neue zeile|nouvelle ligne|nueva l[ií]nea)\b/gi, '\n');

  // Format Colour Index references (e.g., "ci 77266", "C.I. 77266", "colour index 77266")
  formatted = formatted
    .replace(/\b(?:c\.?i\.?|colour\s*index|color\s*index)\s*(\d{5})\b/gi, 'CI $1')
    .replace(/\bci\b/gi, 'CI');

  // Clean up duplicate commas and whitespace
  formatted = formatted
    .replace(/\s*,\s*/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/\s{2,}/g, ' ');

  return formatted;
}

export function useSpeechRecognition({
  locale,
  onFinalTranscript,
  onError,
}: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = LOCALE_TO_SPEECH_LANG[locale] || 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          const cleanedFinal = formatSpokenIngredientText(final);
          onFinalTranscript?.(cleanedFinal);
        }

        setInterimTranscript(formatSpokenIngredientText(interim));
      };

      rec.onerror = (event: any) => {
        const error = event.error || 'speech_error';
        setErrorMessage(error);
        onError?.(error);
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = rec;
    } catch {
      recognitionRef.current = null;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors on cleanup
        }
      }
    };
  }, [locale, isSupported, onFinalTranscript, onError]);

  // Update language when locale changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LOCALE_TO_SPEECH_LANG[locale] || 'en-US';
    }
  }, [locale]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setInterimTranscript('');
    if (!recognitionRef.current) {
      setErrorMessage('not_supported');
      return;
    }
    try {
      recognitionRef.current.start();
    } catch {
      // Already running or starting
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}
