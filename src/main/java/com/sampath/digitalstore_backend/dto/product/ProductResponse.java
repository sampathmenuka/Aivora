package com.sampath.digitalstore_backend.dto.product;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String productType;
    private String thumbnailUrl;
    private String previewUrl;
    private String sellerEmail;
    private boolean isPublished;
}