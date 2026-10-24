import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Camera, Check, AlertCircle, Building2, User, MapPin, FileText } from 'lucide-react';
import { UserProfile } from '../types/database';
import { processProfilePhoto } from '../lib/imageProcessor';
import { t } from '../lib/i18n';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [studioName, setStudioName] = useState(profile.studioName || '');
  const [role, setRole] = useState(profile.role || t('profile.default_artist'));
  const [location, setLocation] = useState(profile.location || t('profile.default_jurisdiction'));
  const [notes, setNotes] = useState(profile.notes || '');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(profile.avatarDataUrl);

  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setProcessing(true);

    try {
      const processed = await processProfilePhoto(file, 256);
      setAvatarDataUrl(processed.dataUrl);
      setSuccessMsg(t('profile.photo_processed', { size: String(Math.round(processed.sizeBytes / 1024)) }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('profile.process_failed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    setAvatarDataUrl(null);
    setSuccessMsg(t('profile.photo_removed'));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await onSaveProfile({
        name: name.trim() || t('profile.default_artist'),
        studioName: studioName.trim() || t('profile.default_studio'),
        role,
        location: location.trim(),
        notes: notes.trim(),
        avatarDataUrl,
      });
      setSuccessMsg(t('profile.profile_saved'));
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('profile.save_failed'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--brand-cyan)]" />
            <h2 id="profile-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
              {t('profile.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label={t('profile.close_aria')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5">
          {/* Notifications */}
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

          {/* Profile Photo Upload Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              {t('profile.custom_photo_heading')}
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-[var(--bg-input)] border border-[var(--border)]">
              {/* Photo Avatar Preview */}
              <div className="relative shrink-0">
                {avatarDataUrl ? (
                  <img
                    src={avatarDataUrl}
                    alt={name || t('profile.profile_alt')}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[var(--brand-cyan)] shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-tag)] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)]">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[11px]">{t('profile.no_photo')}</span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone & Controls */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex-1 w-full flex flex-col items-center justify-center p-3 text-center border border-dashed rounded-lg transition-colors ${
                  isDragging
                    ? 'border-[var(--brand-cyan)] bg-[var(--bg-hover)]'
                    : 'border-[var(--border)] bg-[var(--bg-page)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="custom-profile-photo-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  {t('profile.drop_instructions')}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--brand-cyan)] text-white hover:bg-[var(--brand-hover)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{processing ? t('profile.processing') : t('profile.upload_btn')}</span>
                  </button>

                  {avatarDataUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--bg-tag)] text-[var(--danger-text)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      title={t('profile.remove_title')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('profile.remove_btn')}</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {t('profile.offline_spec')}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                <User className="w-3.5 h-3.5" />
                <span>{t('profile.name_label')}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profile.name_placeholder')}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t('profile.studio_label')}</span>
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder={t('profile.studio_placeholder')}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {t('profile.role_label')}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)]"
                >
                  <option value="Tattoo Artist">{t('profile.role_artist')}</option>
                  <option value="Studio Owner / Manager">{t('profile.role_owner')}</option>
                  <option value="Compliance Officer">{t('profile.role_compliance')}</option>
                  <option value="Guest Artist">{t('profile.role_guest')}</option>
                  <option value="Permanent Makeup Specialist">{t('profile.role_pmu')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('profile.jurisdiction_label')}</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('profile.jurisdiction_placeholder')}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>{t('profile.notes_label')}</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t('profile.notes_placeholder')}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-cyan)]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {t('profile.cancel_btn')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-[var(--brand-cyan)] text-white hover:bg-[var(--brand-hover)] transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('profile.save_btn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
