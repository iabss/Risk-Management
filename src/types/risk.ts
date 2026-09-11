export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type RiskCategory =
  | 'Operasional'
  | 'Keuangan'
  | 'Kepatuhan & Regulasi'
  | 'Keamanan Siber & IT'
  | 'K3 & Lingkungan'
  | 'Strategis & Reputasi';

export type Department =
  | 'Operasional'
  | 'Finance & Accounting'
  | 'Legal & Compliance'
  | 'IT & Security'
  | 'HSE & Safety'
  | 'Human Capital'
  | 'Supply Chain'
  | 'Direksi & Eksekutif';

export type RiskStatus = 'Open' | 'Mitigating' | 'Monitored' | 'Closed';

export type ControlEffectiveness = 'Strong' | 'Adequate' | 'Weak' | 'Deficient';

export interface ActionItem {
  id: string;
  action: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface RiskItem {
  id: string;
  code: string; // e.g. "RSK-OPS-01"
  title: string;
  description: string;
  rootCause: string;
  consequences: string;
  category: RiskCategory;
  department: Department;
  owner: string;
  // Inherent Risk (Sebelum Mitigasi)
  inherentLikelihood: number; // 1-5
  inherentImpact: number; // 1-5
  inherentScore: number; // 1-25
  inherentLevel: RiskLevel;
  // Kontrol & Mitigasi
  existingControls: string;
  controlEffectiveness: ControlEffectiveness;
  mitigationPlan: string;
  mitigationProgress: number; // 0-100
  // Residual Risk (Setelah Mitigasi)
  residualLikelihood: number; // 1-5
  residualImpact: number; // 1-5
  residualScore: number; // 1-25
  residualLevel: RiskLevel;
  // Governance & Metadata
  riskAppetiteStatus: 'Within Appetite' | 'At Limit' | 'Breached';
  status: RiskStatus;
  financialImpactEstimate: string; // e.g. "Rp 1.5 Milyar"
  velocity: 'Rapid' | 'Moderate' | 'Slow';
  lastReviewDate: string;
  targetDate: string;
  actionItems: ActionItem[];
  quarter: string;
}

export interface KRIItem {
  id: string;
  code: string;
  name: string;
  metric: string;
  unit: string;
  currentValue: number;
  previousValue: number;
  thresholdGreen: string;
  thresholdAmber: string;
  thresholdRed: string;
  status: 'Normal' | 'Warning' | 'Critical';
  trend: 'up' | 'down' | 'stable';
  associatedRiskCode: string;
  frequency: string;
}

export interface RiskFilterState {
  search: string;
  category: string;
  department: string;
  level: string;
  status: string;
  matrixCell: { likelihood: number; impact: number } | null;
  quarter: string;
}
