package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.product.*;

import java.util.List;

public interface ProductService {

    ProductResponse createProductByEmail(ProductRequest request, String email);

    List<ProductResponse> getAllPublishedProducts();

    List<ProductResponse> getProductsBySeller(Long sellerId);

    ProductResponse getProductById(Long productId);

    void deleteProduct(Long productId);

    List<PurchaseProductResponse> getMyPurchasedProducts(String email);

    String getSecureDownloadUrl(Long productId, String email);

    ProductResponse publishProduct(Long productId, String email);

    ProductResponse unpublishProduct(Long productId, String email);
}