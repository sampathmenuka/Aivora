package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.order.OrderRequest;
import com.sampath.digitalstore_backend.dto.order.OrderResponse;
import com.sampath.digitalstore_backend.entity.*;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.OrderRepository;
import com.sampath.digitalstore_backend.repository.ProductRepository;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public OrderResponse createOrder(OrderRequest request, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Product> products = productRepository.findAllById(request.getProductIds());

        if (products.isEmpty()) {
            throw new BadRequestException("No products selected");
        }

        Order order = new Order();
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setUser(user);
        order.setStatus("PENDING");

        List<OrderItem> orderItems = products.stream().map(product -> {

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setPriceAtPurchase(product.getPrice());
            item.setQuantity(1);

            double platformFee = product.getPrice() * 0.1;
            item.setPlatformFee(platformFee);
            item.setSellerEarnings(product.getPrice() - platformFee);

            return item;

        }).toList();

        order.setOrderItems(orderItems);

        double totalAmount = orderItems.stream()
                .mapToDouble(OrderItem::getPriceAtPurchase)
                .sum();

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.builder()
                .orderNumber(savedOrder.getOrderNumber())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus())
                .createdAt(savedOrder.getCreatedAt())
                .products(products.stream()
                        .map(Product::getTitle)
                        .toList())
                .build();
    }

    @Override
    public List<OrderResponse> getUserOrders(Long userId) {
        return List.of();
    }

    @Override
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        return null;
    }
}