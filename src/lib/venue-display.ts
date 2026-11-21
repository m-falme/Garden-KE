import type { PublicVenue } from "@/lib/queries/venues";

export type SpaceType = PublicVenue["space_type"];

export const SPACE_LABELS: Record<SpaceType, string> = {
  garden: "Garden",
  backyard: "Backyard",
  lawn: "Lawn",
  courtyard: "Courtyard",
};

export const PLACEHOLDER_GRADIENTS: Record<SpaceType, string> = {
  garden: "from-emerald-200 via-emerald-400 to-emerald-700",
  backyard: "from-teal-200 via-teal-400 to-teal-700",
  lawn: "from-lime-200 via-lime-400 to-green-700",
  courtyard: "from-amber-200 via-orange-300 to-amber-700",
};

export function getTags(venue: PublicVenue): string[] {
  const tags: string[] = [];
  if (!venue.includes_tents && !venue.includes_chairs) tags.push("Space only");
  if (venue.includes_tents) tags.push("Tents");
  if (venue.includes_chairs) tags.push("Chairs");
  if (venue.in_house_catering === "optional") tags.push("Chefs optional");
  if (venue.in_house_catering === "required") tags.push("Chefs on site");
  if (venue.allows_outside_vendors) tags.push("Outside vendors OK");
  return tags;
}

export type Inclusion = { label: string; value: string };

const CATERING_VALUES: Record<PublicVenue["in_house_catering"], string> = {
  none: "Not offered",
  optional: "Venue chefs, optional",
  required: "Venue chefs, required",
};

export function getInclusions(venue: PublicVenue): Inclusion[] {
  return [
    { label: "Tents", value: venue.includes_tents ? "Included" : "Not included" },
    { label: "Chairs", value: venue.includes_chairs ? "Included" : "Not included" },
    { label: "Catering", value: CATERING_VALUES[venue.in_house_catering] },
    {
      label: "Outside vendors",
      value: venue.allows_outside_vendors ? "Allowed" : "Not allowed",
    },
  ];
}