import React, { useState } from 'react';
import {
  FileText,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  BookmarkPlus,
  Trash2,
  Sparkles,
  Percent,
  ChevronRight,
  Info,
  Scale,
  Globe,
} from 'lucide-react';
import { parseInkIngredients, computeDecodeStats } from '../data/pigments';
import { ParsedHit, DecodeStats } from '../types/pigment';
import { saveAudit } from '../lib/offlineDb';
import { InkAuditRecord } from '../types/database';
import { t } from '../lib/i18n';
import { SubstanceRuleModal } from './SubstanceRuleModal';
import { MultiJurisdictionModal } from './MultiJurisdictionModal';

interface BulkDecodeTabProps {
  onGoToShortlist?: () => void;
  onGenerateQuestionSheet?: (params: {
    inkName: string;
    brand: string;
    batchNo: string;
    unrecognisedItems: string[];
  }) => void;
}

const SAMPLE_BLUE = `Water (Aqua), Glycerin 15%, Pigment Blue 15:3 (CI 74160, CAS 147-14-8) 8.5%, CI 74260 (Pigment Green 7, CAS 1328-53-6) 0.5%, Hamamelis Virginiana Water, Isopropyl Alcohol (CAS 67-63-0) 2%`;
const SAMPLE_BLACK = `Aqua, Carbon Black (CI 77266, CAS 1333-86-4) 22%, Glycerin 10%, Lead (CAS 7439-92-1) 0.005%, Nickel (CAS 7440-02-0) 0.001%, Propylene Glycol (CAS 57-55-6)`;
const SAMPLE_MARKET_BLACK = `Eternal Lining Black: Distilled Water, Carbon Black (CI 77266, CAS 1333-86-4), Witch Hazel (CAS 84696-19-5), Glycerin (CAS 56-81-5), Isopropanol (CAS 67-63-0)`;
const SAMPLE_UNRECOGNISED = `Formula Label: Aqua, CI 77891 (Titanium Dioxide), Proprietary Polymer Dispersion Matrix 99, Glycerin, Synthetic Stabiliser Complex X`;
const SAMPLE_CARRIER = `Titanium Dioxide (CI 77891, CAS 13463-67-7) 12%, Aqua 55%, Glycerin 15%, Witch Hazel (CAS 84696-19-5) 5%, Propylene Glycol 13%`;

export const BulkDecodeTab: React.FC<BulkDecodeTabProps> = ({
  onGoToShortlist,
  onGenerateQuestionSheet,
}) => {
  const [inputText, setInputText] = useState('');
  const [hits, setHits] = useState<ParsedHit[]>([]);
  const [stats, setStats] = useState<DecodeStats | null>(null);
  const [hasDecoded, setHasDecoded] = useState(false);
  const [selectedInspectHit, setSelectedInspectHit] = useState<ParsedHit | null>(null);
  const [isMultiJurisdictionModalOpen, setIsMultiJurisdictionModalOpen] = useState(false);

  // Shortlist form state
  const [brand, setBrand] = useState('');
  const [inkName, setInkName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);


  const handleDecode = () => {
    if (!inputText.trim()) {
      setHits([]);
      setStats(null);
      setHasDecoded(false);
      return;
    }
    const parsed = parseInkIngredients(inputText);
    const computed = computeDecodeStats(parsed);
    setHits(parsed);
    setStats(computed);
    setHasDecoded(true);
    setSavedFeedback(null);

    // Auto-detect brand / ink name from text if not yet set
    if (!inkName && !brand) {
      if (inputText.toLowerCase().includes('eternal lining black')) {
        setBrand('Eternal Ink');
        setInkName('Lining Black');
      } else if (inputText.toLowerCase().includes('triple black')) {
        setBrand('World Famous Tattoo Ink');
        setInkName('Triple Black');
      }
    }
  };

  const handleClear = () => {
    setInputText('');
    setHits([]);
    setStats(null);
    setHasDecoded(false);
    setSavedFeedback(null);
  };


  const handleTriggerQuestionSheet = (singleItem?: string) => {
    if (!onGenerateQuestionSheet) return;
    const unrecItems = singleItem
      ? [singleItem]
      : hits.filter((h) => !h.substance).map((h) => h.query);

    onGenerateQuestionSheet({
      inkName: inkName.trim() || 'Label Under Review',
      brand: brand.trim() || 'Ink Manufacturer',
      batchNo: batchNumber.trim(),
      unrecognisedItems: unrecItems,
    });
  };

  const handleSaveToShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hits.length) return;

    // Local calendar date in format YYYY-MM-DD (Ban 19)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;

    // Determine verdict
    let verdict: InkAuditRecord['verdict'] = 'not_covered_only';
    if (stats?.prohibited && stats.prohibited > 0) {
      verdict = 'prohibited_detected';
    } else if (stats?.restricted && stats.restricted > 0) {
      verdict = 'restricted_detected';
    } else if (stats?.unrecognised && stats.unrecognised > 0) {
      verdict = 'unrecognised_items';
    }

    const summaryParts: string[] = [];
    if (stats?.prohibited) summaryParts.push(t('decoder.prohibited_suffix', { count: stats.prohibited }));
    if (stats?.restricted) summaryParts.push(t('decoder.restricted_suffix', { count: stats.restricted }));
    if (stats?.notCovered) summaryParts.push(t('decoder.not_covered_suffix', { count: stats.notCovered }));
    if (stats?.unrecognised) summaryParts.push(t('decoder.unrecognised_suffix', { count: stats.unrecognised }));

    const auditRecord: InkAuditRecord = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: now.toISOString(),
      localDate,
      inkName: inkName.trim() || t('decoder.default_untitled_ink'),
      brand: brand.trim() || t('decoder.default_unknown_brand'),
      batchNumber: batchNumber.trim() || 'N/A',
      ingredientsRaw: inputText,
      hits,
      stats: stats || { total: hits.length, prohibited: 0, restricted: 0, notCovered: 0, unrecognised: 0 },
      verdict,
      findingsSummary: summaryParts.join(', ') || t('decoder.no_substances_evaluated'),
      auditorName: '',
      studioName: '',
      auditorAvatar: null,
      synced: false,
      updatedAt: now.toISOString(),
    };

    await saveAudit(auditRecord);
    setSavedFeedback(t('decoder.saved_success_toast'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--accent)] shrink-0" />
              {t('decoder.heading')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {t('decoder.subheading')}
            </p>
          </div>

        </div>

        {/* Input Area */}
        <div className="mt-4">
          <label
            htmlFor="ink_label_raw_input"
            className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2"
          >
            {t('decoder.input_label')}
            <span className="text-[var(--text-muted)] font-normal lowercase">{t('decoder.sds_support_note')}</span>
          </label>
          <textarea
            id="ink_label_raw_input"
            rows={5}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] p-3.5 text-xs font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent leading-relaxed"
            placeholder={t('decoder.input_placeholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* Sample Pills & Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {t('decoder.samples_label')}
            </span>
            <button
              type="button"
              id="sample_blue_btn"
              onClick={() => {
                setInputText(SAMPLE_BLUE);
                setBrand('');
                setInkName('');
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors inline-flex items-center text-xs cursor-pointer"
            >
              {t('decoder.sample_banned_blue')}
            </button>
            <button
              type="button"
              id="sample_black_btn"
              onClick={() => {
                setInputText(SAMPLE_BLACK);
                setBrand('');
                setInkName('');
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors inline-flex items-center text-xs cursor-pointer"
            >
              {t('decoder.sample_restricted_black')}
            </button>
            <button
              type="button"
              id="sample_market_black_btn"
              onClick={() => {
                setInputText(SAMPLE_MARKET_BLACK);
                setBrand('Eternal Ink');
                setInkName('Lining Black');
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors inline-flex items-center text-xs cursor-pointer"
            >
              {t('decoder.sample_market_black')}
            </button>
            <button
              type="button"
              id="sample_unrecognised_btn"
              onClick={() => {
                setInputText(SAMPLE_UNRECOGNISED);
                setBrand('Apex Color Co');
                setInkName('Formula Alpha');
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors inline-flex items-center text-xs cursor-pointer"
            >
              {t('decoder.sample_unrecognised')}
            </button>
            <button
              type="button"
              id="sample_carrier_btn"
              onClick={() => {
                setInputText(SAMPLE_CARRIER);
                setBrand('');
                setInkName('');
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors inline-flex items-center text-xs cursor-pointer"
            >
              {t('decoder.sample_clean_carrier')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {inputText && (
              <button
                type="button"
                id="clear_input_btn"
                onClick={handleClear}
                className="min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('decoder.clear_button')}
              </button>
            )}
            <button
              type="button"
              id="decode_ingredients_btn"
              onClick={handleDecode}
              className="min-h-[44px] px-5 py-2.5 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              {t('decoder.decode_button')}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasDecoded && (
        <div className="space-y-4">
          {/* Summary Strip */}
          {stats && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t('decoder.summary_title', { total: stats.total })}
                </h3>
                <button
                  type="button"
                  id="open_multi_jurisdiction_modal_btn"
                  onClick={() => setIsMultiJurisdictionModalOpen(true)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Globe className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
                  <span>{t('decoder.btn_multi_jurisdiction_matrix')}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 shrink-0" />
                    {t('decoder.stat_prohibited')}
                  </div>
                  <div className="text-xl font-bold mt-1">{stats.prohibited}</div>
                </div>

                <div className="p-3 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {t('decoder.stat_restricted')}
                  </div>
                  <div className="text-xl font-bold mt-1">{stats.restricted}</div>
                </div>

                <div className="p-3 rounded border border-[var(--safe-border)] bg-[var(--safe-bg)] text-[var(--safe-text)]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    {t('decoder.stat_not_covered')}
                  </div>
                  <div className="text-xl font-bold mt-1">{stats.notCovered}</div>
                </div>

                <div className="p-3 rounded border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    {t('decoder.stat_unrecognised')}
                  </div>
                  <div className="text-xl font-bold mt-1">{stats.unrecognised}</div>
                </div>
              </div>
            </div>
          )}

          {/* Unrecognised Alert Banner with Direct Action to Maker Question Sheet */}
          {stats && stats.unrecognised > 0 && (
            <div className="p-4 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--warning-text)]">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  {t('decoder.unrecognised_banner_title', { count: stats.unrecognised })}
                </div>
                <p className="text-xs text-[var(--warning-text)] mt-1 max-w-2xl leading-relaxed font-medium">
                  {t('decoder.unrecognised_banner_desc')}
                </p>
              </div>

              {onGenerateQuestionSheet && (
                <button
                  type="button"
                  id="unrecognised_generate_sheet_btn"
                  onClick={() => handleTriggerQuestionSheet()}
                  className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{t('decoder.generate_question_sheet_btn')}</span>
                </button>
              )}
            </div>
          )}

          {/* Results: Stacked Cards on Mobile, Table on Desktop */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {hits.map((hit, idx) => {
                const sub = hit.substance;
                if (!sub) {
                  return (
                    <div key={idx} className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-[var(--text-primary)] break-all block">
                            {hit.query}
                          </span>
                          <span className="text-[11px] text-[var(--danger-text)] mt-0.5 block">
                            {hit.unrecognisedReason || t('decoder.unrecognised_reason')}
                          </span>
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)] shrink-0">
                          {t('status.unrecognised')}
                        </span>
                      </div>

                      <div className="text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)] flex flex-col gap-0.5">
                        <span><strong>{t('decoder.limit_label')}</strong> {t('decoder.limit_check_reg')}</span>
                        <span><strong>{t('decoder.note_label')}</strong> {t('decoder.verify_sds_note')}</span>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => setSelectedInspectHit(hit)}
                          className="min-h-[44px] text-xs font-semibold text-[var(--brand-cyan)] flex items-center gap-1 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{t('decoder.view_details')}</span>
                        </button>
                        {onGenerateQuestionSheet && (
                          <button
                            type="button"
                            onClick={() => handleTriggerQuestionSheet(hit.query)}
                            className="min-h-[44px] text-xs text-[var(--text-secondary)] hover:underline flex items-center cursor-pointer"
                          >
                            Ask Maker →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                let badgeClass = 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)]';
                let statusLabel = t('status.not_covered');
                if (sub.status === 'banned' || sub.status === 'svhc') {
                  badgeClass = 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]';
                  statusLabel = t('status.prohibited');
                } else if (sub.status === 'restricted') {
                  badgeClass = 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
                  statusLabel = t('status.restricted');
                } else if (sub.status === 'watch') {
                  badgeClass = 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
                  statusLabel = t('status.watch');
                }

                return (
                  <div key={idx} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs text-[var(--text-muted)] break-all">
                          {hit.query}
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          {sub.name}
                        </div>
                        {hit.matchedBy && (
                          <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                            {hit.matchedBy}
                          </div>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border shrink-0 ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {hit.detectedConcentrationPercent !== undefined && (
                      <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
                          {t('decoder.sds_concentration_label')}
                        </span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {hit.detectedConcentrationPercent}%
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle)]">
                      <div>
                        <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('decoder.col_ci')}</span>
                        <span className="font-mono text-[var(--text-secondary)]">{sub.ci || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold text-[var(--text-muted)] block">{t('decoder.col_cas')}</span>
                        <span className="font-mono text-[var(--text-secondary)]">
                          {sub.cas && sub.cas.length > 0 ? sub.cas.join(', ') : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs pt-1 border-t border-[var(--border-subtle)] space-y-0.5">
                      <div>
                        <span className="font-semibold text-[var(--text-muted)]">{t('decoder.label_limit')}</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {sub.exact_limit || t('decoder.limit_check_reg')}
                        </span>
                      </div>
                      <div className="text-[var(--text-muted)]">
                        <span className="font-semibold">{t('decoder.label_legal_ref')}</span>
                        <span>{sub.entry_reference || 'Entry 75'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => setSelectedInspectHit(hit)}
                        className="min-h-[44px] text-xs font-semibold text-[var(--brand-cyan)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{t('decoder.view_details')}</span>
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
                    <th className="py-3 px-4">{t('decoder.table_query')}</th>
                    <th className="py-3 px-4">{t('decoder.table_detected')}</th>
                    <th className="py-3 px-4">{t('decoder.col_sds_pct')}</th>
                    <th className="py-3 px-4">{t('decoder.table_ci')}</th>
                    <th className="py-3 px-4">{t('decoder.table_cas')}</th>
                    <th className="py-3 px-4">{t('decoder.table_status')}</th>
                    <th className="py-3 px-4">{t('decoder.table_limit')}</th>
                    <th className="py-3 px-4">{t('decoder.table_quote')}</th>
                    <th className="py-3 px-4 text-right">{t('decoder.table_rule_details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {hits.map((hit, idx) => {
                    const sub = hit.substance;
                    if (!sub) {
                      return (
                        <tr key={idx} className="hover:bg-[var(--bg-subtle)] transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-[var(--text-primary)]">
                            {hit.query}
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <span className="italic text-[var(--danger-text)] block">
                              {hit.unrecognisedReason || t('decoder.unrecognised_reason')}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {t('decoder.never_guessed_note')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[var(--text-muted)]">
                            {hit.detectedConcentrationPercent !== undefined ? `${hit.detectedConcentrationPercent}%` : '—'}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[var(--text-muted)]">—</td>
                          <td className="py-3 px-4 text-xs font-mono text-[var(--text-muted)]">—</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                              {t('status.unrecognised')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[var(--text-muted)]">
                            {t('decoder.limit_check_reg')}
                          </td>
                          <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                            {t('decoder.verify_sds_note')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedInspectHit(hit)}
                              className="min-h-[44px] text-xs text-[var(--brand-cyan)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>{t('decoder.inspect_btn')}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    let badgeClass = 'bg-[var(--safe-bg)] text-[var(--safe-text)] border-[var(--safe-border)]';
                    let statusLabel = t('status.not_covered');
                    if (sub.status === 'banned' || sub.status === 'svhc') {
                      badgeClass = 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]';
                      statusLabel = t('status.prohibited');
                    } else if (sub.status === 'restricted') {
                      badgeClass = 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
                      statusLabel = t('status.restricted');
                    } else if (sub.status === 'watch') {
                      badgeClass = 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
                      statusLabel = t('status.watch');
                    }

                    return (
                      <tr key={idx} className="hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-[var(--text-primary)]">
                          {hit.query}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-[var(--text-primary)]">
                          <div>{sub.name}</div>
                          {hit.matchedBy && (
                            <div className="text-[11px] text-[var(--text-muted)] font-mono font-normal">
                              {hit.matchedBy}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {hit.detectedConcentrationPercent !== undefined ? (
                            <span className="font-bold text-[var(--brand-cyan)]">
                              {hit.detectedConcentrationPercent}%
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">
                          {sub.ci || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">
                          {sub.cas && sub.cas.length > 0 ? sub.cas.join(', ') : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-[var(--text-primary)] font-mono">
                          {sub.exact_limit || t('decoder.limit_check_reg')}
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                          {sub.entry_reference || 'Entry 75'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedInspectHit(hit)}
                            className="min-h-[44px] text-xs text-[var(--brand-cyan)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{t('decoder.inspect_btn')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save to Shortlist Form */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 mb-3">
              <BookmarkPlus className="w-4 h-4 text-[var(--accent)]" />
              {t('decoder.save_to_shortlist')}
            </h3>

            <form onSubmit={handleSaveToShortlist} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="shortlist_brand"
                    className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
                  >
                    {t('decoder.field_brand')}
                  </label>
                  <input
                    id="shortlist_brand"
                    type="text"
                    placeholder={t('decoder.placeholder_brand')}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="shortlist_ink_name"
                    className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
                  >
                    {t('decoder.field_ink_name')}
                  </label>
                  <input
                    id="shortlist_ink_name"
                    type="text"
                    placeholder={t('decoder.placeholder_ink_name')}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    value={inkName}
                    onChange={(e) => setInkName(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="shortlist_batch_number"
                    className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
                  >
                    {t('decoder.field_batch_number')}
                  </label>
                  <input
                    id="shortlist_batch_number"
                    type="text"
                    placeholder={t('decoder.placeholder_batch_number')}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {savedFeedback ? (
                  <div className="text-xs font-medium text-[var(--safe-text)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{savedFeedback}</span>
                    {onGoToShortlist && (
                      <button
                        type="button"
                        onClick={onGoToShortlist}
                        className="ml-2 min-h-[44px] inline-flex items-center underline font-semibold text-[var(--text-primary)] hover:opacity-80 cursor-pointer"
                      >
                        {t('decoder.view_shortlist_link')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-muted)]">
                    {t('decoder.offline_save_desc')}
                  </div>
                )}

                <button
                  type="submit"
                  id="save_audit_record_btn"
                  className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {t('decoder.save_button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal for What The Rule Actually Says */}
      {selectedInspectHit && (
        <SubstanceRuleModal
          hit={selectedInspectHit}
          onClose={() => setSelectedInspectHit(null)}
          onGenerateQuestionSheet={(item) => handleTriggerQuestionSheet(item)}
        />
      )}

      {/* Multi-Jurisdiction Regulatory Assessment Modal */}
      <MultiJurisdictionModal
        isOpen={isMultiJurisdictionModalOpen}
        onClose={() => setIsMultiJurisdictionModalOpen(false)}
        hits={hits}
        inkName={inkName}
        brand={brand}
      />
    </div>
  );
};
