package com.example.booking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private Long userId;
    private Long vehicleId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalAmount;
    private String status;

}
