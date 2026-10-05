package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.cart.AddToCartRequest;
import com.sampath.digitalstore_backend.dto.cart.CartItemResponse;
import com.sampath.digitalstore_backend.dto.cart.CartResponse;
import com.sampath.digitalstore_backend.dto.cart.UpdateCartItemRequest;
import com.sampath.digitalstore_backend.entity.*;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.*;
import com.sampath.digitalstore_backend.service.CartService;
import com.sampath.digitalstore_backend.util.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
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

    private Cart getExistingCart(String email) {
        User user = getUser(email);
        return cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
    }

    private CartItem getCartItem(Cart cart, Long productId) {
        return cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));
    }

    @Transactional(readOnly = true)
    @Override
    public CartResponse getMyCart(String email) {
        User user = getUser(email);
        return cartRepository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseGet(CartServiceImpl::emptyCart);
    }

    @Transactional
    @Override
    public CartResponse addToCart(AddToCartRequest request, String email) {

        int qty = request.getQuantity() == null ? 1 : request.getQuantity();

        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

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
            item.setQuantity(checkQuantity(item.getQuantity() + qty));
            item.setPriceSnapshot(product.getPrice());
        }

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    @Override
    public CartResponse updateItemQuantity(Long productId, UpdateCartItemRequest request, String email) {

        Cart cart = getExistingCart(email);
        CartItem item = getCartItem(cart, productId);

        item.setQuantity(checkQuantity(request.getQuantity()));
        item.setPriceSnapshot(item.getProduct().getPrice());

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    @Override
    public CartResponse removeFromCart(Long productId, String email) {

        Cart cart = getExistingCart(email);
        CartItem item = getCartItem(cart, productId);

        cart.getItems().remove(item); // orphanRemoval = true will delete it
        cartRepository.save(cart);

        return toResponse(cart);
    }

    @Transactional
    @Override
    public void clearCart(String email) {
        User user = getUser(email);
        cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    @Transactional
    @Override
    public void removePurchasedItems(Long userId, Collection<Long> productIds) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().removeIf(ci -> productIds.contains(ci.getProduct().getId()));
            cartRepository.save(cart);
        });
    }

    private int checkQuantity(int quantity) {
        if (quantity > Constants.MAX_CART_ITEM_QUANTITY) {
            throw new BadRequestException("Maximum quantity per product is " + Constants.MAX_CART_ITEM_QUANTITY);
        }
        return quantity;
    }

    private static CartResponse emptyCart() {
        return CartResponse.builder()
                .items(List.of())
                .total(BigDecimal.ZERO.setScale(Constants.MONEY_SCALE, RoundingMode.HALF_UP))
                .build();
    }

    private CartResponse toResponse(Cart cart) {

        // Show the current product price, since that is what checkout will charge
        List<CartItemResponse> items = cart.getItems().stream().map(ci -> {
            BigDecimal price = ci.getProduct().getPrice();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(ci.getQuantity()));

            return CartItemResponse.builder()
                    .productId(ci.getProduct().getId())
                    .title(ci.getProduct().getTitle())
                    .price(price)
                    .quantity(ci.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
        }).toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(Constants.MONEY_SCALE, RoundingMode.HALF_UP);

        return CartResponse.builder()
                .items(items)
                .total(total)
                .build();
    }
}
