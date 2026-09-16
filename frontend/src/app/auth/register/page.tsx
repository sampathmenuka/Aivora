"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, Check, Lock, Mail, ShoppingBag, Store, UserRound } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn, getApiErrorMessage } from "@/lib/format";

const ROLES = [
  { value: "USER", label: "I want to buy", description: "Browse, purchase and download", icon: ShoppingBag },
  { value: "SELLER", label: "I want to sell", description: "Publish and sell my products", icon: Store },
] as const;

type Role = (typeof ROLES)[number]["value"];

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH = [
  { label: "Too short", color: "bg-danger" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-warning" },
  { label: "Good", color: "bg-success" },
  { label: "Strong", color: "bg-success" },
];

export default function RegisterPage() {
  const { register, isRegistering, registerError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [validationError, setValidationError] = useState("");

  const strength = passwordStrength(password);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setValidationError("Name is required.");
    if (password.length < 6) return setValidationError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setValidationError("Passwords do not match.");

    setValidationError("");
    register({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
  };

  const errorMessage =
    validationError || (registerError ? getApiErrorMessage(registerError, "Registration failed. Please try again.") : "");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join in seconds. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="sr-only">Account type</legend>
          {ROLES.map((r) => {
            const selected = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                aria-pressed={selected}
                className={cn(
                  "relative rounded-2xl border-2 p-4 text-left transition-all",
                  selected ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-foreground/20",
                )}
              >
                {selected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <r.icon className={cn("mb-3 h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
              </button>
            );
          })}
        </fieldset>

        <Field id="name" label="Full name" icon={UserRound}>
          <input id="name" className="input h-12 pl-10" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </Field>

        <Field id="email" label="Email" icon={Mail}>
          <input id="email" className="input h-12 pl-10" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="password" label="Password" icon={Lock}>
            <input id="password" className="input h-12 pl-10" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          </Field>
          <Field id="confirm" label="Confirm password" icon={Lock}>
            <input id="confirm" className="input h-12 pl-10" type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
          </Field>
        </div>

        {password && (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < strength ? STRENGTH[strength].color : "bg-muted")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Password strength: {STRENGTH[strength].label}</p>
          </div>
        )}

        {errorMessage && (
          <div className="alert-error" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <button type="submit" className="btn-primary btn-lg btn-full" disabled={isRegistering}>
          {isRegistering && <Spinner />}
          {isRegistering ? "Creating account…" : role === "SELLER" ? "Create seller account" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
