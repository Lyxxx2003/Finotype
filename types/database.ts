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
          feedback: string | null
          email_verified: boolean
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
          feedback?: string | null
          email_verified?: boolean
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
          feedback?: string | null
          email_verified?: boolean
        }
      }
      friends: {
        Row: {
          id: string
          requester_id: string
          invitee_email: string
          invitee_id: string | null
          status: string
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          requester_id: string
          invitee_email: string
          invitee_id?: string | null
          status?: string
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          requester_id?: string
          invitee_email?: string
          invitee_id?: string | null
          status?: string
          created_at?: string
          accepted_at?: string | null
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
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          finotype: string
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          finotype?: string
          feedback?: string | null
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          user_id: string
          answers: Json
          scores: Json
          modules_completed: string[]
          is_finished: boolean
          total_score: number
          highest_total_score: number
          learning_curve: Json
          latest_finished_scores: Json | null
          latest_finished_total_score: number | null
          latest_finished_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          answers?: Json
          scores?: Json
          modules_completed?: string[]
          is_finished?: boolean
          total_score?: number
          highest_total_score?: number
          learning_curve?: Json
          latest_finished_scores?: Json | null
          latest_finished_total_score?: number | null
          latest_finished_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          answers?: Json
          scores?: Json
          modules_completed?: string[]
          is_finished?: boolean
          total_score?: number
          highest_total_score?: number
          learning_curve?: Json
          latest_finished_scores?: Json | null
          latest_finished_total_score?: number | null
          latest_finished_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bug_report: {
        Row: {
          id: string
          locale: string
          page_url: string
          expected: string
          actual: string
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          locale: string
          page_url: string
          expected: string
          actual: string
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          locale?: string
          page_url?: string
          expected?: string
          actual?: string
          details?: string | null
          created_at?: string
        }
      }
    }
  }
}
