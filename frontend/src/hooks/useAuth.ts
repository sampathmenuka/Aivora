"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { authStore } from "@/lib/auth";

function dashboardFor(role: string): string {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "/dashboard/admin";
    case "SELLER":
      return "/dashboard/seller";
    default:
      return "/dashboard/user";
  }
}

export function useAuth() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<{email: string; role: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setUser(authStore.getUser());
    setIsAuthenticated(Boolean(authStore.getToken()));
  }, []);

  const loginMutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: ({ data }) => {
      authStore.setAuth(data.token, data.email, data.role);
      setUser({ email: data.email, role: data.role });
      setIsAuthenticated(true);
      router.push(dashboardFor(data.role));
    },
  });

  const registerMutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: ({ data }) => {
      authStore.setAuth(data.token, data.email, data.role);
      setUser({ email: data.email, role: data.role });
      setIsAuthenticated(true);
      router.push(dashboardFor(data.role));
    },
  });

  const logout = () => {
    authStore.clear();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/auth/login");
  };

  return {
    user,
    hydrated,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logout,
  };
}
