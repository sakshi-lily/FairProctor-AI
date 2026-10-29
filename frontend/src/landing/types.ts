export type Severity = 'low' | 'medium' | 'high' | 'info';

export type EventCategory = 'environmental' | 'behavioural' | 'client' | 'keystroke';

export interface EvidenceEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  title: string;
  description: string;
  severity: Severity;
  metrics: {
    label: string;
    value: string;
  }[];
  isSuppressed?: boolean;
  suppressionReason?: string;
  aiRationale: string;
  reviewedStatus?: 'pending' | 'dismissed' | 'escalated' | 'explained';
}

export interface CandidateSession {
  id: string;
  candidateName: string;
  candidateInitials: string;
  examTitle: string;
  examDate: string;
  connectionType: 'Fiber' | '4G Cellular' | 'Rural Broadband' | 'Unstable DSL';
  integrityRiskScore: number; // 0 - 100
  behaviouralRiskScore: number; // 0 - 100
  environmentalQualityScore: number; // 0 - 100
  reviewStatus: 'Auto-Cleared' | 'Requires Review' | 'Escalated' | 'In Appeal';
  flagsCount: number;
  environmentalIncidents: number;
  timeline: EvidenceEvent[];
  summaryRationale: string;
  candidateStatement?: string;
}

export interface PreTestMetric {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'checking';
  value: string;
  details: string;
}
