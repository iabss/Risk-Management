import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Building2,
  User,
  Calendar,
  Sparkles,
  Layers,
  Plus,
  CheckSquare,
} from 'lucide-react';
import { RiskItem, RiskLevel } from '../types/risk';
import { getRiskLevelConfig, getStatusConfig } from '../utils/riskCalculations';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface RiskRegisterTableProps {
  risks: RiskItem[];
  onViewRisk: (risk: RiskItem) => void;
  onEditRisk: (risk: RiskItem) => void;
  onDeleteRisk: (id: string) => void;
  onDeleteMultipleRisks?: (ids: string[]) => void;
  onClearAllRisks?: () => void;
  onOpenAddRisk?: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedLevel: string;
  onSelectLevel: (lvl: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  onClearFilters: () => void;
}

export const RiskRegisterTable: React.FC<RiskRegisterTableProps> = ({
  risks,
  onViewRisk,
  onEditRisk,
  onDeleteRisk,
  onDeleteMultipleRisks,
  onClearAllRisks,
  onOpenAddRisk,
  selectedCategory,
  onSelectCategory,
  selectedLevel,
  onSelectLevel,
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onSelectDepartment,
  selectedStatus,
  onSelectStatus,
  onClearFilters,
}) => {
  const [sortField, setSortField] = useState<'inherentScore' | 'residualScore' | 'code' | 'progress'>('inherentScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([]);
  const [deleteTargetRisk, setDeleteTargetRisk] = useState<RiskItem | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);

  // Departments list for dropdown
  const departments = Array.from(new Set(risks.map((r) => r.department)));
  const categories = Array.from(new Set(risks.map((r) => r.category)));

  // Filter logic
  const filteredRisks = risks.filter((r) => {
    // Search query
    if (
      searchQuery &&
      !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.owner.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.department.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory && r.category !== selectedCategory) {
      return false;
    }

    // Level filter
    if (selectedLevel && r.inherentLevel !== selectedLevel) {
      return false;
    }

    // Department filter
    if (selectedDepartment && r.department !== selectedDepartment) {
      return false;
    }

    // Status filter
    if (selectedStatus && r.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedRisks = [...filteredRisks].sort((a, b) => {
    let comp = 0;
    if (sortField === 'inherentScore') {
      comp = a.inherentScore - b.inherentScore;
    } else if (sortField === 'residualScore') {
      comp = a.residualScore - b.residualScore;
    } else if (sortField === 'progress') {
      comp = a.mitigationProgress - b.mitigationProgress;
    } else if (sortField === 'code') {
      comp = a.code.localeCompare(b.code);
    }
    return sortAsc ? comp : -comp;
  });

  const handleSort = (field: 'inherentScore' | 'residualScore' | 'code' | 'progress') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for risk scores
    }
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedLevel) ||
    Boolean(selectedDepartment) ||
    Boolean(selectedStatus);

  return (
    <div className="bg-[#16161A] rounded-sm border border-white/5 shadow-2xl overflow-hidden mb-8">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-serif text-white">
                Daftar Profil Risiko (Risk Register)
              </h2>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm bg-white/5 text-white/50 border border-white/10">
                {sortedRisks.length} dari {risks.length} Risiko
              </span>
              {risks.length > 0 && (
                <button
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 text-[11px] font-medium text-white/40 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-sm transition"
                  title="Kosongkan seluruh daftar profil risiko"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Semua</span>
                </button>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">
              Identifikasi risiko komprehensif, evaluasi dampak, status mitigasi, dan risiko residual.
            </p>
          </div>

          {/* Quick Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => onSelectLevel('')}
              className={`px-2.5 py-1 rounded-sm font-medium transition ${
                selectedLevel === ''
                  ? 'bg-[#1F1F24] text-white border border-white/20 shadow-xs'
                  : 'bg-[#0A0A0B] text-white/50 border border-white/10 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => onSelectLevel('Critical')}
              className={`px-2.5 py-1 rounded-sm font-medium transition ${
                selectedLevel === 'Critical'
                  ? 'bg-red-950/80 text-red-300 border border-red-800 shadow-xs'
                  : 'bg-red-950/30 text-red-400 border border-red-950 hover:border-red-900/50'
              }`}
            >
              Kritis
            </button>
            <button
              onClick={() => onSelectLevel('High')}
              className={`px-2.5 py-1 rounded-sm font-medium transition ${
                selectedLevel === 'High'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800 shadow-xs'
                  : 'bg-amber-950/30 text-amber-400 border border-amber-950 hover:border-amber-900/50'
              }`}
            >
              Tinggi
            </button>
            <button
              onClick={() => onSelectLevel('Medium')}
              className={`px-2.5 py-1 rounded-sm font-medium transition ${
                selectedLevel === 'Medium'
                  ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-800 shadow-xs'
                  : 'bg-yellow-950/30 text-yellow-400 border border-yellow-950 hover:border-yellow-900/50'
              }`}
            >
              Sedang
            </button>
            <button
              onClick={() => onSelectLevel('Low')}
              className={`px-2.5 py-1 rounded-sm font-medium transition ${
                selectedLevel === 'Low'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-xs'
                  : 'bg-emerald-950/30 text-emerald-400 border border-emerald-950 hover:border-emerald-900/50'
              }`}
            >
              Rendah
            </button>
          </div>
        </div>

        {/* Search & Select Filters Row */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode risiko, judul, pemilik, atau divisi..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            aria-label="Filter Departemen"
            value={selectedDepartment}
            onChange={(e) => onSelectDepartment(e.target.value)}
            className="text-xs bg-[#0F0F12] border border-white/10 rounded-sm px-2.5 py-1.5 text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="" className="bg-[#16161A] text-white">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept} value={dept} className="bg-[#16161A] text-white">
                {dept}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            aria-label="Filter Kategori"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs bg-[#0F0F12] border border-white/10 rounded-sm px-2.5 py-1.5 text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="" className="bg-[#16161A] text-white">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#16161A] text-white">
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            aria-label="Filter Status"
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="text-xs bg-[#0F0F12] border border-white/10 rounded-sm px-2.5 py-1.5 text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="" className="bg-[#16161A] text-white">Semua Status</option>
            <option value="Open" className="bg-[#16161A] text-white">Terbuka (Open)</option>
            <option value="Mitigating" className="bg-[#16161A] text-white">Proses Mitigasi</option>
            <option value="Monitored" className="bg-[#16161A] text-white">Dipantau (Monitored)</option>
            <option value="Closed" className="bg-[#16161A] text-white">Selesai (Closed)</option>
          </select>

          {/* Clear Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1.5 rounded-sm hover:bg-white/5 transition whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedRiskIds.length > 0 && (
        <div className="bg-red-950/40 border-b border-red-900/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 animate-fade-in text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-white font-medium">
              {selectedRiskIds.length} profil risiko dipilih
            </span>
            <button
              type="button"
              onClick={() => setSelectedRiskIds([])}
              className="text-[11px] text-white/50 hover:text-white underline ml-1 cursor-pointer"
            >
              Batalkan Pilihan
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition border border-red-500/50 shadow-sm active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedRiskIds.length} Risiko Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-white/70 border-collapse">
          <thead className="bg-[#0F0F12] text-[10px] uppercase font-mono tracking-widest text-white/40 border-b border-white/5">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Pilih semua risiko di tabel"
                  checked={sortedRisks.length > 0 && sortedRisks.every((r) => selectedRiskIds.includes(r.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allVisibleIds = sortedRisks.map((r) => r.id);
                      setSelectedRiskIds(Array.from(new Set([...selectedRiskIds, ...allVisibleIds])));
                    } else {
                      const visibleIdSet = new Set(sortedRisks.map((r) => r.id));
                      setSelectedRiskIds(selectedRiskIds.filter((id) => !visibleIdSet.has(id)));
                    }
                  }}
                  className="rounded-sm accent-red-500 bg-[#0F0F12] border-white/20 cursor-pointer w-3.5 h-3.5 align-middle"
                />
              </th>
              <th className="py-3 px-4 font-medium">
                <button
                  onClick={() => handleSort('code')}
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  <span>Identifikasi Risiko</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-medium">Departemen & Pemilik</th>
              <th className="py-3 px-3 font-medium text-center">
                <button
                  onClick={() => handleSort('inherentScore')}
                  className="inline-flex items-center space-x-1 hover:text-white transition"
                >
                  <span>Risiko Inheren (L×I)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-medium">
                <button
                  onClick={() => handleSort('progress')}
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  <span>Progres Mitigasi</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-medium text-center">
                <button
                  onClick={() => handleSort('residualScore')}
                  className="inline-flex items-center space-x-1 hover:text-white transition"
                >
                  <span>Risiko Residual</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-medium">Status & Jadwal</th>
              <th className="py-3 px-4 font-medium text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {risks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base font-serif text-white">Daftar Risiko Masih Kosong</p>
                      <p className="text-xs text-white/40 mt-1">
                        Daftar risiko lama telah dibersihkan. Anda dapat mulai mendaftarkan profil risiko baru sekarang.
                      </p>
                    </div>
                    {onOpenAddRisk && (
                      <button
                        onClick={onOpenAddRisk}
                        className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-sm text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition active:scale-95 shadow-sm border border-red-500/50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Profil Risiko Baru</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sortedRisks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-7 h-7 text-white/20" />
                    <p className="text-xs">Tidak ada risiko yang sesuai dengan kriteria filter.</p>
                    <button
                      onClick={onClearFilters}
                      className="text-xs text-red-400 font-medium hover:underline"
                    >
                      Hapus semua filter
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRisks.map((risk) => {
                const inherentCfg = getRiskLevelConfig(risk.inherentLevel);
                const residualCfg = getRiskLevelConfig(risk.residualLevel);
                const statusCfg = getStatusConfig(risk.status);

                return (
                  <tr
                    key={risk.id}
                    id={`risk-row-${risk.code}`}
                    className={`hover:bg-white/[0.02] transition group ${
                      selectedRiskIds.includes(risk.id) ? 'bg-red-950/10' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Pilih profil risiko ${risk.code}`}
                        checked={selectedRiskIds.includes(risk.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedRiskIds((prev) => [...prev, risk.id]);
                          } else {
                            setSelectedRiskIds((prev) => prev.filter((id) => id !== risk.id));
                          }
                        }}
                        className="rounded-sm accent-red-500 bg-[#0F0F12] border-white/20 cursor-pointer w-3.5 h-3.5 align-middle"
                      />
                    </td>

                    {/* Code & Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-white/5 text-white/70 border border-white/10">
                          {risk.code}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono text-white/40 bg-white/5 border border-white/5">
                          {risk.category}
                        </span>
                      </div>
                      <div
                        onClick={() => onViewRisk(risk)}
                        className="mt-1 font-medium text-white hover:text-red-400 cursor-pointer line-clamp-1 transition"
                        title={risk.title}
                      >
                        {risk.title}
                      </div>
                      <p className="text-[11px] text-white/40 line-clamp-1 mt-0.5">
                        {risk.description}
                      </p>
                    </td>

                    {/* Department & Owner */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center text-white/80 font-medium">
                        <Building2 className="w-3 h-3 text-white/40 mr-1.5 shrink-0" />
                        <span>{risk.department}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-white/40 mt-0.5">
                        <User className="w-3 h-3 text-white/30 mr-1.5 shrink-0" />
                        <span className="truncate max-w-[130px]">{risk.owner}</span>
                      </div>
                    </td>

                    {/* Inherent Risk Score */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm border font-bold ${inherentCfg.badgeBg}`}
                        >
                          <span className="font-mono text-xs">{risk.inherentScore}</span>
                          <span className="text-[9px] font-mono font-normal ml-1 opacity-70">
                            ({risk.inherentLikelihood}×{risk.inherentImpact})
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-white/40 mt-1">
                          {inherentCfg.idLabel}
                        </span>
                      </div>
                    </td>

                    {/* Mitigation Plan & Progress */}
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="font-medium text-white/70">
                          {risk.mitigationProgress}% Selesai
                        </span>
                        <span className="text-white/40">
                          {risk.actionItems?.filter((a) => a.completed).length}/
                          {risk.actionItems?.length || 0} Aksi
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            risk.mitigationProgress >= 80
                              ? 'bg-emerald-400'
                              : risk.mitigationProgress >= 40
                              ? 'bg-white/60'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${risk.mitigationProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/40 truncate mt-1" title={risk.mitigationPlan}>
                        {risk.mitigationPlan}
                      </p>
                    </td>

                    {/* Residual Risk Score */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm border font-bold ${residualCfg.badgeBg}`}
                        >
                          <span className="font-mono text-xs">{risk.residualScore}</span>
                          <span className="text-[9px] font-mono font-normal ml-1 opacity-70">
                            ({risk.residualLikelihood}×{risk.residualImpact})
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-white/40 mt-1">
                          {residualCfg.idLabel}
                        </span>
                      </div>
                    </td>

                    {/* Status & Review Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider border ${statusCfg.badge}`}
                      >
                        {statusCfg.label}
                      </span>
                      <div className="flex items-center text-[10px] text-white/40 mt-1 font-mono">
                        <Calendar className="w-3 h-3 mr-1 text-white/30" />
                        <span>Target: {risk.targetDate}</span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onViewRisk(risk)}
                          className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
                          title="Lihat Detail Profil Risiko"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditRisk(risk)}
                          className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
                          title="Edit Risiko"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetRisk(risk)}
                          className="p-1.5 rounded-sm text-white/40 hover:text-red-400 hover:bg-red-950/30 transition"
                          title="Hapus Profil Risiko"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Single Risk Delete */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTargetRisk)}
        onClose={() => setDeleteTargetRisk(null)}
        onConfirm={() => {
          if (deleteTargetRisk) {
            onDeleteRisk(deleteTargetRisk.id);
            setSelectedRiskIds((prev) => prev.filter((id) => id !== deleteTargetRisk.id));
            setDeleteTargetRisk(null);
          }
        }}
        title="Hapus Profil Risiko"
        message="Apakah Anda yakin ingin menghapus profil risiko ini? Data profil risiko dan rencana tindakan mitigasinya akan dihapus dari Risk Register."
        itemDetails={
          deleteTargetRisk
            ? {
                code: deleteTargetRisk.code,
                title: deleteTargetRisk.title,
                category: deleteTargetRisk.category,
                department: deleteTargetRisk.department,
              }
            : undefined
        }
        confirmButtonText="Ya, Hapus Profil Risiko"
      />

      {/* Confirmation Modal for Bulk Delete */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={() => {
          if (onDeleteMultipleRisks) {
            onDeleteMultipleRisks(selectedRiskIds);
          } else {
            selectedRiskIds.forEach((id) => onDeleteRisk(id));
          }
          setSelectedRiskIds([]);
          setIsBulkDeleteModalOpen(false);
        }}
        title="Hapus Profil Risiko Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedRiskIds.length} profil risiko terpilih secara bersamaan? Tindakan ini tidak dapat dibatalkan.`}
        itemDetails={{
          count: selectedRiskIds.length,
        }}
        confirmButtonText={`Hapus ${selectedRiskIds.length} Risiko`}
      />

      {/* Confirmation Modal for Clear All Risks */}
      <ConfirmDeleteModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          if (onClearAllRisks) {
            onClearAllRisks();
          } else {
            risks.forEach((r) => onDeleteRisk(r.id));
          }
          setSelectedRiskIds([]);
          setIsClearAllModalOpen(false);
        }}
        title="Kosongkan Seluruh Profil Risiko"
        message="Apakah Anda yakin ingin menghapus seluruh daftar profil risiko yang ada saat ini? Semua data profil risiko dan rencana tindakan mitigasi akan dibersihkan untuk memulai daftar baru."
        itemDetails={{
          count: risks.length,
        }}
        confirmButtonText="Kosongkan Semua Risiko"
      />
    </div>
  );
};
