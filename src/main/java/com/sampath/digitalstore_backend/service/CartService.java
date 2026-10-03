package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.cart.AddToCartRequest;
import com.sampath.digitalstore_backend.dto.cart.CartResponse;
import com.sampath.digitalstore_backend.dto.cart.UpdateCartItemRequest;

import java.util.Collection;

public interface CartService {

    CartResponse getMyCart(String email);

    CartResponse addToCart(AddToCartRequest request, String email);

    CartResponse updateItemQuantity(Long productId, UpdateCartItemRequest request, String email);

    CartResponse removeFromCart(Long productId, String email);

    void clearCart(String email);

    // Called after a successful payment: drops the purchased products from the user's cart
    void removePurchasedItems(Long userId, Collection<Long> productIds);
}
