import React, { useState, useMemo } from 'react';
import {
  Globe,
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { JurisdictionId } from '../types/jurisdictions';
import {
  JURISDICTIONS_META,
  DIVERGENCE_POINTS,
  assessSubstanceAcrossJurisdictions,
} from '../data/jurisdictionData';
import { PIGMENTS } from '../data/pigments';
import { PigmentRecord } from '../types/pigment';
import { t } from '../lib/i18n';

export const RegulatoryMatrixTab: React.FC = () => {
  const [subView, setSubView] = useState<'matrix' | 'divergence'>('matrix');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<'all' | 'pigment' | 'metal' | 'carrier'>('all');
  const [expandedSubstanceId, setExpandedSubstanceId] = useState<string | null>(null);

  // Filter pigments for the matrix
  const filteredSubstances = useMemo(() => {
    return PIGMENTS.filter((p) => {
      // Group filter
      if (filterGroup === 'pigment') {
        if (['solvent', 'additive', 'preservative', 'heavy_metal', 'metal_impurity'].includes(p.color_group)) {
          return false;
        }
      } else if (filterGroup === 'metal') {
        if (!['heavy_metal', 'metal_impurity'].includes(p.color_group)) return false;
      } else if (filterGroup === 'carrier') {
        if (!['solvent', 'additive', 'preservative'].includes(p.color_group)) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCi = p.ci ? p.ci.toLowerCase().includes(q) : false;
      const matchCas = p.cas.some((c) => c.toLowerCase().includes(q));
      return matchName || matchCi || matchCas;
    });
  }, [searchQuery, filterGroup]);

  return (
    <div className="space-y-6">
      {/* Tab Header & Sub-View Switcher */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-cyan)] shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {t('jurisdictions.tab_title')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                {t('jurisdictions.tab_subtitle')}
              </p>
            </div>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <button
              type="button"
              id="subview_matrix_btn"
              onClick={() => setSubView('matrix')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                subView === 'matrix'
                  ? 'bg-[var(--brand-cyan)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('jurisdictions.btn_matrix')}</span>
            </button>
            <button
              type="button"
              id="subview_divergence_btn"
              onClick={() => setSubView('divergence')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                subView === 'divergence'
                  ? 'bg-[var(--brand-cyan)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('jurisdictions.btn_divergence')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: REGULATORY DIVERGENCE EXPLAINER PANEL */}
      {subView === 'divergence' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {t('jurisdictions.divergence_overview_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('jurisdictions.divergence_overview_desc')}
                </p>
              </div>
            </div>

            {/* Jurisdiction Quick Snapshot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-[var(--border-subtle)]">
              {(Object.keys(JURISDICTIONS_META) as JurisdictionId[]).map((jid) => {
                const meta = JURISDICTIONS_META[jid];
                return (
                  <div
                    key={jid}
                    className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--brand-cyan)] uppercase tracking-wider">
                        {meta.flagCode}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">
                        {t(meta.regionKey)}
                      </span>
                    </div>
                    <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] mt-1">
                      {t(meta.nameKey)}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1.5 line-clamp-2">
                      {meta.primaryLaw}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divergence Categories Deep-Dive */}
          <div className="space-y-4">
            {DIVERGENCE_POINTS.map((dp) => (
              <div
                key={dp.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-cyan)]">
                      {t(dp.categoryKey)}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {t(dp.titleKey)}
                    </h4>
                  </div>
                </div>

                {/* 4-column side-by-side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
                  {/* EU */}
                  <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {t('jurisdictions.eu.name')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)] font-semibold">
                          {dp.jurisdictions.eu.statusBadge}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                        {t(dp.jurisdictions.eu.summaryKey)}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {t(dp.jurisdictions.eu.specificsKey)}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                      {dp.jurisdictions.eu.instrument}
                    </div>
                  </div>

                  {/* US */}
                  <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {t('jurisdictions.us.name')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--warning-bg)] text-[var(--warning-text)] font-semibold">
                          {dp.jurisdictions.us.statusBadge}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                        {t(dp.jurisdictions.us.summaryKey)}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {t(dp.jurisdictions.us.specificsKey)}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                      {dp.jurisdictions.us.instrument}
                    </div>
                  </div>

                  {/* Australia */}
                  <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {t('jurisdictions.au.name')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tag)] text-[var(--text-secondary)] font-semibold">
                          {dp.jurisdictions.au.statusBadge}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                        {t(dp.jurisdictions.au.summaryKey)}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {t(dp.jurisdictions.au.specificsKey)}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                      {dp.jurisdictions.au.instrument}
                    </div>
                  </div>

                  {/* Southeast Asia */}
                  <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {t('jurisdictions.asean.name')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tag)] text-[var(--text-secondary)] font-semibold">
                          {dp.jurisdictions.asean.statusBadge}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                        {t(dp.jurisdictions.asean.summaryKey)}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {t(dp.jurisdictions.asean.specificsKey)}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                      {dp.jurisdictions.asean.instrument}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-JURISDICTION REGULATORY MATRIX */}
      {subView === 'matrix' && (
        <div className="space-y-6">
          {/* Controls: Jurisdiction Pills, Search & Category Filters */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs space-y-4">
            {/* Jurisdiction Selector */}
            <div>
              <label className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-2">
                {t('jurisdictions.filter_jurisdiction_label')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  id="filter_jurisdiction_all"
                  onClick={() => setSelectedJurisdiction('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedJurisdiction === 'all'
                      ? 'bg-[var(--brand-cyan)] text-white shadow-xs'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t('jurisdictions.filter_all_regions')}
                </button>
                {(Object.keys(JURISDICTIONS_META) as JurisdictionId[]).map((jid) => {
                  const meta = JURISDICTIONS_META[jid];
                  return (
                    <button
                      key={jid}
                      type="button"
                      id={`filter_jurisdiction_${jid}`}
                      onClick={() => setSelectedJurisdiction(jid)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedJurisdiction === jid
                          ? 'bg-[var(--brand-cyan)] text-white shadow-xs'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {meta.flagCode} · {t(meta.nameKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search & Substance Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  id="jurisdiction_search_input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('jurisdictions.search_placeholder')}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-cyan)]"
                />
              </div>

              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'all', label: t('jurisdictions.group_all') },
                    { id: 'pigment', label: t('jurisdictions.group_pigments') },
                    { id: 'metal', label: t('jurisdictions.group_metals') },
                    { id: 'carrier', label: t('jurisdictions.group_carriers') },
                  ] as const
                ).map((grp) => (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setFilterGroup(grp.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      filterGroup === grp.id
                        ? 'bg-[var(--bg-tag)] text-[var(--brand-cyan)] font-bold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {grp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Substance Assessment List */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
            <div className="p-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold">
                {t('jurisdictions.substances_count', { count: filteredSubstances.length })}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {t('jurisdictions.click_row_hint')}
              </span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {filteredSubstances.map((substance) => {
                const assessment = assessSubstanceAcrossJurisdictions(substance);
                const isExpanded = expandedSubstanceId === substance.id;

                return (
                  <div key={substance.id} className="transition-colors hover:bg-[var(--bg-hover)]">
                    {/* Header Row */}
                    <button
                      type="button"
                      onClick={() => setExpandedSubstanceId(isExpanded ? null : substance.id)}
                      className="w-full text-left p-4 cursor-pointer focus:outline-hidden"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[var(--text-primary)]">
                              {substance.name}
                            </span>
                            {substance.ci && (
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--brand-cyan)] font-semibold">
                                {substance.ci}
                              </span>
                            )}
                            {substance.cas[0] && (
                              <span className="font-mono text-xs text-[var(--text-muted)]">
                                CAS {substance.cas[0]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                            {substance.notes}
                          </p>
                        </div>

                        {/* Badges for Jurisdictions */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          {(selectedJurisdiction === 'all' || selectedJurisdiction === 'eu') && (
                            <span className="text-[11px] px-2 py-0.5 rounded font-mono border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center gap-1">
                              <span className="font-bold text-[var(--text-muted)]">EU:</span>
                              <span className={getStatusColor(assessment.eu.status)}>
                                {t(assessment.eu.statusLabelKey)}
                              </span>
                            </span>
                          )}

                          {(selectedJurisdiction === 'all' || selectedJurisdiction === 'us') && (
                            <span className="text-[11px] px-2 py-0.5 rounded font-mono border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center gap-1">
                              <span className="font-bold text-[var(--text-muted)]">US:</span>
                              <span className={getStatusColor(assessment.us.status)}>
                                {t(assessment.us.statusLabelKey)}
                              </span>
                            </span>
                          )}

                          {(selectedJurisdiction === 'all' || selectedJurisdiction === 'au') && (
                            <span className="text-[11px] px-2 py-0.5 rounded font-mono border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center gap-1">
                              <span className="font-bold text-[var(--text-muted)]">AU:</span>
                              <span className={getStatusColor(assessment.au.status)}>
                                {t(assessment.au.statusLabelKey)}
                              </span>
                            </span>
                          )}

                          {(selectedJurisdiction === 'all' || selectedJurisdiction === 'asean') && (
                            <span className="text-[11px] px-2 py-0.5 rounded font-mono border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center gap-1">
                              <span className="font-bold text-[var(--text-muted)]">ASEAN:</span>
                              <span className={getStatusColor(assessment.asean.status)}>
                                {t(assessment.asean.statusLabelKey)}
                              </span>
                            </span>
                          )}

                          <div className="text-[var(--text-muted)] ml-1">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-4 pt-1 bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)] space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* EU Detail */}
                          <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-1.5 border-b border-[var(--border-subtle)]">
                              <span>{t('jurisdictions.eu.name')}</span>
                              <span className={`text-[10px] font-mono ${getStatusColor(assessment.eu.status)}`}>
                                {t(assessment.eu.statusLabelKey)}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
                              <p>{t(assessment.eu.legalContextKey)}</p>
                              <div className="p-2 rounded bg-[var(--bg-subtle)] text-[11px] text-[var(--text-muted)]">
                                <span className="font-semibold text-[var(--text-primary)] block">
                                  {t('jurisdictions.matrix_action_label')}:
                                </span>
                                {t(assessment.eu.practicalActionKey)}
                              </div>
                            </div>
                          </div>

                          {/* US Detail */}
                          <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-1.5 border-b border-[var(--border-subtle)]">
                              <span>{t('jurisdictions.us.name')}</span>
                              <span className={`text-[10px] font-mono ${getStatusColor(assessment.us.status)}`}>
                                {t(assessment.us.statusLabelKey)}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
                              <p>{t(assessment.us.legalContextKey)}</p>
                              <div className="p-2 rounded bg-[var(--bg-subtle)] text-[11px] text-[var(--text-muted)]">
                                <span className="font-semibold text-[var(--text-primary)] block">
                                  {t('jurisdictions.matrix_action_label')}:
                                </span>
                                {t(assessment.us.practicalActionKey)}
                              </div>
                            </div>
                          </div>

                          {/* AU Detail */}
                          <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-1.5 border-b border-[var(--border-subtle)]">
                              <span>{t('jurisdictions.au.name')}</span>
                              <span className={`text-[10px] font-mono ${getStatusColor(assessment.au.status)}`}>
                                {t(assessment.au.statusLabelKey)}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
                              <p>{t(assessment.au.legalContextKey)}</p>
                              <div className="p-2 rounded bg-[var(--bg-subtle)] text-[11px] text-[var(--text-muted)]">
                                <span className="font-semibold text-[var(--text-primary)] block">
                                  {t('jurisdictions.matrix_action_label')}:
                                </span>
                                {t(assessment.au.practicalActionKey)}
                              </div>
                            </div>
                          </div>

                          {/* ASEAN Detail */}
                          <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] pb-1.5 border-b border-[var(--border-subtle)]">
                              <span>{t('jurisdictions.asean.name')}</span>
                              <span className={`text-[10px] font-mono ${getStatusColor(assessment.asean.status)}`}>
                                {t(assessment.asean.statusLabelKey)}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
                              <p>{t(assessment.asean.legalContextKey)}</p>
                              <div className="p-2 rounded bg-[var(--bg-subtle)] text-[11px] text-[var(--text-muted)]">
                                <span className="font-semibold text-[var(--text-primary)] block">
                                  {t('jurisdictions.matrix_action_label')}:
                                </span>
                                {t(assessment.asean.practicalActionKey)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Studio Compliance Checklist Generator */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <Building2 className="w-5 h-5 text-[var(--brand-cyan)]" />
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {t('jurisdictions.checklist_heading')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t('jurisdictions.checklist_subheading')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* EU Checklist */}
              <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-cyan)]" />
                  <span>{t('jurisdictions.checklist_eu_title')}</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pl-4 list-disc">
                  <li>{t('jurisdictions.checklist_eu_item_1')}</li>
                  <li>{t('jurisdictions.checklist_eu_item_2')}</li>
                  <li>{t('jurisdictions.checklist_eu_item_3')}</li>
                </ul>
              </div>

              {/* US MoCRA Checklist */}
              <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--warning-text)]" />
                  <span>{t('jurisdictions.checklist_us_title')}</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pl-4 list-disc">
                  <li>{t('jurisdictions.checklist_us_item_1')}</li>
                  <li>{t('jurisdictions.checklist_us_item_2')}</li>
                  <li>{t('jurisdictions.checklist_us_item_3')}</li>
                </ul>
              </div>

              {/* Australia Checklist */}
              <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span>{t('jurisdictions.checklist_au_title')}</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pl-4 list-disc">
                  <li>{t('jurisdictions.checklist_au_item_1')}</li>
                  <li>{t('jurisdictions.checklist_au_item_2')}</li>
                  <li>{t('jurisdictions.checklist_au_item_3')}</li>
                </ul>
              </div>

              {/* Southeast Asia Checklist */}
              <div className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                  <span>{t('jurisdictions.checklist_asean_title')}</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pl-4 list-disc">
                  <li>{t('jurisdictions.checklist_asean_item_1')}</li>
                  <li>{t('jurisdictions.checklist_asean_item_2')}</li>
                  <li>{t('jurisdictions.checklist_asean_item_3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
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
