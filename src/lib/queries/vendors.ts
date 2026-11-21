import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

const VENDOR_COLUMNS =
  "id, name, description, category, area_coverage, client_price_kes, portfolio_images" as const;

export async function getVendorsForArea(area: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("vendors");

  const { data, error } = await createPublicClient()
    .from("vendors")
    .select(VENDOR_COLUMNS)
    .eq("status", "active")
    .contains("area_coverage", [area])
    .order("client_price_kes", { ascending: true });

  if (error) {
    throw new Error(`Failed to load vendors: ${error.message}`);
  }
  return data;
}

export type PublicVendor = Awaited<ReturnType<typeof getVendorsForArea>>[number];