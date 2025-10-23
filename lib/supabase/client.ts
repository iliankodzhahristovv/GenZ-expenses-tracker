import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in the browser
 * This client should be used in client components
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

