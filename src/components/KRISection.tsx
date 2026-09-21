import React, { useState } from 'react';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { KRIItem, RiskItem } from '../types/risk';

interface KRISectionProps {
  kris: KRIItem[];
  risks: RiskItem[];
  onSelectRiskCode: (code: string) => void;
}

export const KRISection: React.FC<KRISectionProps> = ({
  kris,
  risks,
  onSelectRiskCode,
}) => {
  const [filterWarningOnly, setFilterWarningOnly] = useState(false);

  const displayedKRIs = filterWarningOnly
    ? kris.filter((k) => k.status !== 'Normal')
    : kris;

  return (
    <div className="bg-[#16161A] rounded-sm p-6 border border-white/5 shadow-2xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-serif text-white">
              Key Risk Indicators (KRI) - Sistem Peringatan Dini
            </h2>
            <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/50 border border-white/10">
              Early Warning Metrics
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Metrik operasional & finansial berkala untuk mendeteksi deviasi sebelum risiko material.
          </p>
        </div>

        {kris.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterWarningOnly(!filterWarningOnly)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition flex items-center space-x-1.5 ${
                filterWarningOnly
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800 shadow-xs'
                  : 'bg-[#0A0A0B] text-white/60 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Hanya Peringatan / Waspada ({kris.filter((k) => k.status !== 'Normal').length})</span>
            </button>
          </div>
        )}
      </div>

      {kris.length === 0 ? (
        <div className="py-12 px-4 text-center border border-dashed border-white/10 rounded-sm bg-[#0F0F12]">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white/40">
            <Gauge className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-white/80">Key Risk Indicators (KRI) Telah Dikosongkan</h3>
          <p className="text-xs text-white/40 max-w-md mx-auto mt-1">
            Indikator peringatan dini contoh telah dibersihkan karena data risiko terkait sudah tidak ada.
          </p>
        </div>
      ) : displayedKRIs.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-white/10 rounded-sm bg-[#0F0F12]">
          <p className="text-xs text-white/40">Tidak ada KRI dengan status Peringatan atau Waspada.</p>
        </div>
      ) : (
        /* Grid of KRI Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedKRIs.map((kri) => {
            const associatedRisk = risks.find((r) => r.code === kri.associatedRiskCode);

            return (
              <div
                key={kri.id}
                className={`p-4 rounded-sm border transition-all ${
                  kri.status === 'Critical'
                    ? 'bg-[#0F0F12] border-red-900/40 ring-1 ring-red-900/20'
                    : kri.status === 'Warning'
                    ? 'bg-[#0F0F12] border-amber-900/40 ring-1 ring-amber-900/20'
                    : 'bg-[#0F0F12] border-white/5 hover:border-white/15'
                }`}
              >
                {/* Top info */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-white/40">
                      {kri.code} • {kri.frequency}
                    </span>
                    <h3 className="text-xs font-medium text-white mt-1 line-clamp-1">
                      {kri.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded-sm border ${
                      kri.status === 'Critical'
                        ? 'bg-red-950/60 text-red-300 border-red-900/50'
                        : kri.status === 'Warning'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-900/50'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50'
                    }`}
                  >
                    {kri.status === 'Critical'
                      ? 'Kritis'
                      : kri.status === 'Warning'
                      ? 'Waspada'
                      : 'Aman'}
                  </span>
                </div>

                {/* Current Value & Trend */}
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl font-serif text-white">
                      {kri.currentValue}
                    </span>
                    <span className="text-xs text-white/40 font-mono">{kri.unit}</span>
                  </div>

                  <div className="flex items-center text-xs font-mono space-x-1">
                    {kri.trend === 'up' ? (
                      <span className="flex items-center text-amber-400">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Naik ({kri.previousValue})
                      </span>
                    ) : kri.trend === 'down' ? (
                      <span className="flex items-center text-emerald-400">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Turun ({kri.previousValue})
                      </span>
                    ) : (
                      <span className="flex items-center text-white/40">
                        <Minus className="w-3.5 h-3.5 mr-0.5" /> Stabil
                      </span>
                    )}
                  </div>
                </div>

                {/* Thresholds line */}
                <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] font-mono text-white/40 space-y-1">
                  <div className="flex justify-between items-center">
                    <span>Batas Aman: <strong className="text-emerald-400 font-mono">{kri.thresholdGreen}</strong></span>
                    <span>Waspada: <strong className="text-amber-400 font-mono">{kri.thresholdAmber}</strong></span>
                  </div>
                </div>

                {/* Associated Risk reference */}
                {associatedRisk && (
                  <button
                    onClick={() => onSelectRiskCode(kri.associatedRiskCode)}
                    className="mt-3 w-full text-left py-1.5 px-2.5 bg-[#16161A] rounded-sm border border-white/10 hover:border-white/20 flex items-center justify-between text-[11px] text-white/70 hover:text-white transition group"
                  >
                    <span className="truncate pr-2 font-mono">
                      Terkait: <b className="text-white">{associatedRisk.code}</b> ({associatedRisk.category})
                    </span>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white shrink-0" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
