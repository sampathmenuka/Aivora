package com.sampath.digitalstore_backend.dto.cart;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long productId;
    private String title;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal lineTotal;
}