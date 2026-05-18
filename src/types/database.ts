export type QuestionType = 'pattern_recognition' | 'numerical' | 'verbal_analogy' | 'deductive' | 'logical_sequence'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type SessionStatus = 'in_progress' | 'completed' | 'expired'
export type ResultStatus = 'pending_review' | 'reviewed' | 'shortlisted' | 'rejected'

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          company_name: string
          company_logo_url: string | null
          test_name: string
          welcome_headline: string
          welcome_body: string | null
          completion_message: string | null
          confidentiality_text: string | null
          whats_next_text: string | null
          updated_at: string
        }
        Insert: Partial<Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'>> & {
          id?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['settings']['Row']>
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          type: QuestionType
          difficulty: QuestionDifficulty
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: string
          svg_content: string | null
          is_practice: boolean
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['questions']['Row']>
        Relationships: []
      }
      applicants: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          source: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['applicants']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['applicants']['Row']>
        Relationships: []
      }
      test_sessions: {
        Row: {
          id: string
          applicant_id: string
          start_time: string | null
          end_time: string | null
          time_taken_seconds: number | null
          status: SessionStatus
          tab_switches: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['test_sessions']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['test_sessions']['Row']>
        Relationships: []
      }
      answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          selected_answer: string | null
          is_correct: boolean | null
          answered_at: string
        }
        Insert: Omit<Database['public']['Tables']['answers']['Row'], 'id' | 'answered_at'> & {
          id?: string
          answered_at?: string
        }
        Update: Partial<Database['public']['Tables']['answers']['Row']>
        Relationships: []
      }
      results: {
        Row: {
          id: string
          session_id: string
          applicant_id: string
          raw_score: number
          weighted_score: number
          iq_score: number
          percentile: number
          iq_label: string
          status: ResultStatus
          reviewed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['results']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['results']['Row']>
        Relationships: []
      }
      indeed_imports: {
        Row: {
          id: string
          applicant_id: string
          imported_at: string
          source_file: string | null
        }
        Insert: Omit<Database['public']['Tables']['indeed_imports']['Row'], 'id' | 'imported_at'> & {
          id?: string
          imported_at?: string
        }
        Update: Partial<Database['public']['Tables']['indeed_imports']['Row']>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      question_type: QuestionType
      question_difficulty: QuestionDifficulty
      session_status: SessionStatus
      result_status: ResultStatus
    }
  }
}

// Convenience row types
export type Settings = Database['public']['Tables']['settings']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionForClient = Omit<Question, 'correct_answer'>
export type Applicant = Database['public']['Tables']['applicants']['Row']
export type TestSession = Database['public']['Tables']['test_sessions']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type Result = Database['public']['Tables']['results']['Row']
export type IndeedImport = Database['public']['Tables']['indeed_imports']['Row']
