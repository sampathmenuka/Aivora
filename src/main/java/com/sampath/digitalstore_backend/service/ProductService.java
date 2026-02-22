package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.product.ProductRequest;
import com.sampath.digitalstore_backend.dto.product.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request, Long sellerId);

    List<ProductResponse> getAllPublishedProducts();

    List<ProductResponse> getProductsBySeller(Long sellerId);

    ProductResponse getProductById(Long productId);

    void deleteProduct(Long productId);
}