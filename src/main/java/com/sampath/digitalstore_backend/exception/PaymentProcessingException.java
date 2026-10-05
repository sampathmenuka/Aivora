package com.sampath.digitalstore_backend.exception;

// The payment provider (Stripe) failed or rejected the request
public class PaymentProcessingException extends RuntimeException {

    public PaymentProcessingException(String message) {
        super(message);
    }
}
