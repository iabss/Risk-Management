import React from 'react';
import {
  ShieldAlert,
  Plus,
  Download,
  ListCheck,
  RotateCcw,
  Building2,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenActionTracker: () => void;
  onExportData: (format: 'csv' | 'json') => void;
  onResetData: () => void;
  selectedQuarter: string;
  onSelectQuarter: (quarter: string) => void;
  totalRisks: number;
  openActionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenActionTracker,
  onExportData,
  onResetData,
  selectedQuarter,
  onSelectQuarter,
  totalRisks,
  openActionsCount,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0F0F12] border-b border-white/5 text-[#D1D1D1] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-sm bg-[#16161A] border border-white/10 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-serif italic font-semibold text-lg tracking-tight text-white">
                  Sentinel ERM
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-white/5 text-white/50 rounded-sm border border-white/10">
                  ISO 31000:2018
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 hidden sm:block">
                Enterprise Risk Intelligence & Compliance
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Period selector */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#16161A] border border-white/10 rounded-sm px-2.5 py-1 text-xs text-white/70">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/40 text-[11px] uppercase tracking-wider">Periode:</span>
              <select
                aria-label="Pilih Periode Laporan"
                value={selectedQuarter}
                onChange={(e) => onSelectQuarter(e.target.value)}
                className="bg-transparent border-none text-white text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="All" className="bg-[#16161A] text-white">Semua Periode</option>
                <option value="Q3 2026" className="bg-[#16161A] text-white">Q3 2026 (Aktif)</option>
                <option value="Q2 2026" className="bg-[#16161A] text-white">Q2 2026</option>
                <option value="Q1 2026" className="bg-[#16161A] text-white">Q1 2026</option>
              </select>
            </div>

            {/* Action Items tracker button */}
            <button
              id="btn-action-tracker"
              onClick={onOpenActionTracker}
              className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-medium bg-[#16161A] hover:bg-[#1F1F24] text-white/80 hover:text-white border border-white/10 transition"
              title="Daftar Tindakan Mitigasi Terbuka"
            >
              <ListCheck className="w-3.5 h-3.5 text-white/60" />
              <span className="hidden md:inline">Mitigasi</span>
              {openActionsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-sm bg-red-950/80 text-red-300 border border-red-800/40">
                  {openActionsCount}
                </span>
              )}
            </button>

            {/* Export menu dropdown */}
            <div className="relative">
              <button
                id="btn-export-dropdown"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-medium bg-[#16161A] hover:bg-[#1F1F24] text-white/80 hover:text-white border border-white/10 transition"
                title="Ekspor Laporan Risiko"
              >
                <Download className="w-3.5 h-3.5 text-white/60" />
                <span className="hidden md:inline">Ekspor</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-[#16161A] border border-white/10 rounded-sm shadow-2xl py-1.5 z-50 text-xs text-white/80">
                  <div className="px-3 py-1.5 font-semibold text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5">
                    Format Ekspor ({totalRisks} Risiko)
                  </div>
                  <button
                    onClick={() => {
                      onExportData('csv');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#1F1F24] hover:text-white flex items-center space-x-2 transition"
                  >
                    <span>📄 Unduh Format Excel / CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportData('json');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#1F1F24] hover:text-white flex items-center space-x-2 transition"
                  >
                    <span>💾 Unduh Backup JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#1F1F24] hover:text-white flex items-center space-x-2 text-white/70 transition"
                  >
                    <span>🖨️ Cetak / Simpan PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reset data */}
            <button
              id="btn-reset-demo"
              onClick={onResetData}
              className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-[#16161A] transition border border-transparent hover:border-white/5"
              title="Reset ke Data Bawaan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Add Risk Button */}
            <button
              id="btn-add-risk-nav"
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-sm text-xs font-medium bg-red-600 hover:bg-red-500 text-white shadow-sm transition active:scale-95 border border-red-500/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Risiko</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
