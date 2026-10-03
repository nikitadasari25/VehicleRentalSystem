package com.example.payment_service.controller;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.PaymentVerificationRequest;
import com.example.payment_service.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Tag(
        name = "Payment Management",
        description = "Payment Service APIs"
)
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create a payment order.
     */
    @Operation(summary = "Create Payment Order")
    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse> createOrder(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response =
                paymentService.createOrder(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Verify payment after successful transaction.
     */
    @Operation(summary = "Verify Payment")
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {

        boolean verified =
                paymentService.verifyPayment(request);

        if (verified) {
            return ResponseEntity.ok(
                    "Payment verified successfully"
            );
        }

        return ResponseEntity.badRequest().body(
                "Payment verification failed"
        );
    }
}