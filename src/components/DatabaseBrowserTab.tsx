import React, { useState, useMemo } from 'react';
import { Search, Filter, X, RotateCcw, ShieldAlert, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { PigmentRecord } from '../types/pigment';
import { PIGMENT_DATABASE } from '../data/pigments';
import { ResultCard } from './ResultCard';
import { t } from '../lib/i18n';

interface DatabaseBrowserTabProps {
  onAddToInventory?: (pigment: PigmentRecord) => void;
  inventoryIds?: Set<string>;
}

export const DatabaseBrowserTab: React.FC<DatabaseBrowserTabProps> = ({
  onAddToInventory,
  inventoryIds = new Set(),
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');

  // Calculate status counts for quick-filter tabs
  const counts = useMemo(() => {
    let banned = 0;
    let restricted = 0;
    let compliant = 0;
    let watch = 0;

    PIGMENT_DATABASE.forEach((p) => {
      if (p.status === 'banned' || p.status === 'svhc') {
        banned++;
      } else if (p.status === 'restricted') {
        restricted++;
      } else if (p.status === 'safe') {
        compliant++;
      } else if (p.status === 'watch') {
        watch++;
      }
    });

    return {
      all: PIGMENT_DATABASE.length,
      banned,
      restricted,
      compliant,
      watch,
    };
  }, []);

  const colorGroups = useMemo(() => {
    const set = new Set<string>();
    PIGMENT_DATABASE.forEach((p) => {
      if (p.color_group) set.add(p.color_group);
    });
    return Array.from(set).sort();
  }, []);

  const filteredPigments = useMemo(() => {
    return PIGMENT_DATABASE.filter((p) => {
      // Status filter (compliant, restricted, banned, watch, all)
      if (statusFilter === 'compliant') {
        if (p.status !== 'safe') return false;
      } else if (statusFilter === 'restricted') {
        if (p.status !== 'restricted') return false;
      } else if (statusFilter === 'banned') {
        if (p.status !== 'banned' && p.status !== 'svhc') return false;
      } else if (statusFilter === 'watch') {
        if (p.status !== 'watch') return false;
      } else if (statusFilter !== 'all') {
        if (p.status !== statusFilter) return false;
      }

      // Color group filter
      if (colorFilter !== 'all' && p.color_group !== colorFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesCi = p.ci ? p.ci.toLowerCase().includes(term) : false;
        const matchesCas = p.cas.some((c) => c.toLowerCase().includes(term));
        const matchesAliases = p.also_known_as
          ? p.also_known_as.some((a) => a.toLowerCase().includes(term))
          : false;
        const matchesNotes = p.notes.toLowerCase().includes(term);
        return matchesName || matchesCi || matchesCas || matchesAliases || matchesNotes;
      }
      return true;
    });
  }, [searchTerm, statusFilter, colorFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setColorFilter('all');
  };

  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'all' || colorFilter !== 'all';

  return (
    <div className="space-y-5">
      {/* Top Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] space-y-4 shadow-xs">
        {/* Main Search Input & Dropdowns */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar with clear button */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              id="db_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('database.search_placeholder')}
              className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-cyan)]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="w-8 h-8 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                title={t('database.search_clear_title')}
                aria-label={t('database.search_clear_aria')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <div className="min-w-[210px]">
              <label htmlFor="db_status_filter" className="sr-only">
                {t('database.status_filter_label')}
              </label>
              <select
                id="db_status_filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs font-medium rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)] cursor-pointer"
              >
                <option value="all">{t('database.status_opt_all', { count: counts.all })}</option>
                <option value="compliant">{t('database.status_opt_compliant', { count: counts.compliant })}</option>
                <option value="restricted">{t('database.status_opt_restricted', { count: counts.restricted })}</option>
                <option value="banned">{t('database.status_opt_banned', { count: counts.banned })}</option>
                <option value="watch">{t('database.status_opt_watch', { count: counts.watch })}</option>
              </select>
            </div>

            {/* Color Group Filter Dropdown */}
            <div className="min-w-[170px]">
              <label htmlFor="db_group_filter" className="sr-only">
                {t('database.group_filter_label')}
              </label>
              <select
                id="db_group_filter"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)] capitalize cursor-pointer"
              >
                <option value="all">{t('database.group_opt_all')}</option>
                {colorGroups.map((cg) => (
                  <option key={cg} value={cg} className="capitalize">
                    {cg.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Status Pills Bar for Rapid Filtering */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> {t('database.quick_filter_label')}
            </span>

            <button
              type="button"
              id="filter_status_all_btn"
              onClick={() => setStatusFilter('all')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                statusFilter === 'all'
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {t('database.pill_all', { count: counts.all })}
            </button>

            <button
              type="button"
              id="filter_status_compliant_btn"
              onClick={() => setStatusFilter('compliant')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'compliant'
                  ? 'bg-[var(--safe-text)] text-white border-[var(--safe-text)]'
                  : 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)] hover:opacity-90'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {t('database.pill_compliant', { count: counts.compliant })}
            </button>

            <button
              type="button"
              id="filter_status_restricted_btn"
              onClick={() => setStatusFilter('restricted')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'restricted'
                  ? 'bg-[var(--warning-text)] text-white border-[var(--warning-text)]'
                  : 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)] hover:opacity-90'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('database.pill_restricted', { count: counts.restricted })}
            </button>

            <button
              type="button"
              id="filter_status_banned_btn"
              onClick={() => setStatusFilter('banned')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'banned'
                  ? 'bg-[var(--danger-text)] text-white border-[var(--danger-text)]'
                  : 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)] hover:opacity-90'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('database.pill_banned', { count: counts.banned })}
            </button>

            <button
              type="button"
              id="filter_status_watch_btn"
              onClick={() => setStatusFilter('watch')}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'watch'
                  ? 'bg-[var(--brand-cyan)] text-white border-[var(--brand-cyan)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {t('database.pill_watch', { count: counts.watch })}
            </button>
          </div>

          {/* Reset button if active */}
          {isFiltered && (
            <button
              type="button"
              id="reset_db_filters_btn"
              onClick={handleResetFilters}
              className="min-h-[44px] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--danger-text)] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('database.reset_filters')}</span>
            </button>
          )}
        </div>

        {/* Results summary bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)] gap-1">
          <span>
            {t('database.showing_summary')} <strong>{filteredPigments.length}</strong> {t('database.of_substances', { total: PIGMENT_DATABASE.length })}
            {statusFilter !== 'all' && (
              <span className="ml-1 text-[var(--text-primary)]">
                {t('database.filtered_by_label')} <span className="font-semibold capitalize">{statusFilter}</span>
              </span>
            )}
            {colorFilter !== 'all' && (
              <span className="ml-1 text-[var(--text-primary)]">
                {t('database.group_label')} <span className="font-semibold capitalize">{colorFilter.replace('_', ' ')}</span>
              </span>
            )}
            {searchTerm.trim() && (
              <span className="ml-1 text-[var(--text-primary)]">
                {t('database.search_label')} &ldquo;{searchTerm.trim()}&rdquo;
              </span>
            )}
          </span>
          <span>{t('database.indexed_offline_note')}</span>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="space-y-2.5">
        {filteredPigments.map((pigment) => (
          <ResultCard
            key={pigment.id}
            pigment={pigment}
            query={pigment.ci || pigment.cas[0] || pigment.name}
            matchType="name"
            onAddToInventory={onAddToInventory}
            isAddedToInventory={inventoryIds.has(pigment.id)}
          />
        ))}

        {filteredPigments.length === 0 && (
          <div className="p-8 text-center rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] space-y-3">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t('database.no_matches_title')}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {t('database.no_matches_desc')}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--brand-cyan)] hover:bg-[var(--bg-hover)] cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('database.reset_all_btn')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
