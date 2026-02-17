"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { authStore } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState(authStore.getUser());

  useEffect(() => {
    setHydrated(true);
    setUser(authStore.getUser());
  }, []);

  const loginMutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: ({ data }) => {
      authStore.setAuth(data.token, data.email, data.role);
      setUser({ email: data.email, role: data.role });
      router.push("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: ({ data }) => {
      authStore.setAuth(data.token, data.email, data.role);
      setUser({ email: data.email, role: data.role });
      router.push("/");
    },
  });

  const logout = () => {
    authStore.clear();
    setUser(null);
    router.push("/auth/login");
  };

  const isAuthenticated = Boolean(authStore.getToken());

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
