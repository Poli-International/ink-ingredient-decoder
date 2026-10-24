import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  Search,
  FileDown,
  Copy,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
  ShieldAlert,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ClientTattooSession, StudioInkItem, CustomInkMixture } from '../types/database';
import { formatLocalDateDisplay, getLocalDateString } from '../lib/dateUtils';
import { t } from '../lib/i18n';

interface BatchRecallTabProps {
  sessions: ClientTattooSession[];
  inventory: StudioInkItem[];
  mixtures: CustomInkMixture[];
  onOpenSessionDetails?: (session: ClientTattooSession) => void;
}

export const BatchRecallTab: React.FC<BatchRecallTabProps> = ({
  sessions,
  inventory,
  mixtures,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedInkName, setSelectedInkName] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  // Collect unique batch numbers available in inventory and sessions for quick chips
  const knownBatches = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach((i) => {
      if (i.batchNumber && i.batchNumber.trim() && i.batchNumber !== 'N/A') {
        set.add(i.batchNumber.trim());
      }
    });
    sessions.forEach((s) => {
      s.usedInks?.forEach((ink) => {
        if (ink.batchNumber && ink.batchNumber.trim() && ink.batchNumber !== 'LOT-N/A' && ink.batchNumber !== 'N/A') {
          set.add(ink.batchNumber.trim());
        }
        if (ink.mixtureBatchNumber && ink.mixtureBatchNumber.trim()) {
          set.add(ink.mixtureBatchNumber.trim());
        }
      });
    });
    mixtures.forEach((m) => {
      if (m.mixtureBatchNumber) set.add(m.mixtureBatchNumber.trim());
      m.baseInks?.forEach((b) => {
        if (b.batchNumber) set.add(b.batchNumber.trim());
      });
    });
    return Array.from(set);
  }, [inventory, sessions, mixtures]);

  // Perform search across sessions and mixtures
  const recallResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return null;

    // 1. Identify directly affected sessions
    const affectedSessions = sessions.filter((sess) => {
      return sess.usedInks?.some((ink) => {
        const batchMatch = ink.batchNumber?.toLowerCase().includes(query);
        const mixBatchMatch = ink.mixtureBatchNumber?.toLowerCase().includes(query);
        const nameMatch = selectedInkName
          ? ink.inkName.toLowerCase().includes(selectedInkName.toLowerCase())
          : true;
        const brandMatch = selectedBrand
          ? ink.brand.toLowerCase().includes(selectedBrand.toLowerCase())
          : true;
        return (batchMatch || mixBatchMatch) && nameMatch && brandMatch;
      });
    });

    // 2. Identify affected custom mixtures that used this batch as base ink
    const affectedMixtures = mixtures.filter((mix) => {
      const mixSelf = mix.mixtureBatchNumber?.toLowerCase().includes(query);
      const usedInBase = mix.baseInks?.some((b) => b.batchNumber?.toLowerCase().includes(query));
      return mixSelf || usedInBase;
    });

    // 3. Find any additional sessions that used those affected mixtures
    const mixtureBatchCodes = new Set(affectedMixtures.map((m) => m.mixtureBatchNumber.toLowerCase()));
    const indirectSessions = sessions.filter((sess) => {
      if (affectedSessions.includes(sess)) return false;
      return sess.usedInks?.some((ink) => {
        return (
          ink.mixtureBatchNumber &&
          mixtureBatchCodes.has(ink.mixtureBatchNumber.toLowerCase())
        );
      });
    });

    const allSessions = [...affectedSessions, ...indirectSessions];

    // Dates range
    const dates = allSessions
      .map((s) => s.localDate)
      .filter(Boolean)
      .sort();
    const firstUsed = dates.length > 0 ? dates[0] : null;
    const lastUsed = dates.length > 0 ? dates[dates.length - 1] : null;

    // Distinct clients & artists
    const uniqueClients = new Set(allSessions.map((s) => s.clientReference || s.clientName || 'Anonymous'));
    const uniqueArtists = new Set(allSessions.map((s) => s.artistName).filter(Boolean));

    // Inventory bottles matching this batch
    const inventoryMatches = inventory.filter((item) =>
      item.batchNumber?.toLowerCase().includes(query)
    );

    return {
      query: searchTerm.trim(),
      totalSessions: allSessions.length,
      affectedSessions: allSessions,
      affectedMixtures,
      uniqueClientsCount: uniqueClients.size,
      uniqueArtists: Array.from(uniqueArtists),
      firstUsed,
      lastUsed,
      inventoryMatches,
    };
  }, [searchTerm, selectedBrand, selectedInkName, sessions, mixtures, inventory]);

  const handleExportCSV = () => {
    if (!recallResults || recallResults.totalSessions === 0) return;

    const headers = [
      'Recall Batch Number',
      'Session Date',
      'Client Reference',
      'Client Name',
      'Artist',
      'Studio',
      'Placement Area',
      'Ink Brand',
      'Ink Name',
      'Bottle Batch',
      'Mixture Code',
    ];

    const rows: string[][] = [];
    recallResults.affectedSessions.forEach((s) => {
      s.usedInks.forEach((ink) => {
        rows.push([
          `"${recallResults.query}"`,
          `"${s.localDate}"`,
          `"${s.clientReference || 'N/A'}"`,
          `"${s.clientName || 'Confidential'}"`,
          `"${s.artistName || 'N/A'}"`,
          `"${s.studioName || 'Studio'}"`,
          `"${s.bodyPlacement || 'N/A'}"`,
          `"${ink.brand || 'N/A'}"`,
          `"${ink.inkName || 'N/A'}"`,
          `"${ink.batchNumber || 'N/A'}"`,
          `"${ink.mixtureBatchNumber || 'N/A'}"`,
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `RECALL-AUDIT-${recallResults.query.replace(/[^a-z0-9]/gi, '_')}-${getLocalDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyNotificationReport = () => {
    if (!recallResults) return;

    const reportLines = [
      `=== ${t('recall.report_title')} ===`,
      `${t('recall.report_date')}: ${formatLocalDateDisplay(getLocalDateString())}`,
      `${t('recall.recalled_lot')}: ${recallResults.query}`,
      `${t('recall.affected_clients_count')}: ${recallResults.uniqueClientsCount}`,
      `${t('recall.total_sessions_count')}: ${recallResults.totalSessions}`,
      `${t('recall.period_active')}: ${formatLocalDateDisplay(recallResults.firstUsed || '')} - ${formatLocalDateDisplay(recallResults.lastUsed || '')}`,
      `${t('recall.affected_artists')}: ${recallResults.uniqueArtists.join(', ') || 'N/A'}`,
      '',
      `--- ${t('recall.affected_sessions_heading')} ---`,
      ...recallResults.affectedSessions.map((s, idx) => {
        return `${idx + 1}. [${s.localDate}] ${s.clientReference || s.clientName || 'Client'} - ${s.bodyPlacement} (${s.artistName || 'Artist'})`;
      }),
      '',
      `--- ${t('recall.affected_mixtures_heading')} ---`,
      ...recallResults.affectedMixtures.map((m, idx) => {
        return `${idx + 1}. ${m.name} (${m.mixtureBatchNumber}) - Prepared: ${m.preparedDate}`;
      }),
      '',
      t('recall.disclaimer_audit'),
    ];

    navigator.clipboard?.writeText(reportLines.join('\n'));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div id="batch-recall-container" className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t('recall.heading')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              {t('recall.subheading')}
            </p>
          </div>
        </div>

        {recallResults && recallResults.totalSessions > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="btn-export-recall-csv"
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('recall.export_csv')}</span>
            </button>
            <button
              id="btn-copy-recall-report"
              type="button"
              onClick={handleCopyNotificationReport}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
            >
              {copiedReport ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedReport ? t('recall.copied') : t('recall.copy_report')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Audit Filter Control */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              id="recall-batch-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('recall.search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--text-secondary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--card)]"
            >
              {t('recall.clear_search')}
            </button>
          )}
        </div>

        {/* Quick Batch Suggestions Chips */}
        {knownBatches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              {t('recall.known_studio_lots')}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {knownBatches.slice(0, 10).map((batch) => (
                <button
                  key={batch}
                  type="button"
                  onClick={() => setSearchTerm(batch)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition border ${
                    searchTerm === batch
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {batch}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results View */}
      {recallResults ? (
        <div className="flex flex-col gap-5">
          {/* KPI Summary Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  recallResults.totalSessions > 0
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {recallResults.uniqueClientsCount}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {t('recall.kpi_clients')}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  recallResults.totalSessions > 0
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {recallResults.totalSessions}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {t('recall.kpi_sessions')}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {recallResults.affectedMixtures.length}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {t('recall.kpi_mixtures')}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {recallResults.inventoryMatches.length}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {t('recall.kpi_inventory_bottles')}
                </div>
              </div>
            </div>
          </div>

          {/* Active Inventory Warning if bottle is still on the shelf */}
          {recallResults.inventoryMatches.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {t('recall.quarantine_notice_title')}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {t('recall.quarantine_notice_desc', { count: recallResults.inventoryMatches.length })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {recallResults.inventoryMatches.map((bottle) => (
                  <span
                    key={bottle.id}
                    className="px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-mono font-medium text-[var(--foreground)]"
                  >
                    {bottle.name} ({bottle.brand})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Affected Client Sessions Table */}
          {recallResults.totalSessions > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-500" />
                  <span>{t('recall.affected_sessions_heading')}</span>
                  <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-rose-500/10 text-rose-500">
                    {recallResults.totalSessions}
                  </span>
                </h3>
                {recallResults.firstUsed && (
                  <span className="text-xs text-[var(--text-secondary)]">
                    {t('recall.usage_window')}: {formatLocalDateDisplay(recallResults.firstUsed)} — {formatLocalDateDisplay(recallResults.lastUsed || '')}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface)] text-[var(--text-secondary)] border-b border-[var(--border)] font-medium">
                    <tr>
                      <th className="px-4 py-3">{t('recall.col_date')}</th>
                      <th className="px-4 py-3">{t('recall.col_client_ref')}</th>
                      <th className="px-4 py-3">{t('recall.col_placement')}</th>
                      <th className="px-4 py-3">{t('recall.col_artist')}</th>
                      <th className="px-4 py-3">{t('recall.col_ink_details')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                    {recallResults.affectedSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-[var(--surface-hover)] transition">
                        <td className="px-4 py-3 font-mono">
                          {formatLocalDateDisplay(session.localDate)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {session.clientReference || session.clientName || 'Confidential'}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {session.bodyPlacement || '—'}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {session.artistName || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {session.usedInks.map((ink, i) => (
                              <span key={i} className="font-mono text-xs">
                                <span className="font-semibold">{ink.brand}</span> - {ink.inkName} ({ink.batchNumber})
                                {ink.mixtureBatchNumber && (
                                  <span className="ml-1 text-[var(--accent)] font-mono">
                                    [{ink.mixtureBatchNumber}]
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {t('recall.no_affected_clients_title')}
              </div>
              <div className="text-xs text-[var(--text-secondary)] max-w-md">
                {t('recall.no_affected_clients_desc', { batch: recallResults.query })}
              </div>
            </div>
          )}

          {/* Affected Custom Dilution Mixtures */}
          {recallResults.affectedMixtures.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--accent)]" />
                  <span>{t('recall.affected_mixtures_heading')}</span>
                  <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    {recallResults.affectedMixtures.length}
                  </span>
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {recallResults.affectedMixtures.map((mix) => (
                  <div
                    key={mix.id}
                    className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[var(--foreground)]">
                        {mix.name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-medium">
                        {mix.mixtureBatchNumber}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {t('recall.mix_prepared')}: {formatLocalDateDisplay(mix.preparedDate)} · {t('recall.mix_artist')}: {mix.artistName || 'Studio'}
                    </div>
                    <div className="text-xs font-mono text-[var(--foreground)]">
                      {mix.baseInks?.map((b, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{b.brand} - {b.inkName}</span>
                          <span className="text-[var(--text-secondary)]">{b.batchNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Instructions State */
        <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {t('recall.prompt_search_title')}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-lg leading-relaxed">
            {t('recall.prompt_search_desc')}
          </p>
        </div>
      )}
    </div>
  );
};
