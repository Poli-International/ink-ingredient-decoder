import React, { useState } from 'react';
import { QrCode, Printer, Download, Copy, Check, Sparkles } from 'lucide-react';
import { InkAuditRecord } from '../types/database';
import { t } from '../lib/i18n';

interface BottleLabelQRModalProps {
  audit: InkAuditRecord;
  onClose: () => void;
}

export const BottleLabelQRModal: React.FC<BottleLabelQRModalProps> = ({ audit, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Machine readable verification token
  const payloadData = JSON.stringify({
    studioTool: 'Poli International REACH Ink Decoder',
    auditId: audit.id,
    brand: audit.brand,
    ink: audit.inkName,
    lot: audit.batchNumber,
    status: audit.verdict,
    date: audit.localDate,
    ref: 'EU 2020/2081 Entry 75',
  });

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[var(--brand-cyan)]" />
            {t('bottle_qr.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
            aria-label={t('profile.close_aria')}
          >
            ✕
          </button>
        </div>

        {/* Printable Label Badge */}
        <div
          id="printable_bottle_label"
          className="p-4 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-base)] text-center space-y-3"
        >
          <div>
            <div className="font-bold text-sm text-[var(--text-primary)]">{audit.inkName}</div>
            <div className="text-xs text-[var(--text-secondary)]">{audit.brand}</div>
            <div className="font-mono text-xs font-semibold text-[var(--brand-cyan)] mt-1">
              {t('bottle_qr.lot_prefix', { batch: audit.batchNumber })}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {t('bottle_qr.audited_verified', { date: audit.localDate })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed">
          {t('bottle_qr.instructions')}
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={handleCopyPayload}
            className="min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--safe-text)]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('bottle_qr.copied') : t('bottle_qr.copy_json')}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {t('bottle_qr.print_label')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
