package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.entity.Product;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.exception.UnauthorizedException;
import com.sampath.digitalstore_backend.repository.OrderRepository;
import com.sampath.digitalstore_backend.repository.ProductRepository;
import com.sampath.digitalstore_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/downloads")
@RequiredArgsConstructor
public class DownloadController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/products/{productId}")
    public ResponseEntity<Resource> download(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean purchased = orderRepository.hasPurchasedProduct(user.getId(), productId);
        if (!purchased) throw new UnauthorizedException("You have not purchased this product");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // fileUrl should be a private server path like: /opt/store/files/abc.pdf
        File file = new File(product.getFileUrl());
        if (!file.exists()) throw new ResourceNotFoundException("File not found");

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\"")
                .body(resource);
    }
}