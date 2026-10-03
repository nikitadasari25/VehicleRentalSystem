package com.example.vehicle_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class VehicleDTO {

    private Long vehicleId;

    @NotBlank(message = "Vehicle number is required")
    @Pattern(
            regexp = "^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$",
            message = "Vehicle number must be in format KA01AB1234"
    )
    private String vehicleNumber;

    @NotBlank(message = "Brand is required")
    @Size(min = 2, max = 30,
            message = "Brand must be between 2 and 30 characters")
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(min = 2, max = 30,
            message = "Model must be between 2 and 30 characters")
    private String model;

    @NotBlank(message = "Type is required")
    private String type;

    @Positive(message = "Price per day must be greater than 0")
    private double pricePerDay;

    @NotBlank(message = "Availability status is required")
    @Pattern(
            regexp = "AVAILABLE|BOOKED|MAINTENANCE",
            message = "Status must be AVAILABLE, BOOKED, or MAINTENANCE"
    )
    private String availabilityStatus;

    // Default Constructor
    public VehicleDTO() {
    }

    // Parameterized Constructor
    public VehicleDTO(Long vehicleId, String vehicleNumber, String brand,
                      String model, String type, double pricePerDay,
                      String availabilityStatus) {
        this.vehicleId = vehicleId;
        this.vehicleNumber = vehicleNumber;
        this.brand = brand;
        this.model = model;
        this.type = type;
        this.pricePerDay = pricePerDay;
        this.availabilityStatus = availabilityStatus;
    }

    // Getters and Setters

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(double pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    @Override
    public String toString() {
        return "VehicleDTO [vehicleId=" + vehicleId
                + ", vehicleNumber=" + vehicleNumber
                + ", brand=" + brand
                + ", model=" + model
                + ", type=" + type
                + ", pricePerDay=" + pricePerDay
                + ", availabilityStatus=" + availabilityStatus + "]";
    }
}