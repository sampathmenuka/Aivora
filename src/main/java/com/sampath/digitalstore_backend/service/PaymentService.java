package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentRequest;
import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentResponse;

public interface PaymentService {
    CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request, String email);
    void handleStripeWebhook(String payload, String sigHeader);
}