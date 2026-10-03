package com.example.content_service.service;

import com.example.content_service.entity.Content;
import com.example.content_service.exception.ContentNotFoundException;
import com.example.content_service.repository.ContentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentServiceImplTest {

    @Mock
    private ContentRepository contentRepository;

    @InjectMocks
    private ContentServiceImpl contentService;

    private Content content;

    @BeforeEach
    void setUp() {

        content = new Content();
        content.setId(1L);
        content.setType("Feedback");
        content.setName("John");
        content.setEmail("john@test.com");
        content.setMessage("Excellent Service");
        content.setRating(5);
    }

    @Test
    void addContentSuccessfully() {

        when(contentRepository.save(content))
                .thenReturn(content);

        Content result = contentService.addContent(content);

        assertNotNull(result);
        assertEquals("John", result.getName());

        verify(contentRepository, times(1)).save(content);
    }

    @Test
    void getAllContentSuccessfully() {

        when(contentRepository.findAll())
                .thenReturn(List.of(content));

        List<Content> result = contentService.getAllContent();

        assertEquals(1, result.size());

        verify(contentRepository, times(1)).findAll();
    }

    @Test
    void getContentByIdSuccessfully() {

        when(contentRepository.findById(1L))
                .thenReturn(Optional.of(content));

        Content result = contentService.getContentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());

        verify(contentRepository).findById(1L);
    }

    @Test
    void getContentByIdThrowsException() {

        when(contentRepository.findById(1L))
                .thenReturn(Optional.empty());

        ContentNotFoundException exception =
                assertThrows(
                        ContentNotFoundException.class,
                        () -> contentService.getContentById(1L)
                );

        assertEquals(
                "Content not found with id: 1",
                exception.getMessage()
        );
    }

    @Test
    void updateContentSuccessfully() {

        Content updatedContent = new Content();
        updatedContent.setId(1L);
        updatedContent.setType("Complaint");
        updatedContent.setName("Updated User");
        updatedContent.setEmail("updated@test.com");
        updatedContent.setMessage("Updated Message");
        updatedContent.setRating(4);

        when(contentRepository.findById(1L))
                .thenReturn(Optional.of(content));

        when(contentRepository.save(any(Content.class)))
                .thenReturn(updatedContent);

        Content result =
                contentService.updateContent(1L, updatedContent);

        assertNotNull(result);
        assertEquals("Updated User", result.getName());
        assertEquals("Complaint", result.getType());
        assertEquals(4, result.getRating());

        verify(contentRepository).findById(1L);
        verify(contentRepository).save(any(Content.class));
    }

    @Test
    void updateContentThrowsException() {

        when(contentRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ContentNotFoundException.class,
                () -> contentService.updateContent(1L, content)
        );
    }

    @Test
    void deleteContentSuccessfully() {

        when(contentRepository.findById(1L))
                .thenReturn(Optional.of(content));

        contentService.deleteContent(1L);

        verify(contentRepository).delete(content);
    }

    @Test
    void deleteContentThrowsException() {

        when(contentRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ContentNotFoundException.class,
                () -> contentService.deleteContent(1L)
        );
    }
}