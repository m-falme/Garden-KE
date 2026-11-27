"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminEmail } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

export type SignInState = { error: string | null };

const signInSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function signInAdmin(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  const email = data.user?.email;

  if (error || !email || !isAdminEmail(email)) {
    await supabase.auth.signOut();
    return { error: "Wrong email or password." };
  }

  redirect("/admin");
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}