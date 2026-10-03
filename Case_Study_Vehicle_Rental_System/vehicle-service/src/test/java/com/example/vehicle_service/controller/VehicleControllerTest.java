package com.example.vehicle_service.controller;

import com.example.vehicle_service.dto.VehicleDTO;
import com.example.vehicle_service.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleService vehicleService;

    @Autowired
    private ObjectMapper objectMapper;

    private VehicleDTO getVehicleDTO() {

        VehicleDTO vehicleDTO = new VehicleDTO();
        vehicleDTO.setVehicleId(1L);
        vehicleDTO.setVehicleNumber("TN01AB1234");
        vehicleDTO.setBrand("Toyota");
        vehicleDTO.setModel("Innova");
        vehicleDTO.setType("SUV");
        vehicleDTO.setPricePerDay(2000.0);
        vehicleDTO.setAvailabilityStatus("AVAILABLE");

        return vehicleDTO;
    }

    @Test
    void addVehicleSuccessfully() throws Exception {

        VehicleDTO vehicleDTO = getVehicleDTO();

        when(vehicleService.addVehicle(any(VehicleDTO.class)))
                .thenReturn(vehicleDTO);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.brand").value("Toyota"));
    }

    @Test
    void getAllVehiclesSuccessfully() throws Exception {

        when(vehicleService.getAllVehicles())
                .thenReturn(List.of(getVehicleDTO()));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].brand").value("Toyota"));
    }

    @Test
    void getVehicleByIdSuccessfully() throws Exception {

        when(vehicleService.getVehicleById(1L))
                .thenReturn(getVehicleDTO());

        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleId").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"));
    }

    @Test
    void updateVehicleSuccessfully() throws Exception {

        VehicleDTO vehicleDTO = getVehicleDTO();

        when(vehicleService.updateVehicle(eq(1L), any(VehicleDTO.class)))
                .thenReturn(vehicleDTO);

        mockMvc.perform(put("/api/vehicles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Toyota"));
    }

    @Test
    void deleteVehicleSuccessfully() throws Exception {

        doNothing().when(vehicleService).deleteVehicle(1L);

        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(content()
                        .string("Vehicle deleted successfully"));
    }

    @Test
    void getVehiclesByTypeSuccessfully() throws Exception {

        when(vehicleService.getVehiclesByType("SUV"))
                .thenReturn(List.of(getVehicleDTO()));

        mockMvc.perform(get("/api/vehicles/type/SUV"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("SUV"));
    }

    @Test
    void getAvailableVehiclesSuccessfully() throws Exception {

        when(vehicleService.getAvailableVehicles())
                .thenReturn(List.of(getVehicleDTO()));

        mockMvc.perform(get("/api/vehicles/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].availabilityStatus")
                        .value("AVAILABLE"));
    }
}