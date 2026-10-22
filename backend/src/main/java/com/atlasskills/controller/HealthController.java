package com.atlasskills.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "application", "Atlas Skills Platform API",
                "version", "1.0.0",
                "javaVersion", "17",
                "framework", "Spring Boot 3.2.4",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
