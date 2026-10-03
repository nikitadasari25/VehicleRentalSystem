package com.example.vehicle_service.service;

import com.example.vehicle_service.dto.VehicleDTO;
import com.example.vehicle_service.entity.Vehicle;
import com.example.vehicle_service.exception.VehicleNotFoundException;
import com.example.vehicle_service.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleServiceImpl implements VehicleService {
    private final VehicleRepository vehicleRepository;

    public VehicleServiceImpl(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public VehicleDTO addVehicle(VehicleDTO vehicleDTO) {
        Vehicle vehicle = convertToEntity(vehicleDTO);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(savedVehicle);
    }

    @Override
    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDTO getVehicleById(Long id) throws VehicleNotFoundException {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new VehicleNotFoundException("Vehicle not found with ID: " + id));
        return convertToDTO(vehicle);
    }

    @Override
    public VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO) throws VehicleNotFoundException {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new VehicleNotFoundException("Vehicle not found with ID: " + id));
        vehicle.setVehicleNumber(vehicleDTO.getVehicleNumber());
        vehicle.setBrand(vehicleDTO.getBrand());
        vehicle.setModel(vehicleDTO.getModel());
        vehicle.setType(vehicleDTO.getType());
        vehicle.setPricePerDay(vehicleDTO.getPricePerDay());
        vehicle.setAvailabilityStatus(vehicleDTO.getAvailabilityStatus());
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(updatedVehicle);
    }

    @Override
    public void deleteVehicle(Long id) throws VehicleNotFoundException {
        if (!vehicleRepository.existsById(id)) {
            throw new VehicleNotFoundException(
                    "Vehicle not found with ID: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    @Override
    public List<VehicleDTO> getVehiclesByType(String type) {
        return vehicleRepository.findByType(type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDTO> getAvailableVehicles() {
        return vehicleRepository.findByAvailabilityStatus("AVAILABLE")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private Vehicle convertToEntity(VehicleDTO dto) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleNumber(dto.getVehicleNumber());
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setType(dto.getType());
        vehicle.setPricePerDay(dto.getPricePerDay());
        vehicle.setAvailabilityStatus(dto.getAvailabilityStatus());
        return vehicle;
    }

    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setVehicleNumber(vehicle.getVehicleNumber());
        dto.setBrand(vehicle.getBrand());
        dto.setModel(vehicle.getModel());
        dto.setType(vehicle.getType());
        dto.setPricePerDay(vehicle.getPricePerDay());
        dto.setAvailabilityStatus(vehicle.getAvailabilityStatus());
        return dto;
    }
}