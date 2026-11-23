import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { bookingRequestSchema } from "../src/lib/booking-schema";
import { createBooking } from "../src/services/booking.service";
import type { Database } from "../src/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error("Missing env vars. Run with --env-file=.env.local");
}

const supabase = createClient<Database>(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MTAANI_SOUND = "00000000-0000-4000-8000-000000000001";
const CHOMA_CATERING = "00000000-0000-4000-8000-000000000003";

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function makeRequest(overrides: Record<string, unknown> = {}) {
  return bookingRequestSchema.parse({
    venueSlug: "karen-rose-garden",
    clientName: "Test Client",
    clientPhone: "0712 345 678",
    eventDate: daysFromNow(30),
    guestCount: 40,
    eventType: "Birthday",
    selection: {},
    ...overrides,
  });
}

async function test(name: string, run: () => Promise<void>) {
  try {
    await run();
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.log(`FAIL - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function main() {
  await test("valid booking saves totals, margin, add-ons and dispatch logs", async () => {
    const result = await createBooking(
      supabase,
      makeRequest({
        selection: {
          sound: { fulfillment: "platform_vendor", vendorId: MTAANI_SOUND },
          catering: { fulfillment: "platform_vendor", vendorId: CHOMA_CATERING },
          photo: { fulfillment: "bring_your_own" },
        },
      }),
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;

    try {
      assert.match(result.referenceCode, /^GRD-\d+$/);
      assert.equal(result.totalClientKes, 69000);

      const booking = await supabase
        .from("bookings")
        .select("client_phone, total_internal_cost_kes, estimated_margin_kes")
        .eq("id", result.bookingId)
        .single();
      assert.equal(booking.data?.client_phone, "+254712345678");
      assert.equal(booking.data?.total_internal_cost_kes, 61500);
      assert.equal(booking.data?.estimated_margin_kes, 7500);

      const addons = await supabase
        .from("booking_addons")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", result.bookingId);
      assert.equal(addons.count, 3);

      const logs = await supabase
        .from("dispatch_logs")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", result.bookingId);
      assert.equal(logs.count, 4);
    } finally {
      await supabase.from("bookings").delete().eq("id", result.bookingId);
    }
  });

  await test("too many guests is rejected", async () => {
    const result = await createBooking(supabase, makeRequest({ guestCount: 200 }));
    assert.equal(result.ok, false);
  });

  await test("a past date is rejected", async () => {
    const result = await createBooking(
      supabase,
      makeRequest({ eventDate: "2020-01-01" }),
    );
    assert.equal(result.ok, false);
  });

  await test("a tampered choice is rejected", async () => {
    const result = await createBooking(
      supabase,
      makeRequest({
        venueSlug: "kiambu-road-lawn",
        selection: { sound: { fulfillment: "bring_your_own" } },
      }),
    );
    assert.equal(result.ok, false);
  });

  await test("a bad phone number fails validation", async () => {
    const parsed = bookingRequestSchema.safeParse({
      venueSlug: "karen-rose-garden",
      clientName: "Test Client",
      clientPhone: "12345",
      eventDate: daysFromNow(30),
      guestCount: 40,
      eventType: "Birthday",
      selection: {},
    });
    assert.equal(parsed.success, false);
  });
}

main();