package com.sampath.digitalstore_backend.controller;

import com.sampath.digitalstore_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        paymentService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok("received");
    }
}