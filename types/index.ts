export type FinancialType = `${'A' | 'G'}${'F' | 'P'}${'D' | 'I'}${'E' | 'N'}`;

export type AnswerValue = string | string[];

export interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    value: string; // Option key used for scoring and i18n
  }[];
  multiSelect?: boolean;
}

export interface Persona {
  id: FinancialType;
  name: string;
  description: string;
  mascot: string; // Path to mascot image
}

export interface UserProfile {
  industry: string;
  familiarity: string;
  salary?: string;
  paymentFreq?: string;
  language?: string; // User's preferred language
}

export interface JobOption {
  id: string;
  title: string;
  salary: number; // Annualized for calculation
  salaryLabel: string;
  bonus: string;
  healthInsurance: string;
  location: string;
  analysis: string; // Feedback on this career path
}

export interface LifeOption {
  id: string;
  title: string;
  description: string;
  analysis: string; // Immediate feedback
  cost: number;
  type: string; // 'monthly' or 'one-time'
}

export interface SimulationResult {
  finalBalance: number;
  netWorth: number;
  narrative: string;
  tips: string[];
  finotype: string;
  analysisByTopic?: Record<string, string>;
  error?: string;
}

export interface AnalysisState {
  profile: string;
  summary: string;
  tips: string[];
  analysisByTopic?: Record<string, string>;
  error?: string;
}
