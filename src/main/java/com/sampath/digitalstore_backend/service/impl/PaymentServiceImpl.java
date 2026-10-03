package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentRequest;
import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentResponse;
import com.sampath.digitalstore_backend.entity.Order;
import com.sampath.digitalstore_backend.entity.OrderStatus;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.PaymentProcessingException;
import com.sampath.digitalstore_backend.repository.OrderRepository;
import com.sampath.digitalstore_backend.service.CartService;
import com.sampath.digitalstore_backend.service.OrderService;
import com.sampath.digitalstore_backend.service.PaymentService;
import com.sampath.digitalstore_backend.util.Constants;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderService orderService;
    private final CartService cartService;
    private final OrderRepository orderRepository;

    @Value("${stripe.webhookSecret}")
    private String webhookSecret;

    @Value("${stripe.currency:usd}")
    private String currency;

    @Transactional
    @Override
    public CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request, String email) {

        boolean existingOrder = request != null
                && request.getOrderNumber() != null
                && !request.getOrderNumber().isBlank();

        Order order = existingOrder
                ? orderService.getOwnedOrder(request.getOrderNumber(), email)
                : orderService.createPendingOrderFromCart(email);

        switch (order.getStatus()) {
            case PAID -> throw new BadRequestException("Order is already paid");
            case CANCELLED -> throw new BadRequestException("Order was cancelled");
            case FAILED -> order.setStatus(OrderStatus.PENDING); // retrying after a declined payment
            case PENDING -> { }
        }

        // Reuse the existing intent so repeated calls never create a second charge for one order
        if (order.getPaymentIntentId() == null) {
            PaymentIntent pi = createStripePaymentIntent(order);
            order.setPaymentIntentId(pi.getId());
            order.setClientSecret(pi.getClientSecret());
        }
        orderRepository.save(order);

        return CreatePaymentIntentResponse.builder()
                .orderNumber(order.getOrderNumber())
                .paymentIntentId(order.getPaymentIntentId())
                .clientSecret(order.getClientSecret())
                .amount(order.getTotalAmount())
                .currency(currency)
                .build();
    }

    private PaymentIntent createStripePaymentIntent(Order order) {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(toMinorUnits(order.getTotalAmount()))
                .setCurrency(currency)
                .putMetadata("orderNumber", order.getOrderNumber())
                .putMetadata("userId", String.valueOf(order.getUser().getId()))
                .build();

        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey("order-" + order.getOrderNumber())
                .build();

        try {
            return PaymentIntent.create(params, options);
        } catch (StripeException e) {
            log.error("Stripe PaymentIntent creation failed for order {}", order.getOrderNumber(), e);
            throw new PaymentProcessingException("Payment could not be initialized. Please try again.");
        }
    }

    // Stripe amounts are in the smallest currency unit (cents). Assumes a 2-decimal currency like USD.
    private static long toMinorUnits(BigDecimal amount) {
        return amount.setScale(Constants.MONEY_SCALE, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }

    @Transactional
    @Override
    public void handleStripeWebhook(String payload, String sigHeader) {

        if (webhookSecret == null || webhookSecret.isBlank()) {
            // 500 so Stripe keeps retrying until the secret is configured
            throw new IllegalStateException("stripe.webhookSecret is not configured");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new BadRequestException("Invalid Stripe signature");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> onPaymentSucceeded(extractPaymentIntent(event));
            case "payment_intent.payment_failed" -> updateStatus(extractPaymentIntent(event),
                    OrderStatus.FAILED, EnumSet.of(OrderStatus.PENDING));
            case "payment_intent.canceled" -> updateStatus(extractPaymentIntent(event),
                    OrderStatus.CANCELLED, EnumSet.of(OrderStatus.PENDING, OrderStatus.FAILED));
            default -> log.debug("Ignoring Stripe event {} ({})", event.getId(), event.getType());
        }
    }

    private void onPaymentSucceeded(PaymentIntent pi) {
        Order order = findOrder(pi);
        if (order == null) return;

        if (order.getStatus() == OrderStatus.PAID) {
            log.info("Order {} already PAID, ignoring duplicate event", order.getOrderNumber());
            return;
        }

        long expected = toMinorUnits(order.getTotalAmount());
        if (pi.getAmountReceived() == null || pi.getAmountReceived() != expected
                || !currency.equalsIgnoreCase(pi.getCurrency())) {
            log.error("Amount mismatch for order {}: expected {} {}, received {} {}",
                    order.getOrderNumber(), expected, currency, pi.getAmountReceived(), pi.getCurrency());
            return;
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        List<Long> productIds = order.getOrderItems().stream()
                .map(oi -> oi.getProduct().getId())
                .toList();
        cartService.removePurchasedItems(order.getUser().getId(), productIds);

        log.info("Order {} marked PAID", order.getOrderNumber());
    }

    private void updateStatus(PaymentIntent pi, OrderStatus newStatus, Set<OrderStatus> allowedFrom) {
        Order order = findOrder(pi);
        if (order == null) return;

        if (!allowedFrom.contains(order.getStatus())) {
            log.info("Not moving order {} from {} to {}", order.getOrderNumber(), order.getStatus(), newStatus);
            return;
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        log.info("Order {} marked {}", order.getOrderNumber(), newStatus);
    }

    private Order findOrder(PaymentIntent pi) {
        Order order = orderRepository.findByPaymentIntentId(pi.getId()).orElse(null);
        if (order == null) {
            // Not ours (e.g. another integration on the same Stripe account): acknowledge and move on
            log.warn("No order found for PaymentIntent {}", pi.getId());
        }
        return order;
    }

    private PaymentIntent extractPaymentIntent(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject object = deserializer.getObject().orElse(null);

        if (object == null) {
            // Happens when the webhook endpoint API version differs from the library's pinned version
            try {
                object = deserializer.deserializeUnsafe();
            } catch (EventDataObjectDeserializationException e) {
                throw new IllegalStateException("Could not deserialize Stripe event " + event.getId(), e);
            }
        }
        return (PaymentIntent) object;
    }
}
