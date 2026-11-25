"use server";

import { z } from "zod";
import { bookingRequestSchema } from "@/lib/booking-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBooking } from "@/services/booking.service";

export type SubmitBookingResult =
  | { ok: true; bookingId: string }
  | {
      ok: false;
      error: string;
      fieldErrors: Partial<Record<string, string[]>>;
    };

export async function submitBookingRequest(
  input: unknown,
): Promise<SubmitBookingResult> {
  const parsed = bookingRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const result = await createBooking(createAdminClient(), parsed.data);

  if (!result.ok) {
    return { ok: false, error: result.error, fieldErrors: {} };
  }

  return { ok: true, bookingId: result.bookingId };
}