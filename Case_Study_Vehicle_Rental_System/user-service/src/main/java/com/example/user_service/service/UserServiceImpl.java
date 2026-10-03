package com.example.user_service.service;

import com.example.user_service.dto.PasswordRequest;
import com.example.user_service.dto.ProfileUpdateRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.exception.UserNotFoundException;
import com.example.user_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        user.setRole(Role.USER);
        user.setSubscribed(false);

        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + id));
    }

    @Override
    public User updateProfile(
            Long id,
            ProfileUpdateRequest request) {

        User user = getUserById(id);

        if (request.getName() != null
                && !request.getName().isBlank()) {

            user.setName(request.getName());
        }

        if (request.getPhone() != null
                && !request.getPhone().isBlank()) {

            user.setPhone(request.getPhone());
        }

        return userRepository.save(user);
    }

    @Override
    public void changePassword(
            Long id,
            PasswordRequest request) {

        User user = getUserById(id);

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Old password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()));

        userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + id));

        userRepository.delete(user);
    }

    @Override
    public void subscribe(Long id) {

        User user = getUserById(id);

        user.setSubscribed(true);

        userRepository.save(user);
    }

    @Override
    public void unsubscribe(Long id) {

        User user = getUserById(id);

        user.setSubscribed(false);

        userRepository.save(user);
    }
}