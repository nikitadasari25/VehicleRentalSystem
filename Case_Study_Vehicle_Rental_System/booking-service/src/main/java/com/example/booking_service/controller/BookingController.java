package com.example.booking_service.controller;

import com.example.booking_service.dto.BookingRequest;
import com.example.booking_service.dto.BookingResponse;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.service.BookingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@Validated
@Tag(
        name = "Booking Management",
        description = "Booking Service APIs"
)
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Create a new vehicle booking.
     */
    @Operation(summary = "Create Booking")
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request) {

        BookingResponse response =
                bookingService.createBooking(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Retrieve booking details using booking ID.
     */
    @Operation(summary = "Get Booking By ID")
    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable @Positive Long bookingId) {

        return ResponseEntity.ok(
                bookingService.getBookingById(bookingId));
    }

    /**
     * Retrieve all bookings available in the system.
     */
    @Operation(summary = "Get All Bookings")
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings());
    }

    /**
     * Retrieve all bookings belonging to a specific user.
     */
    @Operation(summary = "Get Bookings By User ID")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(
            @PathVariable @Positive Long userId) {

        return ResponseEntity.ok(
                bookingService.getBookingsByUserId(userId));
    }

    /**
     * Cancel an existing booking.
     */
    @Operation(summary = "Cancel Booking")
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable @Positive Long bookingId) {

        return ResponseEntity.ok(
                bookingService.cancelBooking(bookingId));
    }
}