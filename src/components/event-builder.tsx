"use client";

import { useState } from "react";
import {
  ADDON_CATEGORIES,
  ADDON_LABELS,
  buildQuote,
  formatKes,
  getAddonOptions,
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

function isSameChoice(current: AddonChoice | undefined, other: AddonChoice): boolean {
  if (!current) return false;
  if (current.fulfillment !== other.fulfillment) return false;
  if (
    current.fulfillment === "platform_vendor" &&
    other.fulfillment === "platform_vendor"
  ) {
    return current.vendorId === other.vendorId;
  }
  return true;
}

function priceText(priceKes: number | null): string {
  if (priceKes === null) return "Quoted separately";
  if (priceKes === 0) return "No charge";
  return `+${formatKes(priceKes)}`;
}

export function EventBuilder({ venue, vendors }: EventBuilderProps) {
  const [selection, setSelection] = useState<Selection>({});

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
          type="button"
          disabled
          className="h-13 shrink-0 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground opacity-60"
        >
          Request quote
        </button>
      </div>
    </>
  );
}