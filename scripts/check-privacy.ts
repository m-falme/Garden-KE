import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Missing env vars. Run with --env-file=.env.local");
}

const supabase = createClient<Database>(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Result = { error: { message: string } | null };

function report(label: string, shouldSucceed: boolean, result: Result): boolean {
  const succeeded = result.error === null;
  const pass = succeeded === shouldSucceed;
  const detail = result.error ? ` (${result.error.message})` : "";
  console.log(`${pass ? "PASS" : "FAIL"} - ${label}${detail}`);
  return pass;
}

async function main() {
  const results = [
    report(
      "public can read venue public columns",
      true,
      await supabase.from("venues").select("title, area, base_price_kes"),
    ),
    report(
      "public cannot read owner_private_phone",
      false,
      await supabase.from("venues").select("owner_private_phone"),
    ),
    report(
      "public can read vendor client price",
      true,
      await supabase.from("vendors").select("name, client_price_kes"),
    ),
    report(
      "public cannot read partner_cost_kes",
      false,
      await supabase.from("vendors").select("partner_cost_kes"),
    ),
    report(
      "public cannot read vendor private_phone",
      false,
      await supabase.from("vendors").select("private_phone"),
    ),
    report(
      "public cannot read bookings",
      false,
      await supabase.from("bookings").select("id"),
    ),
    report(
      "public cannot create bookings",
      false,
      await supabase.from("bookings").insert({
        venue_id: "00000000-0000-4000-8000-000000000000",
        client_name: "Test",
        client_phone: "+254700000000",
        event_date: "2027-01-01",
        guest_count: 10,
        event_type: "test",
      }),
    ),
  ];

  if (results.some((pass) => !pass)) {
    process.exit(1);
  }
  console.log("All privacy checks passed.");
}

main();