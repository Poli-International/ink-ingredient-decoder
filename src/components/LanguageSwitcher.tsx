import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SupportedLocale, SUPPORTED_LOCALES, t } from '../lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  idPrefix?: string;
  variant?: 'header' | 'compact' | 'footer';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale,
  onSelectLocale,
  idPrefix = 'header',
  variant = 'header',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const currentOption = SUPPORTED_LOCALES.find((l) => l.code === currentLocale) || SUPPORTED_LOCALES[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation inside the listbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const curIdx = SUPPORTED_LOCALES.findIndex((l) => l.code === currentLocale);
        setFocusedIndex(curIdx >= 0 ? curIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % SUPPORTED_LOCALES.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + SUPPORTED_LOCALES.length) % SUPPORTED_LOCALES.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < SUPPORTED_LOCALES.length) {
          handleSelect(SUPPORTED_LOCALES[focusedIndex].code);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = useCallback(
    (code: SupportedLocale) => {
      onSelectLocale(code);
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [onSelectLocale]
  );

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        id={`${idPrefix}_language_switcher_btn`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('languages.select_label')}
        title={t('languages.current', { lang: currentOption.label })}
        className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent ${
          variant === 'footer' ? 'text-[11px] py-1.5' : ''
        }`}
      >
        <Globe className="w-4 h-4 text-[var(--brand-cyan)] shrink-0" />
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[var(--bg-tag)] text-[var(--brand-cyan)] border border-[var(--border)]">
          {currentOption.region}
        </span>
        <span className="font-semibold text-[var(--text-primary)] hidden md:inline">
          {currentOption.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ maxHeight: '380px' }}
        >
          <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {t('languages.select_label')}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {SUPPORTED_LOCALES.length} {t('languages.select_label').toLowerCase()}
            </span>
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label={t('languages.select_label')}
            className="py-1 overflow-y-auto max-h-72 divide-y divide-[var(--border-subtle)]"
          >
            {SUPPORTED_LOCALES.map((loc, idx) => {
              const isSelected = loc.code === currentLocale;
              const isFocused = idx === focusedIndex;
              const inLanguageName = t(`languages.${loc.code}`);

              return (
                <li
                  key={loc.code}
                  role="option"
                  id={`${idPrefix}_lang_opt_${loc.code}`}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(loc.code)}
                  className={`min-h-[44px] flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-[var(--brand-cyan)]/10 text-[var(--text-primary)] font-medium'
                      : isFocused
                      ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-bold font-mono tracking-wider border ${
                        isSelected
                          ? 'bg-[var(--brand-cyan)] text-white border-[var(--brand-cyan)]'
                          : 'bg-[var(--bg-tag)] text-[var(--text-secondary)] border-[var(--border)]'
                      }`}
                    >
                      {loc.region}
                    </span>
                    <div className="text-left">
                      <div
                        className={`text-xs ${
                          isSelected ? 'font-bold text-[var(--text-primary)]' : 'font-medium'
                        }`}
                      >
                        {loc.label}
                      </div>
                      {inLanguageName && inLanguageName !== loc.label && (
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {inLanguageName}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--brand-cyan)] shrink-0 ml-2" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
