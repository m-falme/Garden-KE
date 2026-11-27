import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { bookingRequestSchema } from "../src/lib/booking-schema";
import { canTransition } from "../src/lib/booking-status";
import { calculateDepositKes } from "../src/lib/deposit";
import { createBooking } from "../src/services/booking.service";
import {
  advanceBooking,
  buildPipelineMessages,
  type PipelineContext,
} from "../src/services/pipeline.service";
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

const context: PipelineContext = {
  referenceCode: "GRD-999",
  clientName: "Amina Test",
  clientPhone: "+254712345678",
  venueTitle: "Karen Rose Garden",
  venueOwnerPhone: "+254700000101",
  vendorPhones: ["+254700000201", "+254700000203"],
  eventDate: "2027-01-15",
  guestCount: 40,
  totalKes: 69000,
  depositKes: 20700,
};

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function makeRequest() {
  return bookingRequestSchema.parse({
    venueSlug: "karen-rose-garden",
    clientName: "Test Client",
    clientPhone: "0712 345 678",
    eventDate: daysFromNow(30),
    guestCount: 40,
    eventType: "Birthday",
    selection: {
      sound: { fulfillment: "platform_vendor", vendorId: MTAANI_SOUND },
      catering: { fulfillment: "platform_vendor", vendorId: CHOMA_CATERING },
      photo: { fulfillment: "bring_your_own" },
    },
  });
}

async function test(name: string, run: () => void | Promise<void>) {
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
  await test("only legal status moves are allowed", () => {
    assert.equal(canTransition("inquiry", "quoting"), true);
    assert.equal(canTransition("inquiry", "confirmed"), false);
    assert.equal(canTransition("confirmed", "cancelled"), true);
    assert.equal(canTransition("cancelled", "inquiry"), false);
  });

  await test("deposit is 30 percent rounded up to the next KES 100", () => {
    assert.equal(calculateDepositKes(69000), 20700);
    assert.equal(calculateDepositKes(35001), 10600);
    assert.equal(calculateDepositKes(0), 0);
  });

  await test("venue and vendor messages never contain client details", () => {
    const messages = buildPipelineMessages("confirmed", context);
    assert.equal(messages.length, 4);
    for (const message of messages) {
      if (message.recipientType === "client") continue;
      assert.equal(message.body.includes(context.clientName), false);
      assert.equal(message.body.includes(context.clientPhone), false);
    }
  });

  await test("a booking moves through the whole pipeline", async () => {
    const created = await createBooking(supabase, makeRequest());
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const id = created.bookingId;

    try {
      const skipped = await advanceBooking(supabase, id, "confirmed");
      assert.equal(skipped.ok, false);

      assert.equal((await advanceBooking(supabase, id, "quoting")).ok, true);
      const quoted = await supabase
        .from("bookings")
        .select("deposit_kes")
        .eq("id", id)
        .single();
      assert.equal(quoted.data?.deposit_kes, 20700);

      assert.equal((await advanceBooking(supabase, id, "deposit_paid")).ok, true);
      const paid = await supabase
        .from("bookings")
        .select("payment_reference")
        .eq("id", id)
        .single();
      assert.match(paid.data?.payment_reference ?? "", /^SIM-GRD-/);

      assert.equal((await advanceBooking(supabase, id, "confirmed")).ok, true);

      const backwards = await advanceBooking(supabase, id, "quoting");
      assert.equal(backwards.ok, false);

      const race = await Promise.all([
        advanceBooking(supabase, id, "cancelled"),
        advanceBooking(supabase, id, "cancelled"),
      ]);
      assert.equal(race.filter((result) => result.ok).length, 1);

      const logs = await supabase
        .from("dispatch_logs")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", id);
      assert.equal(logs.count, 14);
    } finally {
      await supabase.from("bookings").delete().eq("id", id);
    }
  });
}

main();