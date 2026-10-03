package com.example.payment_service.service;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private PaymentRequest request;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(
                paymentService,
                "keyId",
                "rzp_test_key"
        );

        ReflectionTestUtils.setField(
                paymentService,
                "keySecret",
                "secret"
        );

        request = new PaymentRequest();
        request.setBookingId(1L);
        request.setAmount(5000.0);
    }

    @Test
    void shouldThrowExceptionWhenPaymentAlreadyCompleted() {

        Payment payment = new Payment();
        payment.setBookingId(1L);
        payment.setPaymentStatus("SUCCESS");

        when(paymentRepository
                .findByBookingIdAndPaymentStatus(
                        1L,
                        "SUCCESS"
                ))
                .thenReturn(Optional.of(payment));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> paymentService.createOrder(request)
                );

        assertEquals(
                "Payment already completed for booking id 1",
                exception.getMessage()
        );
    }

    @Test
    void shouldReturnExistingCreatedOrder() {

        Payment payment = new Payment();

        payment.setBookingId(1L);
        payment.setPaymentStatus("CREATED");
        payment.setRazorpayOrderId("order_123");
        payment.setAmount(5000.0);
        payment.setCurrency("INR");

        when(paymentRepository
                .findByBookingIdAndPaymentStatus(
                        1L,
                        "SUCCESS"
                ))
                .thenReturn(Optional.empty());

        when(paymentRepository
                .findByBookingIdAndPaymentStatus(
                        1L,
                        "CREATED"
                ))
                .thenReturn(Optional.of(payment));

        var response =
                paymentService.createOrder(request);

        assertNotNull(response);

        assertEquals(
                "order_123",
                response.getOrderId()
        );

        assertEquals(
                "rzp_test_key",
                response.getKeyId()
        );

        assertEquals(
                5000.0,
                response.getAmount()
        );
    }

    @Test
    void shouldThrowRuntimeExceptionWhenRazorpayFails() {

        when(paymentRepository
                .findByBookingIdAndPaymentStatus(
                        1L,
                        "SUCCESS"
                ))
                .thenReturn(Optional.empty());

        when(paymentRepository
                .findByBookingIdAndPaymentStatus(
                        1L,
                        "CREATED"
                ))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> paymentService.createOrder(request)
                );

        assertTrue(
                exception.getMessage()
                        .contains("Unable to create Razorpay order")
        );
    }
}