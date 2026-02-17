"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const ROLES = [
  { value: "USER", label: "Customer", description: "Browse, purchase and download digital products" },
  { value: "SELLER", label: "Seller", description: "List and sell your own digital products" },
] as const;

type Role = (typeof ROLES)[number]["value"];

export default function RegisterPage() {
  const { register, isRegistering, registerError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [validationError, setValidationError] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }
    setValidationError("");
    register({ name, email, password, role });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold shadow-md">
            DS
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join Digital Store today</p>
        </div>

        {/* Role selection */}
        <div className="mb-6">
          <p className="form-label mb-2">I want to join as</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  role === r.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{r.description}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="input"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {(validationError || registerError) && (
            <div className="alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {validationError || "Registration failed. Please try again."}
            </div>
          )}

          <button type="submit" className="btn-primary btn-full btn-lg mt-2" disabled={isRegistering}>
            {isRegistering ? (
              <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account...</>
            ) : `Create ${role === "SELLER" ? "Seller" : ""} Account`}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
