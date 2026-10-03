package com.example.user_service.repository;

import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByEmail() {

        User user = new User();
        user.setName("John");
        user.setEmail("john@test.com");
        user.setPassword("password");
        user.setPhone("9876543210");
        user.setRole(Role.USER);

        userRepository.save(user);

        Optional<User> result =
                userRepository.findByEmail("john@test.com");

        assertTrue(result.isPresent());
        assertEquals("john@test.com", result.get().getEmail());
    }

    @Test
    void shouldCheckEmailExists() {

        User user = new User();
        user.setName("John");
        user.setEmail("john@test.com");
        user.setPassword("password");
        user.setPhone("9876543210");
        user.setRole(Role.USER);

        userRepository.save(user);

        assertTrue(
                userRepository.existsByEmail("john@test.com")
        );
    }
}
