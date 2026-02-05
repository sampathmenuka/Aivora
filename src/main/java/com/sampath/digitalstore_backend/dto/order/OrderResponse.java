package com.sampath.digitalstore_backend.dto.order;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private String orderNumber;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<String> products;
}