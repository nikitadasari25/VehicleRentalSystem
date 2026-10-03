package com.example.user_service.controller;

import com.example.user_service.dto.LoginRequest;
import com.example.user_service.dto.LoginResponse;
import com.example.user_service.dto.PasswordRequest;
import com.example.user_service.dto.ProfileUpdateRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.security.JwtService;
import com.example.user_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(
        name = "User Management",
        description = "User Service APIs"
)
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public UserController(
            UserService userService,
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userService = userService;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /**
     * Register a new user in the system.
     */
    @Operation(summary = "Register New User")
    @PostMapping("/register")
    public ResponseEntity<User> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.registerUser(request);

        // Hide password before sending response
        user.setPassword(null);

        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    /**
     * Authenticate user and generate JWT token.
     */
    @Operation(summary = "Login User")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        // Store authenticated user in Security Context
        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Generate JWT token
        String token = jwtService.generateToken(user);

        LoginResponse response =
                new LoginResponse(
                        token,
                        user.getEmail(),
                        user.getRole().name()
                );

        return ResponseEntity.ok(response);
    }

    /**
     * Fetch user details by user id.
     */
    @Operation(summary = "Get User By ID")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(
            @PathVariable Long id) {

        User user = userService.getUserById(id);

        // Do not expose password in API response
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    /**
     * Update profile information like name and phone number.
     */
    @Operation(summary = "Update User Profile")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<User> updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileUpdateRequest request) {

        User user = userService.updateProfile(id, request);

        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    /**
     * Change user password after validation.
     */
    @Operation(summary = "Change User Password")
    @PutMapping("/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordRequest request) {

        userService.changePassword(id, request);

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }

    /**
     * Retrieve all registered users.
     */
    @Operation(summary = "Get All Users")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> users = userService.getAllUsers();

        // Remove passwords before returning list
        users.forEach(user -> user.setPassword(null));

        return ResponseEntity.ok(users);
    }

    /**
     * Delete user from the system.
     */
    @Operation(summary = "Delete User")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }

    /**
     * Activate subscription for a user.
     */
    @Operation(summary = "Subscribe User")
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<String> subscribe(
            @PathVariable Long id) {

        userService.subscribe(id);

        return ResponseEntity.ok(
                "User subscribed successfully"
        );
    }

    /**
     * Cancel user subscription.
     */
    @Operation(summary = "Unsubscribe User")
    @DeleteMapping("/{id}/unsubscribe")
    public ResponseEntity<String> unsubscribe(
            @PathVariable Long id) {

        userService.unsubscribe(id);

        return ResponseEntity.ok(
                "User unsubscribed successfully"
        );
    }
}