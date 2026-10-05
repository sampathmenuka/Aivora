package com.sampath.digitalstore_backend.dto.payment;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePaymentIntentRequest {
    // Optional: pay for an existing PENDING order. When omitted, a new order is created from the cart.
    private String orderNumber;
}
