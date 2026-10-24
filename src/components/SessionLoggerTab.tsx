import React, { useState } from 'react';
import { UserCheck, Plus, Printer, Trash2, FileText, Calendar } from 'lucide-react';
import { ClientTattooSession, StudioInkItem, InkAuditRecord } from '../types/database';
import { t, getLocale } from '../lib/i18n';
import { getLocalDateString } from '../lib/dateUtils';

interface SessionLoggerTabProps {
  sessions: ClientTattooSession[];
  inventory: StudioInkItem[];
  audits: InkAuditRecord[];
  onSaveSession: (session: ClientTattooSession) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
}

export const SessionLoggerTab: React.FC<SessionLoggerTabProps> = ({
  sessions,
  inventory,
  audits,
  onSaveSession,
  onDeleteSession,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [clientReference, setClientReference] = useState('');
  const [clientName, setClientName] = useState('');
  const [artistName] = useState('');
  const [studioName] = useState('');
  const [bodyPlacement, setBodyPlacement] = useState('');
  const [notes, setNotes] = useState('');

  // Active session ink list
  const [selectedInks, setSelectedInks] = useState<ClientTattooSession['usedInks']>([]);

  // Ink selector dropdown state
  const [chosenInkId, setChosenInkId] = useState('');
  const [chosenPurpose, setChosenPurpose] = useState<ClientTattooSession['usedInks'][0]['purpose']>('outline');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const localDate = getLocalDateString(now);

  // Calculate total number of sessions logged in the current month
  const currentMonthSessions = sessions.filter((s) => {
    if (s.localDate) {
      const parts = s.localDate.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        return y === currentYear && m === currentMonthIndex;
      }
    }
    if (s.timestamp) {
      const d = new Date(s.timestamp);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex;
    }
    return false;
  });
  const currentMonthTotal = currentMonthSessions.length;

  const uniqueClientsThisMonth = new Set(
    currentMonthSessions.map((s) => s.clientReference || s.clientName).filter(Boolean)
  ).size;

  const inksUsedThisMonth = currentMonthSessions.reduce(
    (sum, s) => sum + (s.usedInks ? s.usedInks.length : 0),
    0
  );

  const activeLocale = getLocale();
  let localizedMonth = '';
  try {
    const formatter = new Intl.DateTimeFormat(activeLocale, { month: 'long', year: 'numeric' });
    const formatted = formatter.format(now);
    localizedMonth = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    localizedMonth = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  }

  const monthPercentage = sessions.length > 0
    ? Math.min(100, Math.round((currentMonthTotal / sessions.length) * 100))
    : currentMonthTotal > 0 ? 100 : 0;

  const handleAddInkToSession = () => {
    if (!chosenInkId) return;

    // Search inventory or audits
    const inv = inventory.find((i) => i.id === chosenInkId);
    const aud = audits.find((a) => a.id === chosenInkId);

    const inkName = inv ? inv.name : aud ? aud.inkName : t('session_logger.default_ink');
    const brand = inv ? inv.brand : aud ? aud.brand : t('session_logger.default_brand');
    const batchNumber = inv ? (inv.batchNumber || 'N/A') : aud ? aud.batchNumber : 'LOT-N/A';
    const status = inv ? inv.status : aud?.verdict === 'prohibited_detected' ? 'banned' : 'compliant';

    setSelectedInks((prev) => [
      ...prev,
      {
        inkId: chosenInkId,
        inkName,
        brand,
        batchNumber,
        purpose: chosenPurpose,
        status: status as any,
      },
    ]);
  };

  const handleRemoveInk = (idx: number) => {
    setSelectedInks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientReference.trim() && !clientName.trim()) return;

    const newSession: ClientTattooSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      localDate,
      clientReference: clientReference.trim() || `CONSENT-${Date.now().toString().slice(-4)}`,
      clientName: clientName.trim() || t('session_logger.default_client'),
      artistName: artistName.trim() || t('session_logger.default_artist'),
      studioName: studioName.trim() || t('session_logger.default_studio'),
      bodyPlacement: bodyPlacement.trim() || t('session_logger.default_placement'),
      usedInks: selectedInks,
      notes: notes.trim() || undefined,
    };

    await onSaveSession(newSession);
    setClientReference('');
    setClientName('');
    setBodyPlacement('');
    setNotes('');
    setSelectedInks([]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Monthly Procedure Visual Summary Bar */}
      <div
        id="monthly_session_summary_bar"
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-cyan)] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--text-muted)] block">
                {t('session_logger.summary_bar_title')}
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {localizedMonth}
              </h3>
            </div>
          </div>

          <div className="flex items-baseline sm:items-end flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[var(--brand-cyan)] leading-none">
                {currentMonthTotal}
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('session_logger.current_month_sessions_label')}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress / Activity Bar */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              {t('session_logger.current_month_summary_desc', {
                count: currentMonthTotal,
                month: localizedMonth,
              })}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {t('session_logger.summary_all_time_total', { total: sessions.length })}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--brand-cyan)] transition-all duration-300"
              style={{ width: `${Math.max(currentMonthTotal > 0 ? 5 : 0, monthPercentage)}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[var(--text-muted)]">
            <span>{t('session_logger.summary_unique_clients', { count: uniqueClientsThisMonth })}</span>
            <span>{t('session_logger.summary_inks_applied', { count: inksUsedThisMonth })}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-cyan)] shrink-0" />
              {t('session_logger.heading')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {t('session_logger.subheading')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? t('session_logger.close_logger') : t('session_logger.log_new_session')}
          </button>
        </div>
      </div>

      {/* New Session Form */}
      {isAdding && (
        <form onSubmit={handleSaveSession} className="rounded-lg border border-[var(--brand-cyan)] bg-[var(--bg-card)] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{t('session_logger.record_procedure_title')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('session_logger.client_ref_label')}</label>
              <input
                type="text"
                required
                placeholder={t('session_logger.client_ref_placeholder')}
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('session_logger.client_name_label')}</label>
              <input
                type="text"
                placeholder={t('session_logger.client_name_placeholder')}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('session_logger.placement_label')}</label>
              <input
                type="text"
                placeholder={t('session_logger.placement_placeholder')}
                value={bodyPlacement}
                onChange={(e) => setBodyPlacement(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
          </div>

          {/* Select and Add Inks to Session */}
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('session_logger.attach_inks_heading')}
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={chosenInkId}
                onChange={(e) => setChosenInkId(e.target.value)}
                className="flex-1 min-w-[200px] rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none"
              >
                <option value="">{t('session_logger.select_ink_placeholder')}</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.brand} - {i.name} (LOT: {i.batchNumber || 'N/A'})
                  </option>
                ))}
                {audits.map((a) => (
                  <option key={a.id} value={a.id}>
                    {t('session_logger.audited_prefix')} {a.brand} - {a.inkName} (LOT: {a.batchNumber})
                  </option>
                ))}
              </select>

              <select
                value={chosenPurpose}
                onChange={(e) => setChosenPurpose(e.target.value as any)}
                className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none"
              >
                <option value="outline">{t('session_logger.purpose_outline')}</option>
                <option value="shading">{t('session_logger.purpose_shading')}</option>
                <option value="color_fill">{t('session_logger.purpose_color_fill')}</option>
                <option value="highlight">{t('session_logger.purpose_highlight')}</option>
              </select>

              <button
                type="button"
                onClick={handleAddInkToSession}
                className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold bg-[var(--bg-tag)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] cursor-pointer"
              >
                {t('session_logger.add_ink_btn')}
              </button>
            </div>

            {/* Attached Inks List */}
            {selectedInks.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                {selectedInks.map((ink, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">{ink.inkName}</span>
                      <span className="text-[var(--text-secondary)]"> ({ink.brand})</span>
                      <span className="font-mono text-[var(--brand-cyan)] ml-2">LOT: {ink.batchNumber}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] text-xs uppercase font-medium">
                        {ink.purpose}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveInk(idx)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--danger-text)] hover:opacity-80 p-1 cursor-pointer"
                    >
                      {t('session_logger.remove_ink_btn')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              {t('session_logger.cancel_btn')}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 cursor-pointer"
            >
              {t('session_logger.save_session_btn')}
            </button>
          </div>
        </form>
      )}

      {/* Historical Sessions List */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">{t('session_logger.empty_sessions_title')}</p>
            <p className="text-xs mt-1">{t('session_logger.empty_sessions_desc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-5 hover:bg-[var(--bg-subtle)] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--text-primary)]">
                        {sess.clientReference}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">({sess.clientName})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                      <span>{t('session_logger.date_label', { date: sess.localDate })}</span>
                      <span>•</span>
                      <span>{t('session_logger.placement_summary', { placement: sess.bodyPlacement })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-tag)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {t('session_logger.print_card_btn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSession(sess.id)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-text)] transition-colors cursor-pointer"
                      aria-label={t('session_logger.delete_session_aria')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Used Inks in this session */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {sess.usedInks.map((ink, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs"
                    >
                      <div className="font-semibold text-[var(--text-primary)]">{ink.inkName}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{ink.brand}</div>
                      <div className="font-mono text-xs text-[var(--brand-cyan)] mt-1">
                        LOT: {ink.batchNumber}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] uppercase mt-0.5">
                        {ink.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

