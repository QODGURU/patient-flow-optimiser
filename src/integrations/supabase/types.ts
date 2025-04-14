export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          notes: string | null
          patient_id: string | null
          response: string | null
          time: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          response?: string | null
          time: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          response?: string | null
          time?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          availability_preferences: string | null
          call_attempts: number | null
          call_transcript: string | null
          clinic_id: string | null
          cold_reason: string | null
          created_at: string | null
          doctor_id: string | null
          email: string | null
          follow_up_required: boolean | null
          gender: string | null
          id: string
          interaction_rating:
            | Database["public"]["Enums"]["interaction_rating"]
            | null
          last_interaction: string | null
          last_interaction_outcome:
            | Database["public"]["Enums"]["interaction_outcome"]
            | null
          last_modified: string | null
          last_modified_by: string | null
          name: string
          next_interaction: string | null
          notes: string | null
          patient_feedback: string | null
          phone: string
          preferred_channel:
            | Database["public"]["Enums"]["follow_up_channel"]
            | null
          preferred_time: Database["public"]["Enums"]["follow_up_time"] | null
          price: number | null
          script: string | null
          sms_attempts: number | null
          sms_transcript: string | null
          status: Database["public"]["Enums"]["patient_status"] | null
          treatment_category: string | null
          treatment_type: string | null
        }
        Insert: {
          age?: number | null
          availability_preferences?: string | null
          call_attempts?: number | null
          call_transcript?: string | null
          clinic_id?: string | null
          cold_reason?: string | null
          created_at?: string | null
          doctor_id?: string | null
          email?: string | null
          follow_up_required?: boolean | null
          gender?: string | null
          id?: string
          interaction_rating?:
            | Database["public"]["Enums"]["interaction_rating"]
            | null
          last_interaction?: string | null
          last_interaction_outcome?:
            | Database["public"]["Enums"]["interaction_outcome"]
            | null
          last_modified?: string | null
          last_modified_by?: string | null
          name: string
          next_interaction?: string | null
          notes?: string | null
          patient_feedback?: string | null
          phone: string
          preferred_channel?:
            | Database["public"]["Enums"]["follow_up_channel"]
            | null
          preferred_time?: Database["public"]["Enums"]["follow_up_time"] | null
          price?: number | null
          script?: string | null
          sms_attempts?: number | null
          sms_transcript?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          treatment_category?: string | null
          treatment_type?: string | null
        }
        Update: {
          age?: number | null
          availability_preferences?: string | null
          call_attempts?: number | null
          call_transcript?: string | null
          clinic_id?: string | null
          cold_reason?: string | null
          created_at?: string | null
          doctor_id?: string | null
          email?: string | null
          follow_up_required?: boolean | null
          gender?: string | null
          id?: string
          interaction_rating?:
            | Database["public"]["Enums"]["interaction_rating"]
            | null
          last_interaction?: string | null
          last_interaction_outcome?:
            | Database["public"]["Enums"]["interaction_outcome"]
            | null
          last_modified?: string | null
          last_modified_by?: string | null
          name?: string
          next_interaction?: string | null
          notes?: string | null
          patient_feedback?: string | null
          phone?: string
          preferred_channel?:
            | Database["public"]["Enums"]["follow_up_channel"]
            | null
          preferred_time?: Database["public"]["Enums"]["follow_up_time"] | null
          price?: number | null
          script?: string | null
          sms_attempts?: number | null
          sms_transcript?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          treatment_category?: string | null
          treatment_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clinic"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          excluded_days: string[] | null
          id: string
          outreach_end_time: string | null
          outreach_interval: number | null
          outreach_start_time: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          excluded_days?: string[] | null
          id?: string
          outreach_end_time?: string | null
          outreach_interval?: number | null
          outreach_start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          excluded_days?: string[] | null
          id?: string
          outreach_end_time?: string | null
          outreach_interval?: number | null
          outreach_start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      follow_up_channel: "Call" | "SMS" | "Email"
      follow_up_time: "Morning" | "Afternoon" | "Evening"
      interaction_outcome: "Yes" | "No" | "Maybe" | "No Answer" | "Opt-out"
      interaction_rating: "Positive" | "Neutral" | "Negative"
      patient_status:
        | "Interested"
        | "Not Interested"
        | "Pending"
        | "Contacted"
        | "Booked"
        | "Cold"
      user_role: "admin" | "doctor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      follow_up_channel: ["Call", "SMS", "Email"],
      follow_up_time: ["Morning", "Afternoon", "Evening"],
      interaction_outcome: ["Yes", "No", "Maybe", "No Answer", "Opt-out"],
      interaction_rating: ["Positive", "Neutral", "Negative"],
      patient_status: [
        "Interested",
        "Not Interested",
        "Pending",
        "Contacted",
        "Booked",
        "Cold",
      ],
      user_role: ["admin", "doctor"],
    },
  },
} as const
