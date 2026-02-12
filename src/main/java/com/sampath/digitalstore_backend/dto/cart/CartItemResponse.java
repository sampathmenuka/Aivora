package com.sampath.digitalstore_backend.dto.cart;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long productId;
    private String title;
    private Double price;
    private Integer quantity;
    private Double lineTotal;
}