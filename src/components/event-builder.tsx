"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitBookingRequest } from "@/app/actions/booking";
import { EVENT_TYPES } from "@/lib/event-types";
import {
  ADDON_CATEGORIES,
  ADDON_LABELS,
  buildQuote,
  formatKes,
  getAddonOptions,
  isSameChoice,
  type AddonCategory,
  type AddonChoice,
  type Selection,
} from "@/lib/pricing";
import type { PublicVendor } from "@/lib/queries/vendors";
import type { PublicVenue } from "@/lib/queries/venues";

type EventBuilderProps = {
  venue: PublicVenue;
  vendors: PublicVendor[];
};

type FormErrors = {
  message: string | null;
  fields: Partial<Record<string, string[]>>;
};

const NO_ERRORS: FormErrors = { message: null, fields: {} };

const INPUT_CLASS =
  "h-12 w-full rounded-xl border bg-background px-4 text-base";

function priceText(priceKes: number | null): string {
  if (priceKes === null) return "Quoted separately";
  if (priceKes === 0) return "No charge";
  return `+${formatKes(priceKes)}`;
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function EventBuilder({ venue, vendors }: EventBuilderProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection>({});
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [isPending, startTransition] = useTransition();

  function toggle(category: AddonCategory, choice: AddonChoice) {
    setSelection((current) => {
      if (isSameChoice(current[category], choice)) {
        const next = { ...current };
        delete next[category];
        return next;
      }
      return { ...current, [category]: choice };
    });
  }

  function fieldError(name: string): string | undefined {
    return errors.fields[name]?.[0];
  }

  function fieldProps(name: string) {
    const hasError = fieldError(name) !== undefined;
    return {
      id: name,
      name,
      "aria-invalid": hasError ? true : undefined,
      "aria-describedby": hasError ? `${name}-error` : undefined,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = {
      ...Object.fromEntries(formData),
      venueSlug: venue.slug,
      selection,
    };

    setErrors(NO_ERRORS);

    startTransition(async () => {
      try {
        const result = await submitBookingRequest(input);
        if (result.ok) {
          router.push(`/request-sent/${result.bookingId}`);
          return;
        }
        setErrors({ message: result.error, fields: result.fieldErrors });
      } catch {
        setErrors({
          message: "Something went wrong. Please try again.",
          fields: {},
        });
      }
    });
  }

  const quote = buildQuote(venue, selection, vendors);

  return (
    <>
      <section aria-labelledby="build-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="build-heading" className="font-heading text-xl font-bold">
            Build your event
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose who handles each part. We coordinate everything for you.
          </p>
        </div>

        {ADDON_CATEGORIES.map((category) => {
          const options = getAddonOptions(venue, category, vendors);

          return (
            <div
              key={category}
              role="group"
              aria-label={ADDON_LABELS[category]}
              className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4"
            >
              <h3 className="text-base font-semibold">{ADDON_LABELS[category]}</h3>

              {options.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No options for this area yet.
                </p>
              )}

              {options.map((option) => {
                const isSelected = isSameChoice(selection[category], option.choice);

                return (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggle(category, option.choice)}
                    className={`flex min-h-14 items-start justify-between gap-3 rounded-xl border p-3 text-left ${
                      isSelected ? "border-primary bg-secondary" : "bg-background"
                    }`}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="text-[13px] text-muted-foreground">
                        {option.note}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {priceText(option.priceKes)}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </section>

      <section aria-labelledby="details-heading" className="flex flex-col gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <h2 id="details-heading" className="font-heading text-xl font-bold">
            Your details
          </h2>
          <p className="text-sm text-muted-foreground">
            We use these to confirm your date and send your quote.
          </p>
        </div>

        <form
          id="request-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field label="Event date" name="eventDate" error={fieldError("eventDate")}>
            <input
              {...fieldProps("eventDate")}
              type="date"
              required
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Number of guests" name="guestCount" error={fieldError("guestCount")}>
            <input
              {...fieldProps("guestCount")}
              type="number"
              inputMode="numeric"
              min={1}
              max={venue.capacity_max}
              placeholder={`Up to ${venue.capacity_max}`}
              required
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Type of event" name="eventType" error={fieldError("eventType")}>
            <select
              {...fieldProps("eventType")}
              defaultValue=""
              required
              className={INPUT_CLASS}
            >
              <option value="" disabled>
                Choose an event type
              </option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Your name" name="clientName" error={fieldError("clientName")}>
            <input
              {...fieldProps("clientName")}
              type="text"
              autoComplete="name"
              required
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Phone number" name="clientPhone" error={fieldError("clientPhone")}>
            <input
              {...fieldProps("clientPhone")}
              type="tel"
              autoComplete="tel"
              placeholder="0712 345 678"
              required
              className={INPUT_CLASS}
            />
          </Field>

          {errors.message && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              {errors.message}
            </p>
          )}
        </form>
      </section>

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-4 border-t bg-card px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {quote.hasSeparatelyPricedItems
              ? "Estimated total, venue chefs extra"
              : "Estimated total"}
          </span>
          <span className="font-heading text-[22px] font-bold">
            {formatKes(quote.totalKes)}
          </span>
        </div>
        <button
          type="submit"
          form="request-form"
          disabled={isPending}
          className="h-13 shrink-0 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Request quote"}
        </button>
      </div>
    </>
  );
}