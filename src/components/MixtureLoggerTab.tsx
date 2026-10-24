import React, { useState } from 'react';
import {
  Pipette,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { CustomInkMixture, StudioInkItem } from '../types/database';
import { getLocalDateString, formatLocalDateDisplay, calculateDaysRemaining } from '../lib/dateUtils';
import { t } from '../lib/i18n';

interface MixtureLoggerTabProps {
  mixtures: CustomInkMixture[];
  inventory: StudioInkItem[];
  onSaveMixture: (mixture: CustomInkMixture) => Promise<void>;
  onDeleteMixture: (id: string) => Promise<void>;
  onSendToSession?: (mixture: CustomInkMixture) => void;
}

export const MixtureLoggerTab: React.FC<MixtureLoggerTabProps> = ({
  mixtures,
  inventory,
  onSaveMixture,
  onDeleteMixture,
  onSendToSession,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomInkMixture['type']>('greywash');
  const [mixtureBatchNumber, setMixtureBatchNumber] = useState(() => {
    return 'MIX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  });
  const [preparedDate, setPreparedDate] = useState(() => getLocalDateString());
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [artistName, setArtistName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [notes, setNotes] = useState('');

  // Base inks state
  const [baseInks, setBaseInks] = useState<CustomInkMixture['baseInks']>([
    {
      brand: '',
      inkName: '',
      batchNumber: '',
      ratioOrDrops: '5 drops',
    },
  ]);

  // Diluent state
  const [diluentType, setDiluentType] = useState<string>('distilled_water');
  const [diluentBrand, setDiluentBrand] = useState('');
  const [diluentBatchNumber, setDiluentBatchNumber] = useState('');
  const [diluentProportion, setDiluentProportion] = useState('20 drops');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddBaseInkRow = () => {
    setBaseInks((prev) => [
      ...prev,
      { brand: '', inkName: '', batchNumber: '', ratioOrDrops: '' },
    ]);
  };

  const handleRemoveBaseInkRow = (index: number) => {
    setBaseInks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBaseInkChange = (index: number, field: keyof CustomInkMixture['baseInks'][0], val: string) => {
    setBaseInks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSelectFromInventory = (index: number, invId: string) => {
    const item = inventory.find((i) => i.id === invId);
    if (!item) return;
    setBaseInks((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        brand: item.brand,
        inkName: item.name,
        batchNumber: item.batchNumber || 'N/A',
      };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate expiry date string
    const parts = preparedDate.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const expObj = new Date(y, m, d + (expiryDays || 7));
    const expiryDate = getLocalDateString(expObj);

    const newMixture: CustomInkMixture = {
      id: 'mix_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      type,
      mixtureBatchNumber: mixtureBatchNumber.trim() || 'MIX-' + Date.now(),
      preparedDate,
      expiryDate,
      artistName: artistName.trim() || undefined,
      studioName: studioName.trim() || undefined,
      baseInks: baseInks.filter((b) => b.inkName.trim() || b.brand.trim()),
      diluent: {
        type: diluentType,
        name: diluentType,
        brand: diluentBrand.trim() || undefined,
        batchNumber: diluentBatchNumber.trim() || undefined,
        ratioOrDrops: diluentProportion.trim() || undefined,
      },
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSaveMixture(newMixture);
    setIsAdding(false);
    setName('');
    setNotes('');
    setMixtureBatchNumber('MIX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
  };

  const handleCopyRecipe = (mix: CustomInkMixture) => {
    const lines = [
      `=== ${mix.name} [${mix.mixtureBatchNumber}] ===`,
      `${t('mixtures.field_type')}: ${mix.type}`,
      `${t('mixtures.field_prepared')}: ${formatLocalDateDisplay(mix.preparedDate)}`,
      `${t('mixtures.field_expires')}: ${formatLocalDateDisplay(mix.expiryDate || '')}`,
      `${t('mixtures.field_artist')}: ${mix.artistName || 'N/A'}`,
      '',
      `--- ${t('mixtures.heading_base_inks')} ---`,
      ...mix.baseInks.map((b) => `• ${b.brand} - ${b.inkName} (Lot: ${b.batchNumber}) [${b.ratioOrDrops || 'Proportion N/A'}]`),
      '',
      mix.diluent ? `--- ${t('mixtures.heading_diluent')} --- \n• ${mix.diluent.type || mix.diluent.name} (${mix.diluent.brand || 'Generic'}, Lot: ${mix.diluent.batchNumber || 'N/A'}): ${mix.diluent.ratioOrDrops || ''}` : '',
      mix.notes ? `\n${t('mixtures.field_notes')}: ${mix.notes}` : '',
    ];

    navigator.clipboard?.writeText(lines.filter(Boolean).join('\n'));
    setCopiedId(mix.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="mixture-logger-container" className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
            <Pipette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t('mixtures.heading')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              {t('mixtures.subheading')}
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-add-mixture"
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? t('mixtures.btn_cancel') : t('mixtures.btn_new_mixture')}</span>
        </button>
      </div>

      {/* Form Container */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-5 shadow-sm"
        >
          <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>{t('mixtures.form_title')}</span>
            </h3>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {mixtureBatchNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t('mixtures.label_name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('mixtures.placeholder_name')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t('mixtures.label_type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CustomInkMixture['type'])}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="greywash">{t('mixtures.type_greywash')}</option>
                <option value="lining_wash">{t('mixtures.type_lining_wash')}</option>
                <option value="color_blend">{t('mixtures.type_color_blend')}</option>
                <option value="custom_shading">{t('mixtures.type_custom_shading')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t('mixtures.label_lot')}
              </label>
              <input
                type="text"
                value={mixtureBatchNumber}
                onChange={(e) => setMixtureBatchNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t('mixtures.label_prepared_date')}
              </label>
              <input
                type="date"
                value={preparedDate}
                onChange={(e) => setPreparedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t('mixtures.label_shelf_life_days')}
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value, 10) || 7)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {t('mixtures.label_artist')}
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder={t('mixtures.placeholder_artist')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Base Inks List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--foreground)]">
                {t('mixtures.heading_base_inks')} ({baseInks.length})
              </label>
              <button
                type="button"
                onClick={handleAddBaseInkRow}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('mixtures.btn_add_base_ink')}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {baseInks.map((ink, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                >
                  {/* Quick select from studio inventory if available */}
                  <div className="sm:col-span-1">
                    <select
                      onChange={(e) => handleSelectFromInventory(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
                    >
                      <option value="">{t('mixtures.pick_from_stock')}</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.brand})
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder={t('mixtures.placeholder_ink_brand')}
                    value={ink.brand}
                    onChange={(e) => handleBaseInkChange(idx, 'brand', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  />

                  <input
                    type="text"
                    placeholder={t('mixtures.placeholder_ink_name')}
                    value={ink.inkName}
                    onChange={(e) => handleBaseInkChange(idx, 'inkName', e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  />

                  <input
                    type="text"
                    placeholder={t('mixtures.placeholder_ink_lot')}
                    value={ink.batchNumber}
                    onChange={(e) => handleBaseInkChange(idx, 'batchNumber', e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-mono rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  />

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder={t('mixtures.placeholder_proportion')}
                      value={ink.ratioOrDrops}
                      onChange={(e) => handleBaseInkChange(idx, 'ratioOrDrops', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                    />
                    {baseInks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBaseInkRow(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diluent Section */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              {t('mixtures.heading_diluent')}
            </label>
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <select
                  value={diluentType}
                  onChange={(e) => setDiluentType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                >
                  <option value="distilled_water">{t('mixtures.diluent_water')}</option>
                  <option value="witch_hazel">{t('mixtures.diluent_witch_hazel')}</option>
                  <option value="glycerin">{t('mixtures.diluent_glycerin')}</option>
                  <option value="mixing_solution">{t('mixtures.diluent_mixing_solution')}</option>
                </select>
              </div>

              <input
                type="text"
                placeholder={t('mixtures.placeholder_diluent_brand')}
                value={diluentBrand}
                onChange={(e) => setDiluentBrand(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
              />

              <input
                type="text"
                placeholder={t('mixtures.placeholder_diluent_lot')}
                value={diluentBatchNumber}
                onChange={(e) => setDiluentBatchNumber(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
              />

              <input
                type="text"
                placeholder={t('mixtures.placeholder_diluent_volume')}
                value={diluentProportion}
                onChange={(e) => setDiluentProportion(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {t('mixtures.field_notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('mixtures.placeholder_notes')}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--card)]"
            >
              {t('mixtures.btn_cancel')}
            </button>
            <button
              id="btn-submit-save-mixture"
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition shadow-xs cursor-pointer"
            >
              {t('mixtures.btn_save_mixture')}
            </button>
          </div>
        </form>
      )}

      {/* List of Saved Mixtures */}
      {mixtures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mixtures.map((mix) => {
            const daysLeft = mix.expiryDate ? calculateDaysRemaining(mix.expiryDate) : null;
            const isExpired = daysLeft !== null && daysLeft <= 0;
            const isWarning = daysLeft !== null && daysLeft > 0 && daysLeft <= 3;

            return (
              <div
                key={mix.id}
                className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--foreground)] leading-tight">
                        {mix.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] font-semibold">
                          {mix.mixtureBatchNumber}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-[var(--accent)] font-medium">
                          {mix.type}
                        </span>
                      </div>
                    </div>

                    {/* Expiry tag */}
                    {mix.expiryDate && (
                      <div
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                          isExpired
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : isWarning
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {isExpired
                            ? t('mixtures.badge_expired')
                            : t('mixtures.badge_days_left', { days: daysLeft })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dates & Artist */}
                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-3 flex-wrap">
                    <span>
                      {t('mixtures.field_prepared')}: {formatLocalDateDisplay(mix.preparedDate)}
                    </span>
                    {mix.artistName && (
                      <span>
                        {t('mixtures.field_artist')}: {mix.artistName}
                      </span>
                    )}
                  </div>

                  {/* Base Inks Summary */}
                  <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs flex flex-col gap-1.5">
                    <span className="font-semibold text-[var(--foreground)]">
                      {t('mixtures.heading_base_inks')}:
                    </span>
                    {mix.baseInks.map((b, i) => (
                      <div key={i} className="flex justify-between items-center text-[var(--text-secondary)]">
                        <span>
                          <span className="font-medium text-[var(--foreground)]">{b.brand}</span> - {b.inkName} ({b.batchNumber})
                        </span>
                        <span className="font-mono text-xs text-[var(--accent)]">{b.ratioOrDrops}</span>
                      </div>
                    ))}
                    {mix.diluent && (
                      <div className="border-t border-[var(--border)] pt-1.5 mt-1 flex justify-between items-center text-[var(--text-secondary)]">
                        <span>
                          {t('mixtures.heading_diluent')}: {mix.diluent.type || mix.diluent.name} ({mix.diluent.brand || 'Std'})
                        </span>
                        <span className="font-mono text-xs">{mix.diluent.ratioOrDrops}</span>
                      </div>
                    )}
                  </div>

                  {mix.notes && (
                    <p className="text-xs text-[var(--text-secondary)] italic">
                      "{mix.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyRecipe(mix)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition flex items-center gap-1"
                    >
                      {copiedId === mix.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === mix.id ? t('mixtures.copied') : t('mixtures.btn_copy_recipe')}</span>
                    </button>
                    {onSendToSession && (
                      <button
                        type="button"
                        onClick={() => onSendToSession(mix)}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition flex items-center gap-1"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>{t('mixtures.btn_use_in_session')}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteMixture(mix.id)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                    title={t('mixtures.btn_delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
            <Pipette className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {t('mixtures.empty_title')}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
            {t('mixtures.empty_desc')}
          </p>
        </div>
      )}
    </div>
  );
};
