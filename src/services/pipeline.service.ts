import type { SupabaseClient } from "@supabase/supabase-js";
import {
  STATUS_LABELS,
  canTransition,
  type BookingStatus,
} from "@/lib/booking-status";
import { calculateDepositKes } from "@/lib/deposit";
import { formatKes } from "@/lib/pricing";
import {
  dispatchMessages,
  type DispatchMessage,
} from "@/services/dispatch.service";
import {
  simulatedPaymentProvider,
  type PaymentProvider,
} from "@/services/payment.service";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;
type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

export type TransitionResult =
  | { ok: true; status: BookingStatus }
  | { ok: false; error: string };

export type PipelineContext = {
  referenceCode: string;
  clientName: string;
  clientPhone: string;
  venueTitle: string;
  venueOwnerPhone: string | null;
  vendorPhones: string[];
  eventDate: string;
  guestCount: number;
  totalKes: number;
  depositKes: number;
};

function withRecipients(
  context: PipelineContext,
  clientBody: string,
  venueBody: string,
  vendorBody: string,
): DispatchMessage[] {
  const messages: DispatchMessage[] = [
    { recipientType: "client", to: context.clientPhone, body: clientBody },
  ];
  if (context.venueOwnerPhone) {
    messages.push({
      recipientType: "venue_owner",
      to: context.venueOwnerPhone,
      body: venueBody,
    });
  }
  for (const phone of context.vendorPhones) {
    messages.push({ recipientType: "vendor", to: phone, body: vendorBody });
  }
  return messages;
}

export function buildPipelineMessages(
  to: BookingStatus,
  context: PipelineContext,
): DispatchMessage[] {
  const ref = context.referenceCode;
  const name = context.clientName;
  const venue = context.venueTitle;
  const date = context.eventDate;

  switch (to) {
    case "inquiry":
      return [];
    case "quoting":
      return [
        {
          recipientType: "client",
          to: context.clientPhone,
          body: `Hi ${name}, your quote for ${ref} at ${venue} on ${date} is ${formatKes(context.totalKes)}. A deposit of ${formatKes(context.depositKes)} secures your date.`,
        },
      ];
    case "deposit_paid":
      return [
        {
          recipientType: "client",
          to: context.clientPhone,
          body: `Thank you ${name}. We received your deposit of ${formatKes(context.depositKes)} for ${ref}. We are confirming everything with the venue and your crew.`,
        },
      ];
    case "confirmed":
      return withRecipients(
        context,
        `Great news ${name}, your booking ${ref} at ${venue} on ${date} is confirmed.`,
        `Booking ${ref} is confirmed: ${context.guestCount} guests on ${date}.`,
        `Job ${ref} is confirmed for ${date}, ${context.guestCount} guests.`,
      );
    case "cancelled":
      return withRecipients(
        context,
        `Hi ${name}, your request ${ref} has been cancelled. Contact us if this is a mistake.`,
        `Booking ${ref} on ${date} has been cancelled.`,
        `Job ${ref} on ${date} has been cancelled.`,
      );
  }
}

export async function advanceBooking(
  supabase: Supabase,
  bookingId: string,
  to: BookingStatus,
  payments: PaymentProvider = simulatedPaymentProvider,
): Promise<TransitionResult> {
  const bookingResult = await supabase
    .from("bookings")
    .select(
      "id, status, reference_code, client_name, client_phone, event_date, guest_count, total_client_kes, deposit_kes, venues(title, owner_private_phone), booking_addons(vendors(private_phone))",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (bookingResult.error) {
    throw new Error(`Failed to load booking: ${bookingResult.error.message}`);
  }
  const booking = bookingResult.data;
  if (!booking) {
    return { ok: false, error: "Booking not found." };
  }

  const from = booking.status;
  if (!canTransition(from, to)) {
    return {
      ok: false,
      error: `A ${STATUS_LABELS[from]} booking cannot move to ${STATUS_LABELS[to]}.`,
    };
  }

  let depositKes =
    booking.deposit_kes ?? calculateDepositKes(booking.total_client_kes);
  if (to === "quoting") {
    depositKes = calculateDepositKes(booking.total_client_kes);
  }

  const updates: BookingUpdate = { status: to };
  if (to === "quoting") {
    updates.deposit_kes = depositKes;
  }
  if (to === "deposit_paid") {
    const payment = await payments.requestDeposit({
      bookingId,
      phone: booking.client_phone,
      amountKes: depositKes,
      reference: booking.reference_code,
    });
    if (!payment.ok) {
      return { ok: false, error: `Deposit request failed: ${payment.error}` };
    }
    updates.payment_reference = payment.providerReference;
  }

  const updateResult = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("status", from)
    .select("id");
  if (updateResult.error) {
    throw new Error(`Failed to update booking: ${updateResult.error.message}`);
  }
  if (updateResult.data.length === 0) {
    return {
      ok: false,
      error: "This booking was changed by someone else. Refresh and try again.",
    };
  }

  const vendorPhones: string[] = [];
  for (const addon of booking.booking_addons) {
    if (addon.vendors?.private_phone) {
      vendorPhones.push(addon.vendors.private_phone);
    }
  }

  try {
    await dispatchMessages(
      supabase,
      bookingId,
      buildPipelineMessages(to, {
        referenceCode: booking.reference_code,
        clientName: booking.client_name,
        clientPhone: booking.client_phone,
        venueTitle: booking.venues.title,
        venueOwnerPhone: booking.venues.owner_private_phone,
        vendorPhones,
        eventDate: booking.event_date,
        guestCount: booking.guest_count,
        totalKes: booking.total_client_kes,
        depositKes,
      }),
    );
  } catch (error) {
    console.error("Dispatch failed for booking", booking.reference_code, error);
  }

  return { ok: true, status: to };
}