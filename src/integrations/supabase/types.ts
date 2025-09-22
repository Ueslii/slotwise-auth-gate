export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string
          created_at: string
          end_time: string
          establishment_id: number
          id: number
          service_id: number
          start_time: string
          status: string
          team_member_id: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          end_time: string
          establishment_id: number
          id?: never
          service_id: number
          start_time: string
          status?: string
          team_member_id?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          end_time?: string
          establishment_id?: number
          id?: never
          service_id?: number
          start_time?: string
          status?: string
          team_member_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      availabilities: {
        Row: {
          day_of_week: number
          end_time: string
          establishment_id: number
          id: number
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          establishment_id: number
          id?: never
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          establishment_id?: number
          id?: never
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilities_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          created_at: string
          establishment_id: number
          id: number
          note: string
        }
        Insert: {
          client_id: string
          created_at?: string
          establishment_id: number
          id?: never
          note: string
        }
        Update: {
          client_id?: string
          created_at?: string
          establishment_id?: number
          id?: never
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_packages: {
        Row: {
          client_id: string
          credits_remaining: number
          id: number
          package_id: number
          purchase_date: string
        }
        Insert: {
          client_id: string
          credits_remaining: number
          id?: never
          package_id: number
          purchase_date?: string
        }
        Update: {
          client_id?: string
          credits_remaining?: number
          id?: never
          package_id?: number
          purchase_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      establishments: {
        Row: {
          address: string | null
          contact_info: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          owner_id: string
        }
        Insert: {
          address?: string | null
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: never
          name: string
          owner_id: string
        }
        Update: {
          address?: string | null
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: string
          establishment_id: number
          id: number
          source: string | null
        }
        Insert: {
          content: string
          establishment_id: number
          id?: never
          source?: string | null
        }
        Update: {
          content?: string
          establishment_id?: number
          id?: never
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          establishment_id: number
          id: number
          name: string
          price: number
          quantity: number
          service_id: number
        }
        Insert: {
          establishment_id: number
          id?: never
          name: string
          price: number
          quantity: number
          service_id: number
        }
        Update: {
          establishment_id?: number
          id?: never
          name?: string
          price?: number
          quantity?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: number | null
          client_package_id: number | null
          created_at: string
          id: number
          payment_gateway_id: string | null
          status: string
          subscription_id: number | null
        }
        Insert: {
          amount: number
          appointment_id?: number | null
          client_package_id?: number | null
          created_at?: string
          id?: never
          payment_gateway_id?: string | null
          status: string
          subscription_id?: number | null
        }
        Update: {
          amount?: number
          appointment_id?: number | null
          client_package_id?: number | null
          created_at?: string
          id?: never
          payment_gateway_id?: string | null
          status?: string
          subscription_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          role: string
          status: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          role: string
          status?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          role?: string
          status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: number
          client_id: string
          comment: string | null
          created_at: string
          establishment_id: number
          id: number
          rating: number
        }
        Insert: {
          appointment_id: number
          client_id: string
          comment?: string | null
          created_at?: string
          establishment_id: number
          id?: never
          rating: number
        }
        Update: {
          appointment_id?: number
          client_id?: string
          comment?: string | null
          created_at?: string
          establishment_id?: number
          id?: never
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_assignments: {
        Row: {
          service_id: number
          team_member_id: number
        }
        Insert: {
          service_id: number
          team_member_id: number
        }
        Update: {
          service_id?: number
          team_member_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_assignments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          establishment_id: number
          id: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          establishment_id: number
          id?: never
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          establishment_id?: number
          id?: never
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          features: Json | null
          id: number
          name: string
          price: number
        }
        Insert: {
          features?: Json | null
          id?: never
          name: string
          price: number
        }
        Update: {
          features?: Json | null
          id?: never
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          end_date: string | null
          establishment_id: number
          id: number
          plan_id: number
          start_date: string
          status: string
        }
        Insert: {
          end_date?: string | null
          establishment_id: number
          id?: never
          plan_id: number
          start_date: string
          status: string
        }
        Update: {
          end_date?: string | null
          establishment_id?: number
          id?: never
          plan_id?: number
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          establishment_id: number
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          establishment_id: number
          id?: never
          name: string
        }
        Update: {
          created_at?: string
          email?: string | null
          establishment_id?: number
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
