"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: ReactNode;
  role?: "BUYER" | "SELLER";
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

    if (role && user?.role !== role) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, role, router, user?.role]);

  if (!hydrated || !isAuthenticated) {
    return <div className="container-page">Checking access...</div>;
  }

  if (role && user?.role !== role) {
    return <div className="container-page">Access denied.</div>;
  }

  return <>{children}</>;
}
