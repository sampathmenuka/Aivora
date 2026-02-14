package com.sampath.digitalstore_backend.dto.product;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "productId") // ✅ makes stream().distinct() work
public class PurchaseProductResponse {
    private Long productId;
    private String title;
    private String productType;
    private String previewUrl;
}