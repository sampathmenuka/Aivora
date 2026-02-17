"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: ReactNode;
  role?: "USER" | "BUYER" | "SELLER" | "ADMIN";
};

export default function ProtectedRoute({ children, role }: Props) {
  const router = useRouter();
  const { hydrated, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (role) {
      const userRole = user?.role?.toUpperCase();
      const requiredRole = role.toUpperCase();
      // BUYER is an alias for USER
      const normalised = requiredRole === "BUYER" ? "USER" : requiredRole;
      if (userRole !== normalised && userRole !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [hydrated, isAuthenticated, role, router, user?.role]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  if (role) {
    const userRole = user?.role?.toUpperCase();
    const requiredRole = role.toUpperCase();
    const normalised = requiredRole === "BUYER" ? "USER" : requiredRole;
    if (userRole !== normalised && userRole !== "ADMIN") {
      return (
        <div className="container-page">
          <div className="alert-error">Access denied. You need {role} privileges.</div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
