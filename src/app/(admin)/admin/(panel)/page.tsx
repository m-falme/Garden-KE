import { requireAdmin } from "@/lib/auth/admin";
import {
  BOOKING_STATUSES,
  STATUS_LABELS,
  type BookingStatus,
} from "@/lib/booking-status";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("status");

  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  const counts: Record<BookingStatus, number> = {
    inquiry: 0,
    quoting: 0,
    deposit_paid: 0,
    confirmed: 0,
    cancelled: 0,
  };
  for (const row of data) {
    counts[row.status] += 1;
  }

  return (
    <main className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground">Signed in as {admin.email}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {BOOKING_STATUSES.map((status) => (
          <div key={status} className="rounded-2xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</dt>
            <dd className="font-heading text-3xl font-bold">{counts[status]}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}