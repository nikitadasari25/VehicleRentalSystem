package com.example.user_service.service;

import com.example.user_service.dto.PasswordRequest;
import com.example.user_service.dto.ProfileUpdateRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.User;

import java.util.List;

public interface UserService {
    User registerUser(RegisterRequest request);

    User getUserById(Long id);

    User updateProfile(Long id, ProfileUpdateRequest request);

    void changePassword(Long id, PasswordRequest request);

    List<User> getAllUsers();

    void deleteUser(Long id);

    void subscribe(Long id);

    void unsubscribe(Long id);
}