package com.example.booking_service.client;

import com.example.booking_service.dto.VehicleDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "vehicle-service")
public interface VehicleClient {

    @GetMapping("/api/vehicles/{id}")
    VehicleDTO getVehicleById(@PathVariable("id") Long id);
}