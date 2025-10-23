/**
 * Supabase Database Types
 * 
 * This file should be auto-generated using:
 *   pnpm supabase:types
 * 
 * To generate entity types from this file, run:
 *   pnpm generate:types
 * 
 * Make sure Supabase is running first:
 *   pnpm supabase:start
 */

// Placeholder - will be replaced when you run supabase:types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tables will be generated here after running migrations
      // Run: pnpm supabase:reset
      // Then: pnpm generate:types
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

