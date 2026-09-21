import React, { useState } from 'react';
import {
  X,
  ListCheck,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Search,
  ExternalLink,
} from 'lucide-react';
import { RiskItem, ActionItem } from '../types/risk';

interface ActionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  risks: RiskItem[];
  onToggleActionItem: (riskId: string, actionId: string) => void;
  onSelectRisk: (risk: RiskItem) => void;
}

export const ActionTrackerModal: React.FC<ActionTrackerModalProps> = ({
  isOpen,
  onClose,
  risks,
  onToggleActionItem,
  onSelectRisk,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // Collect all actions mapped to their risk
  const allActionsWithRisk = risks.flatMap((risk) =>
    (risk.actionItems || []).map((action) => ({
      ...action,
      riskId: risk.id,
      riskCode: risk.code,
      riskTitle: risk.title,
      riskCategory: risk.category,
      riskItem: risk,
    }))
  );

  const total = allActionsWithRisk.length;
  const completedCount = allActionsWithRisk.filter((a) => a.completed).length;
  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const assignees = Array.from(new Set(allActionsWithRisk.map((a) => a.assignee)));

  const filteredActions = allActionsWithRisk.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !a.action.toLowerCase().includes(q) &&
        !a.riskCode.toLowerCase().includes(q) &&
        !a.assignee.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filterStatus === 'Pending' && a.completed) return false;
    if (filterStatus === 'Completed' && !a.completed) return false;
    if (selectedAssignee && a.assignee !== selectedAssignee) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#16161A] rounded-sm shadow-2xl border border-white/10 my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-sm bg-[#16161A] border border-white/10 text-white/70">
              <ListCheck className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-white">
                Pelacak Rencana Tindakan Mitigasi (Action Tracker)
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                Pengawasan eksekusi rencana perbaikan risiko di seluruh unit kerja.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary bar */}
        <div className="px-6 py-3.5 bg-[#0F0F12] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-white/60">
              Total Selesai: <b className="text-white">{completedCount}</b> dari <b className="text-white">{total}</b> Tindakan
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-emerald-950/60 text-emerald-300 font-mono text-[11px] border border-emerald-800/40">
              {completionPercentage}% Selesai
            </span>
          </div>

          <div className="w-full sm:w-48 bg-black/50 border border-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-white/5 bg-[#16161A] flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tindakan, PIC, atau kode risiko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              aria-label="Filter PIC"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#0F0F12] border border-white/10 rounded-sm text-white/80 focus:outline-none focus:border-white/30"
            >
              <option value="" className="bg-[#16161A] text-white">Semua PIC</option>
              {assignees.map((pic) => (
                <option key={pic} value={pic} className="bg-[#16161A] text-white">
                  {pic}
                </option>
              ))}
            </select>

            <div className="flex bg-[#0F0F12] p-0.5 rounded-sm border border-white/10 text-xs font-mono">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-2.5 py-1 rounded-sm text-[11px] transition ${
                  filterStatus === 'All' ? 'bg-[#1F1F24] text-white border border-white/10' : 'text-white/40 hover:text-white/70'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-2.5 py-1 rounded-sm text-[11px] transition ${
                  filterStatus === 'Pending' ? 'bg-[#1F1F24] text-white border border-white/10' : 'text-white/40 hover:text-white/70'
                }`}
              >
                Belum
              </button>
              <button
                onClick={() => setFilterStatus('Completed')}
                className={`px-2.5 py-1 rounded-sm text-[11px] transition ${
                  filterStatus === 'Completed' ? 'bg-[#1F1F24] text-white border border-white/10' : 'text-white/40 hover:text-white/70'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {filteredActions.length === 0 ? (
            <p className="text-center py-8 text-xs font-mono text-white/40">
              Tidak ada rencana aksi yang sesuai dengan kriteria saringan.
            </p>
          ) : (
            filteredActions.map((action) => (
              <div
                key={action.id}
                className={`p-3 rounded-sm border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  action.completed
                    ? 'bg-[#0A0A0B] border-white/5 opacity-50'
                    : 'bg-[#0F0F12] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => onToggleActionItem(action.riskId, action.id)}
                    className="mt-0.5 text-white/30 hover:text-emerald-400 transition"
                  >
                    {action.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-white/5 text-white/70 border border-white/10">
                        {action.riskCode}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                        {action.riskCategory}
                      </span>
                    </div>

                    <div
                      className={`text-xs font-medium mt-1 ${
                        action.completed
                          ? 'line-through text-white/30'
                          : 'text-white'
                      }`}
                    >
                      {action.action}
                    </div>

                    <div className="text-[11px] font-mono text-white/40 mt-0.5">
                      Risiko: <span className="text-white/60">{action.riskTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs pl-8 sm:pl-0 shrink-0">
                  <div className="text-right">
                    <span className="block font-medium text-white/80">
                      PIC: {action.assignee}
                    </span>
                    <span className="text-[11px] font-mono text-white/40 flex items-center sm:justify-end mt-0.5">
                      <Calendar className="w-3 h-3 mr-1 text-white/30" />
                      Tenggat: {action.dueDate}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectRisk(action.riskItem);
                    }}
                    className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
                    title="Buka Profil Risiko Terkait"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0F0F12] flex justify-end">
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
