import React from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingDown,
  Gauge,
  ListTodo,
} from 'lucide-react';
import { RiskItem, KRIItem } from '../types/risk';

interface ExecutiveStatsProps {
  risks: RiskItem[];
  kris: KRIItem[];
  onFilterCritical: () => void;
  onFilterHigh: () => void;
  onFilterAll: () => void;
  activeLevelFilter: string;
}

export const ExecutiveStats: React.FC<ExecutiveStatsProps> = ({
  risks,
  kris,
  onFilterCritical,
  onFilterHigh,
  onFilterAll,
  activeLevelFilter,
}) => {
  const total = risks.length;
  const criticalCount = risks.filter((r) => r.inherentLevel === 'Critical').length;
  const highCount = risks.filter((r) => r.inherentLevel === 'High').length;
  const mediumCount = risks.filter((r) => r.inherentLevel === 'Medium').length;
  const lowCount = risks.filter((r) => r.inherentLevel === 'Low').length;

  // Residual critical count (after mitigation)
  const residualCriticalCount = risks.filter((r) => r.residualLevel === 'Critical').length;
  const residualHighCount = risks.filter((r) => r.residualLevel === 'High').length;

  // Calculate Average Inherent Score vs Residual Score
  const avgInherent =
    total > 0
      ? (risks.reduce((acc, r) => acc + r.inherentScore, 0) / total).toFixed(1)
      : '0.0';
  const avgResidual =
    total > 0
      ? (risks.reduce((acc, r) => acc + r.residualScore, 0) / total).toFixed(1)
      : '0.0';
  const scoreReductionPercent =
    Number(avgInherent) > 0
      ? Math.round(((Number(avgInherent) - Number(avgResidual)) / Number(avgInherent)) * 100)
      : 0;

  // Action items summary
  const allActionItems = risks.flatMap((r) => r.actionItems || []);
  const completedActions = allActionItems.filter((a) => a.completed).length;
  const totalActions = allActionItems.length;
  const actionCompletionRate =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // KRI alert count
  const kriWarningOrCritical = kris.filter(
    (k) => k.status === 'Warning' || k.status === 'Critical'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Total Risiko Terdaftar */}
      <div
        id="stat-total-risks"
        onClick={onFilterAll}
        className={`bg-[#16161A] p-5 border rounded-sm transition cursor-pointer hover:border-white/20 ${
          activeLevelFilter === ''
            ? 'border-white/20 ring-1 ring-white/10'
            : 'border-white/5'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Total Risiko Terpantau
          </p>
          <div className="p-1.5 rounded-sm bg-white/5 text-white/40">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-3xl font-serif text-white mt-2">
          {total}
        </p>
        <div className="mt-3 flex items-center space-x-2 text-[10px] text-white/40">
          <span className="inline-flex items-center text-red-500 font-medium">
            {criticalCount} Kritis
          </span>
          <span>•</span>
          <span className="inline-flex items-center text-amber-500 font-medium">
            {highCount} Tinggi
          </span>
          <span>•</span>
          <span>{mediumCount + lowCount} Moderat/Rendah</span>
        </div>
      </div>

      {/* Card 2: Risiko Kritis & Butuh Perhatian Segera */}
      <div
        id="stat-critical-risks"
        onClick={onFilterCritical}
        className={`bg-[#16161A] p-5 border rounded-sm transition cursor-pointer hover:border-red-500/50 ${
          activeLevelFilter === 'Critical'
            ? 'border-red-600 ring-1 ring-red-500/30 bg-red-950/20'
            : 'border-white/5'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Risiko Kritis (Ekstrem)
          </p>
          <div className="p-1.5 rounded-sm bg-red-950/50 text-red-500">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-3xl font-serif text-white mt-2">
          {criticalCount}
        </p>
        <p className="text-[10px] text-red-500 mt-3 font-medium flex items-center">
          {criticalCount > 0 ? (
            <>
              <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
              Perlu perhatian Direksi ({residualCriticalCount} residual)
            </>
          ) : (
            <span className="text-emerald-500">Dalam batas toleransi aman</span>
          )}
        </p>
      </div>

      {/* Card 3: Penurunan Skor Risiko (Efektivitas Mitigasi) */}
      <div
        id="stat-risk-reduction"
        className="bg-[#16161A] p-5 border border-white/5 rounded-sm"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Rerata Reduksi Risiko
          </p>
          <div className="p-1.5 rounded-sm bg-emerald-950/50 text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-3xl font-serif text-white mt-2">
          -{scoreReductionPercent}%
        </p>
        <div className="mt-3 flex items-center text-[10px] text-emerald-500 font-medium">
          <span>{avgInherent} ➔ {avgResidual} pts ({highCount + criticalCount - (residualHighCount + residualCriticalCount)} berkurang)</span>
        </div>
      </div>

      {/* Card 4: KRI Early Warning & Pelaksanaan Action Plan */}
      <div
        id="stat-kri-alerts"
        className="bg-[#16161A] p-5 border border-white/5 rounded-sm"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            KRI & Eksekusi Mitigasi
          </p>
          <div className="p-1.5 rounded-sm bg-white/5 text-white/40">
            <Gauge className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-3xl font-serif text-white">
            {actionCompletionRate}%
          </p>
          <span
            className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded-sm border ${
              kriWarningOrCritical > 0
                ? 'bg-amber-950/40 text-amber-400 border-amber-900/50'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
            }`}
          >
            {kriWarningOrCritical} Waspada
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
          <span>{completedActions}/{totalActions} mitigasi selesai</span>
          <div className="w-16 bg-white/5 rounded-full h-1 overflow-hidden">
            <div
              className="bg-white/40 h-1 rounded-full transition-all duration-300"
              style={{ width: `${actionCompletionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
