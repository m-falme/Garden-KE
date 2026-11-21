import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getActiveVenueSlugs, getVenueBySlug } from "@/lib/queries/venues";
import {
  PLACEHOLDER_GRADIENTS,
  SPACE_LABELS,
  getInclusions,
} from "@/lib/venue-display";

type VenuePageProps = PageProps<"/venues/[slug]">;

export async function generateStaticParams() {
  const slugs = await getActiveVenueSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export default function VenuePage({ params }: VenuePageProps) {
  return (
    <Suspense fallback={<VenueSkeleton />}>
      <VenueDetails params={params} />
    </Suspense>
  );
}

async function VenueDetails({ params }: { params: VenuePageProps["params"] }) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);

  if (!venue) {
    notFound();
  }

  return (
    <main>
      <div
        className={`relative h-72 bg-linear-to-br ${PLACEHOLDER_GRADIENTS[venue.space_type]}`}
      >
        <Link
          href="/"
          aria-label="Back to explore"
          className="absolute top-4 left-4 flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative -mt-6 flex flex-col gap-6 rounded-t-3xl bg-background px-5 pt-6 pb-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-[28px] leading-tight font-bold tracking-tight">
            {venue.title}
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {venue.area}, Nairobi · {SPACE_LABELS[venue.space_type]} · up to{" "}
            {venue.capacity_max} guests
          </p>
          <p className="text-[15px] font-semibold">
            From KES {venue.base_price_kes.toLocaleString("en-KE")} / day
          </p>
        </header>

        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {venue.description}
        </p>

        <section aria-labelledby="included-heading" className="flex flex-col gap-3">
          <h2
            id="included-heading"
            className="font-heading text-xl font-bold"
          >
            What&apos;s included
          </h2>
          <dl className="grid grid-cols-2 gap-2.5">
            {getInclusions(venue).map((item) => (
              <div key={item.label} className="rounded-2xl border bg-card p-3.5">
                <dt className="text-sm font-semibold">{item.label}</dt>
                <dd className="text-[13px] text-muted-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}

function VenueSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-72 bg-muted" />
      <div className="flex flex-col gap-3 px-5 pt-6">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/2 rounded-lg bg-muted" />
      </div>
    </div>
  );
}