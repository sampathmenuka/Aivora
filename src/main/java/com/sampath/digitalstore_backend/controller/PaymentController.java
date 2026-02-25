package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentRequest;
import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentResponse;
import com.sampath.digitalstore_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<CreatePaymentIntentResponse> createIntent(
            @RequestBody CreatePaymentIntentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request, userDetails.getUsername()));
    }
}