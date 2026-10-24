import React, { useState } from 'react';
import { ChevronDown, AlertOctagon, AlertTriangle, Eye, ShieldCheck, Plus, Check } from 'lucide-react';
import { PigmentRecord } from '../types/pigment';
import { t } from '../lib/i18n';

interface ResultCardProps {
  pigment: PigmentRecord;
  query: string;
  matchType: 'cas' | 'ci' | 'name';
  initialExpanded?: boolean;
  onAddToInventory?: (pigment: PigmentRecord) => void;
  isAddedToInventory?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  pigment,
  query,
  matchType,
  initialExpanded = false,
  onAddToInventory,
  isAddedToInventory = false,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  // Status visual mapping
  const getStatusMeta = () => {
    switch (pigment.status) {
      case 'banned':
      case 'svhc':
        return {
          icon: <AlertOctagon className="w-5 h-5 text-[var(--danger)] shrink-0" />,
          badgeClass: 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]',
          borderClass: 'border-l-4 border-l-[var(--danger)]',
          label: pigment.status === 'svhc' ? t('result_card.svhc_banned') : t('result_card.banned_eu'),
        };
      case 'restricted':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0" />,
          badgeClass: 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]',
          borderClass: 'border-l-4 border-l-[var(--warning)]',
          label: t('result_card.restricted_limits'),
        };
      case 'watch':
        return {
          icon: <Eye className="w-5 h-5 text-[var(--watch-clr)] shrink-0" />,
          badgeClass: 'bg-[var(--watch-bg)] text-[var(--watch-text)] border-[var(--watch-border)]',
          borderClass: 'border-l-4 border-l-[var(--watch-clr)]',
          label: t('result_card.under_review'),
        };
      case 'safe':
      default:
        return {
          icon: <ShieldCheck className="w-5 h-5 text-[var(--safe)] shrink-0" />,
          badgeClass: 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)]',
          borderClass: 'border-l-4 border-l-[var(--safe)]',
          label: t('result_card.no_restriction'),
        };
    }
  };

  const statusMeta = getStatusMeta();

  const matchNote =
    matchType === 'cas'
      ? t('result_card.match_cas', { query })
      : matchType === 'ci'
      ? t('result_card.match_ci', { query })
      : t('result_card.match_alias');

  return (
    <div
      className={`rounded-lg bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden transition-all shadow-xs ${statusMeta.borderClass}`}
    >
      {/* Card Header (clickable) */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full text-left min-h-[44px] flex items-center gap-3 p-3.5 sm:p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
      >
        {statusMeta.icon}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
              {pigment.name}
            </h3>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            {pigment.limit_ppm != null && (
              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]">
                {t('result_card.max_limit', { ppm: pigment.limit_ppm })}
              </span>
            )}
          </div>

          <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2 flex-wrap">
            {pigment.ci && <span>{t('result_card.ci_label', { ci: pigment.ci })}</span>}
            {pigment.cas && pigment.cas.length > 0 && (
              <span>{t('result_card.cas_label', { cas: pigment.cas.join(', ') })}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable Details Drawer */}
      {expanded && (
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-input)] space-y-3 text-xs">
          {/* Regulatory Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                {t('result_card.regulatory_instrument')}
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                {pigment.regulation}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                {t('result_card.colour_group')}
              </span>
              <span className="text-[var(--text-primary)] capitalize">
                {pigment.color_group.replace('_', ' ')}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                {t('result_card.restriction_rationale')}
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {pigment.notes || t('result_card.default_regulated_note')}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                {t('result_card.match_method')}
              </span>
              <span className="text-[var(--text-muted)] font-mono">
                {matchNote}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-0.5">
                {t('result_card.cas_reference')}
              </span>
              <span className="text-[var(--text-primary)] font-mono">
                {pigment.cas.join(', ')}
              </span>
            </div>
          </div>

          {/* Tags */}
          {pigment.also_known_as && pigment.also_known_as.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                {t('result_card.synonyms')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pigment.also_known_as.map((alias, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--bg-tag)] text-[var(--text-secondary)] border border-[var(--border)]"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pigment.found_in && pigment.found_in.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                {t('result_card.typically_found_in')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pigment.found_in.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--bg-tag)] text-[var(--text-secondary)] border border-[var(--border)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] text-[var(--text-muted)]">
              {pigment.echa_ref || t('result_card.echa_reference', { cas: pigment.cas[0] || 'Substance' })}
            </div>

            {onAddToInventory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToInventory(pigment);
                }}
                disabled={isAddedToInventory}
                className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-60"
              >
                {isAddedToInventory ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--safe)]" />
                    <span>{t('result_card.in_studio_inventory')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
                    <span>{t('result_card.add_to_studio_inventory')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
