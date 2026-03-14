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

export interface Database {
  public: {
    Tables: {
      // Add your table types here, e.g.:
      // games: { Row: { id: string; title: string; ... }; Insert: { ... }; Update: { ... } };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
