package com.example.booking_service.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PaymentResponse {
    private String orderId;
    private String status;
    public PaymentResponse() {
    }

}