import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { Database } from "@/types/database";

export function createPublicClient(){
    return createClient<Database>(
        publicEnv.supabaseUrl,
        publicEnv.supabasePublishableKey,
        { auth: { persistSession: false, autoRefreshToken: false } },
    );
}