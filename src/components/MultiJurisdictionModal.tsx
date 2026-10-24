import React from 'react';
import { X, Globe, Scale, AlertTriangle, ShieldCheck, AlertOctagon, HelpCircle } from 'lucide-react';
import { ParsedHit } from '../types/pigment';
import { assessSubstanceAcrossJurisdictions } from '../data/jurisdictionData';
import { t } from '../lib/i18n';

interface MultiJurisdictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hits: ParsedHit[];
  inkName?: string;
  brand?: string;
}

export const MultiJurisdictionModal: React.FC<MultiJurisdictionModalProps> = ({
  isOpen,
  onClose,
  hits,
  inkName,
  brand,
}) => {
  if (!isOpen) return null;

  const validHits = hits.filter((h) => h.substance !== null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--bg-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-cyan)] shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t('jurisdictions.modal_title')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {brand || inkName ? `${brand} ${inkName}`.trim() : t('jurisdictions.modal_subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Summary Alert */}
          <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <Scale className="w-4 h-4 text-[var(--brand-cyan)]" />
              <span>{t('jurisdictions.modal_summary_heading')}</span>
            </div>
            <p>{t('jurisdictions.modal_summary_text')}</p>
          </div>

          {/* Matrix Table */}
          {validHits.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              {t('jurisdictions.modal_no_substances')}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border)] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-3">{t('jurisdictions.col_ingredient')}</th>
                    <th className="p-3">{t('jurisdictions.eu.name')}</th>
                    <th className="p-3">{t('jurisdictions.us.name')}</th>
                    <th className="p-3">{t('jurisdictions.au.name')}</th>
                    <th className="p-3">{t('jurisdictions.asean.name')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {validHits.map((hit, idx) => {
                    const substance = hit.substance!;
                    const assessment = assessSubstanceAcrossJurisdictions(substance, hit.detectedConcentrationPercent);

                    return (
                      <tr key={idx} className="hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="p-3 font-medium text-[var(--text-primary)]">
                          <div>{substance.name}</div>
                          {substance.ci && (
                            <div className="font-mono text-[11px] text-[var(--brand-cyan)]">
                              {substance.ci}
                            </div>
                          )}
                          {substance.cas[0] && (
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">
                              CAS {substance.cas[0]}
                            </div>
                          )}
                        </td>

                        {/* EU Status */}
                        <td className="p-3">
                          <span className={`text-[11px] font-mono block ${getStatusColor(assessment.eu.status)}`}>
                            {t(assessment.eu.statusLabelKey)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                            {t(assessment.eu.practicalActionKey)}
                          </span>
                        </td>

                        {/* US Status */}
                        <td className="p-3">
                          <span className={`text-[11px] font-mono block ${getStatusColor(assessment.us.status)}`}>
                            {t(assessment.us.statusLabelKey)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                            {t(assessment.us.practicalActionKey)}
                          </span>
                        </td>

                        {/* AU Status */}
                        <td className="p-3">
                          <span className={`text-[11px] font-mono block ${getStatusColor(assessment.au.status)}`}>
                            {t(assessment.au.statusLabelKey)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                            {t(assessment.au.practicalActionKey)}
                          </span>
                        </td>

                        {/* ASEAN Status */}
                        <td className="p-3">
                          <span className={`text-[11px] font-mono block ${getStatusColor(assessment.asean.status)}`}>
                            {t(assessment.asean.statusLabelKey)}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                            {t(assessment.asean.practicalActionKey)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] shrink-0">
          <span>{t('jurisdictions.modal_footer_disclaimer')}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'compliant':
    case 'listed':
      return 'text-[var(--brand-cyan)] font-semibold';
    case 'restricted':
    case 'unapproved':
      return 'text-[var(--warning-text)] font-semibold';
    case 'banned':
    case 'action_required':
      return 'text-[var(--danger-text)] font-bold';
    default:
      return 'text-[var(--text-muted)]';
  }
}
