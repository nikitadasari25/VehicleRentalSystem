package com.example.user_service.controller;

import com.example.user_service.dto.PasswordRequest;
import com.example.user_service.dto.ProfileUpdateRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.security.JwtService;
import com.example.user_service.service.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserController userController;

    private User user;

    @BeforeEach
    void setUp() {

        user = new User();

        user.setId(1L);
        user.setName("John");
        user.setEmail("john@test.com");
        user.setPassword("password");
        user.setPhone("9876543210");
        user.setRole(Role.USER);
        user.setSubscribed(false);
    }

    @Test
    void registerUserSuccessfully() {

        RegisterRequest request = new RegisterRequest();

        request.setName("John");
        request.setEmail("john@test.com");
        request.setPassword("Password123");
        request.setPhone("9876543210");

        when(userService.registerUser(any(RegisterRequest.class)))
                .thenReturn(user);

        ResponseEntity<User> response =
                userController.register(request);

        assertEquals(HttpStatus.CREATED,
                response.getStatusCode());

        assertNotNull(response.getBody());

        assertEquals("john@test.com",
                response.getBody().getEmail());
    }

    @Test
    void getUserSuccessfully() {

        when(userService.getUserById(1L))
                .thenReturn(user);

        ResponseEntity<User> response =
                userController.getUser(1L);

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals("john@test.com",
                response.getBody().getEmail());
    }

    @Test
    void updateProfileSuccessfully() {

        ProfileUpdateRequest request =
                new ProfileUpdateRequest();

        request.setName("Updated User");
        request.setPhone("9999999999");

        user.setName("Updated User");

        when(userService.updateProfile(
                eq(1L),
                any(ProfileUpdateRequest.class)))
                .thenReturn(user);

        ResponseEntity<User> response =
                userController.updateProfile(1L, request);

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals(
                "Updated User",
                response.getBody().getName()
        );
    }

    @Test
    void changePasswordSuccessfully() {

        PasswordRequest request =
                new PasswordRequest();

        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword123");

        ResponseEntity<String> response =
                userController.changePassword(
                        1L,
                        request
                );

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals(
                "Password changed successfully",
                response.getBody()
        );
    }

    @Test
    void getAllUsersSuccessfully() {

        when(userService.getAllUsers())
                .thenReturn(List.of(user));

        ResponseEntity<List<User>> response =
                userController.getAllUsers();

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals(
                1,
                response.getBody().size()
        );
    }

    @Test
    void deleteUserSuccessfully() {

        ResponseEntity<String> response =
                userController.deleteUser(1L);

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals(
                "User deleted successfully",
                response.getBody()
        );
    }

    @Test
    void subscribeSuccessfully() {

        ResponseEntity<String> response =
                userController.subscribe(1L);

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals(
                "User subscribed successfully",
                response.getBody()
        );
    }

    @Test
    void unsubscribeSuccessfully() {

        ResponseEntity<String> response =
                userController.unsubscribe(1L);

        assertEquals(HttpStatus.OK,
                response.getStatusCode());

        assertEquals(
                "User unsubscribed successfully",
                response.getBody()
        );
    }
}