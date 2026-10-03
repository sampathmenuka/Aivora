package com.sampath.digitalstore_backend.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class StripeConfig {

    @Value("${stripe.secretKey}")
    private String secretKey;

    @Value("${stripe.webhookSecret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        if (secretKey.isBlank()) {
            log.warn("STRIPE_SECRET_KEY is not set: payment intents cannot be created");
        }
        if (webhookSecret.isBlank()) {
            log.warn("STRIPE_WEBHOOK_SECRET is not set: Stripe webhooks will be rejected");
        }
        Stripe.apiKey = secretKey;
    }
}
