import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createSessionClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        publicEnv.supabaseUrl,
        publicEnv.supabasePublishableKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // Server Components can't set cookies. The proxy refreshes them.
                    }
                },
            },
        },
    );
}