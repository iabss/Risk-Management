import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveStats } from './components/ExecutiveStats';
import { RiskHeatmap5x5 } from './components/RiskHeatmap5x5';
import { KRISection } from './components/KRISection';
import { RiskCharts } from './components/RiskCharts';
import { RiskRegisterTable } from './components/RiskRegisterTable';
import { RiskDetailModal } from './components/RiskDetailModal';
import { RiskFormModal } from './components/RiskFormModal';
import { ActionTrackerModal } from './components/ActionTrackerModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { INITIAL_RISKS, INITIAL_KRIS } from './data/mockRisks';
import { RiskItem, KRIItem } from './types/risk';
import { calculateRiskLevel } from './utils/riskCalculations';

const STORAGE_KEY_RISKS = 'erm_dashboard_risks_v2';
const STORAGE_KEY_KRIS = 'erm_dashboard_kris_v1';

export default function App() {
  // Load initial state from LocalStorage or default empty list
  const [risks, setRisks] = useState<RiskItem[]>(() => {
    try {
      // Clear legacy storage key if present to ensure clean slate
      localStorage.removeItem('erm_dashboard_risks_v1');
      const saved = localStorage.getItem(STORAGE_KEY_RISKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved risks', e);
    }
    return INITIAL_RISKS;
  });

  const [kris, setKris] = useState<KRIItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KRIS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved KRIs', e);
    }
    return INITIAL_KRIS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RISKS, JSON.stringify(risks));
    } catch (e) {
      console.error('Failed to store risks', e);
    }
  }, [risks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KRIS, JSON.stringify(kris));
    } catch (e) {
      console.error('Failed to store KRIs', e);
    }
  }, [kris]);

  // Filtering and Selection States
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3 2026');
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [viewingRisk, setViewingRisk] = useState<RiskItem | null>(null);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isActionTrackerOpen, setIsActionTrackerOpen] = useState<boolean>(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter risks by period if not "All"
  const quarterFilteredRisks =
    selectedQuarter === 'All'
      ? risks
      : risks.filter((r) => !r.quarter || r.quarter === selectedQuarter);

  // When a matrix cell is selected, also filter the list
  const matrixFilteredRisks = selectedCell
    ? quarterFilteredRisks.filter(
        (r) =>
          r.inherentLikelihood === selectedCell.likelihood &&
          r.inherentImpact === selectedCell.impact
      )
    : quarterFilteredRisks;

  // Actions
  const handleOpenAdd = () => {
    setEditingRisk(null);
    setIsFormOpen(true);
  };

  const handleEditRisk = (risk: RiskItem) => {
    setViewingRisk(null);
    setEditingRisk(risk);
    setIsFormOpen(true);
  };

  const handleDeleteRisk = (id: string) => {
    const target = risks.find((r) => r.id === id);
    setRisks((prev) => prev.filter((r) => r.id !== id));
    if (viewingRisk?.id === id) setViewingRisk(null);
    showToast(`Risiko ${target?.code || ''} berhasil dihapus.`);
  };

  const handleDeleteMultipleRisks = (ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setRisks((prev) => prev.filter((r) => !idSet.has(r.id)));
    if (viewingRisk && idSet.has(viewingRisk.id)) setViewingRisk(null);
    showToast(`${ids.length} profil risiko berhasil dihapus.`);
  };

  const handleConfirmResetData = () => {
    localStorage.removeItem(STORAGE_KEY_RISKS);
    setRisks([]);
    setSelectedCell(null);
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setSearchQuery('');
    if (viewingRisk) setViewingRisk(null);
    setIsResetConfirmModalOpen(false);
    showToast('Seluruh daftar risiko berhasil dikosongkan.');
  };

  const handleSaveRisk = (riskData: Omit<RiskItem, 'id'>, existingId?: string) => {
    if (existingId) {
      // Update
      setRisks((prev) =>
        prev.map((r) => (r.id === existingId ? { ...riskData, id: existingId } : r))
      );
      showToast(`Perubahan risiko ${riskData.code} berhasil disimpan.`);
    } else {
      // Create
      const newRisk: RiskItem = {
        ...riskData,
        id: `rsk-${Date.now()}`,
      };
      setRisks((prev) => [newRisk, ...prev]);
      showToast(`Risiko baru ${newRisk.code} berhasil didaftarkan ke Risk Register.`);
    }
    setIsFormOpen(false);
    setEditingRisk(null);
  };

  const handleToggleActionItem = (riskId: string, actionId: string) => {
    setRisks((prev) =>
      prev.map((risk) => {
        if (risk.id !== riskId) return risk;

        const updatedActions = (risk.actionItems || []).map((a) =>
          a.id === actionId ? { ...a, completed: !a.completed } : a
        );

        // Calculate new progress
        const total = updatedActions.length;
        const completed = updatedActions.filter((a) => a.completed).length;
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : risk.mitigationProgress;

        const updatedRisk = {
          ...risk,
          actionItems: updatedActions,
          mitigationProgress: newProgress,
          status:
            newProgress === 100 && risk.status !== 'Closed'
              ? ('Monitored' as const)
              : risk.status,
        };

        // If currently viewing, update the modal view too
        if (viewingRisk?.id === riskId) {
          setViewingRisk(updatedRisk);
        }

        return updatedRisk;
      })
    );
  };

  const handleOpenResetModal = () => {
    setIsResetConfirmModalOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedCell(null);
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setSearchQuery('');
  };

  // Export Data functionality
  const handleExportData = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify({ risks, kris, exportDate: new Date().toISOString() }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ERM_Risk_Register_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('File JSON berhasil diunduh.');
    } else {
      // CSV Export
      const headers = [
        'Kode',
        'Judul Risiko',
        'Kategori',
        'Departemen',
        'Pemilik Risiko',
        'Kemungkinan Inheren',
        'Dampak Inheren',
        'Skor Inheren',
        'Tingkat Inheren',
        'Pengendalian Eksisting',
        'Efektivitas Kontrol',
        'Rencana Mitigasi',
        'Progres Mitigasi (%)',
        'Kemungkinan Residual',
        'Dampak Residual',
        'Skor Residual',
        'Tingkat Residual',
        'Status',
        'Estimasi Dampak Finansial',
        'Kecepatan',
        'Target Selesai',
      ];

      const rows = risks.map((r) => [
        `"${r.code}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.department}"`,
        `"${r.owner}"`,
        r.inherentLikelihood,
        r.inherentImpact,
        r.inherentScore,
        `"${r.inherentLevel}"`,
        `"${(r.existingControls || '').replace(/"/g, '""')}"`,
        `"${r.controlEffectiveness}"`,
        `"${(r.mitigationPlan || '').replace(/"/g, '""')}"`,
        r.mitigationProgress,
        r.residualLikelihood,
        r.residualImpact,
        r.residualScore,
        `"${r.residualLevel}"`,
        `"${r.status}"`,
        `"${r.financialImpactEstimate || ''}"`,
        `"${r.velocity || ''}"`,
        `"${r.targetDate}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ERM_Risk_Register_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Laporan Excel / CSV berhasil diunduh.');
    }
  };

  // Open action items count
  const openActionsCount = risks
    .flatMap((r) => r.actionItems || [])
    .filter((a) => !a.completed).length;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#D1D1D1] font-sans selection:bg-white/20 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#16161A] text-white rounded-sm shadow-xl text-xs flex items-center space-x-2 border border-white/10 animate-fade-in font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        onOpenAddModal={handleOpenAdd}
        onOpenActionTracker={() => setIsActionTrackerOpen(true)}
        onExportData={handleExportData}
        onResetData={handleOpenResetModal}
        selectedQuarter={selectedQuarter}
        onSelectQuarter={setSelectedQuarter}
        totalRisks={risks.length}
        openActionsCount={openActionsCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Executive Stats Summary */}
        <ExecutiveStats
          risks={quarterFilteredRisks}
          kris={kris}
          onFilterCritical={() => setSelectedLevel('Critical')}
          onFilterHigh={() => setSelectedLevel('High')}
          onFilterAll={() => setSelectedLevel('')}
          activeLevelFilter={selectedLevel}
        />

        {/* 5x5 Heatmap Matrix */}
        <RiskHeatmap5x5
          risks={quarterFilteredRisks}
          selectedCell={selectedCell}
          onSelectCell={(cell) => setSelectedCell(cell)}
          onSelectRiskItem={(risk) => setViewingRisk(risk)}
        />

        {/* Key Risk Indicators (KRI) Early Warning Section */}
        <KRISection
          kris={kris}
          risks={risks}
          onSelectRiskCode={(code) => {
            const match = risks.find((r) => r.code === code);
            if (match) {
              setViewingRisk(match);
            } else {
              setSearchQuery(code);
            }
          }}
        />

        {/* Risk Distribution & Reduction Analytics */}
        <RiskCharts
          risks={quarterFilteredRisks}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          selectedCategory={selectedCategory}
        />

        {/* Comprehensive Risk Register Table */}
        <div id="risk-register-section">
          <RiskRegisterTable
            risks={matrixFilteredRisks}
            onViewRisk={(risk) => setViewingRisk(risk)}
            onEditRisk={(risk) => handleEditRisk(risk)}
            onDeleteRisk={handleDeleteRisk}
            onDeleteMultipleRisks={handleDeleteMultipleRisks}
            onClearAllRisks={handleOpenResetModal}
            onOpenAddRisk={handleOpenAdd}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            onClearFilters={handleClearFilters}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-white/5 text-center text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-white/70">Enterprise Risk Management (ERM) Dashboard</strong> • Berpedoman pada ISO 31000:2018
          </div>
          <div className="text-[11px] text-white/40">
            Dikelola oleh Satuan Kerja Manajemen Risiko & Kepatuhan Internal
          </div>
        </div>
      </footer>

      {/* Risk Detail Modal */}
      {viewingRisk && (
        <RiskDetailModal
          risk={viewingRisk}
          onClose={() => setViewingRisk(null)}
          onEdit={(r) => handleEditRisk(r)}
          onDelete={handleDeleteRisk}
          onToggleActionItem={handleToggleActionItem}
        />
      )}

      {/* Risk Form Modal (Create / Edit) */}
      <RiskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRisk(null);
        }}
        onSave={handleSaveRisk}
        editingRisk={editingRisk}
        nextCodeNumber={risks.length + 1}
      />

      {/* Action Items Tracker Modal */}
      <ActionTrackerModal
        isOpen={isActionTrackerOpen}
        onClose={() => setIsActionTrackerOpen(false)}
        risks={risks}
        onToggleActionItem={handleToggleActionItem}
        onSelectRisk={(r) => setViewingRisk(r)}
      />

      {/* Reset / Clear All Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isResetConfirmModalOpen}
        onClose={() => setIsResetConfirmModalOpen(false)}
        onConfirm={handleConfirmResetData}
        title="Kosongkan Seluruh Profil Risiko"
        message="Apakah Anda yakin ingin menghapus seluruh daftar profil risiko yang ada saat ini? Semua data profil risiko dan rencana tindakan mitigasi akan dibersihkan untuk memulai pendaftaran baru."
        itemDetails={{
          count: risks.length,
        }}
        confirmButtonText="Kosongkan Semua Risiko"
      />
    </div>
  );
}
