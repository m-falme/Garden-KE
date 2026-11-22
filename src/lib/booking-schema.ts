import { z } from "zod";

export const EVENT_TYPES = [
    "Graduation party",
    "Birthday",
    "Bridal shower",
    "Chama gathering",
    "Family & Friends fun day",
    "Other",
]   as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function normalizeKenyanPhone(input: string): string | null {
    const cleaned = input.replace(/[\s-]/g, "");
    const match = /^(?:\+254|254|0)([17])\d{8}$/.exec(cleaned);
    return match ? `+254${match[1]}` : null;
}

function isRealDate(value: string): boolean {
    const date = new Date (`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const choiceSchema = z.discriminatedUnion("fulfillment", [
    z.object({ fulfilllment:z.literal("venue_included") }),
    z.object({
        fulfillment: z.literal("platform_vendor"),
        vendorId: z.string().min(1).max(64),
    }),
    z.object({ fulfillment: z.literal("bring_your_own") }),
]);

const selectionSchema = z.object({
    sound: choiceSchema.optional(),
    catering: choiceSchema.optional(),
    photo: choiceSchema.optional(),
});

export const bookingRequestSchema = z.object({
    venueSlug: z.string().min(1).max(100),
    clientName: z.string().trim().min(2, "Enter your full name").max(100),
    clientPhone: z.string().transform((value, ctx) => {
        const phone = normalizeKenyanPhone(value);
        if (!phone) {
            ctx.addIssue({
                code: "custom",
                message: "Enter a valid Kenyan phone number",
            });
            return z.NEVER;
        }
        return phone;
    }),
    eventDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
        .refine(isRealDate, "Pick a valid date"),
    guestCount: z.coerce
        .number()
        .int("Guests must be a whole number")
        .min(1, "Enter at least 1 guest")
        .max(500, "That is too many guests"),
    eventType: z.enum(EVENT_TYPES),
    Selection: selectionSchema,        
});

export type bookingRequest = z.infer<typeof bookingRequestSchema>;