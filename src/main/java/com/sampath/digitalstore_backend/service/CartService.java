package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.cart.AddToCartRequest;
import com.sampath.digitalstore_backend.dto.cart.CartResponse;

public interface CartService {

    CartResponse getMyCart(String email);

    CartResponse addToCart(AddToCartRequest request, String email);

    CartResponse removeFromCart(Long productId, String email);

    void clearCart(String email);
}