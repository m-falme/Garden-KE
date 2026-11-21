"use client";

import { useState } from "react";
import { VenueCard } from "@/components/venue-card";
import type { PublicVenue } from "@/lib/queries/venues";

type SpaceType = PublicVenue["space_type"];
type Filter = "all" | SpaceType;

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "garden", label: "Garden" },
  { value: "backyard", label: "Backyard" },
  { value: "lawn", label: "Lawn" },
  { value: "courtyard", label: "Courtyard" },
];

export function ExploreView({ venues }: { venues: PublicVenue[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible =
    filter === "all"
      ? venues
      : venues.filter((venue) => venue.space_type === filter);

  return (
    <>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`h-11 shrink-0 rounded-full border px-5 text-sm font-medium ${
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {visible.length} {visible.length === 1 ? "space" : "spaces"} near Nairobi
      </p>

      <div className="mt-3 flex flex-col gap-5">
        {visible.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </>
  );
}
