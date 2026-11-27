"use client";

import { useActionState } from "react";
import { signInAdmin, type SignInState } from "@/app/actions/admin-auth";

const INITIAL_STATE: SignInState = { error: null };
const INPUT_CLASS = "h-12 w-full rounded-xl border bg-background px-4 text-base";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAdmin,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT_CLASS}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-13 rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}