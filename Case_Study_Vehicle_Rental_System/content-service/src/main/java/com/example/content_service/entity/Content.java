package com.example.content_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50,
            message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Message is required")
    @Size(min = 5, max = 500,
            message = "Message must be between 5 and 500 characters")
    private String message;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;

    public Content() {
    }

    public Content(Long id, String type, String name,
                   String email, String message, Integer rating) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.email = email;
        this.message = message;
        this.rating = rating;
    }

}