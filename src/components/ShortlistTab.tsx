import React, { useState, useEffect } from 'react';
import { Download, Trash2, BookmarkCheck, FileSpreadsheet, QrCode } from 'lucide-react';
import { InkAuditRecord } from '../types/database';
import { getAudits, deleteAudit, clearAllAudits, subscribeToSync, getProfile } from '../lib/offlineDb';
import { t } from '../lib/i18n';
import { getLocalDateString } from '../lib/dateUtils';
import { BottleLabelQRModal } from './BottleLabelQRModal';

export const ShortlistTab: React.FC = () => {
  const [audits, setAudits] = useState<InkAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQRItem, setActiveQRItem] = useState<InkAuditRecord | null>(null);
  const [studioName, setStudioName] = useState('Independent Studio');

  const loadShortlist = async () => {
    try {
      const data = await getAudits();
      setAudits(data);
      const prof = await getProfile();
      if (prof && prof.studioName) {
        setStudioName(prof.studioName);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShortlist();
    const unsub = subscribeToSync((event) => {
      if (event.type.startsWith('audit_') || event.type === 'backup_imported') {
        loadShortlist();
      }
      if (event.type === 'profile_updated') {
        getProfile().then((p) => {
          if (p && p.studioName) {
            setStudioName(p.studioName);
          }
        });
      }
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteAudit(id);
    setAudits((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAll = async () => {
    if (window.confirm(t('shortlist.confirm_clear'))) {
      await clearAllAudits();
      setAudits([]);
    }
  };

  const handleExportCSV = () => {
    if (!audits.length) return;

    // Build machine-readable CSV formatting each audited ingredient with regulation status and timestamps
    const headers = [
      'Timestamp_ISO8601',
      'Date_Evaluated_Local',
      'Audit_ID',
      'Brand_Maker',
      'Ink_Name',
      'Batch_Lot_Number',
      'Ingredient_Extracted_Query',
      'Recognised_Substance_Name',
      'Regulation_Status',
      'Regulation_Status_Label',
      'Colour_Index_CI',
      'CAS_Number',
      'Concentration_Limit',
      'Legal_Reference',
      'Formulation_Summary',
      'Auditor_Artist',
      'Studio_Name',
    ];

    const escapeCsv = (val: string | number | null | undefined) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const localDateStr = getLocalDateString();
    const activeStudio = studioName || audits.find((a) => a.studioName)?.studioName || t('shortlist.default_studio');

    // Header row with studio name, current date of export, and information-only disclaimer
    const metaHeaderRow = [
      escapeCsv(t('shortlist.csv_studio_label', { studio: activeStudio })),
      escapeCsv(t('shortlist.csv_export_date_label', { date: localDateStr })),
      escapeCsv(`Disclaimer: ${t('shortlist.csv_disclaimer')}`),
      ...Array(Math.max(0, headers.length - 3)).fill('""'),
    ].join(',');

    const rows: string[] = [];

    audits.forEach((a) => {
      const localDate = a.localDate || a.timestamp.slice(0, 10);
      const isoTimestamp = a.timestamp;

      if (a.hits && a.hits.length > 0) {
        a.hits.forEach((hit) => {
          const sub = hit.substance;
          rows.push(
            [
              escapeCsv(isoTimestamp),
              escapeCsv(localDate),
              escapeCsv(a.id),
              escapeCsv(a.brand),
              escapeCsv(a.inkName),
              escapeCsv(a.batchNumber),
              escapeCsv(hit.query),
              escapeCsv(sub ? sub.name : 'UNRECOGNISED'),
              escapeCsv(sub ? sub.status.toUpperCase() : 'UNRECOGNISED'),
              escapeCsv(sub ? sub.status_label : 'Unrecognised (Verification Required)'),
              escapeCsv(sub?.ci || ''),
              escapeCsv(sub && sub.cas.length > 0 ? sub.cas.join('; ') : ''),
              escapeCsv(sub?.exact_limit || 'check the regulation text'),
              escapeCsv(sub?.entry_reference || 'REACH Annex XVII Entry 75'),
              escapeCsv(a.findingsSummary),
              escapeCsv(a.auditorName || ''),
              escapeCsv(a.studioName || ''),
            ].join(',')
          );
        });
      } else {
        rows.push(
          [
            escapeCsv(isoTimestamp),
            escapeCsv(localDate),
            escapeCsv(a.id),
            escapeCsv(a.brand),
            escapeCsv(a.inkName),
            escapeCsv(a.batchNumber),
            escapeCsv(a.ingredientsRaw.replace(/[\r\n]+/g, ' ')),
            escapeCsv('NO_INDIVIDUAL_SUBSTANCES_EXTRACTED'),
            escapeCsv('UNCHECKED'),
            escapeCsv('Raw Text Saved'),
            escapeCsv(''),
            escapeCsv(''),
            escapeCsv(''),
            escapeCsv('REACH Annex XVII Entry 75'),
            escapeCsv(a.findingsSummary),
            escapeCsv(a.auditorName || ''),
            escapeCsv(a.studioName || ''),
          ].join(',')
        );
      }
    });

    const csvContent = [metaHeaderRow, headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `studio_audited_ingredients_${localDateStr}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!audits.length) return;
    const jsonContent = JSON.stringify(audits, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const localDateStr = `${localYear}-${localMonth}-${localDay}`;
    link.setAttribute('download', `studio_shortlist_inks_${localDateStr}.json`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-[var(--accent)] shrink-0" />
            {t('shortlist.title')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
            {t('shortlist.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {audits.length > 0 && (
            <>
              <button
                type="button"
                id="clear_all_shortlist_btn"
                onClick={handleClearAll}
                className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold text-[var(--danger-text)] bg-[var(--danger-bg)] hover:opacity-90 border border-[var(--danger-border)] transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('shortlist.clear_all')}
              </button>
              <button
                type="button"
                id="download_shortlist_json_btn"
                onClick={handleExportJSON}
                className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer flex items-center gap-1.5"
                title={t('shortlist.download_json_title')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('shortlist.download_json')}</span>
              </button>
              <button
                type="button"
                id="download_shortlist_csv_btn"
                onClick={handleExportCSV}
                className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity cursor-pointer flex items-center gap-2"
                title={t('shortlist.download_csv_title')}
              >
                <Download className="w-4 h-4" />
                <span>{t('shortlist.download_csv')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          {t('shortlist.loading')}
        </div>
      ) : audits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-10 text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            {t('shortlist.empty_state')}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
          {/* Mobile View */}
          <div className="md:hidden divide-y divide-[var(--border)]">
            {audits.map((item) => {
              return (
                <div key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                        {item.brand}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {item.inkName}
                      </h4>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-subtle)] border border-[var(--border)] shrink-0">
                      {item.findingsSummary}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                    <div>
                      <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('shortlist.date_logged')}</span>
                      <span className="font-mono">{item.localDate || item.timestamp.slice(0, 10)}</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('shortlist.batch_lot')}</span>
                      <span className="font-mono">{item.batchNumber || '—'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                    <span className="text-xs uppercase font-bold text-[var(--text-muted)] block mb-0.5">{t('shortlist.detected_substances')}</span>
                    <p className="leading-relaxed">
                      {item.hits.map((h) => (h.substance ? h.substance.name : h.query)).join(', ')}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveQRItem(item)}
                      className="min-h-[44px] px-3 py-1.5 text-xs font-semibold text-[var(--brand-cyan)] hover:bg-[var(--bg-subtle)] rounded-md border border-[var(--border)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {t('shortlist.traceability_qr')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="min-h-[44px] px-3 py-1.5 text-xs font-medium text-[var(--danger-text)] hover:bg-[var(--danger-bg)] rounded-md border border-transparent hover:border-[var(--danger-border)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('shortlist.delete_item')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="py-3 px-4">{t('shortlist.col_date')}</th>
                  <th className="py-3 px-4">{t('shortlist.col_brand')}</th>
                  <th className="py-3 px-4">{t('shortlist.col_ink')}</th>
                  <th className="py-3 px-4">{t('shortlist.col_batch')}</th>
                  <th className="py-3 px-4">{t('shortlist.col_findings')}</th>
                  <th className="py-3 px-4">{t('shortlist.col_items')}</th>
                  <th className="py-3 px-4 text-right">{t('shortlist.col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {audits.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                        {item.localDate || item.timestamp.slice(0, 10)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-xs text-[var(--text-primary)]">
                        {item.brand}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-[var(--text-primary)]">
                        {item.inkName}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--text-secondary)]">
                        {item.batchNumber || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-subtle)] border border-[var(--border)]">
                          {item.findingsSummary}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                        {item.hits.map((h) => (h.substance ? h.substance.name : h.query)).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveQRItem(item)}
                            className="min-h-[44px] text-xs text-[var(--brand-cyan)] hover:underline inline-flex items-center gap-1.5 cursor-pointer px-2"
                            title={t('shortlist.qr_label_title')}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            {t('shortlist.qr_label_btn')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="min-h-[44px] text-xs text-[var(--danger-text)] hover:underline inline-flex items-center gap-1.5 cursor-pointer px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('shortlist.delete_item')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Label Modal */}
      {activeQRItem && (
        <BottleLabelQRModal
          audit={activeQRItem}
          onClose={() => setActiveQRItem(null)}
        />
      )}
    </div>
  );
};
