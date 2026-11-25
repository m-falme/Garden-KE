import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getBookingSummary(id: string) {
    const { data, error } = await createAdminClient()
        .from("bookings")
        .select(
            "reference_code, event_date, guest_count, event_type, total_client_kes, venues(title, area), booking_addons(category, fulfillment_type, vendors(name))",
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to load booking: ${error.message}`);
    }    
    return data;
}