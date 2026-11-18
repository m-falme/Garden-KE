import "server-only"
import { createClient } from "@supabase/supabase-js";
import { getSecretKey, publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createAdminClient(){
    return createClient<Database>(publicEnv.supabaseUrl, getSecretKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}