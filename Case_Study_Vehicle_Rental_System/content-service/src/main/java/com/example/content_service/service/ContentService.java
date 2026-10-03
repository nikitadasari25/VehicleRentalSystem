package com.example.content_service.service;

import com.example.content_service.entity.Content;

import java.util.List;

public interface ContentService {

    Content addContent(Content content);

    List<Content> getAllContent();

    Content getContentById(Long id);

    Content updateContent(Long id, Content content);

    void deleteContent(Long id);
}