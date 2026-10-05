package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.order.OrderResponse;
import com.sampath.digitalstore_backend.entity.*;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.CartRepository;
import com.sampath.digitalstore_backend.repository.OrderRepository;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.OrderService;
import com.sampath.digitalstore_backend.util.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    @Override
    public OrderResponse createOrder(String email) {
        return toResponse(createPendingOrderFromCart(email));
    }

    // Snapshots the cart into a PENDING order. The cart is cleared only after payment succeeds.
    @Transactional
    @Override
    public Order createPendingOrderFromCart(String email) {

        User user = getUser(email);

        Cart cart = cartRepository.findByUserId(user.getId())
                .filter(c -> !c.getItems().isEmpty())
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));

        List<String> unavailable = cart.getItems().stream()
                .map(CartItem::getProduct)
                .filter(p -> !p.isPublished())
                .map(Product::getTitle)
                .toList();
        if (!unavailable.isEmpty()) {
            throw new BadRequestException("These products are no longer available: " + String.join(", ", unavailable));
        }

        Order order = Order.builder()
                .orderNumber(UUID.randomUUID().toString())
                .user(user)
                .status(OrderStatus.PENDING)
                .build();

        cart.getItems().forEach(ci -> order.addItem(toOrderItem(ci)));

        order.setTotalAmount(order.getOrderItems().stream()
                .map(oi -> oi.getPriceAtPurchase().multiply(BigDecimal.valueOf(oi.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(Constants.MONEY_SCALE, RoundingMode.HALF_UP));

        if (order.getTotalAmount().signum() <= 0) {
            throw new BadRequestException("Order total must be greater than zero");
        }

        return orderRepository.save(order);
    }

    private OrderItem toOrderItem(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal price = product.getPrice();
        BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        BigDecimal platformFee = lineTotal.multiply(Constants.PLATFORM_FEE_RATE)
                .setScale(Constants.MONEY_SCALE, RoundingMode.HALF_UP);

        return OrderItem.builder()
                .product(product)
                .priceAtPurchase(price)
                .quantity(cartItem.getQuantity())
                .platformFee(platformFee)
                .sellerEarnings(lineTotal.subtract(platformFee))
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getUserOrders(String email) {
        User user = getUser(email);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public OrderResponse getOrderByOrderNumber(String orderNumber, String email) {
        return toResponse(getOwnedOrder(orderNumber, email));
    }

    @Transactional(readOnly = true)
    @Override
    public Order getOwnedOrder(String orderNumber, String email) {
        User user = getUser(email);
        // Same 404 whether the order is missing or belongs to someone else
        return orderRepository.findByOrderNumberAndUserId(orderNumber, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private OrderResponse toResponse(Order order) {
        List<String> products = order.getOrderItems().stream()
                .map(item -> item.getProduct().getTitle())
                .toList();

        return OrderResponse.builder()
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .products(products)
                .build();
    }
}
