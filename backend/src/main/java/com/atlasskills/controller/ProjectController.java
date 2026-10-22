package com.atlasskills.controller;

import com.atlasskills.model.dto.ProjectDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(projectService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(projectService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        projectService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
