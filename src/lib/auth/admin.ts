import "server-only";
import { redirect } from "next/navigation";
import { getAdminEmails } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdmin() {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user?.email || !isAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  return { id: user.id, email: user.email };
}