export const EVENT_TYPES = [
    "Graduation party",
    "Birthday",
    "Bridal shower",
    "Chama gathering",
    "Family & Friends fun day",
    "Other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];