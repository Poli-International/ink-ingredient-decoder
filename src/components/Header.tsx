import React from 'react';
import { Wifi, WifiOff, RefreshCw, Sun, Moon, User, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/database';
import { t, SupportedLocale } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOnline: boolean;
  profile: UserProfile;
  auditsCount: number;
  syncTimestamp: string;
  onOpenProfile: () => void;
  onOpenSync: () => void;
  currentLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  isOnline,
  profile,
  auditsCount,
  syncTimestamp,
  onOpenProfile,
  onOpenSync,
  currentLocale,
  onSelectLocale,
}) => {
  return (
    <header className="no-print border-b border-[var(--border)] pb-6 mb-6">
      {/* Top Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)] text-xs">
        {/* Offline / Online Sync Status Pill */}
        <button
          type="button"
          id="open_sync_modal_btn"
          onClick={onOpenSync}
          className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-[var(--text-secondary)]"
          title={t('header.sync_title')}
        >
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-[var(--safe-text)]">
              <Wifi className="w-3.5 h-3.5" />
              <span className="font-semibold">{t('header.local_ready')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[var(--warning-text)]">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="font-semibold">{t('header.offline')}</span>
            </span>
          )}
          <span className="text-[var(--border)]">|</span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <RefreshCw className="w-3 h-3" />
            <span>
              {auditsCount === 1
                ? t('header.local_db_singular', { count: String(auditsCount) })
                : t('header.local_db_plural', { count: String(auditsCount) })}
            </span>
          </span>
          <span className="text-[var(--text-muted)] text-[11px]">({syncTimestamp})</span>
        </button>

        {/* Right actions: Language Switcher, Theme toggle, and User Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher
            currentLocale={currentLocale}
            onSelectLocale={onSelectLocale}
            idPrefix="header"
          />

          {/* Theme switch */}
          <button
            type="button"
            id="toggle_theme_btn"
            onClick={onToggleTheme}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label={theme === 'dark' ? t('header.switch_light') : t('header.switch_dark')}
            title={theme === 'dark' ? t('header.switch_light') : t('header.switch_dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--warning-text)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--brand-cyan)]" />
            )}
          </button>

          {/* Artist / Studio Profile Avatar Trigger */}
          <button
            type="button"
            id="open_profile_modal_btn"
            onClick={onOpenProfile}
            className="min-h-[44px] flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer text-[var(--text-primary)]"
            title={t('header.profile_title')}
          >
            {profile.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt={profile.name}
                className="w-6 h-6 rounded-full object-cover border border-[var(--brand-cyan)]"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tag)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-left leading-tight hidden sm:block">
              <div className="font-semibold text-xs truncate max-w-[120px]">
                {profile.name || t('header.default_artist')}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] truncate max-w-[120px]">
                {profile.studioName || t('header.default_studio')}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border)] text-[var(--brand-cyan)] mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
          <span>{t('app.version_tag')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          {t('app.title')}
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('app.subtitle')}
        </p>
      </div>
    </header>
  );
};
