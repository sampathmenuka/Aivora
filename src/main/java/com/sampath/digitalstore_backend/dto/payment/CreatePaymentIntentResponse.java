package com.sampath.digitalstore_backend.dto.payment;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePaymentIntentResponse {
    private String orderNumber;
    private String paymentIntentId;
    private String clientSecret;
    private Double amount;
    private String currency;
}