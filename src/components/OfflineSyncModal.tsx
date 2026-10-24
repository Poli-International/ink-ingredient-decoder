import React, { useRef, useState } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Database,
  Trash2,
  Check,
  AlertCircle,
  HardDrive,
  Lock,
  Key,
  Radio,
  Share2,
  Copy,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { OfflineDatabaseBackup } from '../types/database';
import { encryptBackup, decryptBackup } from '../lib/cryptoBackup';
import { serializeBackupForP2P, deserializeBackupFromP2P } from '../lib/p2pSync';
import { getLocalDateString } from '../lib/dateUtils';
import { t } from '../lib/i18n';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  auditsCount: number;
  inventoryCount: number;
  syncTimestamp: string;
  onExport: () => Promise<OfflineDatabaseBackup>;
  onImport: (backup: OfflineDatabaseBackup) => Promise<void>;
  onClearAudits: () => Promise<void>;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  auditsCount,
  inventoryCount,
  syncTimestamp,
  onExport,
  onImport,
  onClearAudits,
}) => {
  const [modalTab, setModalTab] = useState<'backup' | 'p2p'>('backup');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [useEncryption, setUseEncryption] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [pendingEncryptedBlob, setPendingEncryptedBlob] = useState<string | null>(null);

  // P2P / Station-to-station transfer state
  const [p2pMode, setP2pMode] = useState<'send' | 'receive'>('send');
  const [generatedSyncCode, setGeneratedSyncCode] = useState<string | null>(null);
  const [receiveInputCode, setReceiveInputCode] = useState('');
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const backup = await onExport();

      let outputText: string;
      let filename: string;

      const dateStr = getLocalDateString();
      if (useEncryption) {
        if (!passphrase || passphrase.length < 6) {
          throw new Error(t('sync.pw_min_length'));
        }
        outputText = await encryptBackup(backup, passphrase);
        filename = `ink-decoder-encrypted-backup-${dateStr}.poli.enc`;
      } else {
        outputText = JSON.stringify(backup, null, 2);
        filename = `ink-decoder-offline-backup-${dateStr}.json`;
      }

      const blob = new Blob([outputText], {
        type: useEncryption ? 'application/octet-stream' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg(
        useEncryption
          ? t('sync.encrypted_export_success')
          : t('sync.standard_export_success')
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('sync.export_failed'));
    }
  };

  const handleGenerateP2PCode = async () => {
    try {
      setErrorMsg(null);
      const backup = await onExport();
      const code = serializeBackupForP2P(backup);
      setGeneratedSyncCode(code);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('sync.p2p_gen_failed'));
    }
  };

  const handleApplyP2PCode = async () => {
    if (!receiveInputCode.trim()) return;
    try {
      setErrorMsg(null);
      const importedBackup = deserializeBackupFromP2P(receiveInputCode);
      await onImport(importedBackup);
      setReceiveInputCode('');
      setSuccessMsg(t('sync.p2p_import_success'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('sync.p2p_invalid_payload'));
    }
  };

  const handleCopySyncCode = () => {
    if (generatedSyncCode) {
      navigator.clipboard?.writeText(generatedSyncCode);
      setCopiedSyncCode(true);
      setTimeout(() => setCopiedSyncCode(false), 2500);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingEncryptedBlob(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;

        // Check if file is encrypted format
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.cipherText && parsed.iv && parsed.salt) {
            // It's encrypted! Ask for passphrase
            setPendingEncryptedBlob(text);
            return;
          } else if (parsed && typeof parsed === 'object') {
            // Standard JSON backup
            await onImport(parsed as OfflineDatabaseBackup);
            setSuccessMsg(t('sync.import_success'));
            return;
          }
        } catch {
          // If JSON parse fails, check if plain text
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : t('sync.import_failed'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDecryptAndImport = async () => {
    if (!pendingEncryptedBlob || !decryptPassphrase) return;
    try {
      setErrorMsg(null);
      const decrypted = await decryptBackup(pendingEncryptedBlob, decryptPassphrase);
      await onImport(decrypted);
      setPendingEncryptedBlob(null);
      setDecryptPassphrase('');
      setSuccessMsg(t('sync.decrypt_success'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('sync.decrypt_failed'));
    }
  };

  const handleClear = async () => {
    try {
      await onClearAudits();
      setConfirmClear(false);
      setSuccessMsg(t('sync.clear_success'));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('sync.clear_failed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--brand-cyan)]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {t('sync.title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
            aria-label={t('profile.close_aria')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-1 mb-4">
          <button
            type="button"
            onClick={() => setModalTab('backup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              modalTab === 'backup'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('sync.tab_file_backup')}
          </button>
          <button
            type="button"
            onClick={() => setModalTab('p2p')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
              modalTab === 'p2p'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
            <span>{t('sync.tab_p2p_sync')}</span>
          </button>
        </div>

        <div className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger-text)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs bg-[var(--safe-bg)] border border-[var(--safe-border)] text-[var(--safe-text)]">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sync Status Card */}
          <div className="p-4 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('sync.network_status')}
              </span>
              {isOnline ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--safe-bg)] text-[var(--safe-text)] border border-[var(--safe-border)]">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{t('sync.online')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{t('sync.offline')}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
              <div>
                <span className="text-[var(--text-muted)] block">{t('sync.stored_audits')}</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {auditsCount} {auditsCount === 1 ? t('sync.count_record') : t('sync.count_records')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">{t('sync.studio_inks')}</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {inventoryCount} {inventoryCount === 1 ? t('sync.count_item') : t('sync.count_items')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">{t('sync.sync_engine')}</span>
                <span className="font-medium text-[var(--safe-text)]">
                  {t('sync.sync_engine_val')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">{t('sync.last_synced')}</span>
                <span className="font-medium text-[var(--text-secondary)]">
                  {syncTimestamp}
                </span>
              </div>
            </div>
          </div>

          {modalTab === 'backup' ? (
            <>
              {/* Decryption Prompt if Encrypted File Uploaded */}
              {pendingEncryptedBlob && (
                <div className="p-4 rounded-lg bg-[var(--warning-bg)] border border-[var(--warning-border)] text-[var(--warning-text)] space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>{t('sync.encrypted_detected')}</span>
                  </div>
                  <p className="text-xs">
                    {t('sync.enter_pw_desc')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={t('sync.enter_pw_placeholder')}
                      value={decryptPassphrase}
                      onChange={(e) => setDecryptPassphrase(e.target.value)}
                      className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={handleDecryptAndImport}
                      className="px-4 py-1.5 rounded text-xs font-bold bg-[var(--brand-cyan)] text-white hover:opacity-90 cursor-pointer"
                    >
                      {t('sync.decrypt_btn')}
                    </button>
                  </div>
                </div>
              )}

              {/* Backup & Transfer Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {t('sync.transfer_heading')}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEncryption}
                      onChange={(e) => setUseEncryption(e.target.checked)}
                      className="rounded"
                    />
                    <span className="flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3 text-[var(--brand-cyan)]" />
                      {t('sync.encrypt_checkbox')}
                    </span>
                  </label>
                </div>

                {useEncryption && (
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
                    <label className="block text-xs font-semibold text-[var(--text-primary)]">
                      {t('sync.pw_label')}
                    </label>
                    <input
                      type="password"
                      placeholder={t('sync.pw_placeholder')}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full rounded border border-[var(--border)] bg-[var(--bg-base)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {t('sync.crypto_spec')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[var(--brand-cyan)]" />
                    <span>{useEncryption ? t('sync.export_encrypted') : t('sync.export_json')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[var(--safe-text)]" />
                    <span>{t('sync.import_btn')}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.enc,.poli,application/json,text/plain"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
            </>
          ) : (
            /* Multi-Device Peer-to-Peer Sync */
            <div className="space-y-4 pt-2">
              <div className="flex rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-1">
                <button
                  type="button"
                  onClick={() => setP2pMode('send')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                    p2pMode === 'send'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {t('sync.p2p_send_heading')}
                </button>
                <button
                  type="button"
                  onClick={() => setP2pMode('receive')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                    p2pMode === 'receive'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {t('sync.p2p_receive_heading')}
                </button>
              </div>

              {p2pMode === 'send' ? (
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {t('sync.p2p_send_desc')}
                  </p>
                  {!generatedSyncCode ? (
                    <button
                      type="button"
                      onClick={handleGenerateP2PCode}
                      className="w-full py-2 text-xs font-semibold rounded-lg bg-[var(--brand-cyan)] text-white hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t('sync.p2p_btn_generate')}</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>{t('sync.p2p_sync_token_label')}:</span>
                        <button
                          type="button"
                          onClick={handleCopySyncCode}
                          className="text-[var(--brand-cyan)] hover:underline flex items-center gap-1"
                        >
                          {copiedSyncCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSyncCode ? t('sync.copied') : t('sync.copy')}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={4}
                        value={generatedSyncCode}
                        className="w-full p-2 text-[10px] font-mono rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] select-all"
                      />
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t('sync.p2p_send_instruction')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {t('sync.p2p_receive_desc')}
                  </p>
                  <textarea
                    rows={4}
                    value={receiveInputCode}
                    onChange={(e) => setReceiveInputCode(e.target.value)}
                    placeholder={t('sync.p2p_receive_placeholder')}
                    className="w-full p-2 text-xs font-mono rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyP2PCode}
                    disabled={!receiveInputCode.trim()}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{t('sync.p2p_btn_merge_data')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clear Audits */}
          {auditsCount > 0 && (
            <div className="pt-3 border-t border-[var(--border)]">
              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--danger-text)] hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('sync.clear_audits_btn')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--danger-text)] font-semibold">
                    {t('sync.confirm_clear_prompt')}
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)] hover:opacity-80 cursor-pointer"
                  >
                    {t('sync.confirm_clear_btn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:underline cursor-pointer"
                  >
                    {t('sync.cancel_btn')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
