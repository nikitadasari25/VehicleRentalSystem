package com.example.payment_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity

@Table(name = "payments")

public class Payment {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private Long bookingId;
    private Double amount;
    private String currency;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentStatus;
    private LocalDateTime paymentDate;

    public Payment() {

    }

}
 