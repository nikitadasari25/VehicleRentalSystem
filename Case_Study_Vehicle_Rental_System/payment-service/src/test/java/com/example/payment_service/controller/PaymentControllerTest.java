package com.example.payment_service.controller;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.dto.PaymentVerificationRequest;
import com.example.payment_service.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    void createOrderSuccessfully() throws Exception {

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(1L);
        request.setAmount(500.0);

        PaymentResponse response =
                new PaymentResponse(
                        "order_123",
                        "rzp_test_key",
                        500.0,
                        "INR"
                );

        when(paymentService.createOrder(any(PaymentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/payments/create-order")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId")
                        .value("order_123"))
                .andExpect(jsonPath("$.keyId")
                        .value("rzp_test_key"))
                .andExpect(jsonPath("$.amount")
                        .value(500.0))
                .andExpect(jsonPath("$.currency")
                        .value("INR"));
    }

    @Test
    void verifyPaymentSuccessfully() throws Exception {

        PaymentVerificationRequest request =
                new PaymentVerificationRequest();

        request.setRazorpayOrderId("order_123");
        request.setRazorpayPaymentId("pay_123");
        request.setRazorpaySignature("signature_123");

        when(paymentService.verifyPayment(
                any(PaymentVerificationRequest.class)))
                .thenReturn(true);

        mockMvc.perform(post("/api/payments/verify")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string(
                        "Payment verified successfully"));
    }

    @Test
    void verifyPaymentFailed() throws Exception {

        PaymentVerificationRequest request =
                new PaymentVerificationRequest();

        request.setRazorpayOrderId("order_123");
        request.setRazorpayPaymentId("pay_123");
        request.setRazorpaySignature("invalid_signature");

        when(paymentService.verifyPayment(
                any(PaymentVerificationRequest.class)))
                .thenReturn(false);

        mockMvc.perform(post("/api/payments/verify")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(
                        "Payment verification failed"));
    }

    @Test
    void createOrderValidationFailure() throws Exception {

        PaymentRequest request = new PaymentRequest();

        mockMvc.perform(post("/api/payments/create-order")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void verifyPaymentValidationFailure() throws Exception {

        PaymentVerificationRequest request =
                new PaymentVerificationRequest();

        mockMvc.perform(post("/api/payments/verify")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}