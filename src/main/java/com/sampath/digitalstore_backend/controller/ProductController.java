package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.dto.product.ProductRequest;
import com.sampath.digitalstore_backend.dto.product.ProductResponse;
import com.sampath.digitalstore_backend.dto.product.PurchaseProductResponse;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    // 🔓 Public browsing
    @GetMapping("/public")
    public ResponseEntity<List<ProductResponse>> getAllPublishedProducts() {
        return ResponseEntity.ok(productService.getAllPublishedProducts());
    }

    // 🔐 Authenticated listing:
    // - SELLER: own products (draft + published)
    // - ADMIN: all products
    // - USER: published products
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return switch (user.getRole()) {
            case ADMIN -> ResponseEntity.ok(productService.getAllProducts());
            case SELLER -> ResponseEntity.ok(productService.getProductsBySeller(user.getId()));
            default -> ResponseEntity.ok(productService.getAllPublishedProducts());
        };
    }

    // 🔐 Seller creates product (uses email from JWT)
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(productService.createProductByEmail(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(productService.updateProduct(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        productService.deleteProduct(id, email);
        return ResponseEntity.ok("Product deleted");
    }

    // 🔐 My purchases
    @GetMapping("/my-purchases")
    public ResponseEntity<List<PurchaseProductResponse>> myPurchases(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                productService.getMyPurchasedProducts(userDetails.getUsername())
        );
    }

    // 🔐 Secure download link (Phase 1)
    @GetMapping("/{id}/download-link")
    public ResponseEntity<String> downloadLink(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                productService.getSecureDownloadUrl(id, userDetails.getUsername())
        );
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<ProductResponse> publish(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(productService.publishProduct(id, email));
    }

    @PutMapping("/{id}/unpublish")
    public ResponseEntity<ProductResponse> unpublish(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(productService.unpublishProduct(id, email));
    }
}