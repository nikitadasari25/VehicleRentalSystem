package com.example.payment_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PaymentRequest {

    @NotNull(message = "Booking ID is required")
    @Positive(message = "Booking ID must be greater than zero")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

}