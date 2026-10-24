import React, { useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Calendar,
  ShieldAlert,
  Trash2,
  Package,
  Filter,
  Camera,
  Check,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { StudioInkItem } from '../types/database';
import { getLocalDateString } from '../lib/dateUtils';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { t } from '../lib/i18n';

interface ExpiryDashboardTabProps {
  inventory: StudioInkItem[];
  onSaveItem: (item: StudioInkItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const ExpiryDashboardTab: React.FC<ExpiryDashboardTabProps> = ({
  inventory,
  onSaveItem,
  onDeleteItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterState, setFilterState] = useState<'all' | 'expired' | 'warning' | 'ok'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [openedDate, setOpenedDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [paoMonths, setPaoMonths] = useState<number>(12);
  const [status, setStatus] = useState<StudioInkItem['status']>('compliant');
  const [notes, setNotes] = useState('');

  const todayStr = getLocalDateString();

  const calculateExpiryStatus = (item: StudioInkItem) => {
    let effectiveExpiry = item.expiryDate ? new Date(item.expiryDate) : null;

    // Calculate PAO (Period After Opening) expiry if openedDate and paoMonths provided
    if (item.openedDate && item.paoMonths) {
      const openD = new Date(item.openedDate);
      const paoExp = new Date(openD.setMonth(openD.getMonth() + item.paoMonths));
      if (!effectiveExpiry || paoExp < effectiveExpiry) {
        effectiveExpiry = paoExp;
      }
    }

    if (!effectiveExpiry || isNaN(effectiveExpiry.getTime())) {
      return { label: t('expiry.status_no_date'), state: 'unknown', daysRemaining: null };
    }

    const today = new Date(todayStr);
    const diffTime = effectiveExpiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: t('expiry.status_expired_days', { days: Math.abs(diffDays) }), state: 'expired', daysRemaining: diffDays };
    } else if (diffDays <= 30) {
      return { label: t('expiry.status_expiring_days', { days: diffDays }), state: 'warning', daysRemaining: diffDays };
    } else {
      return { label: t('expiry.status_good_days', { days: diffDays }), state: 'ok', daysRemaining: diffDays };
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: StudioInkItem = {
      id: 'ink_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      brand: brand.trim() || t('expiry.default_stock'),
      batchNumber: batchNumber.trim() || t('expiry.default_lot'),
      openedDate: openedDate || undefined,
      expiryDate: expiryDate || undefined,
      paoMonths: paoMonths || 12,
      status,
      notes: notes.trim() || undefined,
      updatedAt: getLocalDateString(),
    };

    await onSaveItem(newItem);
    setName('');
    setBrand('');
    setBatchNumber('');
    setOpenedDate('');
    setExpiryDate('');
    setNotes('');
    setIsAdding(false);
  };

  const handleMarkOpenedToday = async (item: StudioInkItem) => {
    const updated: StudioInkItem = {
      ...item,
      openedDate: todayStr,
      updatedAt: todayStr,
    };
    await onSaveItem(updated);
  };

  const handleBarcodeDetected = (code: string) => {
    if (code.startsWith('LOT') || code.includes('-')) {
      setBatchNumber(code);
    } else {
      setName(code);
    }
    setIsScannerOpen(false);
  };

  // Filter inventory
  const filteredInventory = useMemo(() => {
    if (filterState === 'all') return inventory;
    return inventory.filter((item) => {
      const s = calculateExpiryStatus(item);
      return s.state === filterState;
    });
  }, [inventory, filterState]);

  // Metrics calculation
  let expiredCount = 0;
  let expiringSoonCount = 0;
  let goodCount = 0;

  inventory.forEach((item) => {
    const s = calculateExpiryStatus(item);
    if (s.state === 'expired') expiredCount++;
    else if (s.state === 'warning') expiringSoonCount++;
    else if (s.state === 'ok') goodCount++;
  });

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--brand-cyan)] shrink-0" />
              {t('expiry.title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {t('expiry.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="add_shelf_ink_btn"
              onClick={() => setIsAdding(!isAdding)}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? t('expiry.close_form') : t('expiry.log_bottle_btn')}
            </button>
          </div>
        </div>

        {/* Proactive Alert Banner */}
        {expiredCount > 0 && (
          <div className="mt-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('expiry.action_req_expired')}: {expiredCount} {t('expiry.bottles_require_quarantine')}</span>
            </div>
            <button
              type="button"
              onClick={() => setFilterState('expired')}
              className="px-2.5 py-1 rounded bg-rose-500 text-white font-semibold hover:bg-rose-600 cursor-pointer shrink-0"
            >
              {t('expiry.view_expired_btn')}
            </button>
          </div>
        )}

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <button
            type="button"
            onClick={() => setFilterState(filterState === 'expired' ? 'all' : 'expired')}
            className={`p-3.5 rounded-lg border text-left cursor-pointer transition ${
              filterState === 'expired' ? 'ring-2 ring-rose-500' : ''
            } border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              {t('expiry.action_req_expired')}
            </div>
            <div className="text-2xl font-bold mt-1">{expiredCount}</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterState(filterState === 'warning' ? 'all' : 'warning')}
            className={`p-3.5 rounded-lg border text-left cursor-pointer transition ${
              filterState === 'warning' ? 'ring-2 ring-amber-500' : ''
            } border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              {t('expiry.expiring_within_30')}
            </div>
            <div className="text-2xl font-bold mt-1">{expiringSoonCount}</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterState(filterState === 'ok' ? 'all' : 'ok')}
            className={`p-3.5 rounded-lg border text-left cursor-pointer transition ${
              filterState === 'ok' ? 'ring-2 ring-emerald-500' : ''
            } border-[var(--safe-border)] bg-[var(--safe-bg)] text-[var(--safe-text)]`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              {t('expiry.active_fresh_stock')}
            </div>
            <div className="text-2xl font-bold mt-1">{goodCount}</div>
          </button>
        </div>
      </div>

      {/* Add New Bottle Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="rounded-lg border border-[var(--brand-cyan)] bg-[var(--bg-card)] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{t('expiry.form_heading')}</h3>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--brand-cyan)] hover:bg-[var(--bg-hover)] flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('scanner.open_scanner_btn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {t('expiry.ink_name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('expiry.placeholder_ink_name')}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {t('expiry.brand_mfg')}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={t('expiry.placeholder_brand')}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {t('expiry.batch_lot')}
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. LOT-2024-09"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {t('expiry.opened_date')}
              </label>
              <input
                type="date"
                value={openedDate}
                onChange={(e) => setOpenedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {t('expiry.pao_months')}
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={paoMonths}
                onChange={(e) => setPaoMonths(parseInt(e.target.value) || 12)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {t('expiry.factory_expiry')}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {t('expiry.notes_label')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('expiry.notes_placeholder')}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            >
              {t('expiry.cancel_btn')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--brand-cyan)] text-white hover:opacity-90"
            >
              {t('expiry.save_bottle_btn')}
            </button>
          </div>
        </form>
      )}

      {/* Barcode scanner modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />

      {/* Table / List Container */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[var(--text-muted)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {t('expiry.logged_bottles')} ({filteredInventory.length})
            </h3>
          </div>

          {filterState !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterState('all')}
              className="text-xs text-[var(--brand-cyan)] hover:underline cursor-pointer"
            >
              {t('expiry.show_all_filter')}
            </button>
          )}
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            <p className="text-sm font-semibold">{t('expiry.empty_heading')}</p>
            <p className="text-xs mt-1">{t('expiry.empty_desc')}</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (md:hidden) */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {filteredInventory.map((item) => {
                const s = calculateExpiryStatus(item);
                let badgeClass = 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border)]';
                if (s.state === 'expired') {
                  badgeClass = 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]';
                } else if (s.state === 'warning') {
                  badgeClass = 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
                } else if (s.state === 'ok') {
                  badgeClass = 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)]';
                }

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[var(--text-primary)]">{item.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{item.brand}</div>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold border shrink-0 ${badgeClass}`}>
                        {s.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle)]">
                      <div>
                        <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('expiry.col_batch_lot')}</span>
                        <span className="font-mono text-[var(--text-secondary)]">{item.batchNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('expiry.col_mfg_expiry')}</span>
                        <span className="text-[var(--text-secondary)]">{item.expiryDate || '—'}</span>
                      </div>
                    </div>

                    <div className="text-xs pt-1 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[var(--text-muted)] font-semibold">{t('expiry.col_opened')}: </span>
                        {item.openedDate ? (
                          <span className="text-[var(--text-secondary)]">
                            {item.openedDate} ({t('expiry.item_pao', { pao: item.paoMonths || 12 })})
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkOpenedToday(item)}
                            className="px-2 py-0.5 rounded bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] text-xs font-medium hover:bg-[var(--brand-cyan)]/20 cursor-pointer"
                          >
                            + {t('expiry.mark_opened_today')}
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-text)] transition-colors cursor-pointer"
                        aria-label={t('expiry.delete_bottle_aria')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4">{t('expiry.col_ink_brand')}</th>
                    <th className="py-3 px-4">{t('expiry.col_batch_lot')}</th>
                    <th className="py-3 px-4">{t('expiry.col_opened')}</th>
                    <th className="py-3 px-4">{t('expiry.col_mfg_expiry')}</th>
                    <th className="py-3 px-4">{t('expiry.col_status')}</th>
                    <th className="py-3 px-4 text-right">{t('expiry.col_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredInventory.map((item) => {
                    const s = calculateExpiryStatus(item);
                    let badgeClass = 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border)]';
                    if (s.state === 'expired') {
                      badgeClass = 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]';
                    } else if (s.state === 'warning') {
                      badgeClass = 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
                    } else if (s.state === 'ok') {
                      badgeClass = 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)]';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)]">{item.name}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{item.brand}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">{item.batchNumber || '—'}</td>
                        <td className="py-3 px-4">
                          {item.openedDate ? (
                            <div>
                              <div>{item.openedDate}</div>
                              <div className="text-xs text-[var(--text-muted)]">{t('expiry.item_pao', { pao: item.paoMonths || 12 })}</div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkOpenedToday(item)}
                              className="px-2 py-0.5 rounded bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] text-xs font-medium hover:bg-[var(--brand-cyan)]/20 cursor-pointer"
                            >
                              + {t('expiry.mark_opened_today')}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">{item.expiryDate || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold border ${badgeClass}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-text)] transition-colors cursor-pointer"
                            aria-label={t('expiry.delete_bottle_aria')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
