package com.example.payment_service.repository;

import com.example.payment_service.entity.Payment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PaymentRepositoryTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void findByRazorpayOrderIdSuccessfully() {

        Payment payment = new Payment();
        payment.setBookingId(101L);
        payment.setAmount(1000.0);
        payment.setCurrency("INR");
        payment.setRazorpayOrderId("order_123");
        payment.setPaymentStatus("CREATED");

        paymentRepository.save(payment);

        Payment result =
                paymentRepository.findByRazorpayOrderId("order_123");

        assertNotNull(result);
        assertEquals("order_123",
                result.getRazorpayOrderId());
    }

    @Test
    void findByBookingIdAndPaymentStatusSuccessfully() {

        Payment payment = new Payment();
        payment.setBookingId(101L);
        payment.setAmount(1000.0);
        payment.setCurrency("INR");
        payment.setRazorpayOrderId("order_123");
        payment.setPaymentStatus("SUCCESS");

        paymentRepository.save(payment);

        Optional<Payment> result =
                paymentRepository
                        .findByBookingIdAndPaymentStatus(
                                101L,
                                "SUCCESS"
                        );

        assertTrue(result.isPresent());
    }
}