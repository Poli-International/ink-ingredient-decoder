import React from 'react';
import {
  Scale,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ArrowRight,
  Info,
  Tag,
  FileSearch,
} from 'lucide-react';
import { t } from '../lib/i18n';

interface PlainLanguagePanelProps {
  onGoToDecoder?: () => void;
}

export const PlainLanguagePanel: React.FC<PlainLanguagePanelProps> = ({ onGoToDecoder }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] text-[var(--accent)] border border-[var(--border)] shrink-0 mt-0.5">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--brand-cyan)] font-bold uppercase tracking-wider">
              EU Regulation (EU) 2020/2081 · REACH Annex XVII Entry 75
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
              {t('plain_language_panel.title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-3xl">
              {t('plain_language_panel.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Who is Responsible for Compliance */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--accent)] shrink-0" />
          {t('plain_language_panel.section1_title')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] font-medium">
          {t('plain_language_panel.section1_lead')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
              {t('plain_language_panel.section1_maker_title')}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('plain_language_panel.section1_maker_desc')}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--safe-text)]" />
              {t('plain_language_panel.section1_artist_title')}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('plain_language_panel.section1_artist_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. What a Bottle Label Must Physically Say */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--accent)] shrink-0" />
          {t('plain_language_panel.section2_title')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('plain_language_panel.section2_lead')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
          <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)] shrink-0 mt-0.5" />
            <span className="text-[var(--text-primary)] leading-relaxed">{t('plain_language_panel.section2_item1')}</span>
          </div>
          <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)] shrink-0 mt-0.5" />
            <span className="text-[var(--text-primary)] leading-relaxed">{t('plain_language_panel.section2_item2')}</span>
          </div>
          <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)] shrink-0 mt-0.5" />
            <span className="text-[var(--text-primary)] leading-relaxed">{t('plain_language_panel.section2_item3')}</span>
          </div>
          <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)] shrink-0 mt-0.5" />
            <span className="text-[var(--text-primary)] leading-relaxed">{t('plain_language_panel.section2_item4')}</span>
          </div>
          <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)] shrink-0 mt-0.5" />
            <span className="text-[var(--text-primary)] leading-relaxed">{t('plain_language_panel.section2_item5')}</span>
          </div>
          <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)] shrink-0 mt-0.5" />
            <span className="text-[var(--text-primary)] leading-relaxed">{t('plain_language_panel.section2_item6')}</span>
          </div>
        </div>
      </div>

      {/* 3. What SDS Section 3 Is */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--accent)] shrink-0" />
          {t('plain_language_panel.section3_title')}
        </h3>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {t('plain_language_panel.section3_lead')}
        </p>
        <div className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>{t('plain_language_panel.section3_desc1')}</p>
          <p>{t('plain_language_panel.section3_desc2')}</p>
        </div>
      </div>

      {/* 4. Prohibited vs Restricted vs Not Covered */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          {t('plain_language_panel.section4_title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Prohibited */}
          <div className="p-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              {t('plain_language_panel.section4_prohibited_title')}
            </div>
            <p className="text-xs leading-relaxed opacity-95">
              {t('plain_language_panel.section4_prohibited_desc')}
            </p>
          </div>

          {/* Restricted */}
          <div className="p-4 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {t('plain_language_panel.section4_restricted_title')}
            </div>
            <p className="text-xs leading-relaxed opacity-95">
              {t('plain_language_panel.section4_restricted_desc')}
            </p>
          </div>

          {/* Not Covered */}
          <div className="p-4 rounded-lg border border-[var(--safe-border)] bg-[var(--safe-bg)] text-[var(--safe-text)] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {t('plain_language_panel.section4_not_covered_title')}
            </div>
            <p className="text-xs leading-relaxed opacity-95">
              {t('plain_language_panel.section4_not_covered_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Why "REACH Compliant" on a Bottle Is Not a Guarantee */}
      <div className="rounded-lg border border-[var(--brand-cyan)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--brand-cyan)] shrink-0" />
          {t('plain_language_panel.section5_title')}
        </h3>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {t('plain_language_panel.section5_lead')}
        </p>
        <div className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>{t('plain_language_panel.section5_desc1')}</p>
          <p>{t('plain_language_panel.section5_desc2')}</p>
        </div>

        {onGoToDecoder && (
          <div className="pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              id="plain_guide_to_decoder_btn"
              onClick={onGoToDecoder}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t('plain_language_panel.cta_test_decoder')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
