package com.example.vehicle_service.service;

import com.example.vehicle_service.dto.VehicleDTO;
import com.example.vehicle_service.exception.VehicleNotFoundException;

import java.util.List;

public interface VehicleService {
    VehicleDTO addVehicle(VehicleDTO vehicleDTO);

    List<VehicleDTO> getAllVehicles();

    VehicleDTO getVehicleById(Long id) throws VehicleNotFoundException;

    VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO) throws VehicleNotFoundException;

    void deleteVehicle(Long id) throws VehicleNotFoundException;

    List<VehicleDTO> getVehiclesByType(String type);

    List<VehicleDTO> getAvailableVehicles();
}