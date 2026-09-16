"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/format";

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your library, cart and dashboard."
      footer={
        <>
          New to Digital Store?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              className="input h-12 pl-10"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              className="input h-12 pl-10 pr-11"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn-icon btn-ghost absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {loginError && (
          <div className="alert-error" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {getApiErrorMessage(loginError, "Sign in failed. Please check your email and password.")}
          </div>
        )}

        <button type="submit" className="btn-primary btn-lg btn-full" disabled={isLoggingIn}>
          {isLoggingIn && <Spinner />}
          {isLoggingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
