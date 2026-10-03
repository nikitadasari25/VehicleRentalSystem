package com.example.booking_service.service;

import com.example.booking_service.client.PaymentClient;
import com.example.booking_service.client.UserClient;
import com.example.booking_service.client.VehicleClient;
import com.example.booking_service.dto.*;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.exception.BookingNotFoundException;
import com.example.booking_service.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private VehicleClient vehicleClient;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Booking booking;
    private BookingRequest bookingRequest;
    private UserDTO userDTO;
    private VehicleDTO vehicleDTO;
    private PaymentResponse paymentResponse;

    @BeforeEach
    void setUp() {

        bookingRequest = new BookingRequest();
        bookingRequest.setUserId(1L);
        bookingRequest.setVehicleId(101L);
        bookingRequest.setStartDate(LocalDate.now());
        bookingRequest.setEndDate(LocalDate.now().plusDays(2));
        bookingRequest.setTotalAmount(5000.0);

        userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setName("Test User");

        vehicleDTO = new VehicleDTO();
        vehicleDTO.setVehicleId(101L);
        vehicleDTO.setAvailabilityStatus("AVAILABLE");

        paymentResponse = new PaymentResponse();
        paymentResponse.setOrderId("ORD123");
        paymentResponse.setStatus("SUCCESS");

        booking = Booking.builder()
                .bookingId(1L)
                .userId(1L)
                .vehicleId(101L)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(2))
                .totalAmount(5000.0)
                .status("CONFIRMED")
                .build();
    }

    @Test
    void createBookingSuccessfully() {

        when(userClient.getUserById(1L))
                .thenReturn(userDTO);

        when(vehicleClient.getVehicleById(101L))
                .thenReturn(vehicleDTO);

        when(paymentClient.createOrder(any(PaymentRequest.class)))
                .thenReturn(paymentResponse);

        when(bookingRepository.save(any(Booking.class)))
                .thenReturn(booking);

        BookingResponse response =
                bookingService.createBooking(bookingRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("CONFIRMED", response.getStatus());

        verify(bookingRepository).save(any(Booking.class));
        verify(paymentClient).createOrder(any(PaymentRequest.class));
    }

    @Test
    void createBooking_UserNotFound() {

        when(userClient.getUserById(1L))
                .thenReturn(null);

        RuntimeException exception =
                assertThrows(RuntimeException.class,
                        () -> bookingService.createBooking(bookingRequest));

        assertEquals("User not found",
                exception.getMessage());
    }

    @Test
    void createBooking_VehicleNotFound() {

        when(userClient.getUserById(1L))
                .thenReturn(userDTO);

        when(vehicleClient.getVehicleById(101L))
                .thenReturn(null);

        RuntimeException exception =
                assertThrows(RuntimeException.class,
                        () -> bookingService.createBooking(bookingRequest));

        assertEquals("Vehicle not found",
                exception.getMessage());
    }

    @Test
    void createBooking_VehicleNotAvailable() {

        vehicleDTO.setAvailabilityStatus("BOOKED");

        when(userClient.getUserById(1L))
                .thenReturn(userDTO);

        when(vehicleClient.getVehicleById(101L))
                .thenReturn(vehicleDTO);

        RuntimeException exception =
                assertThrows(RuntimeException.class,
                        () -> bookingService.createBooking(bookingRequest));

        assertEquals("Vehicle is not available for booking",
                exception.getMessage());
    }

    @Test
    void createBooking_InvalidDateRange() {

        bookingRequest.setEndDate(
                bookingRequest.getStartDate().minusDays(1));

        when(userClient.getUserById(1L))
                .thenReturn(userDTO);

        when(vehicleClient.getVehicleById(101L))
                .thenReturn(vehicleDTO);

        IllegalArgumentException exception =
                assertThrows(IllegalArgumentException.class,
                        () -> bookingService.createBooking(bookingRequest));

        assertEquals("End date must be after start date",
                exception.getMessage());
    }

    @Test
    void getBookingByIdSuccessfully() {

        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking));

        Booking result =
                bookingService.getBookingById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getBookingId());

        verify(bookingRepository).findById(1L);
    }

    @Test
    void getBookingByIdThrowsException() {

        when(bookingRepository.findById(1L))
                .thenReturn(Optional.empty());

        BookingNotFoundException exception =
                assertThrows(
                        BookingNotFoundException.class,
                        () -> bookingService.getBookingById(1L)
                );

        assertEquals("Booking not found with id: 1",
                exception.getMessage());
    }

    @Test
    void getAllBookingsSuccessfully() {

        when(bookingRepository.findAll())
                .thenReturn(List.of(booking));

        List<Booking> bookings =
                bookingService.getAllBookings();

        assertEquals(1, bookings.size());

        verify(bookingRepository).findAll();
    }

    @Test
    void getBookingsByUserIdSuccessfully() {

        when(bookingRepository.findByUserId(1L))
                .thenReturn(List.of(booking));

        List<Booking> bookings =
                bookingService.getBookingsByUserId(1L);

        assertEquals(1, bookings.size());

        verify(bookingRepository).findByUserId(1L);
    }

    @Test
    void cancelBookingSuccessfully() {

        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking));

        when(bookingRepository.save(any(Booking.class)))
                .thenReturn(booking);

        Booking cancelledBooking =
                bookingService.cancelBooking(1L);

        assertEquals("CANCELLED",
                cancelledBooking.getStatus());

        verify(bookingRepository).save(any(Booking.class));
    }
}