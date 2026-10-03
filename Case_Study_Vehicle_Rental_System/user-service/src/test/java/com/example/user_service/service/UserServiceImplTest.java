package com.example.user_service.service;

import com.example.user_service.dto.PasswordRequest;
import com.example.user_service.dto.ProfileUpdateRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.exception.UserNotFoundException;
import com.example.user_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {

        user = new User();
        user.setId(1L);
        user.setName("John");
        user.setEmail("john@test.com");
        user.setPassword("encodedPassword");
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

        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(false);

        when(passwordEncoder.encode("Password123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        User result = userService.registerUser(request);

        assertNotNull(result);
        assertEquals("John", result.getName());
        assertEquals("john@test.com", result.getEmail());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUserEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@test.com");

        when(userRepository.existsByEmail("john@test.com"))
                .thenReturn(true);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> userService.registerUser(request)
                );

        assertEquals(
                "Email already registered",
                exception.getMessage()
        );
    }

    @Test
    void getUserByIdSuccessfully() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        User result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());

        verify(userRepository).findById(1L);
    }

    @Test
    void getUserByIdThrowsException() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.empty());

        UserNotFoundException exception =
                assertThrows(
                        UserNotFoundException.class,
                        () -> userService.getUserById(1L)
                );

        assertEquals(
                "User not found with id: 1",
                exception.getMessage()
        );
    }

    @Test
    void updateProfileSuccessfully() {

        ProfileUpdateRequest request =
                new ProfileUpdateRequest();

        request.setName("Updated User");
        request.setPhone("9999999999");

        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setName("Updated User");
        updatedUser.setEmail("john@test.com");
        updatedUser.setPhone("9999999999");
        updatedUser.setRole(Role.USER);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class)))
                .thenReturn(updatedUser);

        User result =
                userService.updateProfile(1L, request);

        assertEquals("Updated User", result.getName());
        assertEquals("9999999999", result.getPhone());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePasswordSuccessfully() {

        PasswordRequest request =
                new PasswordRequest();

        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword123");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "oldPassword",
                "encodedPassword"))
                .thenReturn(true);

        when(passwordEncoder.encode("newPassword123"))
                .thenReturn("newEncodedPassword");

        userService.changePassword(1L, request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePasswordThrowsException() {

        PasswordRequest request =
                new PasswordRequest();

        request.setOldPassword("wrongPassword");
        request.setNewPassword("newPassword123");

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "wrongPassword",
                "encodedPassword"))
                .thenReturn(false);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> userService.changePassword(
                                1L,
                                request
                        )
                );

        assertEquals(
                "Old password is incorrect",
                exception.getMessage()
        );
    }

    @Test
    void getAllUsersSuccessfully() {

        when(userRepository.findAll())
                .thenReturn(List.of(user));

        List<User> users =
                userService.getAllUsers();

        assertEquals(1, users.size());

        verify(userRepository).findAll();
    }

    @Test
    void deleteUserSuccessfully() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        userService.deleteUser(1L);

        verify(userRepository).delete(user);
    }

    @Test
    void deleteUserThrowsException() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> userService.deleteUser(1L)
        );
    }

    @Test
    void subscribeSuccessfully() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        userService.subscribe(1L);

        assertTrue(user.isSubscribed());

        verify(userRepository).save(user);
    }

    @Test
    void unsubscribeSuccessfully() {

        user.setSubscribed(true);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        userService.unsubscribe(1L);

        assertFalse(user.isSubscribed());

        verify(userRepository).save(user);
    }
}