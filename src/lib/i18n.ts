import { useState, useEffect, useCallback } from 'react';
import enDict from '../locales/en.json';
import frDict from '../locales/fr.json';
import itDict from '../locales/it.json';
import deDict from '../locales/de.json';
import esDict from '../locales/es.json';
import nlDict from '../locales/nl.json';
import ptDict from '../locales/pt.json';
import thDict from '../locales/th.json';

export type SupportedLocale = 'en' | 'fr' | 'it' | 'de' | 'es' | 'nl' | 'pt' | 'th';
export type TranslationKey = string;

export interface LocaleOption {
  code: SupportedLocale;
  label: string;      // Native name of the language
  region: string;     // Short badge (EN, DE, ES, FR, IT, NL, PT)
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', label: 'English', region: 'EN' },
  { code: 'de', label: 'Deutsch', region: 'DE' },
  { code: 'es', label: 'Español', region: 'ES' },
  { code: 'fr', label: 'Français', region: 'FR' },
  { code: 'it', label: 'Italiano', region: 'IT' },
  { code: 'nl', label: 'Nederlands', region: 'NL' },
  { code: 'pt', label: 'Português', region: 'PT' },
  { code: 'th', label: 'ไทย', region: 'TH' },
];

export const dictionaries: Record<SupportedLocale, Record<string, any>> = {
  en: enDict,
  fr: frDict,
  it: itDict,
  de: deDict,
  es: esDict,
  nl: nlDict,
  pt: ptDict,
  th: thDict,
};

let currentLocale: SupportedLocale = 'en';

type LocaleListener = (locale: SupportedLocale) => void;
const listeners = new Set<LocaleListener>();

type DataRefresher = (locale: SupportedLocale) => void;
const dataRefreshers = new Set<DataRefresher>();

export function registerDataRefresher(refresher: DataRefresher): () => void {
  dataRefreshers.add(refresher);
  // Execute once for current locale
  try {
    refresher(currentLocale);
  } catch (err) {
    console.error('Initial data refresher error:', err);
  }
  return () => {
    dataRefreshers.delete(refresher);
  };
}

export function subscribeLocale(listener: LocaleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Safely initialize from localStorage or html lang attribute if present in browser
if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
  try {
    const saved = window.localStorage.getItem('poli_reach_decoder_locale');
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'it' || saved === 'de' || saved === 'es' || saved === 'nl' || saved === 'pt' || saved === 'th')) {
      currentLocale = saved;
      document.documentElement.lang = saved;
    } else if (document.documentElement.lang) {
      const docLang = document.documentElement.lang.slice(0, 2).toLowerCase();
      if (docLang === 'fr' || docLang === 'it' || docLang === 'de' || docLang === 'es' || docLang === 'nl' || docLang === 'pt' || docLang === 'th') {
        currentLocale = docLang;
      }
    }
  } catch {
    // localStorage might be unavailable
  }
}

export function getLocale(): SupportedLocale {
  return currentLocale;
}

export function setLocale(locale: SupportedLocale): void {
  if (dictionaries[locale]) {
    currentLocale = locale;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('poli_reach_decoder_locale', locale);
        document.documentElement.lang = locale;
      } catch {
        // ignore
      }
    }

    // Refresh in-memory data translations
    dataRefreshers.forEach((refresher) => {
      try {
        refresher(locale);
      } catch (err) {
        console.error('Data refresher error:', err);
      }
    });

    // Notify React listeners for automatic UI re-rendering
    listeners.forEach((listener) => {
      try {
        listener(locale);
      } catch (err) {
        console.error('Locale listener error:', err);
      }
    });
  }
}

/**
 * React hook to access current locale and setLocale function,
 * automatically triggering reactive re-renders when the locale changes.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => getLocale());

  useEffect(() => {
    return subscribeLocale((newLoc) => {
      setLocaleState(newLoc);
    });
  }, []);

  const changeLocale = useCallback((newLoc: SupportedLocale) => {
    setLocale(newLoc);
  }, []);

  return { locale, setLocale: changeLocale, t };
}

/**
 * Lightweight synchronous translation function.
 * Accesses keys using dot notation (e.g., 'nav.paste_label')
 * Supports parameter token replacement, e.g. {count} or {total}.
 */
export function t(key: string, params?: Record<string, string | number>, locale?: SupportedLocale): string {
  const activeLocale = locale || currentLocale;
  const dict = dictionaries[activeLocale] || enDict;
  const parts = key.split('.');
  let current: unknown = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
    }
  }

  // Fallback to English dictionary if key is not found in requested locale
  if (typeof current !== 'string' && activeLocale !== 'en') {
    let fallback: unknown = enDict;
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in (fallback as Record<string, unknown>)) {
        fallback = (fallback as Record<string, unknown>)[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    if (typeof fallback === 'string') {
      current = fallback;
    }
  }

  if (typeof current !== 'string') {
    return key; // fallback to key
  }

  let text = current;
  if (params) {
    for (const [paramKey, val] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    }
  }

  return text;
}

/**
 * Returns a translated array of strings (e.g., synonyms or application lists).
 */
export function tArray(key: string, locale?: SupportedLocale): string[] {
  const activeLocale = locale || currentLocale;
  const dict = dictionaries[activeLocale] || enDict;
  const parts = key.split('.');
  let current: unknown = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
    }
  }

  // Fallback to English dictionary if array not found in requested locale
  if (!Array.isArray(current) && activeLocale !== 'en') {
    let fallback: unknown = enDict;
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in (fallback as Record<string, unknown>)) {
        fallback = (fallback as Record<string, unknown>)[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    if (Array.isArray(fallback)) {
      current = fallback;
    }
  }

  if (Array.isArray(current)) {
    return current.map(String);
  }
  return [];
}
