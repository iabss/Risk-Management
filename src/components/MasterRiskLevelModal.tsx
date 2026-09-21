import React, { useState } from 'react';
import { X, Table, Check, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import {
  MASTER_RISK_LEVEL_DATA,
  MASTER_RISK_DIMENSIONS,
  MasterRiskDimensionKey,
} from '../data/masterRiskLevel';

interface MasterRiskLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel?: (level: number, descriptionSummary?: string) => void;
  currentSelectedLevel?: number;
}

export const MasterRiskLevelModal: React.FC<MasterRiskLevelModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  currentSelectedLevel,
}) => {
  const [highlightDimension, setHighlightDimension] = useState<MasterRiskDimensionKey | 'all'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#121216] rounded-sm shadow-2xl border border-white/15 my-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0F0F12] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-sm bg-[#16161A] border border-white/15 text-blue-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-widest bg-blue-950/60 text-blue-300 border border-blue-800/60 rounded-sm">
                  STANDAR MASTER RISK LEVEL
                </span>
                <span className="text-[10px] text-white/40 font-mono hidden sm:inline-block">
                  ISO 31000 Compliant Matrix
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-white mt-1">
                Kriteria Spesifikasi Penetapan Nilai Dampak (Impact Level 1 - 5)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dimension Filter Tabs */}
        <div className="px-4 py-2.5 bg-[#16161A] border-b border-white/5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-white/40 text-[11px] font-mono mr-2">Sorot Dimensi:</span>
          <button
            onClick={() => setHighlightDimension('all')}
            className={`px-2.5 py-1 rounded-sm text-xs font-mono transition ${
              highlightDimension === 'all'
                ? 'bg-white text-black font-bold'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            Semua Dimensi
          </button>
          {MASTER_RISK_DIMENSIONS.map((dim) => (
            <button
              key={dim.key}
              onClick={() => setHighlightDimension(dim.key)}
              className={`px-2.5 py-1 rounded-sm text-xs font-mono transition ${
                highlightDimension === dim.key
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>

        {/* Modal Content - Table */}
        <div className="p-4 sm:p-5 overflow-x-auto overflow-y-auto flex-1">
          <div className="min-w-[840px] border border-white/10 rounded-sm overflow-hidden bg-[#0A0A0C]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#19243a] text-white border-b border-white/15">
                  <th className="py-3 px-3 w-28 text-center font-bold text-[11px] uppercase tracking-wider border-r border-white/10">
                    Level of Impact
                  </th>
                  <th
                    className={`py-3 px-3 font-semibold text-[11px] border-r border-white/10 ${
                      highlightDimension === 'entityWide' ? 'bg-blue-950/80 text-blue-200' : ''
                    }`}
                  >
                    Entity Wide
                  </th>
                  <th
                    className={`py-3 px-3 font-semibold text-[11px] border-r border-white/10 ${
                      highlightDimension === 'output' ? 'bg-blue-950/80 text-blue-200' : ''
                    }`}
                  >
                    Output
                  </th>
                  <th
                    className={`py-3 px-3 font-semibold text-[11px] border-r border-white/10 ${
                      highlightDimension === 'humanResources' ? 'bg-blue-950/80 text-blue-200' : ''
                    }`}
                  >
                    Human Resources
                  </th>
                  <th
                    className={`py-3 px-3 font-semibold text-[11px] border-r border-white/10 ${
                      highlightDimension === 'legalRegulatory' ? 'bg-blue-950/80 text-blue-200' : ''
                    }`}
                  >
                    Legal & Regulatory
                  </th>
                  <th
                    className={`py-3 px-3 font-semibold text-[11px] ${
                      highlightDimension === 'financial' ? 'bg-blue-950/80 text-blue-200' : ''
                    }`}
                  >
                    Financial
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {MASTER_RISK_LEVEL_DATA.map((row) => {
                  const isSelected = currentSelectedLevel === row.level;

                  return (
                    <tr
                      key={row.level}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-950/30 ring-1 ring-blue-500'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Level column */}
                      <td className="py-3.5 px-3 border-r border-white/10 text-center align-top bg-[#0D0D10]">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base border ${row.badgeBg} ${row.textColor} ${row.borderColor}`}
                          >
                            {row.level}
                          </span>
                          <span className={`text-[10px] font-mono mt-1 ${row.textColor}`}>
                            {row.levelNameEn}
                          </span>

                          {onSelectLevel && (
                            <button
                              onClick={() => {
                                onSelectLevel(row.level);
                                onClose();
                              }}
                              className={`mt-2 px-2 py-1 text-[10px] font-bold rounded-sm border transition flex items-center space-x-1 ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                                  : 'bg-white/5 hover:bg-white/15 text-white/80 border-white/15'
                              }`}
                            >
                              {isSelected ? <Check className="w-3 h-3 mr-0.5" /> : null}
                              <span>{isSelected ? 'Terpilih' : 'Pilih Level'}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Entity Wide */}
                      <td
                        className={`py-3.5 px-3 border-r border-white/10 align-top text-white/85 ${
                          highlightDimension === 'entityWide' ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                          {row.entityWide.map((item, idx) => (
                            <li key={idx} className="marker:text-white/40">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Output */}
                      <td
                        className={`py-3.5 px-3 border-r border-white/10 align-top text-white/85 ${
                          highlightDimension === 'output' ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                          {row.output.map((item, idx) => (
                            <li key={idx} className="marker:text-white/40">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Human Resources */}
                      <td
                        className={`py-3.5 px-3 border-r border-white/10 align-top text-white/85 ${
                          highlightDimension === 'humanResources' ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                          {row.humanResources.map((item, idx) => (
                            <li key={idx} className="marker:text-white/40">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Legal & Regulatory */}
                      <td
                        className={`py-3.5 px-3 border-r border-white/10 align-top text-white/85 ${
                          highlightDimension === 'legalRegulatory' ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                          {row.legalRegulatory.map((item, idx) => (
                            <li key={idx} className="marker:text-white/40">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Financial */}
                      <td
                        className={`py-3.5 px-3 align-top text-white/85 ${
                          highlightDimension === 'financial' ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                          {row.financial.map((item, idx) => (
                            <li key={idx} className="marker:text-white/40">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#0F0F12] border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>
            *Pilih level yang paling merepresentasikan konsekuensi terberat dari risiko yang dinilai.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-white/10 text-white hover:bg-white/20 transition font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
