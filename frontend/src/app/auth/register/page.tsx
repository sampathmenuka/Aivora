"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register, isRegistering, registerError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    register({ name, email, password });
  };

  return (
    <main className="container-page max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded border border-border p-4">
        <input
          className="w-full rounded border border-border bg-background px-3 py-2"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button className="w-full rounded bg-foreground py-2 text-background" disabled={isRegistering}>
          {isRegistering ? "Creating account..." : "Create Account"}
        </button>
        {registerError && <p className="text-sm text-red-500">Registration failed.</p>}
      </form>
      <p className="mt-3 text-sm">
        Already have an account? <Link className="underline" href="/auth/login">Login</Link>
      </p>
    </main>
  );
}
