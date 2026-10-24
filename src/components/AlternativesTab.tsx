import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { ALTERNATIVE_COLORANT_MATRIX, ColorantAlternative } from '../data/alternatives';
import { t } from '../lib/i18n';

interface AlternativesTabProps {
  onSelectAlternative?: (ciNumber: string) => void;
}

export const AlternativesTab: React.FC<AlternativesTabProps> = ({ onSelectAlternative }) => {
  const [selectedAlt, setSelectedAlt] = useState<ColorantAlternative>(ALTERNATIVE_COLORANT_MATRIX[0]);
  const [activeSearch, setActiveSearch] = useState('');

  const filteredMatrix = ALTERNATIVE_COLORANT_MATRIX.filter((item) => {
    if (!activeSearch.trim()) return true;
    const q = activeSearch.toLowerCase();
    return (
      item.problematicPigment.toLowerCase().includes(q) ||
      item.ciNumber.toLowerCase().includes(q) ||
      item.casNumber.includes(q) ||
      item.recommendedAlternatives.some((a) => a.name.toLowerCase().includes(q) || a.ciNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--brand-cyan)] shrink-0" />
              {t('alternatives.matrix_title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {t('alternatives.matrix_desc')}
            </p>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--safe-bg)] text-[var(--safe-text)] border border-[var(--safe-border)] shrink-0">
            {t('alternatives.matrix_badge')}
          </span>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            id="matrix_search_input"
            type="text"
            placeholder={t('alternatives.search_placeholder')}
            value={activeSearch}
            onChange={(e) => setActiveSearch(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
          />
        </div>
      </div>

      {/* Main Grid: Problematic Pigments Selector & Recommended Substitutes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prohibited / Restricted Pigments List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t('alternatives.restricted_list_heading', { count: filteredMatrix.length })}
          </h3>
          <div className="space-y-2">
            {filteredMatrix.map((item) => {
              const isSelected = selectedAlt.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`select_pigment_${item.id}`}
                  onClick={() => setSelectedAlt(item)}
                  className={`w-full min-h-[44px] text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--brand-cyan)] bg-[var(--bg-subtle)] shadow-xs ring-1 ring-[var(--brand-cyan)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[var(--text-primary)]">
                      {item.problematicPigment}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)] shrink-0">
                      {t('alternatives.status_prohibited')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[var(--text-muted)]">
                    <span>{item.ciNumber}</span>
                    <span>•</span>
                    <span>CAS {item.casNumber}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 line-clamp-2">
                    {item.restrictionReason}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Pigment Alternatives Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs">
            <div className="border-b border-[var(--border-subtle)] pb-4 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--danger-text)]">
                    {t('alternatives.prohibited_under_entry75')}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                    {selectedAlt.problematicPigment}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mt-1">
                    <span>{t('alternatives.ci_number_label', { ci: selectedAlt.ciNumber })}</span>
                    <span>|</span>
                    <span>{t('alternatives.cas_number_label', { cas: selectedAlt.casNumber })}</span>
                  </div>
                </div>
                <div className="p-2 rounded bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)] text-xs font-semibold">
                  {t('alternatives.transition_expired')}
                </div>
              </div>

              <div className="mt-3 p-3 rounded bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed border border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-primary)]">{t('alternatives.legal_context_prefix')}</span>
                {selectedAlt.restrictionReason}
              </div>
            </div>

            {/* Alternatives Cards */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--safe-text)]" />
                {t('alternatives.compliant_substitutes_heading')}
              </h4>

              <div className="space-y-3">
                {selectedAlt.recommendedAlternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--brand-cyan)] transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[var(--text-primary)]">
                          {alt.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-[var(--text-muted)]">
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-tag)] text-[var(--text-primary)] font-semibold">
                            {alt.ciNumber}
                          </span>
                          <span>CAS {alt.casNumber}</span>
                          <span>•</span>
                          <span>INCI: {alt.inci}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--safe-bg)] text-[var(--safe-text)] border border-[var(--safe-border)] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {alt.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] block font-medium">{t('alternatives.color_shade_label')}</span>
                        <span className="text-[var(--text-primary)] font-semibold">{alt.colorShade}</span>
                      </div>
                      <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] block font-medium">{t('alternatives.reg_status_label')}</span>
                        <span className="text-[var(--safe-text)] font-semibold">{t('alternatives.allowed_status')}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {alt.technicalNotes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
