export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          accept_count: number
          created_at: string
          date: string
          id: string
          partial_count: number
          reject_count: number
          script_id: string
          updated_at: string
          visitor_count: number
        }
        Insert: {
          accept_count?: number
          created_at?: string
          date: string
          id?: string
          partial_count?: number
          reject_count?: number
          script_id: string
          updated_at?: string
          visitor_count?: number
        }
        Update: {
          accept_count?: number
          created_at?: string
          date?: string
          id?: string
          partial_count?: number
          reject_count?: number
          script_id?: string
          updated_at?: string
          visitor_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "consent_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_scripts: {
        Row: {
          auto_hide: boolean
          auto_hide_time: number
          banner_color: string
          banner_position: string
          button_color: string
          button_text_color: string
          created_at: string
          id: string
          script_id: string
          show_powered_by: boolean
          text_color: string
          updated_at: string
          user_id: string
          website_id: string
        }
        Insert: {
          auto_hide?: boolean
          auto_hide_time?: number
          banner_color: string
          banner_position: string
          button_color: string
          button_text_color: string
          created_at?: string
          id?: string
          script_id: string
          show_powered_by?: boolean
          text_color: string
          updated_at?: string
          user_id: string
          website_id: string
        }
        Update: {
          auto_hide?: boolean
          auto_hide_time?: number
          banner_color?: string
          banner_position?: string
          button_color?: string
          button_text_color?: string
          created_at?: string
          id?: string
          script_id?: string
          show_powered_by?: boolean
          text_color?: string
          updated_at?: string
          user_id?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_scripts_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_activity: {
        Row: {
          created_at: string
          domain: string
          event_type: string
          id: string
          language: string | null
          region: string | null
          script_id: string
          session_id: string | null
          url: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          event_type: string
          id?: string
          language?: string | null
          region?: string | null
          script_id: string
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          event_type?: string
          id?: string
          language?: string | null
          region?: string | null
          script_id?: string
          session_id?: string | null
          url?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_activity_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "consent_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_settings: {
        Row: {
          analytics_history: number
          created_at: string
          customization: string
          id: string
          plan_type: string
          support_level: string
          updated_at: string
          webhooks_enabled: boolean
          website_limit: number
          white_label: boolean
        }
        Insert: {
          analytics_history?: number
          created_at?: string
          customization?: string
          id?: string
          plan_type: string
          support_level?: string
          updated_at?: string
          webhooks_enabled?: boolean
          website_limit?: number
          white_label?: boolean
        }
        Update: {
          analytics_history?: number
          created_at?: string
          customization?: string
          id?: string
          plan_type?: string
          support_level?: string
          updated_at?: string
          webhooks_enabled?: boolean
          website_limit?: number
          white_label?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempt: number
          created_at: string
          error_message: string | null
          id: string
          is_test: boolean
          request_payload: Json | null
          response_body: string | null
          status: string
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          error_message?: string | null
          id?: string
          is_test?: boolean
          request_payload?: Json | null
          response_body?: string | null
          status: string
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          attempt?: number
          created_at?: string
          error_message?: string | null
          id?: string
          is_test?: boolean
          request_payload?: Json | null
          response_body?: string | null
          status?: string
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          retry_count: number
          secret: string | null
          updated_at: string
          url: string
          user_id: string
          website_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          retry_count?: number
          secret?: string | null
          updated_at?: string
          url: string
          user_id: string
          website_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          retry_count?: number
          secret?: string | null
          updated_at?: string
          url?: string
          user_id?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          active: boolean
          created_at: string
          domain: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          domain: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          domain?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      domain_geo_distribution: {
        Row: {
          domain: string | null
          eu_visitors: number | null
          other_visitors: number | null
          script_id: string | null
          total_unique_visitors: number | null
          us_visitors: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_activity_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "consent_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_by_email: {
        Args: { user_email: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
