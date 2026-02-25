package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.cart.AddToCartRequest;
import com.sampath.digitalstore_backend.dto.cart.CartItemResponse;
import com.sampath.digitalstore_backend.dto.cart.CartResponse;
import com.sampath.digitalstore_backend.entity.*;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.*;
import com.sampath.digitalstore_backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    @Override
    public CartResponse getMyCart(String email) {
        User user = getUser(email);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));

        return toResponse(cart);
    }

    @Transactional
    @Override
    public CartResponse addToCart(AddToCartRequest request, String email) {

        if (request.getProductId() == null) {
            throw new BadRequestException("productId is required");
        }

        int qty = (request.getQuantity() == null || request.getQuantity() < 1) ? 1 : request.getQuantity();

        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // only published products should be added (recommended)
        if (!product.isPublished()) {
            throw new BadRequestException("Product is not published");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (item == null) {
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(qty)
                    .priceSnapshot(product.getPrice())
                    .build();
            cart.getItems().add(item);
        } else {
            item.setQuantity(item.getQuantity() + qty);
        }

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    @Override
    public CartResponse removeFromCart(Long productId, String email) {

        User user = getUser(email);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cart.getItems().remove(item); // orphanRemoval = true will delete it
        cartRepository.save(cart);

        return toResponse(cart);
    }

    @Transactional
    @Override
    public void clearCart(String email) {
        User user = getUser(email);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private CartResponse toResponse(Cart cart) {

        List<CartItemResponse> items = cart.getItems().stream().map(ci -> {
            double price = ci.getPriceSnapshot();
            double lineTotal = price * ci.getQuantity();

            return CartItemResponse.builder()
                    .productId(ci.getProduct().getId())
                    .title(ci.getProduct().getTitle())
                    .price(price)
                    .quantity(ci.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
        }).toList();

        double total = items.stream().mapToDouble(CartItemResponse::getLineTotal).sum();

        return CartResponse.builder()
                .items(items)
                .total(total)
                .build();
    }
}