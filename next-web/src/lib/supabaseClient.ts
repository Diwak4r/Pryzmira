import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Server-side client. Uses the service role key when available (cron/admin routes), else the anon key. */
export function getServerSupabase(): SupabaseClient | null {
    if (!isSupabaseConfigured()) return null;

    if (!serverClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
        serverClient = createClient(url, key, { auth: { persistSession: false } });
    }

    return serverClient;
}

/** Browser client, anon key only. */
export function getBrowserSupabase(): SupabaseClient | null {
    if (!isSupabaseConfigured()) return null;

    if (!browserClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
        browserClient = createClient(url, key, { auth: { persistSession: false } });
    }

    return browserClient;
}
