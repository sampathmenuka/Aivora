package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.order.OrderRequest;
import com.sampath.digitalstore_backend.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request, Long userId);

    List<OrderResponse> getUserOrders(Long userId);

    OrderResponse getOrderByOrderNumber(String orderNumber);
}
