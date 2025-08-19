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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          response_time: unknown | null
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
          response_time?: unknown | null
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
          response_time?: unknown | null
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
          is_government_verified?: boolean | null
          is_law_enforcement?: boolean | null
          notification_preferences?: Json | null
          popia_consent?: boolean | null
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
          is_government_verified?: boolean | null
          is_law_enforcement?: boolean | null
          notification_preferences?: Json | null
          popia_consent?: boolean | null
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
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
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
