"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "./ui";

type Props = {
  children: ReactNode;
  role?: "USER" | "BUYER" | "SELLER" | "ADMIN";
};

function hasRole(userRole: string | undefined, required: string) {
  const normalised = required.toUpperCase() === "BUYER" ? "USER" : required.toUpperCase();
  const actual = userRole?.toUpperCase();
  return actual === normalised || actual === "ADMIN";
}

export default function ProtectedRoute({ children, role }: Props) {
  const router = useRouter();
  const { hydrated, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/auth/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return <PageLoader label="Checking access…" />;
  }

  if (role && !hasRole(user?.role, role)) {
    return (
      <div className="container-page flex justify-center">
        <div className="card max-w-md text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="font-display text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area requires a {role.toLowerCase()} account.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
