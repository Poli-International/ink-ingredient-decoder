import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Calendar,
  HelpCircle,
  BookmarkCheck,
  Database,
  ExternalLink,
  Sparkles,
  Clock,
  UserCheck,
  ShieldCheck,
  Scale,
  Pipette,
  Search,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { useOfflineSync } from './hooks/useOfflineSync';
import { Header } from './components/Header';
import { BulkDecodeTab } from './components/BulkDecodeTab';
import { BlueGreenExplainer } from './components/BlueGreenExplainer';
import { MakerQuestionSheet } from './components/MakerQuestionSheet';
import { PlainLanguagePanel } from './components/PlainLanguagePanel';
import { ShortlistTab } from './components/ShortlistTab';
import { DatabaseBrowserTab } from './components/DatabaseBrowserTab';
import { AlternativesTab } from './components/AlternativesTab';
import { ExpiryDashboardTab } from './components/ExpiryDashboardTab';
import { SessionLoggerTab } from './components/SessionLoggerTab';
import { HeavyMetalCalculatorTab } from './components/HeavyMetalCalculatorTab';
import { MixtureLoggerTab } from './components/MixtureLoggerTab';
import { BatchRecallTab } from './components/BatchRecallTab';
import { RegulatoryMatrixTab } from './components/RegulatoryMatrixTab';
import { ProfileModal } from './components/ProfileModal';
import { OfflineSyncModal } from './components/OfflineSyncModal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { PigmentRecord } from './types/pigment';
import { StudioInkItem } from './types/database';
import { t, useLocale } from './lib/i18n';

export default function App() {
  const { locale, setLocale } = useLocale();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (localStorage.getItem('poli_theme') as 'dark' | 'light') || 'dark';
      } catch {
        return 'dark';
      }
    }
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<
    | 'decoder'
    | 'jurisdictions'
    | 'blue_green'
    | 'plain_language'
    | 'questions'
    | 'shortlist'
    | 'database'
    | 'alternatives'
    | 'expiry'
    | 'sessions'
    | 'metals'
    | 'mixtures'
    | 'recall'
  >('decoder');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  const [questionSheetPrefill, setQuestionSheetPrefill] = useState<{
    inkName: string;
    brand: string;
    batchNo: string;
    unrecognisedItems: string[];
  }>({
    inkName: '',
    brand: '',
    batchNo: '',
    unrecognisedItems: [],
  });

  const handleGenerateQuestionSheet = (data: {
    inkName: string;
    brand: string;
    batchNo: string;
    unrecognisedItems: string[];
  }) => {
    setQuestionSheetPrefill(data);
    setActiveTab('questions');
  };

  const {
    isOnline,
    profile,
    audits,
    inventory,
    sessions,
    coas,
    mixtures,
    syncTimestamp,
    saveUserProfile,
    saveInventory,
    deleteInventory,
    saveSession,
    deleteSession,
    saveCOA,
    deleteCOA,
    saveMixture,
    deleteMixture,
    exportData,
    importData,
    clearInkAudits,
  } = useOfflineSync();


  // Apply theme class to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('poli_theme', theme);
    } catch {}
  }, [theme]);

  // Inside the site or CRM frame, follow the host page's theme
  useEffect(() => {
    if (window.self === window.top) return;
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'poli-theme') setTheme(e.data.light ? 'light' : 'dark');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const inventoryPigmentIds = useMemo(() => {
    return new Set(inventory.map((i) => i.id));
  }, [inventory]);

  const handleAddPigmentToInventory = async (pigment: PigmentRecord) => {
    const invItem: StudioInkItem = {
      id: pigment.id,
      name: pigment.name,
      brand: 'Standard Pigment Registry',
      batchNumber: pigment.ci || pigment.cas[0] || 'N/A',
      status:
        pigment.status === 'banned' || pigment.status === 'svhc'
          ? 'banned'
          : pigment.status === 'restricted'
          ? 'restricted'
          : 'compliant',
      notes: pigment.notes,
      updatedAt: new Date().toISOString(),
    };
    await saveInventory(invItem);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <div className="tool-wrapper max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          isOnline={isOnline}
          profile={profile}
          auditsCount={audits.length}
          syncTimestamp={syncTimestamp}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSync={() => setIsSyncOpen(true)}
          currentLocale={locale}
          onSelectLocale={setLocale}
        />

        {/* Tab Navigation */}
        <div className="no-print mb-6">
          <nav
            aria-label={t('nav.aria_nav')}
            className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-x-auto text-xs sm:text-sm shadow-xs"
          >
            <button
              type="button"
              id="tab_decoder_btn"
              onClick={() => setActiveTab('decoder')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'decoder'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('nav.paste_label')}</span>
            </button>

            <button
              type="button"
              id="tab_jurisdictions_btn"
              onClick={() => setActiveTab('jurisdictions')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'jurisdictions'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t('nav.jurisdictions')}</span>
            </button>

            <button
              type="button"
              id="tab_database_btn"
              onClick={() => setActiveTab('database')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{t('nav.database')}</span>
            </button>

            <button
              type="button"
              id="tab_alternatives_btn"
              onClick={() => setActiveTab('alternatives')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'alternatives'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[var(--warning-text)]" />
              <span>{t('nav.alternatives')}</span>
            </button>

            <button
              type="button"
              id="tab_expiry_btn"
              onClick={() => setActiveTab('expiry')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'expiry'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('nav.expiry')}</span>
            </button>

            <button
              type="button"
              id="tab_sessions_btn"
              onClick={() => setActiveTab('sessions')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('nav.sessions')}</span>
            </button>

            <button
              type="button"
              id="tab_metals_btn"
              onClick={() => setActiveTab('metals')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'metals'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('nav.metals')}</span>
            </button>

            <button
              type="button"
              id="tab_mixtures_btn"
              onClick={() => setActiveTab('mixtures')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'mixtures'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Pipette className="w-4 h-4" />
              <span>{t('nav.mixtures')}</span>
            </button>

            <button
              type="button"
              id="tab_recall_btn"
              onClick={() => setActiveTab('recall')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'recall'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t('nav.recall')}</span>
            </button>


            <button
              type="button"
              id="tab_shortlist_btn"
              onClick={() => setActiveTab('shortlist')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'shortlist'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{t('nav.shortlist')}</span>
              {audits.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === 'shortlist'
                      ? 'bg-white/25 text-white'
                      : 'bg-[var(--bg-tag)] text-[var(--text-secondary)]'
                  }`}
                >
                  {audits.length}
                </span>
              )}
            </button>

            <button
              type="button"
              id="tab_blue_green_btn"
              onClick={() => setActiveTab('blue_green')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'blue_green'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('nav.blue_green')}</span>
            </button>

            <button
              type="button"
              id="tab_plain_language_btn"
              onClick={() => setActiveTab('plain_language')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'plain_language'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{t('nav.plain_language')}</span>
            </button>

            <button
              type="button"
              id="tab_questions_btn"
              onClick={() => setActiveTab('questions')}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'bg-[var(--brand-cyan)] text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('nav.maker_questions')}</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <main className="no-print">
          {activeTab === 'decoder' && (
            <BulkDecodeTab
              onGoToShortlist={() => setActiveTab('shortlist')}
              onGenerateQuestionSheet={handleGenerateQuestionSheet}
            />
          )}

          {activeTab === 'jurisdictions' && <RegulatoryMatrixTab />}

          {activeTab === 'database' && (
            <DatabaseBrowserTab
              onAddToInventory={handleAddPigmentToInventory}
              inventoryIds={inventoryPigmentIds}
            />
          )}

          {activeTab === 'alternatives' && (
            <AlternativesTab
              onSelectAlternative={(ci) => {
                setActiveTab('database');
              }}
            />
          )}

          {activeTab === 'expiry' && (
            <ExpiryDashboardTab
              inventory={inventory}
              onSaveItem={saveInventory}
              onDeleteItem={deleteInventory}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionLoggerTab
              sessions={sessions}
              inventory={inventory}
              audits={audits}
              onSaveSession={saveSession}
              onDeleteSession={deleteSession}
            />
          )}

          {activeTab === 'metals' && (
            <HeavyMetalCalculatorTab
              coas={coas}
              onSaveCOA={saveCOA}
              onDeleteCOA={deleteCOA}
            />
          )}

          {activeTab === 'mixtures' && (
            <MixtureLoggerTab
              mixtures={mixtures}
              inventory={inventory}
              onSaveMixture={saveMixture}
              onDeleteMixture={deleteMixture}
            />
          )}

          {activeTab === 'recall' && (
            <BatchRecallTab
              sessions={sessions}
              inventory={inventory}
              mixtures={mixtures}
            />
          )}


          {activeTab === 'shortlist' && <ShortlistTab />}

          {activeTab === 'blue_green' && (
            <BlueGreenExplainer
              onDecodeFormulation={() => {
                setActiveTab('decoder');
              }}
            />
          )}

          {activeTab === 'plain_language' && (
            <PlainLanguagePanel onGoToDecoder={() => setActiveTab('decoder')} />
          )}

          {activeTab === 'questions' && (
            <MakerQuestionSheet
              initialInkName={questionSheetPrefill.inkName}
              initialBrand={questionSheetPrefill.brand}
              initialBatchNo={questionSheetPrefill.batchNo}
              initialUnrecognisedItems={questionSheetPrefill.unrecognisedItems}
            />
          )}
        </main>

        {/* Disclaimer / Legal Notice */}
        <div className="no-print mt-8 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-xs text-[var(--text-muted)] leading-relaxed">
          {t('disclaimer.note')}
        </div>

        {/* Cross-Tool Links by Poli International */}
        <div className="no-print mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-xs space-y-2">
          <div className="font-semibold text-[var(--text-secondary)]">
            {t('cross_links.heading')}
          </div>
          <div className="flex flex-wrap gap-4 text-[var(--accent)] font-medium">
            <a
              href="https://poliinternational.com/reach-svhc-checker/"
              target="_top"
              rel="noopener"
              className="inline-flex items-center gap-1 hover:underline"
            >
              {t('cross_links.svhc')}
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://poliinternational.com/tattoo-ink-mixer/"
              target="_top"
              rel="noopener"
              className="inline-flex items-center gap-1 hover:underline"
            >
              {t('cross_links.mixer')}
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://poliinternational.com/allergy-patch-test/"
              target="_top"
              rel="noopener"
              className="inline-flex items-center gap-1 hover:underline"
            >
              {t('cross_links.patch')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="no-print mt-8 pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span>{t('footer.publisher')}</span>
            <span className="hidden sm:inline text-[var(--border)]">|</span>
            <LanguageSwitcher
              currentLocale={locale}
              onSelectLocale={setLocale}
              idPrefix="footer"
              variant="footer"
            />
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <span>{t('footer.reg_tag')}</span>
            <span>·</span>
            <span>{t('footer.storage_tag')}</span>
            <span>·</span>
            <span>{t('footer.telemetry_tag')}</span>
          </div>
        </footer>

        {/* Modals */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onSaveProfile={saveUserProfile}
        />

        <OfflineSyncModal
          isOpen={isSyncOpen}
          onClose={() => setIsSyncOpen(false)}
          isOnline={isOnline}
          auditsCount={audits.length}
          inventoryCount={inventory.length}
          syncTimestamp={syncTimestamp}
          onExport={exportData}
          onImport={importData}
          onClearAudits={clearInkAudits}
        />
      </div>
    </div>
  );
}
