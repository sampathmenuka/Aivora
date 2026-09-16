"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const CART_QUERY_KEY = ["cart"];

type AddPayload = { productId: number; quantity?: number };

export function useCart() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();

  // Guests have no cart: skip the request instead of hitting a protected endpoint
  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => (await apiClient.getCart()).data,
    enabled: hydrated && isAuthenticated,
  });

  const setCart = ({ data }: { data: unknown }) => {
    if (data && typeof data === "object") queryClient.setQueryData(CART_QUERY_KEY, data);
    else queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
  };

  const addToCart = useMutation({
    mutationFn: apiClient.addToCart,
    onSuccess: setCart,
  });

  const updateQuantity = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      apiClient.updateCartItem(productId, quantity),
    onSuccess: setCart,
  });

  const removeFromCart = useMutation({
    mutationFn: apiClient.removeFromCart,
    onSuccess: setCart,
  });

  const clearCart = useMutation({
    mutationFn: apiClient.clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
  });

  const add = (payload: AddPayload, options?: { onSuccess?: () => void }) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    addToCart.mutate(payload, { onSuccess: () => options?.onSuccess?.() });
  };

  const items = cartQuery.data?.items ?? [];

  return {
    cart: cartQuery.data,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    isLoadingCart: cartQuery.isLoading && cartQuery.fetchStatus !== "idle",
    cartError: cartQuery.error,
    refreshCart: cartQuery.refetch,
    addToCart: add,
    addingProductId: addToCart.isPending ? addToCart.variables?.productId : undefined,
    isAdding: addToCart.isPending,
    addError: addToCart.error,
    updateQuantity: updateQuantity.mutate,
    updatingProductId: updateQuantity.isPending ? updateQuantity.variables?.productId : undefined,
    removeFromCart: removeFromCart.mutate,
    removingProductId: removeFromCart.isPending ? removeFromCart.variables : undefined,
    clearCart: clearCart.mutate,
    isRemoving: removeFromCart.isPending,
    isClearing: clearCart.isPending,
  };
}
