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
          post_familiarity: string | null
          salary: string | null
          payment_freq: string | null
          email_verified: boolean
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
          industry?: string | null
          familiarity?: string | null
          post_familiarity?: string | null
          salary?: string | null
          payment_freq?: string | null
          email_verified?: boolean
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
          industry?: string | null
          familiarity?: string | null
          post_familiarity?: string | null
          salary?: string | null
          payment_freq?: string | null
          email_verified?: boolean
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
      type: {
        Row: {
          id: string
          session_id: string
          finotype: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          finotype: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          finotype?: string
          created_at?: string
        }
      }
    }
  }
}
