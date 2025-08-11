export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
}

export interface ComplianceIssue {
  clause: string;
  issueDescription: string;
  severity: 'High' | 'Medium' | 'Low';
  recommendation: string;
  regulationId: string;
  regulationLink: string;
  recommendationExample: {
    before: string;
    after: string;
  };
  riskAnalysis: string;
  mitigation: string;
}

export interface AnalysisResult {
  complianceStatus: ComplianceStatus;
  summary: string;
  issues: ComplianceIssue[];
}

export interface Regulation {
  id: string;
  name: string;
  description: string;
  sourceUrl?: string;
  region?: string;
}

// --- New Types for Multi-Domain Platform ---

export interface Engagement {
    id: string;
    name: string;
    createdAt: string;
    auditTrail: AuditEntry[];
}

export interface AuditEntry {
    id: string;
    timestamp: string;
    analysisResult: AnalysisResult;
    policyText: string;
    regulationIds: string[];
}


// --- Overhauled Types for Scenario Modeling ---

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ScenarioRisk {
  challenge: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
}

export interface ScenarioOutcome {
  title: 'Best Case' | 'Most Likely' | 'Worst Case';
  description: string;
}

export interface ScenarioRecommendation {
  recommendation: string;
  rationale: string;
  estimatedStaffing: string;
  estimatedBudget: string;
  estimatedTimeline: string;
}

export interface StrategicOpportunity {
  opportunity: string;
  rationale: string;
}

export interface ScenarioResult {
  riskMatrix: ScenarioRisk[];
  outcomes: ScenarioOutcome[];
  recommendations: ScenarioRecommendation[];
  opportunities: StrategicOpportunity[];
}