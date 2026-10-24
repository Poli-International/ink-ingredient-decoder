import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertTriangle, Scan, Copy, ArrowRight } from 'lucide-react';
import { t } from '../lib/i18n';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (detectedText: string) => void;
  title?: string;
  hint?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
  title,
  hint,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [barcodeFormat, setBarcodeFormat] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [copied, setCopied] = useState(false);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    setLastScannedResult(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t('scanner.err_no_media_devices'));
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || t('scanner.err_camera_access'));
      setIsScanning(false);
    }
  }, []);

  // Frame detection loop
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    let animId: number;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: [
            'qr_code',
            'ean_13',
            'ean_8',
            'code_128',
            'code_39',
            'data_matrix',
            'upc_a',
            'upc_e',
            'itf',
          ],
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
        !lastScannedResult
      ) {
        const video = videoRef.current;
        if (detector) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const item = barcodes[0];
              const raw = item.rawValue || '';
              if (raw) {
                setLastScannedResult(raw);
                setBarcodeFormat(item.format || 'barcode');
                setIsScanning(false);
                return;
              }
            }
          } catch {
            // Ignore detection frame error and continue
          }
        }
      }

      if (isScanning && !lastScannedResult) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (isScanning && !lastScannedResult) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isScanning, lastScannedResult]);

  if (!isOpen) return null;

  const handleApply = (textToApply?: string) => {
    const text = textToApply || lastScannedResult || manualInput;
    if (text.trim()) {
      onDetected(text.trim());
      stopCamera();
      onClose();
    }
  };

  const handleCopy = () => {
    const val = lastScannedResult || manualInput;
    if (val) {
      navigator.clipboard?.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRescan = () => {
    setLastScannedResult(null);
    setBarcodeFormat(null);
    setIsScanning(true);
  };

  return (
    <div
      id="barcode-scanner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div
        id="barcode-scanner-modal-card"
        className="w-full max-w-lg bg-[var(--surface)] text-[var(--foreground)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="scanner-modal-title" className="text-base font-semibold leading-tight">
                {title || t('scanner.modal_title')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {hint || t('scanner.modal_sub')}
              </p>
            </div>
          </div>
          <button
            id="btn-close-scanner-modal"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition"
            aria-label={t('scanner.aria_close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Error Body */}
        <div className="p-5 flex flex-col gap-4">
          {errorMsg ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{t('scanner.camera_unavailable_title')}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {errorMsg}
              </p>
              <p className="text-xs mt-1">
                {t('scanner.manual_entry_prompt')}
              </p>
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-[var(--border)] shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning visual reticle */}
              {isScanning && !lastScannedResult && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[var(--accent)]/80 rounded-xl relative shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[var(--accent)] -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[var(--accent)] -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[var(--accent)] -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[var(--accent)] -mb-1 -mr-1 rounded-br" />
                    <div className="absolute inset-x-0 h-0.5 bg-[var(--accent)]/90 animate-pulse top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-mono tracking-wide backdrop-blur-xs">
                    {t('scanner.align_barcode')}
                  </div>
                </div>
              )}

              {lastScannedResult && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                  <span className="text-sm font-semibold text-white">
                    {t('scanner.scan_success')}
                  </span>
                  {barcodeFormat && (
                    <span className="text-xs uppercase px-2 py-0.5 mt-1 rounded-md bg-white/20 text-white font-mono">
                      {barcodeFormat}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Detected Code Result Display */}
          {lastScannedResult && (
            <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5 text-[var(--accent)]" />
                  {t('scanner.detected_content')}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? t('scanner.copied') : t('scanner.copy')}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] font-mono text-xs text-[var(--foreground)] break-all max-h-24 overflow-y-auto border border-[var(--border)]">
                {lastScannedResult}
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="manual-barcode-input"
              className="text-xs font-medium text-[var(--text-secondary)]"
            >
              {t('scanner.manual_label')}
            </label>
            <div className="flex gap-2">
              <input
                id="manual-barcode-input"
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={t('scanner.manual_placeholder')}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--text-secondary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]"
              />
              {manualInput && (
                <button
                  id="btn-apply-manual-code"
                  type="button"
                  onClick={() => handleApply(manualInput)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition flex items-center gap-1"
                >
                  {t('scanner.apply_manual')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)] bg-[var(--card)]">
          <div>
            {lastScannedResult && (
              <button
                id="btn-rescan"
                onClick={handleRescan}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface)] transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('scanner.scan_again')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-scanner"
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition"
            >
              {t('scanner.cancel')}
            </button>
            <button
              id="btn-confirm-scanner-detected"
              type="button"
              disabled={!lastScannedResult && !manualInput}
              onClick={() => handleApply()}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              <span>{t('scanner.confirm_use')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
