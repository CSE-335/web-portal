/**
 * Supabase database types.
 * Generate with: npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/database.types.ts
 * Or define your tables here for type-safe queries.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];


  //In Progress...
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
          bio?: string | null;
          locale?: string | null;
          metadata?: Json;
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
