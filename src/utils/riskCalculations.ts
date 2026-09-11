import { RiskLevel } from '../types/risk';

export const LIKELIHOOD_LABELS: Record<number, { title: string; desc: string; en: string }> = {
  1: { title: '1 - Sangat Jarang', desc: '< 1x per 3 tahun', en: 'Rare' },
  2: { title: '2 - Jarang Terjadi', desc: '1x per 1-3 tahun', en: 'Unlikely' },
  3: { title: '3 - Mungkin Terjadi', desc: '1x per tahun', en: 'Possible' },
  4: { title: '4 - Sering', desc: 'Beberapa kali per tahun', en: 'Likely' },
  5: { title: '5 - Hampir Pasti', desc: 'Rutin / > 1x per bulan', en: 'Almost Certain' },
};

export const IMPACT_LABELS: Record<number, { title: string; desc: string; en: string }> = {
  1: { title: '1 - Sangat Rendah', desc: 'Dampak finansial/operasional minimal (< Rp 50Jt)', en: 'Insignificant' },
  2: { title: '2 - Rendah', desc: 'Kerugian terukur, operasional terganggu sejenak', en: 'Minor' },
  3: { title: '3 - Moderat', desc: 'Dampak signifikan pada divisi, biaya Rp 200Jt-1M', en: 'Moderate' },
  4: { title: '4 - Tinggi', desc: 'Gangguan operasional meluas, reputasi tercoreng', en: 'Major' },
  5: { title: '5 - Katastropik', desc: 'Ancaman kelangsungan usaha, sanksi berat', en: 'Catastrophic' },
};

/**
 * ISO 31000 Standard 5x5 Scoring:
 * Score = Likelihood (1-5) * Impact (1-5)
 * 15 - 25: Critical / Ekstrem (Merah)
 * 10 - 14: High / Tinggi (Oranye)
 * 5 - 9:   Medium / Moderat (Kuning)
 * 1 - 4:   Low / Rendah (Hijau)
 */
export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

export function getRiskLevelConfig(level: RiskLevel) {
  switch (level) {
    case 'Critical':
      return {
        idLabel: 'Ekstrem / Kritis',
        enLabel: 'Critical',
        badgeBg: 'bg-red-950/50 text-red-400 border-red-900/60',
        dotColor: 'bg-red-500',
        matrixCellBg: 'bg-red-950/30 hover:bg-red-900/40 border-white/5 text-red-200',
        activeMatrixRing: 'ring-red-500 ring-2',
        hex: '#ef4444',
        actionRequired: 'Penanganan Darurat Direksi & Pemantauan Mingguan',
      };
    case 'High':
      return {
        idLabel: 'Tinggi',
        enLabel: 'High',
        badgeBg: 'bg-amber-950/50 text-amber-400 border-amber-900/60',
        dotColor: 'bg-amber-500',
        matrixCellBg: 'bg-amber-950/30 hover:bg-amber-900/40 border-white/5 text-amber-200',
        activeMatrixRing: 'ring-amber-500 ring-2',
        hex: '#f59e0b',
        actionRequired: 'Rencana Mitigasi Khusus & Pelaporan Bulanan',
      };
    case 'Medium':
      return {
        idLabel: 'Moderat / Sedang',
        enLabel: 'Medium',
        badgeBg: 'bg-yellow-950/40 text-yellow-400 border-yellow-900/60',
        dotColor: 'bg-yellow-500',
        matrixCellBg: 'bg-yellow-950/20 hover:bg-yellow-900/30 border-white/5 text-yellow-200',
        activeMatrixRing: 'ring-yellow-500 ring-2',
        hex: '#eab308',
        actionRequired: 'Pengawasan Prosedur Rutin oleh Manajer Terkait',
      };
    case 'Low':
    default:
      return {
        idLabel: 'Rendah',
        enLabel: 'Low',
        badgeBg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60',
        dotColor: 'bg-emerald-500',
        matrixCellBg: 'bg-emerald-950/20 hover:bg-emerald-900/30 border-white/5 text-emerald-200',
        activeMatrixRing: 'ring-emerald-500 ring-2',
        hex: '#10b981',
        actionRequired: 'Diterima dalam Batas Toleransi Risiko',
      };
  }
}

export function getStatusConfig(status: string) {
  switch (status) {
    case 'Open':
      return {
        label: 'Terbuka (Open)',
        badge: 'bg-white/5 text-white/70 border-white/10',
      };
    case 'Mitigating':
      return {
        label: 'Proses Mitigasi',
        badge: 'bg-sky-950/40 text-sky-300 border-sky-800/50',
      };
    case 'Monitored':
      return {
        label: 'Dipantau (Monitored)',
        badge: 'bg-purple-950/40 text-purple-300 border-purple-800/50',
      };
    case 'Closed':
      return {
        label: 'Selesai / Terkendali',
        badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
      };
    default:
      return {
        label: status,
        badge: 'bg-white/5 text-white/60 border-white/10',
      };
  }
}
