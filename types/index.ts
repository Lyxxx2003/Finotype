export type FinancialType = 'FC' | 'FA' | 'LC' | 'LA';

export interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    value: 'F' | 'L' | 'C' | 'A'; // Scoring towards specific trait
  }[];
}

export interface Persona {
  id: FinancialType;
  name: string;
  description: string;
  mascot: string; // Emoji for now
  strengths: string[];
  pitfalls: string[];
  tips: string[];
}
