package com.example.payment_service.service;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.PaymentVerificationRequest;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public PaymentResponse createOrder(PaymentRequest request) {

        // Check if payment already completed
        Optional<Payment> existingSuccess =
                paymentRepository.findByBookingIdAndPaymentStatus(
                        request.getBookingId(),
                        "SUCCESS"
                );

        if (existingSuccess.isPresent()) {
            throw new RuntimeException(
                    "Payment already completed for booking id "
                            + request.getBookingId()
            );
        }

        // Check if a pending order already exists
        Optional<Payment> existingCreated =
                paymentRepository.findByBookingIdAndPaymentStatus(
                        request.getBookingId(),
                        "CREATED"
                );

        if (existingCreated.isPresent()) {

            Payment payment = existingCreated.get();

            return new PaymentResponse(
                    payment.getRazorpayOrderId(),
                    keyId,
                    payment.getAmount(),
                    payment.getCurrency()
            );
        }

        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(keyId, keySecret);

            int amountInPaise =
                    (int) Math.round(request.getAmount() * 100);

            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put(
                    "receipt",
                    "booking_" + request.getBookingId()
            );

            Order order =
                    razorpayClient.orders.create(orderRequest);

            String orderId = order.get("id");

            Payment payment = new Payment();

            payment.setBookingId(request.getBookingId());
            payment.setAmount(request.getAmount());
            payment.setCurrency("INR");
            payment.setRazorpayOrderId(orderId);
            payment.setPaymentStatus("CREATED");
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepository.save(payment);

            return new PaymentResponse(
                    orderId,
                    keyId,
                    request.getAmount(),
                    "INR"
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + e.getMessage()
            );
        }
    }

    @Override
    public boolean verifyPayment(
            PaymentVerificationRequest request) {

        try {

            JSONObject options = new JSONObject();

            options.put(
                    "razorpay_order_id",
                    request.getRazorpayOrderId()
            );

            options.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );

            options.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );

            boolean verified =
                    Utils.verifyPaymentSignature(
                            options,
                            keySecret
                    );

            if (verified) {

                Payment payment =
                        paymentRepository.findByRazorpayOrderId(
                                request.getRazorpayOrderId()
                        );

                if (payment != null) {

                    payment.setRazorpayPaymentId(
                            request.getRazorpayPaymentId()
                    );

                    payment.setPaymentStatus(
                            "SUCCESS"
                    );

                    payment.setPaymentDate(
                            LocalDateTime.now()
                    );

                    paymentRepository.save(payment);
                }
            }

            return verified;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Payment verification failed: "
                            + e.getMessage()
            );
        }
    }
}