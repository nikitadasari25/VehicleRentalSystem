package com.example.vehicle_service.controller;

import com.example.vehicle_service.dto.VehicleDTO;
import com.example.vehicle_service.service.VehicleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@Tag(
        name = "Vehicle Management",
        description = "Vehicle Rental Service APIs"
)
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * Add a new vehicle to the system.
     */
    @Operation(summary = "Add New Vehicle")
    @PostMapping
    public ResponseEntity<VehicleDTO> addVehicle(
            @Valid @RequestBody VehicleDTO vehicleDTO) {

        VehicleDTO savedVehicle =
                vehicleService.addVehicle(vehicleDTO);

        return new ResponseEntity<>(
                savedVehicle,
                HttpStatus.CREATED
        );
    }

    /**
     * Retrieve all vehicles.
     */
    @Operation(summary = "Get All Vehicles")
    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllVehicles() {

        return ResponseEntity.ok(
                vehicleService.getAllVehicles()
        );
    }

    /**
     * Retrieve a vehicle using vehicle ID.
     */
    @Operation(summary = "Get Vehicle By ID")
    @GetMapping("/{id}")
    public ResponseEntity<VehicleDTO> getVehicleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                vehicleService.getVehicleById(id)
        );
    }

    /**
     * Update vehicle information.
     */
    @Operation(summary = "Update Vehicle")
    @PutMapping("/{id}")
    public ResponseEntity<VehicleDTO> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDTO vehicleDTO) {

        return ResponseEntity.ok(
                vehicleService.updateVehicle(id, vehicleDTO)
        );
    }

    /**
     * Delete a vehicle from the system.
     */
    @Operation(summary = "Delete Vehicle")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVehicle(
            @PathVariable Long id) {

        vehicleService.deleteVehicle(id);

        return ResponseEntity.ok(
                "Vehicle deleted successfully"
        );
    }

    /**
     * Search vehicles by vehicle type.
     */
    @Operation(summary = "Get Vehicles By Type")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<VehicleDTO>> getVehiclesByType(
            @PathVariable String type) {

        return ResponseEntity.ok(
                vehicleService.getVehiclesByType(type)
        );
    }

    /**
     * Retrieve all currently available vehicles.
     */
    @Operation(summary = "Get Available Vehicles")
    @GetMapping("/available")
    public ResponseEntity<List<VehicleDTO>> getAvailableVehicles() {

        return ResponseEntity.ok(
                vehicleService.getAvailableVehicles()
        );
    }
}