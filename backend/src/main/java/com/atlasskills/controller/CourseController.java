package com.atlasskills.controller;

import com.atlasskills.model.dto.CourseDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(courseService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<CourseDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CourseDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CourseDto dto) {
        return ResponseEntity.ok(courseService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        courseService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
