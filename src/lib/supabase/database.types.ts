/**
 * Supabase database types — manually maintained.
 * Tables: games, user_profiles, game_likes, play_sessions
 * See supabase-migration.sql for the full schema DDL.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: number;
          slug: string;
          title: string;
          subject: string;
          description: string;
          long_description: string[];
          link: string;
          thumbnail: string;
          is_published: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          title: string;
          subject: string;
          description: string;
          long_description: string[];
          link: string;
          thumbnail: string;
          is_published?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          title?: string;
          subject?: string;
          description?: string;
          long_description?: string[];
          link?: string;
          thumbnail?: string;
          is_published?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          locale: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          locale?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          locale?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_likes: {
        Row: {
          id: number;
          user_id: string;
          game_slug: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_slug: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      play_sessions: {
        Row: {
          id: number;
          user_id: string;
          game_slug: string;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_slug: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_slug?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
        };
        Relationships: [];
      };
      game_data: {
        Row: {
          id: number;
          user_id: string;
          game_id: number;
          data_json: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_id: number;
          data_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_id?: number;
          data_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
