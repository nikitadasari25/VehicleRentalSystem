package com.example.payment_service.service;
import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.PaymentVerificationRequest;
public interface PaymentService {
   PaymentResponse createOrder(PaymentRequest request);
   boolean verifyPayment(PaymentVerificationRequest request);
}