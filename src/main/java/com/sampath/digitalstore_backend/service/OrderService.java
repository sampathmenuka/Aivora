package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.order.OrderResponse;
import com.sampath.digitalstore_backend.entity.Order;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(String email);

    List<OrderResponse> getUserOrders(String email);

    OrderResponse getOrderByOrderNumber(String orderNumber, String email);

    // Internal (service-to-service) helpers used by the payment flow

    Order createPendingOrderFromCart(String email);

    Order getOwnedOrder(String orderNumber, String email);
}
