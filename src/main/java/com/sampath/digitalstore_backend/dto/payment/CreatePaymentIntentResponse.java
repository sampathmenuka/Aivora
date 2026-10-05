package com.sampath.digitalstore_backend.dto.payment;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePaymentIntentResponse {
    private String orderNumber;
    private String paymentIntentId;
    private String clientSecret;
    private BigDecimal amount;
    private String currency;
}
