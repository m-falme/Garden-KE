import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !publishableKey || !secretKey) {
  throw new Error("Missing env vars. Run with --env-file=.env.local");
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };

async function main() {
  const admin = createClient(url!, secretKey!, options);
  const adminResult = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  console.log(
    "Secret key:",
    adminResult.error ? `FAILED - ${adminResult.error.message}` : "OK",
  );

  const publicClient = createClient(url!, publishableKey!, options);
  const publicResult = await publicClient.from("_ping").select("*").limit(1);
  console.log(
    "Publishable key:",
    publicResult.error
      ? `${publicResult.error.code ?? ""} ${publicResult.error.message}`
      : "OK",
  );
}

main();
