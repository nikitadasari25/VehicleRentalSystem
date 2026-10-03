package com.example.booking_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VehicleDTO {

    private Long vehicleId;
    private String vehicleNumber;
    private String brand;
    private String model;
    private String type;
    private double pricePerDay;
    private String availabilityStatus;
}