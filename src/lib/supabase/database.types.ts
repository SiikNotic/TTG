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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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
      user_role: "asistente" | "organizador" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
