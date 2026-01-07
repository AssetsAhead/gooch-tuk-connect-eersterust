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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_incidents: {
        Row: {
          auto_detected: boolean | null
          capture_id: string
          created_at: string
          description: string | null
          id: string
          incident_type: string
          location: Json | null
          metadata: Json | null
          resolution_notes: string | null
          responded_at: string | null
          responded_by: string | null
          response_required: boolean | null
          response_time: unknown
          severity: string
          status: string | null
        }
        Insert: {
          auto_detected?: boolean | null
          capture_id: string
          created_at?: string
          description?: string | null
          id?: string
          incident_type: string
          location?: Json | null
          metadata?: Json | null
          resolution_notes?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_required?: boolean | null
          response_time?: unknown
          severity?: string
          status?: string | null
        }
        Update: {
          auto_detected?: boolean | null
          capture_id?: string
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: string
          location?: Json | null
          metadata?: Json | null
          resolution_notes?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_required?: boolean | null
          response_time?: unknown
          severity?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_incidents_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "camera_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      association_executives: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          position: string
          term_end: string | null
          term_start: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          position: string
          term_end?: string | null
          term_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string
          term_end?: string | null
          term_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      camera_captures: {
        Row: {
          ai_analysis: Json | null
          camera_id: string | null
          capture_timestamp: string
          confidence_score: number | null
          created_at: string
          evidence_status: string | null
          facial_matches: Json | null
          id: string
          image_url: string
          incident_detected: boolean | null
          incident_type: string | null
          license_plates: Json | null
          location: Json | null
          metadata: Json | null
          traffic_violations: Json | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          camera_id?: string | null
          capture_timestamp?: string
          confidence_score?: number | null
          created_at?: string
          evidence_status?: string | null
          facial_matches?: Json | null
          id?: string
          image_url: string
          incident_detected?: boolean | null
          incident_type?: string | null
          license_plates?: Json | null
          location?: Json | null
          metadata?: Json | null
          traffic_violations?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          camera_id?: string | null
          capture_timestamp?: string
          confidence_score?: number | null
          created_at?: string
          evidence_status?: string | null
          facial_matches?: Json | null
          id?: string
          image_url?: string
          incident_detected?: boolean | null
          incident_type?: string | null
          license_plates?: Json | null
          location?: Json | null
          metadata?: Json | null
          traffic_violations?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_captures_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "camera_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_installations: {
        Row: {
          camera_type: string
          created_at: string
          features: string[] | null
          id: string
          installation_date: string
          installation_notes: string | null
          latitude: number
          location_name: string
          longitude: number
          municipality: string
          status: string
          updated_at: string
          ward: string | null
        }
        Insert: {
          camera_type?: string
          created_at?: string
          features?: string[] | null
          id?: string
          installation_date?: string
          installation_notes?: string | null
          latitude: number
          location_name: string
          longitude: number
          municipality: string
          status?: string
          updated_at?: string
          ward?: string | null
        }
        Update: {
          camera_type?: string
          created_at?: string
          features?: string[] | null
          id?: string
          installation_date?: string
          installation_notes?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          municipality?: string
          status?: string
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      data_processing_logs: {
        Row: {
          created_at: string
          data_type: string
          id: string
          lawful_basis: Database["public"]["Enums"]["legal_basis"]
          operation: Database["public"]["Enums"]["data_operation"]
          purpose: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          lawful_basis?: Database["public"]["Enums"]["legal_basis"]
          operation: Database["public"]["Enums"]["data_operation"]
          purpose: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          lawful_basis?: Database["public"]["Enums"]["legal_basis"]
          operation?: Database["public"]["Enums"]["data_operation"]
          purpose?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deadline_reminders: {
        Row: {
          created_at: string
          deadline_date: string
          description: string | null
          id: string
          is_active: boolean
          last_reminder_sent: string | null
          registration_id: string | null
          reminder_days: number[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_date: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_reminder_sent?: string | null
          registration_id?: string | null
          reminder_days?: number[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_date?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_reminder_sent?: string | null
          registration_id?: string | null
          reminder_days?: number[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadline_reminders_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "regulatory_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          document_type: string
          driver_id: string
          expiry_date: string | null
          file_name: string
          file_path: string
          id: string
          is_current: boolean
          notes: string | null
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          document_type: string
          driver_id: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          id?: string
          is_current?: boolean
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          driver_id?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_current?: boolean
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: []
      }
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
          photo_url: string | null
          rating: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          vehicle: string
        }
        Insert: {
          eta?: number | null
          id?: string
          location: string
          name: string
          photo_url?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          vehicle: string
        }
        Update: {
          eta?: number | null
          id?: string
          location?: string
          name?: string
          photo_url?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_messages: {
        Row: {
          area: string | null
          created_at: string
          created_by: string | null
          id: string
          message: string
          priority: string
          responses: number | null
          status: string
          title: string
          type: string
          updated_at: string
          views: number | null
          ward: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          priority: string
          responses?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string
          views?: number | null
          ward: string
        }
        Update: {
          area?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          priority?: string
          responses?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          views?: number | null
          ward?: string
        }
        Relationships: []
      }
      evidence_chain: {
        Row: {
          capture_id: string
          case_number: string | null
          case_reference: string | null
          chain_notes: string | null
          collected_at: string
          collected_by: string
          court_admissible: boolean | null
          created_at: string
          digital_signature: string | null
          evidence_type: string
          id: string
          legal_status: string | null
          metadata: Json | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          capture_id: string
          case_number?: string | null
          case_reference?: string | null
          chain_notes?: string | null
          collected_at?: string
          collected_by: string
          court_admissible?: boolean | null
          created_at?: string
          digital_signature?: string | null
          evidence_type: string
          id?: string
          legal_status?: string | null
          metadata?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          capture_id?: string
          case_number?: string | null
          case_reference?: string | null
          chain_notes?: string | null
          collected_at?: string
          collected_by?: string
          court_admissible?: boolean | null
          created_at?: string
          digital_signature?: string | null
          evidence_type?: string
          id?: string
          legal_status?: string | null
          metadata?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_chain_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "camera_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      file_13_requests: {
        Row: {
          claimed_at: string | null
          created_at: string
          current_owner_id: string | null
          driver_name: string
          driver_nickname: string | null
          driver_phone: string | null
          driver_photo_url: string | null
          id: string
          notes: string | null
          posted_at: string
          posted_by: string | null
          reason: string | null
          requesting_owner_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          current_owner_id?: string | null
          driver_name: string
          driver_nickname?: string | null
          driver_phone?: string | null
          driver_photo_url?: string | null
          id?: string
          notes?: string | null
          posted_at?: string
          posted_by?: string | null
          reason?: string | null
          requesting_owner_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          current_owner_id?: string | null
          driver_name?: string
          driver_nickname?: string | null
          driver_phone?: string | null
          driver_photo_url?: string | null
          id?: string
          notes?: string | null
          posted_at?: string
          posted_by?: string | null
          reason?: string | null
          requesting_owner_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      flagged_individuals: {
        Row: {
          created_at: string
          flag_level: string
          flagged_at: string
          flagged_by: string | null
          id: string
          id_number: string | null
          is_active: boolean
          name: string
          nickname: string | null
          notes: string | null
          person_type: string
          phone: string | null
          photo_url: string | null
          reason: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          flag_level?: string
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean
          name: string
          nickname?: string | null
          notes?: string | null
          person_type: string
          phone?: string | null
          photo_url?: string | null
          reason: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          flag_level?: string
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean
          name?: string
          nickname?: string | null
          notes?: string | null
          person_type?: string
          phone?: string | null
          photo_url?: string | null
          reason?: string
          updated_at?: string
        }
        Relationships: []
      }
      fleet_revenue_tracking: {
        Row: {
          created_at: string
          fuel_cost: number
          gross_revenue: number
          id: string
          maintenance_cost: number
          notes: string | null
          other_costs: number
          owner_id: string
          tracking_date: string
          trips_completed: number
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          fuel_cost?: number
          gross_revenue?: number
          id?: string
          maintenance_cost?: number
          notes?: string | null
          other_costs?: number
          owner_id: string
          tracking_date?: string
          trips_completed?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          fuel_cost?: number
          gross_revenue?: number
          id?: string
          maintenance_cost?: number
          notes?: string | null
          other_costs?: number
          owner_id?: string
          tracking_date?: string
          trips_completed?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_revenue_tracking_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_zones: {
        Row: {
          active: boolean | null
          boundary: Json
          created_at: string
          created_by: string | null
          enforcement_level: string | null
          id: string
          municipality: string
          rules: Json | null
          updated_at: string
          ward: string | null
          zone_name: string
          zone_type: string
        }
        Insert: {
          active?: boolean | null
          boundary: Json
          created_at?: string
          created_by?: string | null
          enforcement_level?: string | null
          id?: string
          municipality: string
          rules?: Json | null
          updated_at?: string
          ward?: string | null
          zone_name: string
          zone_type: string
        }
        Update: {
          active?: boolean | null
          boundary?: Json
          created_at?: string
          created_by?: string | null
          enforcement_level?: string | null
          id?: string
          municipality?: string
          rules?: Json | null
          updated_at?: string
          ward?: string | null
          zone_name?: string
          zone_type?: string
        }
        Relationships: []
      }
      insurance_quotes: {
        Row: {
          annual_premium_max: number
          annual_premium_min: number
          business_type: string
          coverage_amount: string
          created_at: string
          has_claims_history: boolean
          id: string
          include_passenger_liability: boolean
          is_active: boolean
          monthly_premium_max: number
          monthly_premium_min: number
          notes: string | null
          quote_date: string
          risk_level: string
          updated_at: string
          user_id: string
          valid_until: string | null
          vehicle_count: number
        }
        Insert: {
          annual_premium_max: number
          annual_premium_min: number
          business_type: string
          coverage_amount: string
          created_at?: string
          has_claims_history?: boolean
          id?: string
          include_passenger_liability?: boolean
          is_active?: boolean
          monthly_premium_max: number
          monthly_premium_min: number
          notes?: string | null
          quote_date?: string
          risk_level: string
          updated_at?: string
          user_id: string
          valid_until?: string | null
          vehicle_count?: number
        }
        Update: {
          annual_premium_max?: number
          annual_premium_min?: number
          business_type?: string
          coverage_amount?: string
          created_at?: string
          has_claims_history?: boolean
          id?: string
          include_passenger_liability?: boolean
          is_active?: boolean
          monthly_premium_max?: number
          monthly_premium_min?: number
          notes?: string | null
          quote_date?: string
          risk_level?: string
          updated_at?: string
          user_id?: string
          valid_until?: string | null
          vehicle_count?: number
        }
        Relationships: []
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
      maintenance_expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expense_date: string
          expense_type: string
          id: string
          owner_id: string
          purchase_order_id: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type: string
          id?: string
          owner_id: string
          purchase_order_id?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          owner_id?: string
          purchase_order_id?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_expenses_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_expenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
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
      parts_inventory: {
        Row: {
          category: string | null
          created_at: string
          id: string
          minimum_stock: number | null
          notes: string | null
          part_name: string
          part_number: string | null
          price_rands: number
          stock_quantity: number | null
          supplier_id: string | null
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          minimum_stock?: number | null
          notes?: string | null
          part_name: string
          part_number?: string | null
          price_rands: number
          stock_quantity?: number | null
          supplier_id?: string | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          minimum_stock?: number | null
          notes?: string | null
          part_name?: string
          part_number?: string | null
          price_rands?: number
          stock_quantity?: number | null
          supplier_id?: string | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "parts_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pii_data_records: {
        Row: {
          created_at: string
          data_type: Database["public"]["Enums"]["pii_data_type"]
          encrypted_value: string
          expires_at: string
          id: string
          purpose: string
          retention_days: number
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_type: Database["public"]["Enums"]["pii_data_type"]
          encrypted_value: string
          expires_at: string
          id?: string
          purpose: string
          retention_days?: number
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_type?: Database["public"]["Enums"]["pii_data_type"]
          encrypted_value?: string
          expires_at?: string
          id?: string
          purpose?: string
          retention_days?: number
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_updates: {
        Row: {
          announcement_date: string
          category: string
          created_at: string
          created_by: string | null
          document_url: string | null
          effective_date: string | null
          id: string
          impact_level: string
          source_url: string | null
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          announcement_date?: string
          category: string
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          source_url?: string | null
          status?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          announcement_date?: string
          category?: string
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          source_url?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      popia_consent_records: {
        Row: {
          consent_date: string
          consent_given: boolean
          created_at: string
          id: string
          legal_basis: Database["public"]["Enums"]["legal_basis"]
          purpose: string
          updated_at: string
          user_id: string
          withdrawal_date: string | null
        }
        Insert: {
          consent_date?: string
          consent_given?: boolean
          created_at?: string
          id?: string
          legal_basis?: Database["public"]["Enums"]["legal_basis"]
          purpose: string
          updated_at?: string
          user_id: string
          withdrawal_date?: string | null
        }
        Update: {
          consent_date?: string
          consent_given?: boolean
          created_at?: string
          id?: string
          legal_basis?: Database["public"]["Enums"]["legal_basis"]
          purpose?: string
          updated_at?: string
          user_id?: string
          withdrawal_date?: string | null
        }
        Relationships: []
      }
      portal_access: {
        Row: {
          access_granted: boolean
          created_at: string
          granted_at: string | null
          granted_by: string | null
          id: string
          notes: string | null
          portal_type: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_granted?: boolean
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          portal_type: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_granted?: boolean
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          portal_type?: string
          revoked_at?: string | null
          updated_at?: string
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
          is_government_verified: boolean | null
          is_law_enforcement: boolean | null
          notification_preferences: Json | null
          popia_consent: boolean | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_government_verified?: boolean | null
          is_law_enforcement?: boolean | null
          notification_preferences?: Json | null
          popia_consent?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_government_verified?: boolean | null
          is_law_enforcement?: boolean | null
          notification_preferences?: Json | null
          popia_consent?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          part_id: string | null
          part_name: string
          purchase_order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          part_id?: string | null
          part_name: string
          purchase_order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          part_id?: string | null
          part_name?: string
          purchase_order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_number: string
          owner_id: string
          status: string
          supplier_id: string | null
          total_amount: number
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_number: string
          owner_id: string
          status?: string
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_number?: string
          owner_id?: string
          status?: string
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "parts_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      rank_access_fees: {
        Row: {
          amount: number
          created_at: string
          driver_id: string | null
          id: string
          notes: string | null
          owner_id: string
          paid_at: string | null
          payment_status: string
          receipt_number: string | null
          updated_at: string
          vehicle_id: string | null
          week_starting: string
        }
        Insert: {
          amount?: number
          created_at?: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          paid_at?: string | null
          payment_status?: string
          receipt_number?: string | null
          updated_at?: string
          vehicle_id?: string | null
          week_starting: string
        }
        Update: {
          amount?: number
          created_at?: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          paid_at?: string | null
          payment_status?: string
          receipt_number?: string | null
          updated_at?: string
          vehicle_id?: string | null
          week_starting?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_access_fees_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "rank_access_fees_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_documents: {
        Row: {
          document_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_current: boolean
          notes: string | null
          registration_id: string
          uploaded_at: string
          user_id: string
          version: number
        }
        Insert: {
          document_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          registration_id: string
          uploaded_at?: string
          user_id: string
          version?: number
        }
        Update: {
          document_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          registration_id?: string
          uploaded_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_documents_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "regulatory_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_registrations: {
        Row: {
          approved_date: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          notes: string | null
          organization_code: string
          organization_name: string
          registration_number: string | null
          status: string
          submitted_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_date?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          organization_code: string
          organization_name: string
          registration_number?: string | null
          status?: string
          submitted_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_date?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          organization_code?: string
          organization_name?: string
          registration_number?: string | null
          status?: string
          submitted_date?: string | null
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
          driver_rating: number | null
          driver_rating_comment: string | null
          id: string
          passenger_id: string | null
          pickup_location: string
          price: number
          ride_type: string
          scheduled_for: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          destination: string
          driver_id?: string | null
          driver_rating?: number | null
          driver_rating_comment?: string | null
          id?: string
          passenger_id?: string | null
          pickup_location: string
          price: number
          ride_type: string
          scheduled_for?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string
          driver_id?: string | null
          driver_rating?: number | null
          driver_rating_comment?: string | null
          id?: string
          passenger_id?: string | null
          pickup_location?: string
          price?: number
          ride_type?: string
          scheduled_for?: string | null
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
      role_requests: {
        Row: {
          created_at: string
          id: string
          justification: string
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          verification_notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          justification: string
          requested_role: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          justification?: string
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
        }
        Relationships: []
      }
      sassa_verifications: {
        Row: {
          card_photo_url: string | null
          created_at: string
          file_path: string | null
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
          file_path?: string | null
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
          file_path?: string | null
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
      security_audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
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
      sms_usage_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string
          id: string
          message_type: string
          phone_number: string
          status: string
          twilio_sid: string | null
          user_id: string | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string
          id?: string
          message_type?: string
          phone_number: string
          status?: string
          twilio_sid?: string | null
          user_id?: string | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string
          id?: string
          message_type?: string
          phone_number?: string
          status?: string
          twilio_sid?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sms_verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone_number: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          verified?: boolean | null
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
      trip_revenue: {
        Row: {
          created_at: string
          driver_id: string | null
          driver_share: number | null
          dropoff_location: string | null
          fare_amount: number
          id: string
          notes: string | null
          owner_id: string
          owner_share: number | null
          payment_method: string
          pickup_location: string | null
          platform_fee: number | null
          rank_access_fee: number | null
          route_name: string | null
          trip_date: string
          trip_time: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          driver_share?: number | null
          dropoff_location?: string | null
          fare_amount?: number
          id?: string
          notes?: string | null
          owner_id: string
          owner_share?: number | null
          payment_method?: string
          pickup_location?: string | null
          platform_fee?: number | null
          rank_access_fee?: number | null
          route_name?: string | null
          trip_date?: string
          trip_time?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          driver_share?: number | null
          dropoff_location?: string | null
          fare_amount?: number
          id?: string
          notes?: string | null
          owner_id?: string
          owner_share?: number | null
          payment_method?: string
          pickup_location?: string | null
          platform_fee?: number | null
          rank_access_fee?: number | null
          route_name?: string | null
          trip_date?: string
          trip_time?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_revenue_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trip_revenue_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_phone_numbers: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          is_verified: boolean
          phone_number: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          phone_number: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          phone_number?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_registrations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          criminal_declaration_signed: boolean | null
          criminal_declaration_signed_at: string | null
          drivers_license_number: string | null
          first_name: string
          id: string
          id_number: string | null
          last_name: string
          pdp_number: string | null
          registration_status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          criminal_declaration_signed?: boolean | null
          criminal_declaration_signed_at?: string | null
          drivers_license_number?: string | null
          first_name: string
          id?: string
          id_number?: string | null
          last_name: string
          pdp_number?: string | null
          registration_status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          criminal_declaration_signed?: boolean | null
          criminal_declaration_signed_at?: string | null
          drivers_license_number?: string | null
          first_name?: string
          id?: string
          id_number?: string | null
          last_name?: string
          pdp_number?: string | null
          registration_status?: string
          updated_at?: string
          user_id?: string | null
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
          social_media?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          assigned_driver_id: string | null
          color: string | null
          created_at: string
          id: string
          insurance_expiry: string | null
          make: string | null
          model: string | null
          notes: string | null
          operating_license_number: string | null
          owner_id: string | null
          registration_number: string
          roadworthy_expiry: string | null
          route_number: string | null
          status: string
          updated_at: string
          vehicle_type: string
          year: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          insurance_expiry?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          operating_license_number?: string | null
          owner_id?: string | null
          registration_number: string
          roadworthy_expiry?: string | null
          route_number?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
          year?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          insurance_expiry?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          operating_license_number?: string | null
          owner_id?: string | null
          registration_number?: string
          roadworthy_expiry?: string | null
          route_number?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_admin_sessions: { Args: never; Returns: number }
      cleanup_expired_sms_codes: { Args: never; Returns: undefined }
      create_admin_session: {
        Args: { _ip_address?: string; _user_agent?: string }
        Returns: string
      }
      create_notification: {
        Args: {
          _message: string
          _related_id?: string
          _related_type?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_role_text: {
        Args: { p_role_text: string; p_user_id: string }
        Returns: boolean
      }
      has_valid_admin_session: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      revoke_admin_session: { Args: never; Returns: boolean }
      safe_role_allowed: { Args: { inp_role: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "driver"
        | "passenger"
        | "owner"
        | "marshall"
        | "police"
      data_operation: "collect" | "process" | "store" | "transmit" | "delete"
      legal_basis:
        | "consent"
        | "contract"
        | "legal_obligation"
        | "vital_interests"
        | "public_task"
        | "legitimate_interests"
      pii_data_type:
        | "identity_number"
        | "phone_number"
        | "email"
        | "address"
        | "biometric"
        | "financial"
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
    Enums: {
      app_role: ["admin", "driver", "passenger", "owner", "marshall", "police"],
      data_operation: ["collect", "process", "store", "transmit", "delete"],
      legal_basis: [
        "consent",
        "contract",
        "legal_obligation",
        "vital_interests",
        "public_task",
        "legitimate_interests",
      ],
      pii_data_type: [
        "identity_number",
        "phone_number",
        "email",
        "address",
        "biometric",
        "financial",
      ],
    },
  },
} as const
