package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.product.ProductRequest;
import com.sampath.digitalstore_backend.dto.product.ProductResponse;
import com.sampath.digitalstore_backend.dto.product.PurchaseProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProductByEmail(ProductRequest request, String email);

    List<ProductResponse> getAllPublishedProducts();

    List<ProductResponse> getProductsBySeller(Long sellerId);

    ProductResponse getProductById(Long productId);

    void deleteProduct(Long productId);

    ProductResponse createProductByEmail(ProductRequest request, String email);

    ProductResponse publishProduct(Long productId, String sellerEmail);

    ProductResponse unpublishProduct(Long productId, String sellerEmail);
}