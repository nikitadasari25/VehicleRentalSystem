package com.example.booking_service.client;
import com.example.booking_service.config.FeignConfig;
import com.example.booking_service.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@FeignClient(
        name = "user-service",
        configuration = FeignConfig.class
)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable Long id);
}