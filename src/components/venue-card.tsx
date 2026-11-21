import Link from "next/link";
import type { PublicVenue } from "@/lib/queries/venues";
import {
  PLACEHOLDER_GRADIENTS,
  SPACE_LABELS,
  getTags,
} from "@/lib/venue-display";

export function VenueCard({ venue }: { venue: PublicVenue }) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="block overflow-hidden rounded-3xl border bg-card text-card-foreground"
    >
      <div
        className={`relative h-44 bg-linear-to-br ${PLACEHOLDER_GRADIENTS[venue.space_type]}`}
      >
        <span className="absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
          {SPACE_LABELS[venue.space_type]}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-lg font-bold leading-tight">
            {venue.title}
          </h3>
          <p className="whitespace-nowrap text-[15px] font-semibold">
            KES {venue.base_price_kes.toLocaleString("en-KE")}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              / day
            </span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {venue.area} · up to {venue.capacity_max} guests
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {getTags(venue)
            .slice(0, 3)
            .map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </li>
            ))}
        </ul>
      </div>
    </Link>
  );
}