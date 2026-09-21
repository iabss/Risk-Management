import React, { useState } from 'react';
import { PieChart, BarChart3, ShieldAlert, ArrowDownRight } from 'lucide-react';
import { RiskItem, RiskCategory, RISK_CATEGORIES } from '../types/risk';

interface RiskChartsProps {
  risks: RiskItem[];
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  'Operational': '#3b82f6', // blue
  'Financial': '#10b981', // emerald
  'Legal & Regulation': '#8b5cf6', // purple
  'Entity Company': '#06b6d4', // cyan
  'Human Resources': '#f59e0b', // amber
};

export const RiskCharts: React.FC<RiskChartsProps> = ({
  risks,
  onSelectCategory,
  selectedCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'reduction' | 'status'>('category');

  // Dynamic list of categories from both constants and any existing risks
  const allCategories = Array.from(new Set([...RISK_CATEGORIES, ...risks.map((r) => r.category)]));

  // Category counts
  const categoryData = allCategories.map((cat) => {
    const count = risks.filter((r) => r.category === cat).length;
    const criticalCount = risks.filter((r) => r.category === cat && r.inherentLevel === 'Critical').length;
    return {
      category: cat,
      count,
      criticalCount,
      color: (CATEGORY_COLORS as Record<string, string>)[cat] || '#ec4899',
    };
  }).filter((d) => d.count > 0);

  const maxCount = Math.max(...categoryData.map((d) => d.count), 1);

  // Status breakdown
  const statusCounts = {
    Mitigating: risks.filter((r) => r.status === 'Mitigating').length,
    Monitored: risks.filter((r) => r.status === 'Monitored').length,
    Open: risks.filter((r) => r.status === 'Open').length,
    Closed: risks.filter((r) => r.status === 'Closed').length,
  };

  // Top reduced risks (greatest impact of mitigation)
  const topMitigatedRisks = [...risks]
    .sort((a, b) => (b.inherentScore - b.residualScore) - (a.inherentScore - a.residualScore))
    .slice(0, 5);

  return (
    <div className="bg-[#16161A] rounded-sm p-6 border border-white/5 shadow-2xl mb-8">
      {/* Header with View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-serif text-white">
              Analisis & Distribusi Profil Risiko
            </h2>
            <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-white/50 border border-white/10">
              ERM Analytics
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Komposisi risiko per kategori, status penanganan, dan efektivitas reduksi pasca mitigasi.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#0A0A0B] p-1 rounded-sm border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-sm font-medium transition ${
              activeTab === 'category'
                ? 'bg-[#1F1F24] text-white shadow-xs border border-white/10'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Kategori
          </button>
          <button
            onClick={() => setActiveTab('reduction')}
            className={`px-3 py-1.5 rounded-sm font-medium transition ${
              activeTab === 'reduction'
                ? 'bg-[#1F1F24] text-white shadow-xs border border-white/10'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Efektivitas Reduksi
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-sm font-medium transition ${
              activeTab === 'status'
                ? 'bg-[#1F1F24] text-white shadow-xs border border-white/10'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Status Penanganan
          </button>
        </div>
      </div>

      {/* Tab 1: Category Breakdown */}
      {activeTab === 'category' && (
        <div className="space-y-3">
          {categoryData.length === 0 ? (
            <div className="py-10 text-center text-white/40 text-xs font-mono">
              Belum ada data risiko untuk dianalisis per kategori.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryData.map((d) => {
                const isSelected = selectedCategory === d.category;
                const percentage = Math.round((d.count / risks.length) * 100);

                return (
                  <div
                    key={d.category}
                    onClick={() => onSelectCategory(isSelected ? '' : d.category)}
                    className={`p-4 rounded-sm border transition cursor-pointer ${
                      isSelected
                        ? 'border-white/30 ring-1 ring-white/10 bg-[#1F1F24]'
                        : 'border-white/5 hover:border-white/20 bg-[#0F0F12]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="font-medium text-white/90">
                          {d.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="font-bold text-white">
                          {d.count} Risiko
                        </span>
                        <span className="text-white/40">({percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${(d.count / maxCount) * 100}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>

                    {d.criticalCount > 0 && (
                      <div className="mt-2 text-[10px] text-red-400 font-mono font-medium flex items-center">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        {d.criticalCount} risiko berstatus Kritis
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reduction Effectiveness (Inherent vs Residual comparison) */}
      {activeTab === 'reduction' && (
        <div className="space-y-3">
          {topMitigatedRisks.length === 0 ? (
            <div className="py-10 text-center text-white/40 text-xs font-mono">
              Belum ada profil risiko untuk analisis efektivitas reduksi mitigasi.
            </div>
          ) : (
            <>
              <p className="text-xs text-white/40 mb-2">
                Perbandingan Skor Inheren (Sebelum Mitigasi) vs Skor Residual (Setelah Mitigasi) pada 5 risiko teratas:
              </p>

              <div className="space-y-3">
                {topMitigatedRisks.map((risk) => {
                  const reduction = risk.inherentScore - risk.residualScore;
                  const reductionPercent = Math.round((reduction / risk.inherentScore) * 100);

                  return (
                    <div
                      key={risk.id}
                      className="p-4 rounded-sm border border-white/5 bg-[#0F0F12]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                            {risk.code} • {risk.category}
                          </span>
                          <h4 className="text-xs font-medium text-white mt-0.5">
                            {risk.title}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded-sm font-semibold bg-red-950/60 text-red-300 border border-red-900/50">
                            Inh: {risk.inherentScore}
                          </span>
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="px-2 py-0.5 rounded-sm font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-900/50">
                            Res: {risk.residualScore}
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            (-{reductionPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Dual comparative bar */}
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="w-16 text-white/40">Inheren</span>
                          <div className="flex-1 bg-white/5 rounded-full h-1.5">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{ width: `${(risk.inherentScore / 25) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-white/50">
                            {risk.inherentScore}/25
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="w-16 text-white/40">Residual</span>
                          <div className="flex-1 bg-white/5 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${(risk.residualScore / 25) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-emerald-400 font-bold">
                            {risk.residualScore}/25
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Status Breakdown */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-sm border border-white/5 bg-[#0F0F12]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400">
              Proses Mitigasi
            </span>
            <div className="mt-2 text-3xl font-serif text-white">
              {statusCounts.Mitigating}
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Rencana aksi sedang aktif diimplementasikan divisi
            </p>
          </div>

          <div className="p-4 rounded-sm border border-white/5 bg-[#0F0F12]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400">
              Dipantau (Monitored)
            </span>
            <div className="mt-2 text-3xl font-serif text-white">
              {statusCounts.Monitored}
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Mitigasi berjalan stabil, evaluasi KRI berkala
            </p>
          </div>

          <div className="p-4 rounded-sm border border-white/5 bg-[#0F0F12]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
              Terbuka (Open)
            </span>
            <div className="mt-2 text-3xl font-serif text-white">
              {statusCounts.Open}
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Baru teridentifikasi, menyusun rencana penanganan
            </p>
          </div>

          <div className="p-4 rounded-sm border border-white/5 bg-[#0F0F12]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
              Terkendali (Closed)
            </span>
            <div className="mt-2 text-3xl font-serif text-white">
              {statusCounts.Closed}
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Risiko telah diturunkan ke level residu yang dapat diterima
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
