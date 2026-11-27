function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const publicEnv = {
    supabaseUrl: required(
        "NEXT_PUBLIC_SUPABASE_URL",
        process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabasePublishableKey: required(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
} as const;

export function getSecretKey(): string {
    return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
}


export function getAdminEmails(): string[] {
    return required("ADMIN_EMAILS", process.env.ADMIN_EMAILS)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}