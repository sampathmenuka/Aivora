package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.product.ProductRequest;
import com.sampath.digitalstore_backend.dto.product.ProductResponse;
import com.sampath.digitalstore_backend.dto.product.PurchaseProductResponse;
import com.sampath.digitalstore_backend.entity.Order;
import com.sampath.digitalstore_backend.entity.Product;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.exception.UnauthorizedException;
import com.sampath.digitalstore_backend.repository.OrderRepository;
import com.sampath.digitalstore_backend.repository.ProductRepository;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public ProductResponse createProductByEmail(ProductRequest request, String email) {

        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .productType(request.getProductType())
                .fileUrl(request.getFileUrl())
                .previewUrl(request.getPreviewUrl())
                .seller(seller)
                .isPublished(false)
                .build();

        productRepository.save(product);

        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllPublishedProducts() {
        return productRepository.findByIsPublishedTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(Long productId, ProductRequest request, String email) {
        Product product = getOwnedProductOrAdmin(productId, email);

        if (request.getTitle() != null) {
            product.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getProductType() != null) {
            product.setProductType(request.getProductType());
        }
        if (request.getPreviewUrl() != null) {
            product.setPreviewUrl(request.getPreviewUrl());
        }
        if (request.getFileUrl() != null && !request.getFileUrl().isBlank()) {
            product.setFileUrl(request.getFileUrl());
        }

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public void deleteProduct(Long productId, String email) {
        Product product = getOwnedProductOrAdmin(productId, email);
        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .productType(product.getProductType())
                .thumbnailUrl(product.getThumbnailUrl())
                .previewUrl(product.getPreviewUrl())
                .sellerEmail(product.getSeller() != null ? product.getSeller().getEmail() : null)
                .isPublished(product.isPublished())
                .build();
    }

    private Product getOwnedProductOrAdmin(Long productId, String email) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isOwner = product.getSeller().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to modify this product");
        }
        return product;
    }

    @Override
    public ProductResponse publishProduct(Long productId, String sellerEmail) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only product owner seller OR admin can publish
        boolean isOwner = product.getSeller().getId().equals(seller.getId());
        boolean isAdmin = seller.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to publish this product");
        }

        product.setPublished(true);
        productRepository.save(product);

        return mapToResponse(product);
    }

    @Override
    public ProductResponse unpublishProduct(Long productId, String sellerEmail) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isOwner = product.getSeller().getId().equals(seller.getId());
        boolean isAdmin = seller.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to unpublish this product");
        }

        product.setPublished(false);
        productRepository.save(product);

        return mapToResponse(product);
    }

    @Override
    public String getSecureDownloadUrl(Long productId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean purchased = orderRepository.hasPurchasedProduct(user.getId(), productId);

        if (!purchased) {
            throw new UnauthorizedException("You have not purchased this product");
        }

        return "/api/downloads/products/" + productId;
    }

    @Override
    public List<PurchaseProductResponse> getMyPurchasedProducts(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Order> paidOrders = orderRepository.findByUserId(user.getId())
                .stream()
                .filter(o -> "PAID".equals(o.getStatus()))
                .toList();

        return paidOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(oi -> PurchaseProductResponse.builder()
                        .productId(oi.getProduct().getId())
                        .title(oi.getProduct().getTitle())
                        .productType(oi.getProduct().getProductType())
                        .previewUrl(oi.getProduct().getPreviewUrl())
                        .build())
                .distinct()
                .toList();
    }
}