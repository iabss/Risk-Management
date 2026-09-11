import React from 'react';
import {
  X,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Building2,
  User,
  Calendar,
  DollarSign,
  Zap,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { RiskItem, ActionItem } from '../types/risk';
import {
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
  getRiskLevelConfig,
  getStatusConfig,
} from '../utils/riskCalculations';

interface RiskDetailModalProps {
  risk: RiskItem | null;
  onClose: () => void;
  onEdit: (risk: RiskItem) => void;
  onToggleActionItem: (riskId: string, actionId: string) => void;
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({
  risk,
  onClose,
  onEdit,
  onToggleActionItem,
}) => {
  if (!risk) return null;

  const inherentCfg = getRiskLevelConfig(risk.inherentLevel);
  const residualCfg = getRiskLevelConfig(risk.residualLevel);
  const statusCfg = getStatusConfig(risk.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#16161A] rounded-sm shadow-2xl border border-white/10 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 bg-[#0F0F12] flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-sm bg-[#16161A] border border-white/10 text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-white/5 text-white/80 border border-white/10">
                  {risk.code}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-sm text-white/50 bg-white/5 border border-white/5">
                  {risk.category}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-sm border ${statusCfg.badge}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <h3 className="text-xl font-serif text-white mt-2">
                {risk.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(risk)}
              className="p-2 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
              title="Edit Profil Risiko"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#0F0F12] p-3.5 rounded-sm border border-white/5">
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-mono tracking-wider">
                Departemen
              </span>
              <span className="font-medium text-white flex items-center mt-1">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-white/40" />
                {risk.department}
              </span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-mono tracking-wider">
                Pemilik Risiko (Owner)
              </span>
              <span className="font-medium text-white flex items-center mt-1">
                <User className="w-3.5 h-3.5 mr-1.5 text-white/40" />
                {risk.owner}
              </span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-mono tracking-wider">
                Estimasi Dampak Finansial
              </span>
              <span className="font-medium text-red-400 font-mono flex items-center mt-1">
                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                {risk.financialImpactEstimate}
              </span>
            </div>
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-mono tracking-wider">
                Kecepatan Risiko (Velocity)
              </span>
              <span className="font-medium text-amber-400 flex items-center mt-1">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                {risk.velocity === 'Rapid'
                  ? 'Cepat (Rapid)'
                  : risk.velocity === 'Moderate'
                  ? 'Moderat'
                  : 'Lambat'}
              </span>
            </div>
          </div>

          {/* Dual Score Comparison Box (Inherent vs Residual) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inherent Risk Card */}
            <div className={`p-4 rounded-sm border ${inherentCfg.badgeBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">
                  Risiko Inheren (Awal)
                </span>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm bg-black/40 border border-white/10">
                  {inherentCfg.idLabel}
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-serif">
                  {risk.inherentScore}
                </span>
                <span className="text-xs font-mono opacity-60">
                  (L: {risk.inherentLikelihood} × I: {risk.inherentImpact})
                </span>
              </div>
              <div className="mt-2 text-[11px] space-y-1 opacity-80">
                <div>
                  Kemungkinan:{' '}
                  <b className="text-white">{LIKELIHOOD_LABELS[risk.inherentLikelihood]?.title}</b>
                </div>
                <div>
                  Dampak: <b className="text-white">{IMPACT_LABELS[risk.inherentImpact]?.title}</b>
                </div>
              </div>
            </div>

            {/* Residual Risk Card */}
            <div className={`p-4 rounded-sm border ${residualCfg.badgeBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">
                  Risiko Residual (Target Pasca Mitigasi)
                </span>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm bg-black/40 border border-white/10">
                  {residualCfg.idLabel}
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-serif">
                  {risk.residualScore}
                </span>
                <span className="text-xs font-mono opacity-60">
                  (L: {risk.residualLikelihood} × I: {risk.residualImpact})
                </span>
              </div>
              <div className="mt-2 text-[11px] space-y-1 opacity-80">
                <div>
                  Kemungkinan:{' '}
                  <b className="text-white">{LIKELIHOOD_LABELS[risk.residualLikelihood]?.title}</b>
                </div>
                <div>
                  Dampak: <b className="text-white">{IMPACT_LABELS[risk.residualImpact]?.title}</b>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Root Cause & Consequences */}
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-serif text-sm text-white mb-1.5">
                Deskripsi Risiko
              </h4>
              <p className="text-white/70 bg-[#0F0F12] p-3.5 rounded-sm border border-white/5 leading-relaxed">
                {risk.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-serif text-sm text-white mb-1.5">
                  Akar Penyebab (Root Cause)
                </h4>
                <p className="text-white/70 bg-[#0F0F12] p-3.5 rounded-sm border border-white/5 leading-relaxed">
                  {risk.rootCause}
                </p>
              </div>
              <div>
                <h4 className="font-serif text-sm text-white mb-1.5">
                  Dampak & Konsekuensi
                </h4>
                <p className="text-white/70 bg-[#0F0F12] p-3.5 rounded-sm border border-white/5 leading-relaxed">
                  {risk.consequences}
                </p>
              </div>
            </div>
          </div>

          {/* Existing Controls & Mitigation Plan */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-serif text-sm text-white">
                  Pengendalian Eksisting & Efektivitas Kontrol
                </h4>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono tracking-wider bg-white/5 text-white/70 border border-white/10">
                  Efektivitas: {risk.controlEffectiveness}
                </span>
              </div>
              <p className="text-white/70 bg-[#0F0F12] p-3.5 rounded-sm border border-white/5 leading-relaxed">
                {risk.existingControls}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-serif text-sm text-white">
                  Rencana Mitigasi (Treatment Action Plan)
                </h4>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                  Progres: {risk.mitigationProgress}%
                </span>
              </div>
              <p className="text-emerald-300/80 bg-[#0F0F12] p-3.5 rounded-sm border border-emerald-950/50 leading-relaxed">
                {risk.mitigationPlan}
              </p>
            </div>
          </div>

          {/* Action Items Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-serif text-sm text-white flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-white/40" />
                Daftar Tindakan Mitigasi (Action Plan Checklist)
              </h4>
              <span className="text-[10px] font-mono text-white/40">
                Klik baris untuk mengubah status penyelesaian
              </span>
            </div>

            <div className="space-y-2">
              {risk.actionItems && risk.actionItems.length > 0 ? (
                risk.actionItems.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => onToggleActionItem(risk.id, action.id)}
                    className={`p-3 rounded-sm border flex items-center justify-between text-xs cursor-pointer transition ${
                      action.completed
                        ? 'bg-[#0A0A0B] border-white/5 text-white/30 line-through'
                        : 'bg-[#0F0F12] border-white/10 text-white/90 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {action.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/30 shrink-0" />
                      )}
                      <span className="font-medium">{action.action}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] font-mono text-white/40 shrink-0">
                      <span>PIC: <b className="text-white/70">{action.assignee}</b></span>
                      <span>Target: {action.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/40 italic font-mono">Belum ada rincian action plan.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0F0F12] flex items-center justify-between">
          <div className="text-[11px] font-mono text-white/40">
            Peninjauan Terakhir: <b className="text-white/70">{risk.lastReviewDate}</b> • Target Penyelesaian: <b className="text-white/70">{risk.targetDate}</b>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-[#1F1F24] text-white rounded-sm border border-white/15 hover:bg-[#282830] transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
