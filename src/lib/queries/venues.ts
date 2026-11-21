import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

const VENUE_COLUMNS =
  "id, slug, title, description, space_type, area, capacity_max, base_price_kes, includes_tents, includes_chairs, in_house_catering, allows_outside_vendors, images" as const;

export async function getActiveVenues() {
  "use cache";
  cacheLife("hours");
  cacheTag("venues");

  const { data, error } = await createPublicClient()
    .from("venues")
    .select(VENUE_COLUMNS)
    .eq("status", "active")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to load venues: ${error.message}`);
  }
  return data;
}

export type PublicVenue = Awaited<ReturnType<typeof getActiveVenues>>[number];

export async function getActiveVenueSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("venues");

  const { data, error } = await createPublicClient()
    .from("venues")
    .select("slug")
    .eq("status", "active");

  if (error) {
    throw new Error(`Failed to load venue slugs: ${error.message}`);
  }  
  return data;
}  

export async function getVenueBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("venues", `venue:${slug}`);

  const { data, error } = await createPublicClient()
    .from("venues")
    .select(VENUE_COLUMNS)
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();


  if (error) {
    throw new Error(`Failed to load venue: ${error.message}`);
  } 
  return data;
}