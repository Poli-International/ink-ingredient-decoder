import React, { useEffect } from 'react';
import { X, AlertOctagon, AlertTriangle, ShieldCheck, HelpCircle, FileText, Scale, ExternalLink } from 'lucide-react';
import { ParsedHit } from '../types/pigment';
import { t } from '../lib/i18n';

interface SubstanceRuleModalProps {
  hit: ParsedHit | null;
  onClose: () => void;
  onGenerateQuestionSheet?: (unrecognisedItem: string) => void;
}

export const SubstanceRuleModal: React.FC<SubstanceRuleModalProps> = ({
  hit,
  onClose,
  onGenerateQuestionSheet,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!hit) return null;

  const sub = hit.substance;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="substance_rule_modal_title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl p-6 sm:p-7 space-y-5 my-8 text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('decoder.rule_says_heading')}
              </span>
            </div>
            <h3 id="substance_rule_modal_title" className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-1">
              {sub ? sub.name : hit.query}
            </h3>
            {hit.matchedBy && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                {t('decoder.matched_by_label')} {hit.matchedBy}
              </p>
            )}
          </div>

          <button
            type="button"
            id="close_substance_rule_modal_btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            aria-label={t('substance_rule_modal.close_aria')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {sub ? (
          <div className="space-y-4">
            {/* Status & Identification Strip */}
            <div className="flex flex-wrap items-center gap-2">
              {sub.status === 'banned' || sub.status === 'svhc' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)]">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {t('status.prohibited')}
                </span>
              ) : sub.status === 'restricted' || sub.status === 'watch' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('status.restricted')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--safe-bg)] text-[var(--safe-text)] border border-[var(--safe-border)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('status.not_covered')}
                </span>
              )}

              {sub.ci && (
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                  CI {sub.ci}
                </span>
              )}

              {sub.cas && sub.cas.length > 0 && (
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                  CAS {sub.cas.join(', ')}
                </span>
              )}
            </div>

            {/* Statutory Concentration Limit */}
            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                {t('substance_rule_modal.exact_concentration_limit_heading')}
              </div>
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-mono">
                {sub.exact_limit || t('decoder.limit_check_reg')}
              </div>
            </div>

            {/* Legal Appendix Reference */}
            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('substance_rule_modal.regulatory_quoted_provision_heading')}
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                {sub.entry_reference || 'REACH Annex XVII Entry 75'}
              </p>
              {sub.regulation && (
                <p className="text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
                  {t('substance_rule_modal.reference_label', { ref: sub.regulation })}
                </p>
              )}
            </div>

            {/* Plain-Language Studio Guidance */}
            {sub.notes && (
              <div className="p-4 rounded-lg border border-[var(--brand-cyan)] bg-[var(--bg-subtle)] space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-cyan)]">
                  {t('decoder.plain_language_rule')}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                  {sub.notes}
                </p>
              </div>
            )}

          </div>
        ) : (
          /* Unrecognised Substance View */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]">
                <HelpCircle className="w-3.5 h-3.5" />
                {t('status.unrecognised')}
              </span>
            </div>

            <div className="p-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="font-bold">{t('substance_rule_modal.unrecognised_box_title')}</div>
              <p>
                {t('substance_rule_modal.unrecognised_box_desc1_prefix')}<code className="px-1.5 py-0.5 rounded bg-black/10 font-bold">{hit.query}</code>{t('substance_rule_modal.unrecognised_box_desc1_suffix')}
              </p>
              <p className="font-medium">
                {t('substance_rule_modal.unrecognised_box_desc2')}
              </p>
            </div>

            {onGenerateQuestionSheet && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGenerateQuestionSheet(hit.query);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{t('decoder.generate_question_sheet_btn')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            {t('substance_rule_modal.close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
