import React, { useState } from 'react';
import {
  Check,
  HelpCircle,
  Table,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  MASTER_RISK_LEVEL_DATA,
  MASTER_RISK_DIMENSIONS,
  MasterRiskDimensionKey,
  getMasterRiskLevelRow,
} from '../data/masterRiskLevel';

interface ImpactCriteriaPickerProps {
  currentImpact: number;
  onSelectImpact: (level: number) => void;
  onOpenFullMatrixModal: () => void;
  onApplyDescription?: (text: string) => void;
  titlePrefix?: string;
  isResidual?: boolean;
}

export const ImpactCriteriaPicker: React.FC<ImpactCriteriaPickerProps> = ({
  currentImpact,
  onSelectImpact,
  onOpenFullMatrixModal,
  onApplyDescription,
  titlePrefix = 'Inherent',
  isResidual = false,
}) => {
  const [activeDimension, setActiveDimension] = useState<MasterRiskDimensionKey>('output');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const selectedRow = getMasterRiskLevelRow(currentImpact);
  const activeDimConfig = MASTER_RISK_DIMENSIONS.find((d) => d.key === activeDimension);

  return (
    <div className="rounded-sm border border-white/10 bg-[#0C0C0F] p-3 sm:p-4 space-y-3">
      {/* Header with toggle and Matrix Modal button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h4 className="text-xs font-semibold text-white tracking-wide flex items-center">
            Pilihan Kriteria Master Risk Level ({titlePrefix} Impact)
          </h4>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-950/60 text-blue-300 border border-blue-900/50">
            5 Dimensi Evaluasi
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenFullMatrixModal}
            className="px-2.5 py-1 text-[11px] font-mono rounded-sm bg-[#16161A] text-blue-300 border border-blue-800/40 hover:bg-blue-950/40 hover:border-blue-700 transition flex items-center space-x-1"
            title="Buka tabel lengkap master risk level"
          >
            <Table className="w-3.5 h-3.5 mr-1" />
            <span>Tabel Matriks Lengkap</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-white/50 hover:text-white transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Dimension Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                Pilih Perspektif / Dimensi Dampak Risiko:
              </span>
              <span className="text-[10px] text-white/40 hidden sm:inline-block">
                {activeDimConfig?.subLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {MASTER_RISK_DIMENSIONS.map((dim) => {
                const isActive = activeDimension === dim.key;
                return (
                  <button
                    key={dim.key}
                    type="button"
                    onClick={() => setActiveDimension(dim.key)}
                    className={`py-1.5 px-2 rounded-sm text-left border transition text-xs flex flex-col ${
                      isActive
                        ? 'bg-blue-950/70 border-blue-700 text-white font-medium shadow-xs ring-1 ring-blue-500/40'
                        : 'bg-[#121215] border-white/5 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="truncate text-[11px] font-bold">{dim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Cards Selector (1 to 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
            {MASTER_RISK_LEVEL_DATA.slice()
              .sort((a, b) => a.level - b.level)
              .map((row) => {
                const isSelected = currentImpact === row.level;
                const criteriaItems = row[activeDimension] || [];

                return (
                  <div
                    key={row.level}
                    onClick={() => onSelectImpact(row.level)}
                    className={`p-2.5 rounded-sm border cursor-pointer transition-all flex flex-col justify-between text-left ${
                      isSelected
                        ? `bg-[#151722] ${row.borderColor} ring-2 ring-blue-500/80 shadow-md`
                        : 'bg-[#111114] border-white/5 hover:border-white/20 hover:bg-[#15151a]'
                    }`}
                  >
                    <div>
                      {/* Top badge */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${row.badgeBg} ${row.textColor} ${row.borderColor}`}
                        >
                          {row.level}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase font-bold tracking-wider ${row.textColor}`}
                        >
                          {row.levelNameEn}
                        </span>
                      </div>

                      {/* Criteria list for this dimension */}
                      <div className="space-y-1 my-2">
                        {criteriaItems.map((item, idx) => (
                          <p
                            key={idx}
                            className="text-[11px] leading-snug text-white/80 line-clamp-3"
                          >
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Bottom action button */}
                    <div className="pt-2 border-t border-white/5 mt-auto flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-blue-400 font-bold flex items-center' : 'text-white/40'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3 h-3 mr-1 inline" />
                            Level Terpilih
                          </>
                        ) : (
                          'Klik untuk Pilih'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Selected Level Summary & Quick Copy */}
          {selectedRow && (
            <div className="p-2.5 rounded-sm bg-[#16161D] border border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${selectedRow.badgeBg} ${selectedRow.textColor}`}
                >
                  {selectedRow.level}
                </span>
                <span className="text-white/90 font-medium">
                  Impact Terpilih: <strong>Level {selectedRow.level} ({selectedRow.levelNameId})</strong>
                </span>
                <span className="text-white/40 hidden md:inline font-mono text-[10px]">
                  — {selectedRow[activeDimension]?.[0]}
                </span>
              </div>

              {onApplyDescription && (
                <button
                  type="button"
                  onClick={() => {
                    const sampleText = selectedRow[activeDimension]?.join('; ');
                    if (sampleText) {
                      onApplyDescription(sampleText);
                    }
                  }}
                  className="px-2 py-1 rounded-sm bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white border border-white/10 text-[10px] font-mono transition flex items-center self-start sm:self-auto shrink-0"
                  title="Salin deskripsi kriteria ini ke skenario terburuk"
                >
                  <Sparkles className="w-3 h-3 mr-1 text-blue-400" />
                  Salin ke Catatan Skenario
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
