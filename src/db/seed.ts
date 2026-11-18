import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
type VendorInsert = Database["public"]["Tables"]["vendors"]["Insert"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error("Missing env vars. Run with --env-file=.env.local");
}

const supabase = createClient<Database>(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const venues: VenueInsert[] = [
  {
    slug: "karen-rose-garden",
    title: "Karen Rose Garden",
    description:
      "A walled rose garden with mature trees and a wide central lawn, suited to graduations, bridal showers and family days.",
    space_type: "garden",
    area: "Karen",
    capacity_max: 80,
    base_price_kes: 35000,
    includes_tents: true,
    includes_chairs: true,
    in_house_catering: "optional",
    allows_outside_vendors: true,
    owner_private_phone: "+254700000101",
    images: [],
    status: "active",
    is_simulated: true,
  },
  {
    slug: "kiambu-road-lawn",
    title: "Kiambu Road Lawn",
    description:
      "A large flat lawn with room for several tents and a dance floor. The venue's own kitchen handles all catering.",
    space_type: "lawn",
    area: "Kiambu Road",
    capacity_max: 100,
    base_price_kes: 45000,
    includes_tents: true,
    includes_chairs: true,
    in_house_catering: "required",
    allows_outside_vendors: false,
    owner_private_phone: "+254700000102",
    images: [],
    status: "active",
    is_simulated: true,
  },
  {
    slug: "runda-backyard",
    title: "Runda Backyard",
    description:
      "A quiet private backyard with a paved patio and a small lawn, good for birthdays and small gatherings.",
    space_type: "backyard",
    area: "Runda",
    capacity_max: 50,
    base_price_kes: 28000,
    includes_tents: false,
    includes_chairs: true,
    in_house_catering: "none",
    allows_outside_vendors: true,
    owner_private_phone: "+254700000103",
    images: [],
    status: "active",
    is_simulated: true,
  },
  {
    slug: "syokimau-courtyard",
    title: "Syokimau Courtyard",
    description:
      "A tiled courtyard with a shaded corner, rented as an empty space so you can set it up your way.",
    space_type: "courtyard",
    area: "Syokimau",
    capacity_max: 40,
    base_price_kes: 18000,
    includes_tents: false,
    includes_chairs: false,
    in_house_catering: "none",
    allows_outside_vendors: true,
    owner_private_phone: "+254700000104",
    images: [],
    status: "active",
    is_simulated: true,
  },
  {
    slug: "lavington-jacaranda-garden",
    title: "Lavington Jacaranda Garden",
    description:
      "A leafy garden under old jacaranda trees, close to town, with a covered veranda for the sound and food tables.",
    space_type: "garden",
    area: "Lavington",
    capacity_max: 60,
    base_price_kes: 32000,
    includes_tents: true,
    includes_chairs: true,
    in_house_catering: "optional",
    allows_outside_vendors: true,
    owner_private_phone: "+254700000105",
    images: [],
    status: "active",
    is_simulated: true,
  },
  {
    slug: "ngong-hills-view-lawn",
    title: "Ngong Hills View Lawn",
    description:
      "An open lawn with views toward the Ngong Hills and plenty of parking, ideal for bigger family fun days.",
    space_type: "lawn",
    area: "Ngong",
    capacity_max: 90,
    base_price_kes: 38000,
    includes_tents: true,
    includes_chairs: true,
    in_house_catering: "none",
    allows_outside_vendors: true,
    owner_private_phone: "+254700000106",
    images: [],
    status: "active",
    is_simulated: true,
  },
];

const vendors: VendorInsert[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Mtaani Sound Co.",
    description:
      "Full PA system, wireless mics and an MC-ready setup for outdoor events up to 100 guests.",
    category: "sound",
    area_coverage: ["Karen", "Lavington", "Runda", "Kiambu Road"],
    partner_cost_kes: 4500,
    client_price_kes: 6000,
    private_phone: "+254700000201",
    portfolio_images: [],
    status: "active",
    is_simulated: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Savannah PA and DJ",
    description:
      "Compact speaker setup with a DJ, suited to birthdays and chama get-togethers.",
    category: "sound",
    area_coverage: ["Syokimau", "Ngong", "Karen"],
    partner_cost_kes: 3500,
    client_price_kes: 5000,
    private_phone: "+254700000202",
    portfolio_images: [],
    status: "active",
    is_simulated: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Choma Masters Catering",
    description:
      "Nyama choma, pilau and sides for 40 to 100 guests, cooked on site.",
    category: "catering",
    area_coverage: [
      "Karen",
      "Kiambu Road",
      "Runda",
      "Syokimau",
      "Lavington",
      "Ngong",
    ],
    partner_cost_kes: 22000,
    client_price_kes: 28000,
    private_phone: "+254700000203",
    portfolio_images: [],
    status: "active",
    is_simulated: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Jiko Fresh Catering",
    description:
      "Buffet-style catering with a mix of Kenyan favourites and a vegetarian menu.",
    category: "catering",
    area_coverage: ["Kiambu Road", "Runda", "Lavington"],
    partner_cost_kes: 18000,
    client_price_kes: 24000,
    private_phone: "+254700000204",
    portfolio_images: [],
    status: "active",
    is_simulated: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    name: "Kuvuma Lens Photography",
    description:
      "Event photography with edited photos delivered online within a few days.",
    category: "photo",
    area_coverage: [
      "Karen",
      "Kiambu Road",
      "Runda",
      "Syokimau",
      "Lavington",
      "Ngong",
    ],
    partner_cost_kes: 7500,
    client_price_kes: 10000,
    private_phone: "+254700000205",
    portfolio_images: [],
    status: "active",
    is_simulated: true,
  },
];

async function main() {
  const venuesResult = await supabase
    .from("venues")
    .upsert(venues, { onConflict: "slug" });
  if (venuesResult.error) throw venuesResult.error;

  const vendorsResult = await supabase
    .from("vendors")
    .upsert(vendors, { onConflict: "id" });
  if (vendorsResult.error) throw vendorsResult.error;

  console.log(`Seeded ${venues.length} venues and ${vendors.length} vendors.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});