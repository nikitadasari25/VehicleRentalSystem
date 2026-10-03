package com.example.booking_service.service;

import com.example.booking_service.client.PaymentClient;
import com.example.booking_service.client.UserClient;
import com.example.booking_service.client.VehicleClient;
import com.example.booking_service.dto.*;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.exception.BookingNotFoundException;
import com.example.booking_service.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserClient userClient;
    private final VehicleClient vehicleClient;
    private final PaymentClient paymentClient;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              UserClient userClient,
                              VehicleClient vehicleClient,
                              PaymentClient paymentClient) {
        this.bookingRepository = bookingRepository;
        this.userClient = userClient;
        this.vehicleClient = vehicleClient;
        this.paymentClient = paymentClient;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request) {

        // Fetch user details from User Service
        UserDTO user = userClient.getUserById(request.getUserId());

        // Fetch vehicle details from Vehicle Service
        VehicleDTO vehicle = vehicleClient.getVehicleById(request.getVehicleId());

        // Validate user existence
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Validate vehicle existence
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found");
        }

        // Ensure vehicle is available for booking
        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getAvailabilityStatus())) {
            throw new RuntimeException("Vehicle is not available for booking");
        }

        // Validate booking dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date must be after start date");
        }

        // Create Booking entity
        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .vehicleId(request.getVehicleId())
                .bookingDate(LocalDate.now())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalAmount(request.getTotalAmount())
                .status("CONFIRMED")
                .build();

        // Save booking into database
        Booking savedBooking = bookingRepository.save(booking);

        // Create payment order through Payment Service
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setBookingId(savedBooking.getBookingId());
        paymentRequest.setAmount(savedBooking.getTotalAmount());

        PaymentResponse paymentResponse =
                paymentClient.createOrder(paymentRequest);

        // Return booking response
        return new BookingResponse(
                savedBooking.getBookingId(),
                savedBooking.getUserId(),
                savedBooking.getVehicleId(),
                savedBooking.getStartDate(),
                savedBooking.getEndDate(),
                savedBooking.getTotalAmount(),
                savedBooking.getStatus()
        );
    }

    @Override
    public Booking getBookingById(Long bookingId) {

        // Retrieve booking or throw custom exception
        return bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new BookingNotFoundException(
                                "Booking not found with id: " + bookingId));
    }

    @Override
    public List<Booking> getAllBookings() {

        // Fetch all bookings
        return bookingRepository.findAll();
    }

    @Override
    public List<Booking> getBookingsByUserId(Long userId) {

        // Fetch bookings for a specific user
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public Booking cancelBooking(Long bookingId) {

        // Find booking by ID
        Booking booking = getBookingById(bookingId);

        // Update booking status to canceled
        booking.setStatus("CANCELED");

        // Save updated booking
        return bookingRepository.save(booking);
    }
}