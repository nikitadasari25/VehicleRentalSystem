package com.example.content_service.controller;

import com.example.content_service.entity.Content;
import com.example.content_service.service.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@Validated
@Tag(
        name = "Content Management",
        description = "Content Service APIs"
)
public class ContentController {

    @Autowired
    private ContentService contentService;

    /**
     * Add new content.
     */
    @Operation(summary = "Add New Content")
    @PostMapping
    public ResponseEntity<Content> addContent(
            @Valid @RequestBody Content content) {

        return ResponseEntity.ok(
                contentService.addContent(content)
        );
    }

    /**
     * Retrieve all content.
     */
    @Operation(summary = "Get All Content")
    @GetMapping
    public ResponseEntity<List<Content>> getAllContent() {

        return ResponseEntity.ok(
                contentService.getAllContent()
        );
    }

    /**
     * Retrieve content by ID.
     */
    @Operation(summary = "Get Content By ID")
    @GetMapping("/{id}")
    public ResponseEntity<Content> getContentById(
            @PathVariable
            @Positive(message = "Id must be positive")
            Long id) {

        return ResponseEntity.ok(
                contentService.getContentById(id)
        );
    }

    /**
     * Update existing content.
     */
    @Operation(summary = "Update Content")
    @PutMapping("/{id}")
    public ResponseEntity<Content> updateContent(
            @PathVariable
            @Positive(message = "Id must be positive")
            Long id,
            @Valid @RequestBody Content content) {

        return ResponseEntity.ok(
                contentService.updateContent(id, content)
        );
    }

    /**
     * Delete content by ID.
     */
    @Operation(summary = "Delete Content")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContent(
            @PathVariable
            @Positive(message = "Id must be positive")
            long id) {

        contentService.deleteContent(id);

        return ResponseEntity.ok(
                "Content deleted successfully"
        );
    }
}
