import React, { useState } from 'react';
import {
  Info,
  FilterX,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RiskItem, RiskLevel } from '../types/risk';
import {
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
  calculateRiskLevel,
  getRiskLevelConfig,
} from '../utils/riskCalculations';

interface RiskHeatmap5x5Props {
  risks: RiskItem[];
  selectedCell: { likelihood: number; impact: number } | null;
  onSelectCell: (cell: { likelihood: number; impact: number } | null) => void;
  onSelectRiskItem: (risk: RiskItem) => void;
}

type MatrixViewMode = 'inherent' | 'residual' | 'comparison';

export const RiskHeatmap5x5: React.FC<RiskHeatmap5x5Props> = ({
  risks,
  selectedCell,
  onSelectCell,
  onSelectRiskItem,
}) => {
  const [viewMode, setViewMode] = useState<MatrixViewMode>('inherent');
  const [hoveredCell, setHoveredCell] = useState<{ l: number; i: number } | null>(null);

  // Group risks into cells based on current viewMode
  const getRisksForCell = (l: number, i: number, mode: 'inherent' | 'residual') => {
    return risks.filter((r) => {
      if (mode === 'inherent') {
        return r.inherentLikelihood === l && r.inherentImpact === i;
      } else {
        return r.residualLikelihood === l && r.residualImpact === i;
      }
    });
  };

  // Matrix axes
  const likelihoods = [5, 4, 3, 2, 1]; // Y-axis top to bottom
  const impacts = [1, 2, 3, 4, 5]; // X-axis left to right

  // Stats for the matrix legend
  const currentLevelCounts = {
    Critical: risks.filter((r) => (viewMode === 'inherent' ? r.inherentLevel : r.residualLevel) === 'Critical').length,
    High: risks.filter((r) => (viewMode === 'inherent' ? r.inherentLevel : r.residualLevel) === 'High').length,
    Medium: risks.filter((r) => (viewMode === 'inherent' ? r.inherentLevel : r.residualLevel) === 'Medium').length,
    Low: risks.filter((r) => (viewMode === 'inherent' ? r.inherentLevel : r.residualLevel) === 'Low').length,
  };

  return (
    <div className="bg-[#16161A] rounded-sm p-6 border border-white/5 shadow-2xl mb-8">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-serif text-white">
              Matriks Peta Panas Risiko 5x5 (ISO 31000)
            </h2>
            <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/50 border border-white/10">
              Likelihood × Impact
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Klik pada kotak matriks untuk menyaring tabel daftar risiko di bawah.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#0A0A0B] p-1 rounded-sm border border-white/10 text-xs">
          <button
            id="view-mode-inherent"
            onClick={() => setViewMode('inherent')}
            className={`px-3 py-1.5 rounded-sm font-medium transition ${
              viewMode === 'inherent'
                ? 'bg-[#1F1F24] text-white shadow-xs border border-white/10'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Risiko Inheren
          </button>
          <button
            id="view-mode-residual"
            onClick={() => setViewMode('residual')}
            className={`px-3 py-1.5 rounded-sm font-medium transition ${
              viewMode === 'residual'
                ? 'bg-[#1F1F24] text-white shadow-xs border border-white/10'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Risiko Residual
          </button>
          <button
            id="view-mode-comparison"
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-sm font-medium transition flex items-center space-x-1 ${
              viewMode === 'comparison'
                ? 'bg-[#1F1F24] text-white shadow-xs border border-white/10'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Migrasi Mitigasi</span>
          </button>
        </div>
      </div>

      {/* Active filter notification banner */}
      {selectedCell && (
        <div className="mb-4 p-3 bg-[#1F1F24] border-l-2 border-amber-500 border-y border-r border-white/5 rounded-sm flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-400">Filter Matriks Aktif:</span>
            <span>
              Kemungkinan (L): <b>{selectedCell.likelihood}</b> × Dampak (I):{' '}
              <b>{selectedCell.impact}</b> (Skor: {selectedCell.likelihood * selectedCell.impact})
            </span>
          </div>
          <button
            onClick={() => onSelectCell(null)}
            className="flex items-center space-x-1 font-medium hover:underline text-amber-400"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Hapus Filter</span>
          </button>
        </div>
      )}

      {/* 5x5 Matrix Layout */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[540px] flex">
          {/* Y-axis Label */}
          <div className="flex items-center justify-center -rotate-90 text-[9px] uppercase tracking-widest font-mono text-white/30 w-8 whitespace-nowrap">
            Kemungkinan (Likelihood)
          </div>

          <div className="flex-1">
            {/* Rows of the matrix */}
            <div className="space-y-1.5">
              {likelihoods.map((l) => (
                <div key={l} className="flex items-center space-x-1.5">
                  {/* Row header (Likelihood label) */}
                  <div
                    className="w-28 text-right pr-2 text-xs font-medium text-white/70"
                    title={LIKELIHOOD_LABELS[l].desc}
                  >
                    <span className="block text-[11px] leading-tight text-white/80">
                      {LIKELIHOOD_LABELS[l].title}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 font-normal font-mono">
                      {LIKELIHOOD_LABELS[l].en}
                    </span>
                  </div>

                  {/* 5 Cells for this row */}
                  <div className="grid grid-cols-5 gap-1.5 flex-1">
                    {impacts.map((i) => {
                      const score = l * i;
                      const level = calculateRiskLevel(score);
                      const config = getRiskLevelConfig(level);
                      const isSelected =
                        selectedCell?.likelihood === l && selectedCell?.impact === i;

                      const inherentRisks = getRisksForCell(l, i, 'inherent');
                      const residualRisks = getRisksForCell(l, i, 'residual');

                      const cellRisks =
                        viewMode === 'inherent'
                          ? inherentRisks
                          : viewMode === 'residual'
                          ? residualRisks
                          : inherentRisks;

                      return (
                        <div
                          key={`${l}-${i}`}
                          id={`matrix-cell-${l}-${i}`}
                          onClick={() => {
                            if (isSelected) {
                              onSelectCell(null);
                            } else {
                              onSelectCell({ likelihood: l, impact: i });
                            }
                          }}
                          onMouseEnter={() => setHoveredCell({ l, i })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`relative h-20 p-2 rounded-sm border flex flex-col justify-between cursor-pointer transition-all duration-150 select-none ${
                            config.matrixCellBg
                          } ${
                            isSelected
                              ? `${config.activeMatrixRing} shadow-xl scale-[1.02] z-10 border-white/40`
                              : 'hover:scale-[1.01] hover:border-white/20'
                          }`}
                        >
                          {/* Top row inside cell: score & level abbreviation */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-white/70">
                              {score}
                            </span>
                            <span className="text-[9px] uppercase font-mono tracking-widest opacity-60">
                              {level === 'Critical'
                                ? 'KRITIS'
                                : level === 'High'
                                ? 'TINGGI'
                                : level === 'Medium'
                                ? 'SEDANG'
                                : 'RENDAH'}
                            </span>
                          </div>

                          {/* Center: Risk Count & Chips */}
                          <div className="my-auto flex flex-col items-center justify-center">
                            {viewMode === 'comparison' ? (
                              <div className="flex items-center space-x-1 text-[10px] font-mono">
                                <span
                                  className="font-bold px-1.5 py-0.5 rounded-sm bg-white/5 text-white/70 border border-white/10"
                                  title={`${inherentRisks.length} Risiko Inheren`}
                                >
                                  {inherentRisks.length} Inh
                                </span>
                                <ArrowRight className="w-3 h-3 text-white/30" />
                                <span
                                  className="font-bold px-1.5 py-0.5 rounded-sm bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                                  title={`${residualRisks.length} Risiko Residual`}
                                >
                                  {residualRisks.length} Res
                                </span>
                              </div>
                            ) : cellRisks.length > 0 ? (
                              <div className="flex items-center space-x-1">
                                <span className="w-6 h-6 rounded-sm flex items-center justify-center font-bold text-xs bg-white/10 text-white border border-white/10 shadow-xs">
                                  {cellRisks.length}
                                </span>
                                <span className="text-[10px] font-medium hidden md:inline text-white/60">
                                  Risiko
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-white/20 font-mono">
                                0
                              </span>
                            )}
                          </div>

                          {/* Bottom: quick code preview or indicator dots */}
                          <div className="flex items-center justify-center space-x-1 overflow-hidden h-3.5">
                            {cellRisks.slice(0, 3).map((r) => (
                              <span
                                key={r.id}
                                className="w-1.5 h-1.5 rounded-full bg-white/70"
                                title={r.code}
                              />
                            ))}
                            {cellRisks.length > 3 && (
                              <span className="text-[9px] font-mono font-semibold text-white/40">
                                +{cellRisks.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* X-axis Columns Header */}
            <div className="flex items-start space-x-1.5 mt-2.5">
              <div className="w-28" /> {/* spacer for Y-axis label */}
              <div className="grid grid-cols-5 gap-1.5 flex-1 text-center">
                {impacts.map((i) => (
                  <div key={i} className="px-1" title={IMPACT_LABELS[i].desc}>
                    <span className="block text-[11px] font-medium text-white/80">
                      {IMPACT_LABELS[i].title}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/30 font-mono">
                      {IMPACT_LABELS[i].en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis title */}
            <div className="text-center text-[9px] uppercase tracking-widest font-mono text-white/30 mt-2">
              Tingkat Dampak (Impact)
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legend & Level Breakdown */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
            Kategori ISO 31000:
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-white/70 text-xs">
              Kritis (15 - 25):{' '}
              <b className="text-red-400 font-mono">{currentLevelCounts.Critical}</b>
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-white/70 text-xs">
              Tinggi (10 - 14):{' '}
              <b className="text-amber-400 font-mono">{currentLevelCounts.High}</b>
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-white/70 text-xs">
              Sedang (5 - 9):{' '}
              <b className="text-yellow-400 font-mono">{currentLevelCounts.Medium}</b>
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-white/70 text-xs">
              Rendah (1 - 4):{' '}
              <b className="text-emerald-400 font-mono">{currentLevelCounts.Low}</b>
            </span>
          </div>
        </div>

        <div className="text-[10px] text-white/30 flex items-center font-mono uppercase tracking-wider">
          <Info className="w-3 h-3 mr-1 text-white/40" />
          <span>Skor = Likelihood (1-5) × Impact (1-5)</span>
        </div>
      </div>
    </div>
  );
};
