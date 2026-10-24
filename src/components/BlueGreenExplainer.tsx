import React from 'react';
import { Calendar, AlertOctagon, Info, ArrowRight } from 'lucide-react';
import { t } from '../lib/i18n';

interface BlueGreenExplainerProps {
  onDecodeFormulation?: (text: string) => void;
}

export const BlueGreenExplainer: React.FC<BlueGreenExplainerProps> = ({ onDecodeFormulation }) => {
  const sampleBlueGreen =
    'Pigment Blue 15:3 (CI 74160, CAS 147-14-8), Pigment Green 7 (CI 74260, CAS 1328-53-6), Aqua, Glycerin';

  return (
    <div className="space-y-6">
      {/* Top Banner with Transition Date */}
      <div className="rounded-lg border-2 border-[var(--danger-border)] bg-[var(--danger-bg)] p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-full bg-[var(--danger)] text-white shrink-0 mt-0.5">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--danger-text)]">
              {t('blue_green.date_highlight_title')}
            </h2>
            <p className="text-sm text-[var(--danger-text)] mt-1.5 leading-relaxed font-medium">
              {t('blue_green.date_highlight_body')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          {t('blue_green.title')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
          {t('blue_green.subtitle')}
        </p>
      </div>

      {/* The Two Pigment Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pigment Blue 15:3 */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--danger-text)] bg-[var(--danger-bg)] border border-[var(--danger-border)] px-2 py-0.5 rounded">
                {t('blue_green.prohibited_since')}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">CI 74160</span>
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              {t('blue_green.pb15_title')}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              {t('blue_green.pb15_desc')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <div><strong>{t('blue_green.chemical_class_label')}</strong> {t('blue_green.pb15_chemical_val')}</div>
            <div><strong>{t('blue_green.cosmetic_annex_label')}</strong> {t('blue_green.pb15_cosmetic_val')}</div>
            <div><strong>{t('blue_green.entry75_label')}</strong> {t('blue_green.derogation_expired_val')}</div>
          </div>
        </div>

        {/* Pigment Green 7 */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--danger-text)] bg-[var(--danger-bg)] border border-[var(--danger-border)] px-2 py-0.5 rounded">
                {t('blue_green.prohibited_since')}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">CI 74260</span>
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              {t('blue_green.pg7_title')}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              {t('blue_green.pg7_desc')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <div><strong>{t('blue_green.chemical_class_label')}</strong> {t('blue_green.pg7_chemical_val')}</div>
            <div><strong>{t('blue_green.cosmetic_annex_label')}</strong> {t('blue_green.pg7_cosmetic_val')}</div>
            <div><strong>{t('blue_green.entry75_label')}</strong> {t('blue_green.derogation_expired_val')}</div>
          </div>
        </div>
      </div>

      {/* What this means for studios today */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--accent)]" />
          {t('blue_green.status_today_heading')}
        </h4>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
            <span>{t('blue_green.status_today_item1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
            <span>{t('blue_green.status_today_item2')}</span>
          </li>
        </ul>

        <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          {t('blue_green.source_reference')}
        </div>

        {onDecodeFormulation && (
          <div className="pt-2">
            <button
              type="button"
              id="test_blue_green_in_decoder_btn"
              onClick={() => onDecodeFormulation(sampleBlueGreen)}
              className="px-3.5 py-1.5 rounded text-xs font-bold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {t('blue_green.test_decoder_btn')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
