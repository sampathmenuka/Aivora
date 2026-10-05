package com.sampath.digitalstore_backend.dto.product;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    private String title;
    private String description;
    private BigDecimal price;
    private String productType;
    private String fileUrl;
    private String previewUrl;
}