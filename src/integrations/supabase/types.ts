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
      driver_reputation: {
        Row: {
          champion_acts: number | null
          compliance_score: number | null
          driver_id: string | null
          id: string
          infringements: number | null
          rating: number | null
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          champion_acts?: number | null
          compliance_score?: number | null
          driver_id?: string | null
          id?: string
          infringements?: number | null
          rating?: number | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          champion_acts?: number | null
          compliance_score?: number | null
          driver_id?: string | null
          id?: string
          infringements?: number | null
          rating?: number | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_reputation_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          eta: number | null
          id: string
          location: string
          name: string
          rating: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vehicle: string
        }
        Insert: {
          eta?: number | null
          id?: string
          location: string
          name: string
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle: string
        }
        Update: {
          eta?: number | null
          id?: string
          location?: string
          name?: string
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location_logs: {
        Row: {
          accuracy: number | null
          id: string
          latitude: number | null
          longitude: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          timestamp?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      municipal_bills: {
        Row: {
          amount: number
          bill_date: string
          bill_number: string | null
          consumption: number | null
          created_at: string
          document_url: string | null
          due_date: string
          id: string
          meter_reading: string | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          previous_reading: string | null
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bill_date: string
          bill_number?: string | null
          consumption?: number | null
          created_at?: string
          document_url?: string | null
          due_date: string
          id?: string
          meter_reading?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          previous_reading?: string | null
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bill_date?: string
          bill_number?: string | null
          consumption?: number | null
          created_at?: string
          document_url?: string | null
          due_date?: string
          id?: string
          meter_reading?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          previous_reading?: string | null
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipal_bills_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "municipal_services"
            referencedColumns: ["id"]
          },
        ]
      }
      municipal_services: {
        Row: {
          account_number: string
          auto_pay_enabled: boolean | null
          bill_period: string | null
          consumption_units: string | null
          created_at: string
          current_balance: number | null
          document_url: string | null
          due_date: string | null
          id: string
          meter_reading: string | null
          municipality: string
          property_address: string
          rate_per_unit: number | null
          service_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          auto_pay_enabled?: boolean | null
          bill_period?: string | null
          consumption_units?: string | null
          created_at?: string
          current_balance?: number | null
          document_url?: string | null
          due_date?: string | null
          id?: string
          meter_reading?: string | null
          municipality: string
          property_address: string
          rate_per_unit?: number | null
          service_type: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          auto_pay_enabled?: boolean | null
          bill_period?: string | null
          consumption_units?: string | null
          created_at?: string
          current_balance?: number | null
          document_url?: string | null
          due_date?: string | null
          id?: string
          meter_reading?: string | null
          municipality?: string
          property_address?: string
          rate_per_unit?: number | null
          service_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      panic_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          location: Json | null
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          id?: string
          location?: Json | null
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          location?: Json | null
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          notification_preferences: Json | null
          preferred_language: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ride_updates: {
        Row: {
          created_at: string
          driver_location: Json | null
          estimated_arrival: string | null
          id: string
          ride_id: string
          status_message: string | null
        }
        Insert: {
          created_at?: string
          driver_location?: Json | null
          estimated_arrival?: string | null
          id?: string
          ride_id: string
          status_message?: string | null
        }
        Update: {
          created_at?: string
          driver_location?: Json | null
          estimated_arrival?: string | null
          id?: string
          ride_id?: string
          status_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_updates_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          created_at: string | null
          destination: string
          driver_id: string | null
          id: string
          passenger_id: string | null
          pickup_location: string
          price: number
          ride_type: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          destination: string
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          pickup_location: string
          price: number
          ride_type: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          pickup_location?: string
          price?: number
          ride_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sassa_verifications: {
        Row: {
          card_photo_url: string | null
          created_at: string
          grant_type: string
          id: string
          status: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verified_at: string | null
        }
        Insert: {
          card_photo_url?: string | null
          created_at?: string
          grant_type: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verified_at?: string | null
        }
        Update: {
          card_photo_url?: string | null
          created_at?: string
          grant_type?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          details: Json | null
          id: string
          incident_type: string
          status: string
          timestamp: string
          user_id: string
        }
        Insert: {
          details?: Json | null
          id?: string
          incident_type: string
          status?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          details?: Json | null
          id?: string
          incident_type?: string
          status?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          driver_share: number
          id: string
          owner_share: number
          payment_method: string
          platform_fee: number
          ride_id: string | null
          ride_type: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          driver_share: number
          id?: string
          owner_share: number
          payment_method: string
          platform_fee: number
          ride_id?: string | null
          ride_type?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          driver_share?: number
          id?: string
          owner_share?: number
          payment_method?: string
          platform_fee?: number
          ride_id?: string | null
          ride_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string
          profile_pic_url: string | null
          role: string
          social_media: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          profile_pic_url?: string | null
          role: string
          social_media?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
          profile_pic_url?: string | null
          role?: string
          social_media?: string | null
        }
        Relationships: []
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
