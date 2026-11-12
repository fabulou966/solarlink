"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/lib/admin/actions";

const INITIAL: ActionState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={action}>
      {state.error && <p className="alert err">{state.error}</p>}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <button className="btn" type="submit" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
