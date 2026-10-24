import React, { useState, useEffect } from 'react';
import { Printer, HelpCircle, Copy, Check, Plus, X, Mail } from 'lucide-react';
import { t } from '../lib/i18n';

interface MakerQuestionSheetProps {
  initialInkName?: string;
  initialBrand?: string;
  initialBatchNo?: string;
  initialUnrecognisedItems?: string[];
}

export const MakerQuestionSheet: React.FC<MakerQuestionSheetProps> = ({
  initialInkName = '',
  initialBrand = '',
  initialBatchNo = '',
  initialUnrecognisedItems = [],
}) => {
  // Form fields to let studios customize before printing or emailing
  const [studioName, setStudioName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [inkMaker, setInkMaker] = useState(initialBrand);
  const [inkName, setInkName] = useState(initialInkName);
  const [batchNo, setBatchNo] = useState(initialBatchNo);
  const [unrecognisedItems, setUnrecognisedItems] = useState<string[]>(initialUnrecognisedItems);
  const [newItemText, setNewItemText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Sync if initial props change
  useEffect(() => {
    if (initialInkName) setInkName(initialInkName);
    if (initialBrand) setInkMaker(initialBrand);
    if (initialBatchNo) setBatchNo(initialBatchNo);
    if (initialUnrecognisedItems && initialUnrecognisedItems.length > 0) {
      setUnrecognisedItems(initialUnrecognisedItems);
    }
  }, [initialInkName, initialBrand, initialBatchNo, initialUnrecognisedItems]);

  // Local calendar date (Ban 19)
  const todayLocalDate = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const [evalDate, setEvalDate] = useState(todayLocalDate);
  const [notes, setNotes] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemText.trim();
    if (trimmed && !unrecognisedItems.includes(trimmed)) {
      setUnrecognisedItems([...unrecognisedItems, trimmed]);
      setNewItemText('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setUnrecognisedItems(unrecognisedItems.filter((_, idx) => idx !== index));
  };

  // Formulate exact email inquiry
  const displayInk = inkName.trim() || '[ink name]';
  const displayMaker = inkMaker.trim() || 'Manufacturer / Distributor';
  const displayItems = unrecognisedItems.length > 0 ? unrecognisedItems.join(', ') : '[unrecognised ingredient]';

  const emailText = `Subject: REACH Annex XVII Entry 75 Verification: ${displayInk}${batchNo ? ` (Batch ${batchNo})` : ''}

Dear ${displayMaker} Technical Support,

Your label for ${displayInk} lists ${displayItems}. Please provide the CAS number, CI number, and REACH entry 75 status for this ingredient so we can complete our studio records.

Studio Information:
Studio Name: ${studioName.trim() || '[Studio Name]'}
Reviewer: ${auditorName.trim() || '[Studio Reviewer]'}
Date of Review: ${evalDate}
${batchNo ? `Batch / Lot Reference: ${batchNo}\n` : ''}
We maintain compliance verification files under EU Regulation 2020/2081 for all pigments used in our studio procedures.

Thank you,
${auditorName.trim() || 'Studio Team'}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Triggers */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--accent)] shrink-0" />
            {t('maker_questions.title')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
            {t('maker_questions.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="copy_maker_inquiry_email_btn"
            onClick={handleCopyEmail}
            className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedEmail ? (
              <>
                <Check className="w-4 h-4 text-[var(--safe-text)]" />
                <span className="text-[var(--safe-text)]">{t('maker_questions.copied_email_toast')}</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-[var(--brand-cyan)]" />
                <span>{t('maker_questions.copy_email_btn')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="print_maker_question_sheet_btn"
            onClick={handlePrint}
            className="min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-bold bg-[var(--accent)] text-white hover:opacity-90 shadow-xs transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {t('maker_questions.print_btn')}
          </button>
        </div>
      </div>

      {/* Email Inquiry Copy Box (Interactive) */}
      <div className="no-print rounded-lg border border-[var(--brand-cyan)] bg-[var(--bg-card)] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Mail className="w-4 h-4 text-[var(--brand-cyan)]" />
            {t('maker_questions.inquiry_box_title')}
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-2.5 py-1 text-xs font-semibold text-[var(--brand-cyan)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedEmail ? t('maker_questions.copied_email_toast') : t('maker_questions.copy_email_btn')}
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          {t('maker_questions.inquiry_box_desc')}
        </p>

        <pre className="p-3.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {emailText}
        </pre>
      </div>

      {/* Printable Sheet Container */}
      <div
        id="printable_questionnaire_sheet"
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header for Print */}
        <div className="border-b border-[var(--border)] pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {t('maker_questions.sheet_doc_title')}
            </h3>
            <span className="text-xs font-mono text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded">
              EU Regulation 2020/2081 Entry 75
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t('maker_questions.sheet_doc_desc')}
          </p>
        </div>

        {/* Studio & Product Metadata Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            {t('maker_questions.studio_info_heading')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-2 text-sm">
            <div>
              <label
                htmlFor="mq_studio_name"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
              >
                {t('maker_questions.studio_name')}
              </label>
              <input
                id="mq_studio_name"
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder={t('maker_questions.studio_placeholder')}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs print:border-b print:border-t-0 print:border-x-0 print:bg-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="mq_auditor_name"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
              >
                {t('maker_questions.auditor_name')}
              </label>
              <input
                id="mq_auditor_name"
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder={t('maker_questions.auditor_placeholder')}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs print:border-b print:border-t-0 print:border-x-0 print:bg-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="mq_ink_maker"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
              >
                {t('maker_questions.ink_maker')}
              </label>
              <input
                id="mq_ink_maker"
                type="text"
                value={inkMaker}
                onChange={(e) => setInkMaker(e.target.value)}
                placeholder={t('maker_questions.ink_maker_placeholder')}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs print:border-b print:border-t-0 print:border-x-0 print:bg-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="mq_ink_name"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
              >
                {t('maker_questions.ink_name')}
              </label>
              <input
                id="mq_ink_name"
                type="text"
                value={inkName}
                onChange={(e) => setInkName(e.target.value)}
                placeholder={t('maker_questions.ink_name_placeholder')}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs print:border-b print:border-t-0 print:border-x-0 print:bg-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="mq_batch_no"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
              >
                {t('maker_questions.batch_no')}
              </label>
              <input
                id="mq_batch_no"
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder={t('maker_questions.batch_placeholder')}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs print:border-b print:border-t-0 print:border-x-0 print:bg-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="mq_eval_date"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
              >
                {t('maker_questions.date_checked')}
              </label>
              <input
                id="mq_eval_date"
                type="text"
                value={evalDate}
                onChange={(e) => setEvalDate(e.target.value)}
                placeholder={t('maker_questions.date_placeholder')}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs print:border-b print:border-t-0 print:border-x-0 print:bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dedicated Unrecognised Items Section */}
        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--danger-text)] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              {t('maker_questions.unrecognised_items_heading')}
            </h4>
          </div>

          <div className="p-3.5 rounded border border-[var(--warning-border)] bg-[var(--warning-bg)] text-xs text-[var(--warning-text)] leading-relaxed">
            <strong>{t('maker_questions.standard_studio_inquiry_prefix')} </strong>
            {t('maker_questions.standard_studio_inquiry_line', {
              inkName: displayInk,
              items: displayItems,
            })}
          </div>

          {/* List of items */}
          {unrecognisedItems.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">
              {t('maker_questions.empty_unrecognised_items')}
            </p>
          ) : (
            <div className="space-y-2">
              {unrecognisedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)]"
                >
                  <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {item}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="hidden sm:inline font-mono">
                      CAS: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ] &nbsp; CI: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ] &nbsp; Entry 75: [ &nbsp; &nbsp; &nbsp; &nbsp; ]
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="no-print min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger-text)] rounded cursor-pointer"
                      title={t('maker_questions.remove_item_aria')}
                      aria-label={t('maker_questions.remove_item_aria')}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add item control (screen only) */}
          <form onSubmit={handleAddItem} className="no-print flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={t('maker_questions.item_placeholder')}
              className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] px-2.5 py-1.5 text-xs font-mono"
            />
            <button
              type="submit"
              className="min-h-[44px] px-3 py-1.5 rounded text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('maker_questions.add_unrecognised_item')}
            </button>
          </form>
        </div>

        {/* 6 Mandatory Questions */}
        <div className="space-y-4 pt-2 border-t border-[var(--border)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t('maker_questions.checklist_heading')}
          </h4>

          <div className="space-y-3">
            {/* Q1 */}
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('maker_questions.q1_title')}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  [ ] {t('maker_questions.provided')} &nbsp; [ ] {t('maker_questions.missing')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('maker_questions.q1_desc')}
              </p>
            </div>

            {/* Q2 */}
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('maker_questions.q2_title')}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  [ ] {t('maker_questions.provided')} &nbsp; [ ] {t('maker_questions.missing')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('maker_questions.q2_desc')}
              </p>
            </div>

            {/* Q3 */}
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('maker_questions.q3_title')}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  [ ] {t('maker_questions.provided')} &nbsp; [ ] {t('maker_questions.missing')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('maker_questions.q3_desc')}
              </p>
            </div>

            {/* Q4 */}
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('maker_questions.q4_title')}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  [ ] {t('maker_questions.provided')} &nbsp; [ ] {t('maker_questions.missing')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('maker_questions.q4_desc')}
              </p>
            </div>

            {/* Q5 */}
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('maker_questions.q5_title')}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  [ ] {t('maker_questions.provided')} &nbsp; [ ] {t('maker_questions.missing')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('maker_questions.q5_desc')}
              </p>
            </div>

            {/* Q6 */}
            <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-subtle)] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {t('maker_questions.q6_title')}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  [ ] {t('maker_questions.provided')} &nbsp; [ ] {t('maker_questions.missing')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('maker_questions.q6_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Notes & Signature area */}
        <div className="pt-2 border-t border-[var(--border)] space-y-4">
          <div>
            <label
              htmlFor="mq_notes"
              className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
            >
              {t('maker_questions.notes_area')}
            </label>
            <textarea
              id="mq_notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('maker_questions.notes_placeholder')}
              className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] p-2.5 text-xs font-mono resize-y print:h-20"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-dashed border-[var(--border)] text-xs text-[var(--text-muted)]">
            <span>{t('maker_questions.signature_block')} ____________________________________</span>
            <span>{t('maker_questions.date_block')} ________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};
