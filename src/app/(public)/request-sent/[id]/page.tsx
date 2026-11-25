import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { z } from "zod";
import { ADDON_LABELS, formatKes } from "@/lib/pricing";
import { getBookingSummary } from "@/lib/queries/booking-summary";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Request sent",
  robots: { index: false },
};

type RequestSentPageProps = { params: Promise<{ id: string }> };
type VendorCategory = Database["public"]["Enums"]["vendor_category"];
type BookingSummary = NonNullable<Awaited<ReturnType<typeof getBookingSummary>>>;
type SummaryAddon = BookingSummary["booking_addons"][number];

function categoryLabel(category: VendorCategory): string {
  return category === "tents" ? "Tents" : ADDON_LABELS[category];
}

function addonValue(addon: SummaryAddon): string {
  if (addon.fulfillment_type === "platform_vendor") {
    return addon.vendors?.name ?? "Our crew";
  }
  if (addon.fulfillment_type === "venue_included") {
    return "Venue chefs";
  }
  return "Your own vendor";
}

function formatEventDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function RequestSentPage({ params }: RequestSentPageProps) {
  return (
    <Suspense fallback={<SummarySkeleton />}>
      <Summary params={params} />
    </Suspense>
  );
}

async function Summary({ params }: RequestSentPageProps) {
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const booking = await getBookingSummary(id);

  if (!booking) {
    notFound();
  }

  const hasVenueChefs = booking.booking_addons.some(
    (addon) => addon.fulfillment_type === "venue_included",
  );

  return (
    <main className="flex flex-col gap-6 px-5 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-18 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-9" aria-hidden="true" />
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Request sent
        </h1>
        <p className="max-w-xs text-[15px] text-muted-foreground">
          We are checking your date with {booking.venues.title} and will message
          you on WhatsApp.
        </p>
        <p className="flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm text-secondary-foreground">
          Reference
          <span className="font-semibold tracking-wide">
            {booking.reference_code}
          </span>
        </p>
      </div>

      <dl className="rounded-2xl border bg-card px-4">
        <SummaryRow label="Space" value={booking.venues.title} />
        <SummaryRow label="Date" value={formatEventDate(booking.event_date)} />
        <SummaryRow
          label="Guests"
          value={`${booking.guest_count} · ${booking.event_type}`}
        />
        {booking.booking_addons.map((addon) => (
          <SummaryRow
            key={addon.category}
            label={categoryLabel(addon.category)}
            value={addonValue(addon)}
          />
        ))}
        <div className="flex items-baseline justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Estimated total</dt>
          <dd className="font-heading text-[22px] font-bold">
            {formatKes(booking.total_client_kes)}
          </dd>
        </div>
      </dl>

      {hasVenueChefs && (
        <p className="text-sm text-muted-foreground">
          Venue chef pricing will be added to your final quote.
        </p>
      )}

      <section aria-labelledby="next-heading" className="flex flex-col gap-3">
        <h2 id="next-heading" className="font-heading text-xl font-bold">
          What happens next
        </h2>
        <ol className="flex flex-col gap-3 text-sm">
          <li>1. We confirm the date with the venue and your crew.</li>
          <li>2. You get a final quote on WhatsApp.</li>
          <li>3. Pay a deposit with M-Pesa to lock in your date.</li>
        </ol>
      </section>

      <Link
        href="/"
        className="flex h-13 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
      >
        Back to explore
      </Link>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-center gap-4 px-5 py-10" aria-hidden="true">
      <div className="size-18 rounded-full bg-muted" />
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-40 w-full rounded-2xl bg-muted" />
    </div>
  );
}