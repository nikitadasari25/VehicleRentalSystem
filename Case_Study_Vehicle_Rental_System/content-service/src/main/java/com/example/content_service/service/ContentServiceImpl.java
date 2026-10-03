package com.example.content_service.service;

import com.example.content_service.entity.Content;
import com.example.content_service.exception.ContentNotFoundException;
import com.example.content_service.repository.ContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentServiceImpl implements ContentService {

    @Autowired
    private ContentRepository contentRepository;

    @Override
    public Content addContent(Content content) {

        // Save new content to the database
        return contentRepository.save(content);
    }

    @Override
    public List<Content> getAllContent() {

        // Retrieve all content records from the database
        return contentRepository.findAll();
    }

    @Override
    public Content getContentById(Long id) {

        // Find content by ID or throw custom exception if not found
        return contentRepository.findById(id)
                .orElseThrow(() ->
                        new ContentNotFoundException(
                                "Content not found with id: " + id));
    }

    @Override
    public Content updateContent(Long id, Content content) {

        // Retrieve existing content from the database
        Content existingContent = contentRepository.findById(id)
                .orElseThrow(() ->
                        new ContentNotFoundException(
                                "Content not found with id: " + id));

        // Update content details
        existingContent.setType(content.getType());
        existingContent.setName(content.getName());
        existingContent.setEmail(content.getEmail());
        existingContent.setMessage(content.getMessage());
        existingContent.setRating(content.getRating());

        // Save updated content
        return contentRepository.save(existingContent);
    }

    @Override
    public void deleteContent(Long id) {

        // Retrieve content before deletion
        Content existingContent = contentRepository.findById(id)
                .orElseThrow(() ->
                        new ContentNotFoundException(
                                "Content not found with id: " + id));

        // Delete content from the database
        contentRepository.delete(existingContent);
    }
}
