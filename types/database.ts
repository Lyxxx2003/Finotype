export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
          industry: string | null
          familiarity: string | null
          salary: string | null
          payment_freq: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
          industry?: string | null
          familiarity?: string | null
          salary?: string | null
          payment_freq?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
          industry?: string | null
          familiarity?: string | null
          salary?: string | null
          payment_freq?: string | null
        }
      }
      simulations: {
        Row: {
          id: string
          user_id: string
          created_at: string
          final_balance: number
          game_history: Json | null
          gemini_analysis: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          final_balance: number
          game_history?: Json | null
          gemini_analysis?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          final_balance?: number
          game_history?: Json | null
          gemini_analysis?: Json | null
        }
      }
    }
  }
}
