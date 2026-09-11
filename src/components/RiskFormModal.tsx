import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  HelpCircle,
} from 'lucide-react';
import {
  RiskItem,
  RiskCategory,
  Department,
  RiskStatus,
  ControlEffectiveness,
  ActionItem,
} from '../types/risk';
import {
  calculateRiskLevel,
  getRiskLevelConfig,
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
} from '../utils/riskCalculations';

interface RiskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (riskData: Omit<RiskItem, 'id'>, existingId?: string) => void;
  editingRisk: RiskItem | null;
  nextCodeNumber: number;
}

const CATEGORIES: RiskCategory[] = [
  'Operasional',
  'Keuangan',
  'Kepatuhan & Regulasi',
  'Keamanan Siber & IT',
  'K3 & Lingkungan',
  'Strategis & Reputasi',
];

const DEPARTMENTS: Department[] = [
  'Operasional',
  'Finance & Accounting',
  'Legal & Compliance',
  'IT & Security',
  'HSE & Safety',
  'Human Capital',
  'Supply Chain',
  'Direksi & Eksekutif',
];

export const RiskFormModal: React.FC<RiskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRisk,
  nextCodeNumber,
}) => {
  if (!isOpen) return null;

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [consequences, setConsequences] = useState('');
  const [category, setCategory] = useState<RiskCategory>('Operasional');
  const [department, setDepartment] = useState<Department>('Operasional');
  const [owner, setOwner] = useState('');
  const [financialImpactEstimate, setFinancialImpactEstimate] = useState('Rp 500 Juta');
  const [velocity, setVelocity] = useState<'Rapid' | 'Moderate' | 'Slow'>('Moderate');

  // Inherent Risk
  const [inherentLikelihood, setInherentLikelihood] = useState<number>(3);
  const [inherentImpact, setInherentImpact] = useState<number>(3);

  // Controls & Mitigation
  const [existingControls, setExistingControls] = useState('');
  const [controlEffectiveness, setControlEffectiveness] = useState<ControlEffectiveness>('Adequate');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [mitigationProgress, setMitigationProgress] = useState<number>(50);

  // Residual Risk
  const [residualLikelihood, setResidualLikelihood] = useState<number>(2);
  const [residualImpact, setResidualImpact] = useState<number>(2);

  // Status & Timing
  const [status, setStatus] = useState<RiskStatus>('Mitigating');
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');

  // Prepopulate when editing
  useEffect(() => {
    if (editingRisk) {
      setCode(editingRisk.code);
      setTitle(editingRisk.title);
      setDescription(editingRisk.description);
      setRootCause(editingRisk.rootCause || '');
      setConsequences(editingRisk.consequences || '');
      setCategory(editingRisk.category);
      setDepartment(editingRisk.department);
      setOwner(editingRisk.owner);
      setFinancialImpactEstimate(editingRisk.financialImpactEstimate || 'Rp 500 Juta');
      setVelocity(editingRisk.velocity || 'Moderate');
      setInherentLikelihood(editingRisk.inherentLikelihood);
      setInherentImpact(editingRisk.inherentImpact);
      setExistingControls(editingRisk.existingControls);
      setControlEffectiveness(editingRisk.controlEffectiveness);
      setMitigationPlan(editingRisk.mitigationPlan);
      setMitigationProgress(editingRisk.mitigationProgress);
      setResidualLikelihood(editingRisk.residualLikelihood);
      setResidualImpact(editingRisk.residualImpact);
      setStatus(editingRisk.status);
      setTargetDate(editingRisk.targetDate);
      setActionItems(editingRisk.actionItems || []);
    } else {
      // Default new risk
      setCode(`RSK-NEW-0${nextCodeNumber}`);
      setTitle('');
      setDescription('');
      setRootCause('');
      setConsequences('');
      setCategory('Operasional');
      setDepartment('Operasional');
      setOwner('');
      setFinancialImpactEstimate('Rp 500 Juta');
      setVelocity('Moderate');
      setInherentLikelihood(3);
      setInherentImpact(3);
      setExistingControls('');
      setControlEffectiveness('Adequate');
      setMitigationPlan('');
      setMitigationProgress(20);
      setResidualLikelihood(2);
      setResidualImpact(2);
      setStatus('Open');
      setTargetDate('2026-12-31');
      setActionItems([]);
    }
  }, [editingRisk, nextCodeNumber]);

  // Derived scores
  const inherentScore = inherentLikelihood * inherentImpact;
  const inherentLevel = calculateRiskLevel(inherentScore);
  const inherentCfg = getRiskLevelConfig(inherentLevel);

  const residualScore = residualLikelihood * residualImpact;
  const residualLevel = calculateRiskLevel(residualScore);
  const residualCfg = getRiskLevelConfig(residualLevel);

  const handleAddAction = () => {
    if (!newActionText.trim()) return;
    const item: ActionItem = {
      id: `act-temp-${Date.now()}`,
      action: newActionText.trim(),
      assignee: newActionAssignee.trim() || owner || 'Tim Pelaksana',
      dueDate: newActionDueDate || targetDate,
      completed: false,
      status: 'In Progress',
    };
    setActionItems([...actionItems, item]);
    setNewActionText('');
    setNewActionAssignee('');
    setNewActionDueDate('');
  };

  const handleRemoveAction = (id: string) => {
    setActionItems(actionItems.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi Judul Risiko.');
      return;
    }

    const payload: Omit<RiskItem, 'id'> = {
      code: code || `RSK-GEN-0${nextCodeNumber}`,
      title: title.trim(),
      description: description.trim(),
      rootCause: rootCause.trim(),
      consequences: consequences.trim(),
      category,
      department,
      owner: owner.trim() || 'Tim Manajemen Risiko',
      inherentLikelihood,
      inherentImpact,
      inherentScore,
      inherentLevel,
      existingControls: existingControls.trim() || 'Standard Operating Procedure (SOP) divisi.',
      controlEffectiveness,
      mitigationPlan: mitigationPlan.trim() || 'Rencana perbaikan dan monitoring berkala.',
      mitigationProgress,
      residualLikelihood,
      residualImpact,
      residualScore,
      residualLevel,
      riskAppetiteStatus: residualScore <= 9 ? 'Within Appetite' : 'At Limit',
      status,
      financialImpactEstimate: financialImpactEstimate || 'Rp 500 Juta',
      velocity,
      lastReviewDate: new Date().toISOString().split('T')[0],
      targetDate: targetDate || '2026-12-31',
      quarter: 'Q3 2026',
      actionItems,
    };

    onSave(payload, editingRisk?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#16161A] rounded-sm shadow-2xl border border-white/10 my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif text-white">
              {editingRisk ? 'Perbarui Profil Risiko' : 'Tambah Identifikasi Risiko Baru'}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Standar ISO 31000: Penilaian kemungkinan (likelihood), dampak (impact), dan rencana mitigasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Basic Identifiers */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 border-b border-white/5 pb-1">
              1. Identitas & Kepemilikan Risiko
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Kode Risiko
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Kategori Risiko
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RiskCategory)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#16161A] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Departemen Penanggung Jawab
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="bg-[#16161A] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Judul Risiko (Pernyataan Kejadian Tidak Diinginkan)
              </label>
              <input
                type="text"
                placeholder="Contoh: Gangguan Pasokan Bahan Baku Akibat Hambatan Pelabuhan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Pemilik Risiko (Risk Owner)
                </label>
                <input
                  type="text"
                  placeholder="Nama & Jabatan PIC"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Estimasi Dampak Finansial
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rp 2.5 Milyar"
                  value={financialImpactEstimate}
                  onChange={(e) => setFinancialImpactEstimate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Kecepatan Risiko (Velocity)
                </label>
                <select
                  value={velocity}
                  onChange={(e) => setVelocity(e.target.value as 'Rapid' | 'Moderate' | 'Slow')}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Rapid" className="bg-[#16161A] text-white">Cepat (Hitungan hari/minggu)</option>
                  <option value="Moderate" className="bg-[#16161A] text-white">Moderat (1 - 3 bulan)</option>
                  <option value="Slow" className="bg-[#16161A] text-white">Lambat (Jangka panjang / &gt; 3 bulan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Deskripsi Naratif Risiko
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan konteks terjadinya risiko secara komprehensif..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Penyebab Akar (Root Cause)
                </label>
                <textarea
                  rows={2}
                  placeholder="Faktor internal/eksternal pemicu terjadinya risiko..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Dampak & Konsekuensi
                </label>
                <textarea
                  rows={2}
                  placeholder="Dampak pada operasional, hukum, reputasi, atau laba..."
                  value={consequences}
                  onChange={(e) => setConsequences(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Inherent Risk Assessment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                2. Penilaian Risiko Inheren (Sebelum Mitigasi)
              </h4>
              <div
                className={`text-xs px-2.5 py-0.5 rounded-sm font-mono font-bold border ${inherentCfg.badgeBg}`}
              >
                Skor Inheren: {inherentScore} ({inherentCfg.idLabel})
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Likelihood 1-5 */}
              <div className="p-3.5 bg-[#0F0F12] rounded-sm border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/90">
                    Kemungkinan Terjadi (Likelihood: 1-5)
                  </label>
                  <span className="font-mono font-bold text-red-400 text-xs">
                    {inherentLikelihood} - {LIKELIHOOD_LABELS[inherentLikelihood]?.en}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={inherentLikelihood}
                  onChange={(e) => setInherentLikelihood(Number(e.target.value))}
                  className="w-full cursor-pointer accent-red-500"
                />
                <p className="text-[10px] font-mono text-white/40 mt-1">
                  {LIKELIHOOD_LABELS[inherentLikelihood]?.title}: {LIKELIHOOD_LABELS[inherentLikelihood]?.desc}
                </p>
              </div>

              {/* Impact 1-5 */}
              <div className="p-3.5 bg-[#0F0F12] rounded-sm border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/90">
                    Tingkat Dampak (Impact: 1-5)
                  </label>
                  <span className="font-mono font-bold text-red-400 text-xs">
                    {inherentImpact} - {IMPACT_LABELS[inherentImpact]?.en}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={inherentImpact}
                  onChange={(e) => setInherentImpact(Number(e.target.value))}
                  className="w-full cursor-pointer accent-red-500"
                />
                <p className="text-[10px] font-mono text-white/40 mt-1">
                  {IMPACT_LABELS[inherentImpact]?.title}: {IMPACT_LABELS[inherentImpact]?.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Existing Controls & Mitigation Treatment */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 border-b border-white/5 pb-1">
              3. Pengendalian & Rencana Mitigasi (Treatment)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Pengendalian Internal yang Sudah Ada (Existing Controls)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SOP operasional, asuransi, backup server berkala"
                  value={existingControls}
                  onChange={(e) => setExistingControls(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Efektivitas Pengendalian
                </label>
                <select
                  value={controlEffectiveness}
                  onChange={(e) => setControlEffectiveness(e.target.value as ControlEffectiveness)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Strong" className="bg-[#16161A] text-white">Kuat (Strong)</option>
                  <option value="Adequate" className="bg-[#16161A] text-white">Memadai (Adequate)</option>
                  <option value="Weak" className="bg-[#16161A] text-white">Lemah (Weak)</option>
                  <option value="Deficient" className="bg-[#16161A] text-white">Tidak Efektif (Deficient)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Rencana Mitigasi Risiko Tambahan (Action Treatment Plan)
              </label>
              <textarea
                rows={2}
                placeholder="Langkah terstruktur untuk menurunkan kemungkinan atau dampak risiko..."
                value={mitigationPlan}
                onChange={(e) => setMitigationPlan(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Progres Mitigasi ({mitigationProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={mitigationProgress}
                  onChange={(e) => setMitigationProgress(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Status Penanganan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RiskStatus)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Open" className="bg-[#16161A] text-white">Terbuka (Open)</option>
                  <option value="Mitigating" className="bg-[#16161A] text-white">Dalam Proses Mitigasi</option>
                  <option value="Monitored" className="bg-[#16161A] text-white">Dipantau Berkala (Monitored)</option>
                  <option value="Closed" className="bg-[#16161A] text-white">Terkendali / Selesai (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Target Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Residual Risk Target */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                4. Target Risiko Residual (Pasca Mitigasi Selesai)
              </h4>
              <div
                className={`text-xs px-2.5 py-0.5 rounded-sm font-mono font-bold border ${residualCfg.badgeBg}`}
              >
                Skor Residual: {residualScore} ({residualCfg.idLabel})
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Residual Likelihood 1-5 */}
              <div className="p-3.5 bg-[#0F0F12] rounded-sm border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/90">
                    Target Kemungkinan Residual (1-5)
                  </label>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {residualLikelihood} - {LIKELIHOOD_LABELS[residualLikelihood]?.en}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={residualLikelihood}
                  onChange={(e) => setResidualLikelihood(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Residual Impact 1-5 */}
              <div className="p-3.5 bg-[#0F0F12] rounded-sm border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/90">
                    Target Dampak Residual (1-5)
                  </label>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {residualImpact} - {IMPACT_LABELS[residualImpact]?.en}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={residualImpact}
                  onChange={(e) => setResidualImpact(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Action Items List */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 border-b border-white/5 pb-1">
              5. Rincian Milestone / Action Plan
            </h4>

            {/* List existing */}
            <div className="space-y-2">
              {actionItems.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-sm bg-[#0F0F12] border border-white/10 text-xs"
                >
                  <span className="font-medium text-white/90">
                    {act.action}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-white/40">
                    <span>PIC: <strong className="text-white/70">{act.assignee}</strong></span>
                    <span>Tenggat: {act.dueDate}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(act.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new action item inputs */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Rencana tindakan konkret baru..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
              <input
                type="text"
                placeholder="Nama PIC"
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
                className="w-32 text-xs px-3 py-1.5 bg-[#0F0F12] border border-white/10 rounded-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
              <input
                type="date"
                value={newActionDueDate}
                onChange={(e) => setNewActionDueDate(e.target.value)}
                className="w-32 text-xs px-3 py-1.5 bg-[#0F0F12] border border-white/10 rounded-sm text-white focus:outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={handleAddAction}
                className="px-3 py-1.5 text-xs font-medium bg-[#1F1F24] text-white rounded-sm border border-white/15 hover:bg-[#282830] transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white rounded-sm border border-white/10 hover:bg-white/5 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-medium bg-red-950 hover:bg-red-900 text-red-100 rounded-sm border border-red-800/80 shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingRisk ? 'Simpan Perubahan' : 'Daftarkan Profil Risiko'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
