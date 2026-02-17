"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    login({ email, password });
  };

  return (
    <main className="container-page max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded border border-border p-4">
        <input
          className="w-full rounded border border-border bg-background px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border border-border bg-background px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full rounded bg-foreground py-2 text-background" disabled={isLoggingIn}>
          {isLoggingIn ? "Signing in..." : "Sign In"}
        </button>
        {loginError && <p className="text-sm text-red-500">Login failed. Check your credentials.</p>}
      </form>
      <p className="mt-3 text-sm">
        No account? <Link className="underline" href="/auth/register">Register</Link>
      </p>
    </main>
  );
}
