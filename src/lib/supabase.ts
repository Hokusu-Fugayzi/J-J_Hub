import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Only create client if configured; otherwise data.ts returns empty arrays
export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseKey)
	: null;
