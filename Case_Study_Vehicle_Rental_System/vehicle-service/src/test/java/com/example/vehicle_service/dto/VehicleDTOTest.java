package com.example.vehicle_service.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VehicleDTOTest {

    @Test
    void shouldCreateVehicleDTOUsingConstructor() {

        VehicleDTO dto = new VehicleDTO(
                1L,
                "TN01AB1234",
                "Toyota",
                "Innova",
                "SUV",
                2000.0,
                "AVAILABLE"
        );

        assertEquals(1L, dto.getVehicleId());
        assertEquals("TN01AB1234", dto.getVehicleNumber());
        assertEquals("Toyota", dto.getBrand());
        assertEquals("Innova", dto.getModel());
        assertEquals("SUV", dto.getType());
        assertEquals(2000.0, dto.getPricePerDay());
        assertEquals("AVAILABLE", dto.getAvailabilityStatus());
    }

    @Test
    void shouldReturnProperToString() {

        VehicleDTO dto = new VehicleDTO(
                1L,
                "TN01AB1234",
                "Toyota",
                "Innova",
                "SUV",
                2000.0,
                "AVAILABLE"
        );

        String result = dto.toString();

        assertNotNull(result);
        assertTrue(result.contains("Toyota"));
        assertTrue(result.contains("TN01AB1234"));
        assertTrue(result.contains("AVAILABLE"));
    }
}