export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      events: {
        Row: {
          address: string;
          capacity: number;
          category: Database["public"]["Enums"]["event_category"];
          city: string;
          cover_image_url: string | null;
          created_at: string;
          description: string;
          ends_at: string | null;
          id: string;
          min_age: number | null;
          organizer_id: string;
          rules: Json;
          slug: string;
          starts_at: string;
          status: Database["public"]["Enums"]["event_status"];
          timezone: string;
          title: string;
          updated_at: string;
          venue_name: string;
        };
        Insert: {
          address?: string;
          capacity: number;
          category: Database["public"]["Enums"]["event_category"];
          city?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          ends_at?: string | null;
          id?: string;
          min_age?: number | null;
          organizer_id: string;
          rules?: Json;
          slug: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["event_status"];
          timezone?: string;
          title: string;
          updated_at?: string;
          venue_name?: string;
        };
        Update: {
          address?: string;
          capacity?: number;
          category?: Database["public"]["Enums"]["event_category"];
          city?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          ends_at?: string | null;
          id?: string;
          min_age?: number | null;
          organizer_id?: string;
          rules?: Json;
          slug?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["event_status"];
          timezone?: string;
          title?: string;
          updated_at?: string;
          venue_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          buyer_id: string;
          created_at: string;
          event_id: string;
          expires_at: string | null;
          id: string;
          quantity: number;
          status: Database["public"]["Enums"]["order_status"];
          ticket_type_id: string;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          event_id: string;
          expires_at?: string | null;
          id?: string;
          quantity: number;
          status?: Database["public"]["Enums"]["order_status"];
          ticket_type_id: string;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          event_id?: string;
          expires_at?: string | null;
          id?: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["order_status"];
          ticket_type_id?: string;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_ticket_type_id_fkey";
            columns: ["ticket_type_id"];
            isOneToOne: false;
            referencedRelation: "ticket_types";
            referencedColumns: ["id"];
          },
        ];
      };
      organizer_profiles: {
        Row: {
          bio: string;
          created_at: string;
          display_name: string | null;
          id: string;
          logo_url: string | null;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          bio?: string;
          created_at?: string;
          display_name?: string | null;
          id: string;
          logo_url?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          bio?: string;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          logo_url?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizer_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_types: {
        Row: {
          created_at: string;
          event_id: string;
          id: string;
          max_per_buyer: number;
          name: string;
          price: number;
          quantity_sold: number;
          quantity_total: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          id?: string;
          max_per_buyer?: number;
          name: string;
          price?: number;
          quantity_sold?: number;
          quantity_total: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          id?: string;
          max_per_buyer?: number;
          name?: string;
          price?: number;
          quantity_sold?: number;
          quantity_total?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          created_at: string;
          encrypted_token: string | null;
          event_id: string;
          id: string;
          order_id: string;
          owner_id: string;
          secure_token_hash: string;
          serial: string;
          status: Database["public"]["Enums"]["ticket_status"];
          ticket_type_id: string;
          updated_at: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          encrypted_token?: string | null;
          event_id: string;
          id?: string;
          order_id: string;
          owner_id: string;
          secure_token_hash: string;
          serial: string;
          status?: Database["public"]["Enums"]["ticket_status"];
          ticket_type_id: string;
          updated_at?: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          encrypted_token?: string | null;
          event_id?: string;
          id?: string;
          order_id?: string;
          owner_id?: string;
          secure_token_hash?: string;
          serial?: string;
          status?: Database["public"]["Enums"]["ticket_status"];
          ticket_type_id?: string;
          updated_at?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey";
            columns: ["ticket_type_id"];
            isOneToOne: false;
            referencedRelation: "ticket_types";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_order: {
        Args: { p_order_id: string };
        Returns: {
          buyer_id: string;
          created_at: string;
          event_id: string;
          expires_at: string | null;
          id: string;
          quantity: number;
          status: Database["public"]["Enums"]["order_status"];
          ticket_type_id: string;
          unit_price: number;
          updated_at: string;
        };
      };
      check_ticket_token: {
        Args: { p_raw_token: string };
        Returns: {
          created_at: string;
          encrypted_token: string | null;
          event_id: string;
          id: string;
          order_id: string;
          owner_id: string;
          secure_token_hash: string;
          serial: string;
          status: Database["public"]["Enums"]["ticket_status"];
          ticket_type_id: string;
          updated_at: string;
          used_at: string | null;
        };
      };
      confirm_order: {
        Args: { p_order_id: string };
        Returns: {
          raw_token: string;
          serial: string;
          ticket_id: string;
        }[];
      };
      get_ticket_qr_payload: {
        Args: { p_ticket_id: string };
        Returns: string;
      };
      reserve_tickets: {
        Args: { p_quantity: number; p_ticket_type_id: string };
        Returns: {
          buyer_id: string;
          created_at: string;
          event_id: string;
          expires_at: string | null;
          id: string;
          quantity: number;
          status: Database["public"]["Enums"]["order_status"];
          ticket_type_id: string;
          unit_price: number;
          updated_at: string;
        };
      };
      set_ticket_status_by_organizer: {
        Args: {
          p_new_status: Database["public"]["Enums"]["ticket_status"];
          p_ticket_id: string;
        };
        Returns: {
          created_at: string;
          encrypted_token: string | null;
          event_id: string;
          id: string;
          order_id: string;
          owner_id: string;
          secure_token_hash: string;
          serial: string;
          status: Database["public"]["Enums"]["ticket_status"];
          ticket_type_id: string;
          updated_at: string;
          used_at: string | null;
        };
      };
    };
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
        | "otros";
      event_status: "borrador" | "publicado" | "pausado" | "cancelado";
      order_status: "pendiente" | "pagado" | "expirado" | "cancelado";
      ticket_status: "active" | "used" | "cancelled" | "refunded" | "expired";
      user_role: "asistente" | "organizador" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
