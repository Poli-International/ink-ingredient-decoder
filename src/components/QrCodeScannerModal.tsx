import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Flashlight,
  SwitchCamera,
  Upload,
  ArrowRight,
  FileText,
  Tag,
  Hash,
  Sparkles,
} from 'lucide-react';
import { t } from '../lib/i18n';
import { parseLabelOrDocumentation, ParsedLabelData } from '../lib/labelParser';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: ParsedLabelData) => void;
  title?: string;
  hint?: string;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
  title,
  hint,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedRaw, setDetectedRaw] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLabelData | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [manualText, setManualText] = useState('');

  // Editable fields for confirmation before applying
  const [editBrand, setEditBrand] = useState('');
  const [editInkName, setEditInkName] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editIngredients, setEditIngredients] = useState('');

  // Check if camera devices exist
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {
        setHasMultipleCameras(false);
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setIsTorchOn(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    setDetectedRaw(null);
    setParsedData(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t('qr_scanner.err_no_media_devices'));
      }

      // Stop previous stream if switching
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Check torch capability
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities?.() || {};
        setHasTorch(Boolean(capabilities.torch));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || t('qr_scanner.err_camera_access'));
      setIsScanning(false);
    }
  }, [facingMode, stream]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Torch toggling
  const handleToggleTorch = async () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && hasTorch) {
      try {
        const nextTorch = !isTorchOn;
        await (videoTrack as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setIsTorchOn(nextTorch);
      } catch {
        // Torch constraint failed
      }
    }
  };

  // Switch between front & back cameras
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process detected payload
  const handlePayloadDetected = useCallback((rawCode: string) => {
    if (!rawCode || !rawCode.trim()) return;
    const parsed = parseLabelOrDocumentation(rawCode);
    setDetectedRaw(rawCode);
    setParsedData(parsed);
    setEditBrand(parsed.brand || '');
    setEditInkName(parsed.inkName || '');
    setEditBatch(parsed.batchNumber || '');
    setEditIngredients(parsed.ingredients || (parsed.detectedType === 'plain' ? rawCode : ''));
    setIsScanning(false);

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(50);
    }
  }, []);

  // Frame scanner loop
  useEffect(() => {
    let animId: number;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'data_matrix', 'code_128', 'ean_13'],
        });
      } catch {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (
        isScanning &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        !detectedRaw
      ) {
        const video = videoRef.current;
        if (detector) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const item = barcodes[0];
              const raw = item.rawValue || '';
              if (raw) {
                handlePayloadDetected(raw);
                return;
              }
            }
          } catch {
            // Ignore frame error and continue
          }
        }
      }

      if (isScanning && !detectedRaw) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (isScanning && !detectedRaw) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isScanning, detectedRaw, handlePayloadDetected]);

  // Handle local image file upload containing a QR code
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = async () => {
          if ('BarcodeDetector' in window) {
            try {
              const detector = new (window as any).BarcodeDetector({
                formats: ['qr_code', 'data_matrix', 'code_128', 'ean_13'],
              });
              const barcodes = await detector.detect(img);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                handlePayloadDetected(barcodes[0].rawValue);
                return;
              }
            } catch {
              // Ignore
            }
          }
          // Fallback: If image cannot be optically parsed, prompt manual review
          setErrorMsg(t('qr_scanner.err_file_parse'));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMsg(t('qr_scanner.err_file_parse'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRescan = () => {
    setDetectedRaw(null);
    setParsedData(null);
    setEditBrand('');
    setEditInkName('');
    setEditBatch('');
    setEditIngredients('');
    setIsScanning(true);
  };

  const handleApplyConfirm = () => {
    const result: ParsedLabelData = {
      brand: editBrand.trim() || undefined,
      inkName: editInkName.trim() || undefined,
      batchNumber: editBatch.trim() || undefined,
      ingredients: editIngredients.trim() || undefined,
      rawText: detectedRaw || manualText || '',
      detectedType: parsedData?.detectedType || 'plain',
    };

    onApplyParsedData(result);
    stopCamera();
    onClose();
  };

  const handleApplyManual = () => {
    if (!manualText.trim()) return;
    handlePayloadDetected(manualText.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      id="qr_code_scanner_modal_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr_scanner_modal_title"
    >
      <div
        id="qr_code_scanner_modal_card"
        className="w-full max-w-xl bg-[var(--bg-card)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 id="qr_scanner_modal_title" className="text-base font-bold leading-tight">
                {title || t('qr_scanner.modal_title')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {hint || t('qr_scanner.modal_sub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasTorch && !detectedRaw && (
              <button
                type="button"
                id="btn_toggle_torch"
                onClick={handleToggleTorch}
                aria-label={t('qr_scanner.aria_torch')}
                title={t('qr_scanner.aria_torch')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isTorchOn
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            {hasMultipleCameras && !detectedRaw && (
              <button
                type="button"
                id="btn_switch_camera"
                onClick={handleSwitchCamera}
                aria-label={t('qr_scanner.aria_switch_camera')}
                title={t('qr_scanner.aria_switch_camera')}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              id="btn_close_qr_modal"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              aria-label={t('profile.close_aria')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewport & Result Display */}
        <div className="p-5 flex flex-col gap-4">
          {errorMsg && !detectedRaw ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{t('qr_scanner.camera_unavailable_title')}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{errorMsg}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('qr_scanner.manual_entry_prompt')}
              </p>
            </div>
          ) : !detectedRaw ? (
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-[var(--border)] shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning visual reticle */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-52 border-2 border-[var(--brand-cyan)] rounded-xl relative shadow-[0_0_20px_rgba(0,180,216,0.3)]">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[var(--brand-cyan)] -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[var(--brand-cyan)] -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[var(--brand-cyan)] -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[var(--brand-cyan)] -mb-1 -mr-1 rounded-br" />
                    {/* Laser scanline */}
                    <div className="absolute inset-x-0 h-0.5 bg-[var(--brand-cyan)] animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_8px_var(--brand-cyan)]" />
                  </div>
                  <div className="absolute bottom-3 px-3.5 py-1.5 rounded-full bg-black/70 text-white text-xs font-mono tracking-wide backdrop-blur-xs flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
                    {t('qr_scanner.align_qr_hint')}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Parsed Information Confirmation Card */}
          {detectedRaw && parsedData && (
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex flex-col gap-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {t('qr_scanner.detected_label')}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/30 font-semibold">
                    {parsedData.detectedType}
                  </span>
                </div>
                <button
                  type="button"
                  id="btn_rescan_qr"
                  onClick={handleRescan}
                  className="min-h-[36px] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('qr_scanner.scan_again')}
                </button>
              </div>

              {/* Editable Fields for User Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[var(--brand-cyan)]" />
                    {t('qr_scanner.field_brand')}
                  </label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder={t('qr_scanner.placeholder_brand')}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:ring-2 focus:ring-[var(--brand-cyan)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--brand-cyan)]" />
                    {t('qr_scanner.field_ink')}
                  </label>
                  <input
                    type="text"
                    value={editInkName}
                    onChange={(e) => setEditInkName(e.target.value)}
                    placeholder={t('qr_scanner.placeholder_ink')}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:ring-2 focus:ring-[var(--brand-cyan)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-[var(--brand-cyan)]" />
                    {t('qr_scanner.field_batch')}
                  </label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    placeholder={t('qr_scanner.placeholder_batch')}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono focus:ring-2 focus:ring-[var(--brand-cyan)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[var(--brand-cyan)]" />
                    {t('qr_scanner.field_ingredients')}
                  </label>
                  <textarea
                    rows={3}
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    placeholder={t('qr_scanner.placeholder_ingredients')}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono resize-y focus:ring-2 focus:ring-[var(--brand-cyan)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Alternative Input Options (Photo Upload or Manual QR Text) */}
          {!detectedRaw && (
            <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{t('qr_scanner.or_upload_photo')}</span>
                <button
                  type="button"
                  id="btn_upload_qr_image"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-medium"
                >
                  <Upload className="w-3.5 h-3.5 text-[var(--brand-cyan)]" />
                  <span>{t('qr_scanner.btn_browse_photo')}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Paste or Manual Payload Fallback */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder={t('qr_scanner.manual_paste_placeholder')}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]"
                />
                {manualText.trim() && (
                  <button
                    type="button"
                    id="btn_parse_manual_qr"
                    onClick={handleApplyManual}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
                  >
                    {t('qr_scanner.btn_parse')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)] bg-[var(--bg-base)]">
          <button
            type="button"
            id="btn_cancel_qr_scanner"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {t('qr_scanner.btn_cancel')}
          </button>

          <button
            type="button"
            id="btn_confirm_apply_qr"
            disabled={!detectedRaw && !manualText}
            onClick={handleApplyConfirm}
            className="min-h-[44px] px-5 py-2 text-xs font-bold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>{t('qr_scanner.btn_apply_to_decoder')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
