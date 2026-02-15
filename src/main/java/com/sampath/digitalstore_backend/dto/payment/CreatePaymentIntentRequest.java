package com.sampath.digitalstore_backend.dto.payment;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePaymentIntentRequest {
    private List<Long> productIds;
}