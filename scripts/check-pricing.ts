import assert from "node:assert/strict";
import { buildQuote, getAddonOptions } from "../src/lib/pricing";
import type { PublicVendor } from "../src/lib/queries/vendors";
import type { PublicVenue } from "../src/lib/queries/venues";

const karen: PublicVenue = {
  id: "venue-karen",
  slug: "karen-rose-garden",
  title: "Karen Rose Garden",
  description: "Test venue",
  space_type: "garden",
  area: "Karen",
  capacity_max: 80,
  base_price_kes: 35000,
  includes_tents: true,
  includes_chairs: true,
  in_house_catering: "optional",
  allows_outside_vendors: true,
  images: [],
};

const kiambu: PublicVenue = {
  ...karen,
  id: "venue-kiambu",
  slug: "kiambu-road-lawn",
  area: "Kiambu Road",
  in_house_catering: "required",
  allows_outside_vendors: false,
};

const vendors: PublicVendor[] = [
  {
    id: "vendor-sound",
    name: "Mtaani Sound Co.",
    description: "PA system",
    category: "sound",
    area_coverage: ["Karen", "Kiambu Road"],
    client_price_kes: 6000,
    portfolio_images: [],
  },
  {
    id: "vendor-catering",
    name: "Choma Masters Catering",
    description: "Nyama choma",
    category: "catering",
    area_coverage: ["Karen", "Kiambu Road"],
    client_price_kes: 28000,
    portfolio_images: [],
  },
  {
    id: "vendor-photo",
    name: "Kuvuma Lens Photography",
    description: "Event photos",
    category: "photo",
    area_coverage: ["Karen", "Kiambu Road"],
    client_price_kes: 10000,
    portfolio_images: [],
  },
];

function test(name: string, run: () => void) {
  try {
    run();
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.log(`FAIL - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

test("no add-ons costs only the base price", () => {
  const quote = buildQuote(karen, {}, vendors);
  assert.equal(quote.totalKes, 35000);
  assert.equal(quote.lines.length, 0);
});

test("platform vendor adds its client price", () => {
  const quote = buildQuote(
    karen,
    { sound: { fulfillment: "platform_vendor", vendorId: "vendor-sound" } },
    vendors,
  );
  assert.equal(quote.totalKes, 41000);
});

test("venue chefs are priced separately, own vendor is free", () => {
  const quote = buildQuote(
    karen,
    {
      catering: { fulfillment: "venue_included" },
      photo: { fulfillment: "bring_your_own" },
    },
    vendors,
  );
  assert.equal(quote.totalKes, 35000);
  assert.equal(quote.hasSeparatelyPricedItems, true);
});

test("a vendor from the wrong category is ignored", () => {
  const quote = buildQuote(
    karen,
    { photo: { fulfillment: "platform_vendor", vendorId: "vendor-sound" } },
    vendors,
  );
  assert.equal(quote.totalKes, 35000);
  assert.equal(quote.lines.length, 0);
});

test("optional in-house catering offers 3 choices", () => {
  assert.equal(getAddonOptions(karen, "catering", vendors).length, 3);
});

test("required in-house catering offers only the venue chefs", () => {
  const options = getAddonOptions(kiambu, "catering", vendors);
  assert.equal(options.length, 1);
  assert.equal(options[0]?.choice.fulfillment, "venue_included");
});

test("no outside vendors means no bring-your-own option", () => {
  const options = getAddonOptions(kiambu, "sound", vendors);
  assert.equal(options.length, 1);
  assert.equal(options[0]?.choice.fulfillment, "platform_vendor");
});