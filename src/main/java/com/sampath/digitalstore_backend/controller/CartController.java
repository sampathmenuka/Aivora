package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.dto.cart.AddToCartRequest;
import com.sampath.digitalstore_backend.dto.cart.CartResponse;
import com.sampath.digitalstore_backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getMyCart(userDetails.getUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(cartService.addToCart(request, userDetails.getUsername()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(cartService.removeFromCart(productId, userDetails.getUsername()));
    }

    @DeleteMapping
    public ResponseEntity<String> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok("Cart cleared");
    }
}