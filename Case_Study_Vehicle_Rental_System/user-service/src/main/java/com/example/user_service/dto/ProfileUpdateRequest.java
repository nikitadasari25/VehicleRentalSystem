package com.example.user_service.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(min = 2, max = 50,
            message = "Name must be between 2 and 50 characters")
    private String name;

    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone number must be exactly 10 digits")
    private String phone;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}