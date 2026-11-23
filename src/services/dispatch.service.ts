import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DispatchMessage = {
  recipientType: Database["public"]["Enums"]["recipient_type"];
  to: string;
  body: string;
};

export async function dispatchMessages(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  messages: readonly DispatchMessage[],
): Promise<void> {
  if (messages.length === 0) return;

  const { error } = await supabase.from("dispatch_logs").insert(
    messages.map((message) => ({
      booking_id: bookingId,
      recipient_type: message.recipientType,
      channel: "simulated_whatsapp" as const,
      message_payload: { to: message.to, body: message.body },
    })),
  );

  if (error) {
    throw new Error(`Failed to log dispatch: ${error.message}`);
  }
}