package com.example.booking_service.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PaymentRequest {
    private Long bookingId;
    private Double amount;
    public PaymentRequest() {
    }

}