package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.dto.order.OrderRequest;
import com.sampath.digitalstore_backend.dto.order.OrderResponse;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<OrderResponse>
    createOrder(
            @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(
                orderService.createOrder(request, user.getId())
        );
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(
                orderService.getUserOrders(user.getId())
        );
    }
}