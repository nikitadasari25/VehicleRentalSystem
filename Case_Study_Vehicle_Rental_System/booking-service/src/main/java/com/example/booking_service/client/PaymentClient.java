package com.example.booking_service.client;
import com.example.booking_service.dto.PaymentRequest;
import com.example.booking_service.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
@FeignClient(name = "payment-service")
public interface PaymentClient {
    @PostMapping("/api/payments/create-order")
    PaymentResponse createOrder(@RequestBody PaymentRequest request);
}