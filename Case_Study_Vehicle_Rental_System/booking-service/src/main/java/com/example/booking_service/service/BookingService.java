package com.example.booking_service.service;

import com.example.booking_service.dto.BookingRequest;
import com.example.booking_service.dto.BookingResponse;
import com.example.booking_service.entity.Booking;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    Booking getBookingById(Long bookingId);

    List<Booking> getAllBookings();

    List<Booking> getBookingsByUserId(Long userId);

    Booking cancelBooking(Long bookingId);
}