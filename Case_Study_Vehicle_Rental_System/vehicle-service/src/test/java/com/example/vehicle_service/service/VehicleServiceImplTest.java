package com.example.vehicle_service.service;

import com.example.vehicle_service.dto.VehicleDTO;
import com.example.vehicle_service.entity.Vehicle;
import com.example.vehicle_service.exception.VehicleNotFoundException;
import com.example.vehicle_service.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private Vehicle vehicle;
    private VehicleDTO vehicleDTO;

    @BeforeEach
    void setUp() {

        vehicle = new Vehicle();
        vehicle.setVehicleId(1L);
        vehicle.setVehicleNumber("TN01AB1234");
        vehicle.setBrand("Toyota");
        vehicle.setModel("Innova");
        vehicle.setType("SUV");
        vehicle.setPricePerDay(2000.0);
        vehicle.setAvailabilityStatus("AVAILABLE");

        vehicleDTO = new VehicleDTO();
        vehicleDTO.setVehicleId(1L);
        vehicleDTO.setVehicleNumber("TN01AB1234");
        vehicleDTO.setBrand("Toyota");
        vehicleDTO.setModel("Innova");
        vehicleDTO.setType("SUV");
        vehicleDTO.setPricePerDay(2000.0);
        vehicleDTO.setAvailabilityStatus("AVAILABLE");
    }

    @Test
    void addVehicleSuccessfully() {

        when(vehicleRepository.save(any(Vehicle.class)))
                .thenReturn(vehicle);

        VehicleDTO result = vehicleService.addVehicle(vehicleDTO);

        assertNotNull(result);
        assertEquals("Toyota", result.getBrand());

        verify(vehicleRepository, times(1))
                .save(any(Vehicle.class));
    }

    @Test
    void getAllVehiclesSuccessfully() {

        when(vehicleRepository.findAll())
                .thenReturn(Arrays.asList(vehicle));

        List<VehicleDTO> result =
                vehicleService.getAllVehicles();

        assertEquals(1, result.size());
        assertEquals("Toyota", result.get(0).getBrand());

        verify(vehicleRepository).findAll();
    }

    @Test
    void getVehicleByIdSuccessfully()
            throws VehicleNotFoundException {

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        VehicleDTO result =
                vehicleService.getVehicleById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getVehicleId());

        verify(vehicleRepository).findById(1L);
    }

    @Test
    void getVehicleByIdThrowsException() {

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.empty());

        VehicleNotFoundException exception =
                assertThrows(
                        VehicleNotFoundException.class,
                        () -> vehicleService.getVehicleById(1L)
                );

        assertEquals(
                "Vehicle not found with ID: 1",
                exception.getMessage()
        );
    }

    @Test
    void updateVehicleSuccessfully()
            throws VehicleNotFoundException {

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        when(vehicleRepository.save(any(Vehicle.class)))
                .thenReturn(vehicle);

        VehicleDTO result =
                vehicleService.updateVehicle(1L, vehicleDTO);

        assertNotNull(result);
        assertEquals("Toyota", result.getBrand());

        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void updateVehicleThrowsException() {

        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.empty());

        VehicleNotFoundException exception =
                assertThrows(
                        VehicleNotFoundException.class,
                        () -> vehicleService.updateVehicle(
                                1L,
                                vehicleDTO
                        )
                );

        assertEquals(
                "Vehicle not found with ID: 1",
                exception.getMessage()
        );
    }

    @Test
    void deleteVehicleSuccessfully()
            throws VehicleNotFoundException {

        when(vehicleRepository.existsById(1L))
                .thenReturn(true);

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository).deleteById(1L);
    }

    @Test
    void deleteVehicleThrowsException() {

        when(vehicleRepository.existsById(1L))
                .thenReturn(false);

        VehicleNotFoundException exception =
                assertThrows(
                        VehicleNotFoundException.class,
                        () -> vehicleService.deleteVehicle(1L)
                );

        assertEquals(
                "Vehicle not found with ID: 1",
                exception.getMessage()
        );
    }

    @Test
    void getVehiclesByTypeSuccessfully() {

        when(vehicleRepository.findByType("SUV"))
                .thenReturn(Arrays.asList(vehicle));

        List<VehicleDTO> result =
                vehicleService.getVehiclesByType("SUV");

        assertEquals(1, result.size());
        assertEquals("SUV", result.get(0).getType());

        verify(vehicleRepository).findByType("SUV");
    }

    @Test
    void getAvailableVehiclesSuccessfully() {

        when(vehicleRepository.findByAvailabilityStatus("AVAILABLE"))
                .thenReturn(Arrays.asList(vehicle));

        List<VehicleDTO> result =
                vehicleService.getAvailableVehicles();

        assertEquals(1, result.size());
        assertEquals(
                "AVAILABLE",
                result.get(0).getAvailabilityStatus()
        );

        verify(vehicleRepository)
                .findByAvailabilityStatus("AVAILABLE");
    }
}