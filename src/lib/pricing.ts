import type { PublicVendor } from "@/lib/queries/vendors";
import type { PublicVenue } from "@/lib/queries/venues";
import type { Database } from "@/types/database";

type VendorCategory = Database["public"]["Enums"]["vendor_category"];

export type AddonCategory = Exclude<VendorCategory, "tents">;

export const ADDON_CATEGORIES: readonly AddonCategory[] = [
  "sound",
  "catering",
  "photo",
];

export const ADDON_LABELS: Record<AddonCategory, string> = {
  sound: "Sound and MC",
  catering: "Catering",
  photo: "Photography",
};

export type AddonChoice =
  | { fulfillment: "venue_included" }
  | { fulfillment: "platform_vendor"; vendorId: string }
  | { fulfillment: "bring_your_own" };

export type Selection = Partial<Record<AddonCategory, AddonChoice>>;

export type AddonOption = {
  choice: AddonChoice;
  label: string;
  note: string;
  priceKes: number | null;
};

export type QuoteLine = {
  category: AddonCategory;
  label: string;
  priceKes: number | null;
};

export type Quote = {
  baseKes: number;
  lines: QuoteLine[];
  totalKes: number;
  hasSeparatelyPricedItems: boolean;
};

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function getAddonOptions(
  venue: PublicVenue,
  category: AddonCategory,
  vendors: readonly PublicVendor[],
): AddonOption[] {
  const options: AddonOption[] = [];
  const venueCateringRequired =
    category === "catering" && venue.in_house_catering === "required";

  if (category === "catering" && venue.in_house_catering !== "none") {
    options.push({
      choice: { fulfillment: "venue_included" },
      label: "Venue chefs",
      note: "Priced by the venue in your final quote.",
      priceKes: null,
    });
  }

  if (venueCateringRequired) {
    return options;
  }

  for (const vendor of vendors) {
    if (vendor.category !== category) continue;
    options.push({
      choice: { fulfillment: "platform_vendor", vendorId: vendor.id },
      label: vendor.name,
      note: vendor.description,
      priceKes: vendor.client_price_kes,
    });
  }

  if (venue.allows_outside_vendors) {
    options.push({
      choice: { fulfillment: "bring_your_own" },
      label: "I'll bring my own",
      note: "You arrange this yourself. We note it on your booking.",
      priceKes: 0,
    });
  }

  return options;
}

export function buildQuote(
  venue: PublicVenue,
  selection: Selection,
  vendors: readonly PublicVendor[],
): Quote {
  const lines: QuoteLine[] = [];

  for (const category of ADDON_CATEGORIES) {
    const choice = selection[category];
    if (!choice) continue;

    switch (choice.fulfillment) {
      case "venue_included":
        lines.push({ category, label: "Provided by the venue", priceKes: null });
        break;
      case "bring_your_own":
        lines.push({ category, label: "Your own vendor", priceKes: 0 });
        break;
      case "platform_vendor": {
        const vendor = vendors.find(
          (v) => v.id === choice.vendorId && v.category === category,
        );
        if (vendor) {
          lines.push({
            category,
            label: vendor.name,
            priceKes: vendor.client_price_kes,
          });
        }
        break;
      }
      default: {
        const unreachable: never = choice;
        throw new Error(`Unhandled fulfillment: ${JSON.stringify(unreachable)}`);
      }
    }
  }

  const extrasKes = lines.reduce((sum, line) => sum + (line.priceKes ?? 0), 0);

  return {
    baseKes: venue.base_price_kes,
    lines,
    totalKes: venue.base_price_kes + extrasKes,
    hasSeparatelyPricedItems: lines.some((line) => line.priceKes === null),
  };
}