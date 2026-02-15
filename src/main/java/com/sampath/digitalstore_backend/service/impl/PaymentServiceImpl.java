package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentRequest;
import com.sampath.digitalstore_backend.dto.payment.CreatePaymentIntentResponse;
import com.sampath.digitalstore_backend.entity.*;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.repository.*;
import com.sampath.digitalstore_backend.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Value("${stripe.webhookSecret}")
    private String webhookSecret;

    @Value("${stripe.currency:usd}")
    private String currency;

    @Transactional
    @Override
    public CreatePaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Product> products = productRepository.findAllById(request.getProductIds());
        if (products.isEmpty()) throw new BadRequestException("No products selected");

        // Only published products
        boolean anyUnpublished = products.stream().anyMatch(p -> !p.isPublished());
        if (anyUnpublished) throw new BadRequestException("Cart contains unpublished product(s)");

        double total = products.stream().mapToDouble(Product::getPrice).sum();

        // Stripe amount is in smallest currency unit (cents)
        long amountInCents = Math.round(total * 100);

        // Create order in PENDING
        Order order = Order.builder()
                .orderNumber(UUID.randomUUID().toString())
                .user(user)
                .status("PENDING")
                .totalAmount(total)
                .build();

        order = orderRepository.save(order);

        // Create Stripe PaymentIntent and attach metadata for lookup in webhook
        try {
            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amountInCents)
                            .setCurrency(currency)
                            .putMetadata("orderNumber", order.getOrderNumber())
                            .putMetadata("userId", String.valueOf(user.getId()))
                            .build();

            PaymentIntent pi = PaymentIntent.create(params);

            order.setPaymentIntentId(pi.getId());
            order.setClientSecret(pi.getClientSecret());
            orderRepository.save(order);

            return CreatePaymentIntentResponse.builder()
                    .orderNumber(order.getOrderNumber())
                    .paymentIntentId(pi.getId())
                    .clientSecret(pi.getClientSecret())
                    .amount(total)
                    .currency(currency)
                    .build();

        } catch (StripeException e) {
            throw new BadRequestException("Stripe error: " + e.getMessage());
        }
    }

    @Transactional
    @Override
    public void handleStripeWebhook(String payload, String sigHeader) {

        Event event;
        try {
            // Verify signature with raw body + Stripe-Signature header
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret); // recommended by Stripe docs :contentReference[oaicite:1]{index=1}
        } catch (SignatureVerificationException e) {
            throw new BadRequestException("Invalid Stripe signature");
        }

        // Handle payment success/failure events :contentReference[oaicite:2]{index=2}
        if ("payment_intent.succeeded".equals(event.getType())) {

            PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);

            if (pi == null) return;

            String orderNumber = pi.getMetadata().get("orderNumber");
            if (orderNumber == null) return;

            Order order = orderRepository.findByOrderNumber(orderNumber);
            if (order == null) return;

            order.setStatus("PAID");
            orderRepository.save(order);

        } else if ("payment_intent.payment_failed".equals(event.getType())) {

            PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);

            if (pi == null) return;

            String orderNumber = pi.getMetadata().get("orderNumber");
            if (orderNumber == null) return;

            Order order = orderRepository.findByOrderNumber(orderNumber);
            if (order == null) return;

            order.setStatus("FAILED");
            orderRepository.save(order);
        }
    }
}