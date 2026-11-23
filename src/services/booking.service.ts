import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRequest } from "@/lib/booking-schema";
import {
  ADDON_CATEGORIES,
  ADDON_LABELS,
  getAddonOptions,
  isSameChoice,
} from "@/lib/pricing";
import {
  dispatchMessages,
  type DispatchMessage,
} from "@/services/dispatch.service";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;
type VenueRow = Database["public"]["Tables"]["venues"]["Row"];
type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
type AddonInsert = Database["public"]["Tables"]["booking_addons"]["Insert"];
type AddonDraft = Omit<AddonInsert, "booking_id">;

export type CreateBookingResult =
  | {
      ok: true;
      bookingId: string;
      referenceCode: string;
      totalClientKes: number;
      hasSeparatelyPricedItems: boolean;
    }
  | { ok: false; error: string };

function todayInNairobi(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
}

function sumOf(
  drafts: readonly AddonDraft[],
  field: "client_price_kes" | "partner_cost_kes",
): number {
  return drafts.reduce((sum, draft) => sum + (draft[field] ?? 0), 0);
}

function buildMessages(
  request: BookingRequest,
  venue: VenueRow,
  referenceCode: string,
  drafts: readonly AddonDraft[],
  vendors: readonly VendorRow[],
): DispatchMessage[] {
  const messages: DispatchMessage[] = [
    {
      recipientType: "client",
      to: request.clientPhone,
      body: `Hi ${request.clientName}, we received your request ${referenceCode} for ${venue.title} on ${request.eventDate}. We will confirm availability and send your quote shortly.`,
    },
  ];

  if (venue.owner_private_phone) {
    messages.push({
      recipientType: "venue_owner",
      to: venue.owner_private_phone,
      body: `New inquiry ${referenceCode}: ${request.eventType}, ${request.guestCount} guests on ${request.eventDate}. Please confirm availability.`,
    });
  }

  for (const draft of drafts) {
    if (draft.fulfillment_type !== "platform_vendor") continue;
    const vendor = vendors.find((v) => v.id === draft.vendor_id);
    if (!vendor?.private_phone) continue;
    messages.push({
      recipientType: "vendor",
      to: vendor.private_phone,
      body: `New job ${referenceCode}: ${draft.category} at ${venue.title} (${venue.area}) on ${request.eventDate}, ${request.guestCount} guests.`,
    });
  }

  return messages;
}

export async function createBooking(
  supabase: Supabase,
  request: BookingRequest,
): Promise<CreateBookingResult> {
  const venueResult = await supabase
    .from("venues")
    .select("*")
    .eq("slug", request.venueSlug)
    .eq("status", "active")
    .maybeSingle();
  if (venueResult.error) {
    throw new Error(`Failed to load venue: ${venueResult.error.message}`);
  }
  const venue = venueResult.data;
  if (!venue) {
    return { ok: false, error: "That venue is no longer available." };
  }

  if (request.eventDate <= todayInNairobi()) {
    return { ok: false, error: "Choose a date after today." };
  }
  if (request.guestCount > venue.capacity_max) {
    return {
      ok: false,
      error: `This venue holds up to ${venue.capacity_max} guests.`,
    };
  }

  const vendorsResult = await supabase
    .from("vendors")
    .select("*")
    .eq("status", "active")
    .contains("area_coverage", [venue.area]);
  if (vendorsResult.error) {
    throw new Error(`Failed to load vendors: ${vendorsResult.error.message}`);
  }
  const vendors = vendorsResult.data;

  const drafts: AddonDraft[] = [];

  for (const category of ADDON_CATEGORIES) {
    const choice = request.selection[category];
    if (!choice) continue;

    const allowed = getAddonOptions(venue, category, vendors).some((option) =>
      isSameChoice(choice, option.choice),
    );
    if (!allowed) {
      return {
        ok: false,
        error: `That ${ADDON_LABELS[category]} choice is not available for this venue.`,
      };
    }

    switch (choice.fulfillment) {
      case "platform_vendor": {
        const vendor = vendors.find((v) => v.id === choice.vendorId);
        if (!vendor) {
          return { ok: false, error: "That vendor is no longer available." };
        }
        drafts.push({
          category,
          fulfillment_type: "platform_vendor",
          vendor_id: vendor.id,
          client_price_kes: vendor.client_price_kes,
          partner_cost_kes: vendor.partner_cost_kes,
        });
        break;
      }
      case "venue_included":
        drafts.push({
          category,
          fulfillment_type: "venue_included",
          vendor_id: null,
          client_price_kes: 0,
          partner_cost_kes: 0,
        });
        break;
      case "bring_your_own":
        drafts.push({
          category,
          fulfillment_type: "bring_your_own",
          vendor_id: null,
          client_price_kes: 0,
          partner_cost_kes: 0,
        });
        break;
    }
  }

  // Business assumption: the venue's base price passes to the owner at cost,
  // so our margin comes only from the vendor markup.
  const totalClientKes = venue.base_price_kes + sumOf(drafts, "client_price_kes");
  const totalInternalCostKes =
    venue.base_price_kes + sumOf(drafts, "partner_cost_kes");

  const bookingResult = await supabase
    .from("bookings")
    .insert({
      venue_id: venue.id,
      client_name: request.clientName,
      client_phone: request.clientPhone,
      event_date: request.eventDate,
      guest_count: request.guestCount,
      event_type: request.eventType,
      total_client_kes: totalClientKes,
      total_internal_cost_kes: totalInternalCostKes,
    })
    .select("id, reference_code")
    .single();
  if (bookingResult.error) {
    throw new Error(`Failed to create booking: ${bookingResult.error.message}`);
  }
  const booking = bookingResult.data;

  if (drafts.length > 0) {
    const addonsResult = await supabase
      .from("booking_addons")
      .insert(drafts.map((draft) => ({ ...draft, booking_id: booking.id })));
    if (addonsResult.error) {
      await supabase.from("bookings").delete().eq("id", booking.id);
      throw new Error(`Failed to save add-ons: ${addonsResult.error.message}`);
    }
  }

  try {
    await dispatchMessages(
      supabase,
      booking.id,
      buildMessages(request, venue, booking.reference_code, drafts, vendors),
    );
  } catch (error) {
    console.error("Dispatch failed for booking", booking.reference_code, error);
  }

  return {
    ok: true,
    bookingId: booking.id,
    referenceCode: booking.reference_code,
    totalClientKes,
    hasSeparatelyPricedItems: drafts.some(
      (draft) => draft.fulfillment_type === "venue_included",
    ),
  };
}