import type { Database } from "@/types/database";

export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export const BOOKING_STATUSES: readonly BookingStatus[] = [
    "inquiry",
    "quoting",
    "deposit_paid",
    "confirmed",
    "cancelled",
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
    inquiry: "Inquiry",
    quoting: "Quoting",
    deposit_paid: "Deposit paid",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
};

const TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
    inquiry: ["quoting", "cancelled"],
    quoting: ["deposit_paid", "cancelled"],
    deposit_paid: ["confirmed", "cancelled"],
    confirmed: ["cancelled"],
    cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return TRANSITIONS[from].includes(to);
}

export function getNextStatuses(from: BookingStatus): readonly BookingStatus[] {
    return TRANSITIONS[from];
}