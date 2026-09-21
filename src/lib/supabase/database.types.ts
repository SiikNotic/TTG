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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_staff: {
        Row: {
          created_at: string
          event_id: string | null
          event_title_snapshot: string | null
          id: string
          invited_at: string
          organizer_display_name_snapshot: string
          organizer_id: string
          responded_at: string | null
          staff_display_name_snapshot: string
          staff_user_id: string
          status: Database["public"]["Enums"]["staff_invite_status"]
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          event_title_snapshot?: string | null
          id?: string
          invited_at?: string
          organizer_display_name_snapshot: string
          organizer_id: string
          responded_at?: string | null
          staff_display_name_snapshot: string
          staff_user_id: string
          status?: Database["public"]["Enums"]["staff_invite_status"]
        }
        Update: {
          created_at?: string
          event_id?: string | null
          event_title_snapshot?: string | null
          id?: string
          invited_at?: string
          organizer_display_name_snapshot?: string
          organizer_id?: string
          responded_at?: string | null
          staff_display_name_snapshot?: string
          staff_user_id?: string
          status?: Database["public"]["Enums"]["staff_invite_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_staff_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_staff_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city: string
          cover_image_url: string | null
          created_at: string
          description: string
          ends_at: string | null
          id: string
          min_age: number | null
          organizer_id: string
          rules: Json
          series_id: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string
          venue_name: string
        }
        Insert: {
          address?: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          min_age?: number | null
          organizer_id: string
          rules?: Json
          series_id?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title: string
          updated_at?: string
          venue_name?: string
        }
        Update: {
          address?: string
          capacity?: number
          category?: Database["public"]["Enums"]["event_category"]
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          min_age?: number | null
          organizer_id?: string
          rules?: Json
          series_id?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title?: string
          updated_at?: string
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "venue_series"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_total: number | null
          buyer_id: string
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payout_rail: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount: number | null
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          ticket_type_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          amount_total?: number | null
          buyer_id: string
          created_at?: string
          event_id: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payout_rail?: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount?: number | null
          quantity: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          ticket_type_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          amount_total?: number | null
          buyer_id?: string
          created_at?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payout_rail?: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount?: number | null
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          ticket_type_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_payout_settings: {
        Row: {
          ath_movil_phone: string | null
          method: Database["public"]["Enums"]["payout_method"]
          organizer_id: string
          paypal_email: string | null
          updated_at: string
        }
        Insert: {
          ath_movil_phone?: string | null
          method?: Database["public"]["Enums"]["payout_method"]
          organizer_id: string
          paypal_email?: string | null
          updated_at?: string
        }
        Update: {
          ath_movil_phone?: string | null
          method?: Database["public"]["Enums"]["payout_method"]
          organizer_id?: string
          paypal_email?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizer_payout_settings_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_payouts: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          organizer_id: string
          paypal_batch_id: string | null
          reference: string | null
          status: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          organizer_id: string
          paypal_batch_id?: string | null
          reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          organizer_id?: string
          paypal_batch_id?: string | null
          reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizer_payouts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizer_payouts_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_profiles: {
        Row: {
          bio: string
          created_at: string
          display_name: string | null
          id: string
          logo_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          bio?: string
          created_at?: string
          display_name?: string | null
          id: string
          logo_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          bio?: string
          created_at?: string
          display_name?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_stripe_accounts: {
        Row: {
          charges_enabled: boolean
          created_at: string
          details_submitted: boolean
          organizer_id: string
          payouts_enabled: boolean
          stripe_account_id: string
          updated_at: string
        }
        Insert: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          organizer_id: string
          payouts_enabled?: boolean
          stripe_account_id: string
          updated_at?: string
        }
        Update: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          organizer_id?: string
          payouts_enabled?: boolean
          stripe_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizer_stripe_accounts_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          created_at: string
          currency: string
          gross_amount: number
          id: string
          order_id: string
          organizer_amount: number
          platform_fee_amount: number
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          ticket_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          currency?: string
          gross_amount: number
          id?: string
          order_id: string
          organizer_amount: number
          platform_fee_amount: number
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          ticket_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          currency?: string
          gross_amount?: number
          id?: string
          order_id?: string
          organizer_amount?: number
          platform_fee_amount?: number
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          ticket_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      scan_attempts: {
        Row: {
          created_at: string
          event_id: string
          id: string
          result: string
          scanned_by: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          result: string
          scanned_by: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          result?: string
          scanned_by?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_attempts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_attempts_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_attempts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          id: string
          type: string
        }
        Insert: {
          created_at?: string
          id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          created_at: string
          event_id: string
          id: string
          max_per_buyer: number
          name: string
          price: number
          quantity_sold: number
          quantity_total: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          max_per_buyer?: number
          name: string
          price?: number
          quantity_sold?: number
          quantity_total: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          max_per_buyer?: number
          name?: string
          price?: number
          quantity_sold?: number
          quantity_total?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          encrypted_token: string | null
          event_id: string
          id: string
          order_id: string
          owner_id: string
          secure_token_hash: string
          serial: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          encrypted_token?: string | null
          event_id: string
          id?: string
          order_id: string
          owner_id: string
          secure_token_hash: string
          serial: string
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          encrypted_token?: string | null
          event_id?: string
          id?: string
          order_id?: string
          owner_id?: string
          secure_token_hash?: string
          serial?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_series: {
        Row: {
          address: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city: string
          close_time: string | null
          cover_image_url: string | null
          cover_price: number
          created_at: string
          description: string
          id: string
          min_age: number | null
          open_time: string
          open_weekdays: number[]
          organizer_id: string
          rules: Json
          status: string
          timezone: string
          title: string
          updated_at: string
          venue_name: string
        }
        Insert: {
          address?: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city?: string
          close_time?: string | null
          cover_image_url?: string | null
          cover_price?: number
          created_at?: string
          description?: string
          id?: string
          min_age?: number | null
          open_time?: string
          open_weekdays: number[]
          organizer_id: string
          rules?: Json
          status?: string
          timezone?: string
          title: string
          updated_at?: string
          venue_name?: string
        }
        Update: {
          address?: string
          capacity?: number
          category?: Database["public"]["Enums"]["event_category"]
          city?: string
          close_time?: string | null
          cover_image_url?: string | null
          cover_price?: number
          created_at?: string
          description?: string
          id?: string
          min_age?: number | null
          open_time?: string
          open_weekdays?: number[]
          organizer_id?: string
          rules?: Json
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_series_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_force_ticket_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["ticket_status"]
          p_reason: string
          p_ticket_id: string
        }
        Returns: {
          created_at: string
          encrypted_token: string | null
          event_id: string
          id: string
          order_id: string
          owner_id: string
          secure_token_hash: string
          serial: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id: string
          updated_at: string
          used_at: string | null
        }
      }
      admin_pause_organizer_events: {
        Args: { p_organizer_id: string }
        Returns: {
          address: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city: string
          cover_image_url: string | null
          created_at: string
          description: string
          ends_at: string | null
          id: string
          min_age: number | null
          organizer_id: string
          rules: Json
          series_id: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string
          venue_name: string
        }[]
      }
      admin_set_event_status: {
        Args: {
          p_event_id: string
          p_new_status: Database["public"]["Enums"]["event_status"]
        }
        Returns: {
          address: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city: string
          cover_image_url: string | null
          created_at: string
          description: string
          ends_at: string | null
          id: string
          min_age: number | null
          organizer_id: string
          rules: Json
          series_id: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string
          venue_name: string
        }
      }
      admin_set_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
      }
      apply_order_dispute: {
        Args: {
          p_amount: number
          p_order_id: string
          p_stripe_dispute_id: string
        }
        Returns: {
          created_at: string
          encrypted_token: string | null
          event_id: string
          id: string
          order_id: string
          owner_id: string
          secure_token_hash: string
          serial: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id: string
          updated_at: string
          used_at: string | null
        }[]
      }
      apply_ticket_refund: {
        Args: {
          p_amount: number
          p_platform_fee_refunded: number
          p_stripe_refund_id: string
          p_ticket_id: string
        }
        Returns: {
          created_at: string
          encrypted_token: string | null
          event_id: string
          id: string
          order_id: string
          owner_id: string
          secure_token_hash: string
          serial: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id: string
          updated_at: string
          used_at: string | null
        }
      }
      cancel_order: {
        Args: { p_order_id: string }
        Returns: {
          amount_total: number | null
          buyer_id: string
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payout_rail: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount: number | null
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          ticket_type_id: string
          unit_price: number
          updated_at: string
        }
      }
      confirm_order_paid: {
        Args: {
          p_amount_total: number
          p_application_fee_amount: number
          p_order_id: string
          p_stripe_charge_id: string
          p_stripe_payment_intent_id: string
        }
        Returns: {
          serial: string
          ticket_id: string
        }[]
      }
      generate_venue_series_events: {
        Args: { p_days_ahead?: number; p_series_id: string }
        Returns: {
          address: string
          capacity: number
          category: Database["public"]["Enums"]["event_category"]
          city: string
          cover_image_url: string | null
          created_at: string
          description: string
          ends_at: string | null
          id: string
          min_age: number | null
          organizer_id: string
          rules: Json
          series_id: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string
          venue_name: string
        }[]
      }
      get_refundable_ticket: {
        Args: { p_ticket_id: string }
        Returns: {
          order_id: string
          payout_rail: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount: number
          quantity: number
          stripe_payment_intent_id: string
          ticket_id: string
          unit_price: number
        }[]
      }
      get_ticket_qr_payload: { Args: { p_ticket_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      mark_order_payment_failed: {
        Args: { p_order_id: string }
        Returns: {
          amount_total: number | null
          buyer_id: string
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payout_rail: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount: number | null
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          ticket_type_id: string
          unit_price: number
          updated_at: string
        }
      }
      reserve_tickets: {
        Args: { p_quantity: number; p_ticket_type_id: string }
        Returns: {
          amount_total: number | null
          buyer_id: string
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payout_rail: Database["public"]["Enums"]["payout_method"]
          platform_fee_amount: number | null
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          ticket_type_id: string
          unit_price: number
          updated_at: string
        }
      }
      resolve_staff_invitee: {
        Args: { p_email: string }
        Returns: {
          display_name: string
          user_id: string
        }[]
      }
      respond_staff_invitation: {
        Args: { p_accept: boolean; p_invitation_id: string }
        Returns: {
          created_at: string
          event_id: string | null
          event_title_snapshot: string | null
          id: string
          invited_at: string
          organizer_display_name_snapshot: string
          organizer_id: string
          responded_at: string | null
          staff_display_name_snapshot: string
          staff_user_id: string
          status: Database["public"]["Enums"]["staff_invite_status"]
        }
      }
      scan_ticket: {
        Args: { p_event_id: string; p_raw_token: string }
        Returns: {
          result: string
          serial: string
          ticket_id: string
          ticket_type_name: string
        }[]
      }
      set_ticket_status_by_organizer: {
        Args: {
          p_new_status: Database["public"]["Enums"]["ticket_status"]
          p_ticket_id: string
        }
        Returns: {
          created_at: string
          encrypted_token: string | null
          event_id: string
          id: string
          order_id: string
          owner_id: string
          secure_token_hash: string
          serial: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_type_id: string
          updated_at: string
          used_at: string | null
        }
      }
    }
    Enums: {
      event_category:
        | "musica"
        | "escuelas"
        | "deportes"
        | "teatro"
        | "fiestas"
        | "familia"
        | "gastronomia"
        | "religioso"
        | "comunidad"
        | "otros"
      event_status: "borrador" | "publicado" | "pausado" | "cancelado"
      order_status:
        | "pendiente"
        | "pagado"
        | "expirado"
        | "cancelado"
        | "fallido"
      payout_method: "stripe" | "paypal" | "ath_movil"
      staff_invite_status: "pendiente" | "aceptada" | "rechazada" | "revocada"
      ticket_status:
        | "active"
        | "used"
        | "cancelled"
        | "refunded"
        | "expired"
        | "disputed"
      user_role: "asistente" | "organizador" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      event_category: [
        "musica",
        "escuelas",
        "deportes",
        "teatro",
        "fiestas",
        "familia",
        "gastronomia",
        "religioso",
        "comunidad",
        "otros",
      ],
      event_status: ["borrador", "publicado", "pausado", "cancelado"],
      order_status: ["pendiente", "pagado", "expirado", "cancelado", "fallido"],
      payout_method: ["stripe", "paypal", "ath_movil"],
      staff_invite_status: ["pendiente", "aceptada", "rechazada", "revocada"],
      ticket_status: [
        "active",
        "used",
        "cancelled",
        "refunded",
        "expired",
        "disputed",
      ],
      user_role: ["asistente", "organizador", "admin"],
    },
  },
} as const
