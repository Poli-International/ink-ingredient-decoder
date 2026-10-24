import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, Plus, Trash2, FileSpreadsheet, FileText, Sparkles, Check, ArrowDown } from 'lucide-react';
import { REACH_APPENDIX_13_LIMITS, HeavyMetalLimit } from '../data/heavyMetals';
import { HeavyMetalCOARecord } from '../types/database';
import { parseCoaText, ParsedCoaResult } from '../lib/coaParser';
import { t } from '../lib/i18n';

interface HeavyMetalCalculatorTabProps {
  coas: HeavyMetalCOARecord[];
  onSaveCOA: (coa: HeavyMetalCOARecord) => Promise<void>;
  onDeleteCOA: (id: string) => Promise<void>;
}

export const HeavyMetalCalculatorTab: React.FC<HeavyMetalCalculatorTabProps> = ({
  coas,
  onSaveCOA,
  onDeleteCOA,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [inkName, setInkName] = useState('');
  const [brand, setBrand] = useState('');
  const [labName, setLabName] = useState('');
  const [sampleType, setSampleType] = useState<'ink_bottle' | 'raw_pigment'>('ink_bottle');

  // Interactive measured inputs mapped to substance limits
  const [measurements, setMeasurements] = useState<Record<string, string>>({});

  // Raw COA text parser state
  const [showParser, setShowParser] = useState(false);
  const [pastedCoaText, setPastedCoaText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedCoaResult | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDate = `${year}-${month}-${day}`;

  const handleValueChange = (id: string, val: string) => {
    setMeasurements((prev) => ({ ...prev, [id]: val }));
  };

  const handleParseText = () => {
    if (!pastedCoaText.trim()) return;
    const res = parseCoaText(pastedCoaText);
    setParsedPreview(res);
  };

  const handleApplyParsedData = () => {
    if (!parsedPreview) return;
    setMeasurements((prev) => ({ ...prev, ...parsedPreview.measurements }));
    if (parsedPreview.detectedBatch) setBatchNumber(parsedPreview.detectedBatch);
    if (parsedPreview.detectedLab) setLabName(parsedPreview.detectedLab);
    if (parsedPreview.detectedBrand) setBrand(parsedPreview.detectedBrand);
    setShowParser(false);
  };

  const handleLoadSampleCoa = () => {
    const sample = `TEST REPORT: CTL Bielefeld / SGS Laboratory Analysis
Product: Carbon Black Ultra Lining Ink
Batch / Lot: LOT-2024-EU75
Date: 2024-03-15
Method: ICP-MS / DIN EN ISO 17294-2 (Screening REACH Annex XVII Entry 75)

Substance Results:
Lead (Pb): 0.12 mg/kg (Limit: <= 0.7 ppm) -> PASS
Cadmium (Cd): < 0.05 ppm (Limit: <= 0.5 ppm) -> PASS
Mercury (Hg): ND (< 0.02 ppm) -> PASS
Arsenic (As): 0.18 mg/kg -> PASS
Chromium (VI): < 0.1 ppm -> PASS
Nickel (Ni): 1.8 ppm (Limit: <= 5.0 ppm) -> PASS
Antimony (Sb): 0.08 mg/kg -> PASS
Barium (Ba): 14.2 ppm (Limit: <= 500 ppm) -> PASS
Copper (Cu): 4.5 ppm (Limit: <= 250 ppm) -> PASS
Zinc (Zn): 22.0 ppm (Limit: <= 2000 ppm) -> PASS
Tin (Sn): < 0.5 ppm -> PASS
Selenium (Se): < 0.2 ppm -> PASS
Benzo[a]pyrene: < 0.001 ppm (Limit: <= 0.005 ppm) -> PASS`;
    setPastedCoaText(sample);
    const res = parseCoaText(sample);
    setParsedPreview(res);
    setInkName('Carbon Black Ultra Lining Ink');
  };

  const handleSaveCOA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim() || !inkName.trim()) return;

    let overallPass = true;
    const results: HeavyMetalCOARecord['results'] = [];

    REACH_APPENDIX_13_LIMITS.forEach((limit) => {
      const rawVal = measurements[limit.id];
      if (rawVal !== undefined && rawVal !== '') {
        const measured = parseFloat(rawVal);
        if (!isNaN(measured)) {
          const pass = measured <= limit.maxLimitPpm;
          if (!pass) overallPass = false;
          const marginPercent = Math.round((measured / limit.maxLimitPpm) * 100);
          results.push({
            metalId: limit.id,
            substanceName: limit.substance,
            measuredPpm: measured,
            maxLimitPpm: limit.maxLimitPpm,
            pass,
            marginPercent,
          });
        }
      }
    });

    const newRecord: HeavyMetalCOARecord = {
      id: 'coa_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      batchNumber: batchNumber.trim(),
      inkName: inkName.trim(),
      brand: brand.trim() || t('metals.default_manufacturer'),
      testDate: localDate,
      labName: labName.trim() || t('metals.default_lab'),
      sampleType,
      results,
      overallPass,
      createdAt: new Date().toISOString(),
    };

    await onSaveCOA(newRecord);
    setBatchNumber('');
    setInkName('');
    setBrand('');
    setLabName('');
    setMeasurements({});
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-cyan)] shrink-0" />
              {t('metals.title')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {t('metals.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? t('metals.close_calculator') : t('metals.evaluate_new_coa')}
          </button>
        </div>
      </div>

      {/* Calculator & Input Form */}
      {isAdding && (
        <form onSubmit={handleSaveCOA} className="rounded-lg border border-[var(--brand-cyan)] bg-[var(--bg-card)] p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('metals.form_heading')}
            </h3>
            <button
              type="button"
              id="toggle-coa-text-parser-btn"
              onClick={() => setShowParser(!showParser)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
              <span>{showParser ? t('metals.hide_parser') : t('metals.open_text_parser')}</span>
            </button>
          </div>

          {/* Raw Text COA Optical/Text Parser Box */}
          {showParser && (
            <div className="p-4 rounded-xl border border-[var(--brand-cyan)]/40 bg-[var(--bg-base)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <Sparkles className="w-4 h-4 text-[var(--brand-cyan)]" />
                  <span>{t('metals.parser_title')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleCoa}
                  className="text-xs text-[var(--brand-cyan)] hover:underline self-start sm:self-auto cursor-pointer"
                >
                  {t('metals.load_sample_coa')}
                </button>
              </div>
              <textarea
                rows={5}
                value={pastedCoaText}
                onChange={(e) => setPastedCoaText(e.target.value)}
                placeholder={t('metals.parser_placeholder')}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] p-3 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={!pastedCoaText.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--brand-cyan)] text-white hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('metals.btn_extract_data')}</span>
                </button>

                {parsedPreview && (
                  <button
                    type="button"
                    onClick={handleApplyParsedData}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('metals.btn_apply_to_form', { count: parsedPreview.detectedItems.length })}</span>
                  </button>
                )}
              </div>

              {parsedPreview && (
                <div className="mt-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                    <span>{t('metals.parsed_detected_heading')}:</span>
                    <span className="text-[var(--text-muted)] font-normal">
                      {t('metals.metals_found_count', { count: parsedPreview.detectedItems.length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {parsedPreview.detectedItems.map((item) => (
                      <div
                        key={item.metalId}
                        className={`p-2 rounded-md border flex flex-col justify-between ${
                          item.pass
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                            : 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider">{item.metalId}</span>
                        <span className="font-mono text-xs mt-1">
                          {item.numericPpm} ppm ({item.pass ? t('metals.pass') : t('metals.fail')})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('metals.batch_label')}</label>
              <input
                type="text"
                required
                placeholder={t('metals.batch_placeholder')}
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('metals.ink_name_label')}</label>
              <input
                type="text"
                required
                placeholder={t('metals.ink_name_placeholder')}
                value={inkName}
                onChange={(e) => setInkName(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('metals.brand_label')}</label>
              <input
                type="text"
                placeholder={t('metals.brand_placeholder')}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{t('metals.lab_label')}</label>
              <input
                type="text"
                placeholder={t('metals.lab_placeholder')}
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
            </div>
          </div>

          {/* Elemental Impurities Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('metals.input_heading')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {REACH_APPENDIX_13_LIMITS.map((limit) => {
                const raw = measurements[limit.id] || '';
                const num = parseFloat(raw);
                const isTested = raw !== '' && !isNaN(num);
                const isPass = isTested ? num <= limit.maxLimitPpm : true;

                return (
                  <div
                    key={limit.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      isTested
                        ? isPass
                          ? 'border-[var(--safe-border)] bg-[var(--safe-bg)]'
                          : 'border-[var(--danger-border)] bg-[var(--danger-bg)]'
                        : 'border-[var(--border)] bg-[var(--bg-base)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-[var(--text-primary)]">{limit.substance}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {t('metals.limit_prefix', { limit: limit.maxLimitPpm })}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        step="0.001"
                        placeholder={t('metals.ppm_placeholder')}
                        value={raw}
                        onChange={(e) => handleValueChange(limit.id, e.target.value)}
                        className="w-full rounded border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] px-2 py-1.5 text-xs font-mono"
                      />
                      {isTested && (
                        <span
                          className={`text-xs font-bold shrink-0 px-2 py-1 rounded ${
                            isPass ? 'text-[var(--safe-text)]' : 'text-[var(--danger-text)]'
                          }`}
                        >
                          {isPass ? t('metals.pass') : t('metals.fail')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              {t('metals.cancel_btn')}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 cursor-pointer"
            >
              {t('metals.calculate_save_btn')}
            </button>
          </div>
        </form>
      )}

      {/* Audited COA History */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
        {coas.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">{t('metals.empty_heading')}</p>
            <p className="text-xs mt-1">
              {t('metals.empty_desc')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {coas.map((coa) => (
              <div key={coa.id} className="p-5 hover:bg-[var(--bg-subtle)] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{coa.inkName}</span>
                      <span className="font-mono text-xs text-[var(--brand-cyan)]">LOT: {coa.batchNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          coa.overallPass
                            ? 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)]'
                            : 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                        }`}
                      >
                        {coa.overallPass ? t('metals.compliant_badge') : t('metals.fail_badge')}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {coa.brand} {t('metals.lab_date_meta', { lab: coa.labName, date: coa.testDate })}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={t('metals.delete_coa_aria')}
                    onClick={() => onDeleteCOA(coa.id)}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-text)] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Analytical Results Pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {coa.results.map((r, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded text-xs font-mono border ${
                        r.pass
                          ? 'bg-[var(--bg-base)] text-[var(--text-primary)] border-[var(--border)]'
                          : 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)] font-bold'
                      }`}
                    >
                      {t('metals.result_pill', { substance: r.substanceName.split(' ')[0], measured: r.measuredPpm, max: r.maxLimitPpm })}
                    </span>
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
