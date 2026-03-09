"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

const CART_QUERY_KEY = ["cart"];

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => (await apiClient.getCart()).data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

  const addToCart = useMutation({
    mutationFn: apiClient.addToCart,
    onSuccess: invalidate,
  });

  const removeFromCart = useMutation({
    mutationFn: apiClient.removeFromCart,
    onSuccess: invalidate,
  });

  const clearCart = useMutation({
    mutationFn: apiClient.clearCart,
    onSuccess: invalidate,
  });

  return {
    cart: cartQuery.data,
    isLoadingCart: cartQuery.isLoading,
    cartError: cartQuery.error,
    refreshCart: cartQuery.refetch,
    addToCart: addToCart.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    isAdding: addToCart.isPending,
    isRemoving: removeFromCart.isPending,
    isClearing: clearCart.isPending,
  };
}
