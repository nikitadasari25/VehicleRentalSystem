package com.example.content_service.repository;

import com.example.content_service.entity.Content;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository

public interface ContentRepository extends JpaRepository<Content, Long> {

}

