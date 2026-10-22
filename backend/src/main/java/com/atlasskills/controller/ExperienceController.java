package com.atlasskills.controller;

import com.atlasskills.model.dto.ExperienceDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.ExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @GetMapping
    public ResponseEntity<List<ExperienceDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(experienceService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<ExperienceDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExperienceDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(experienceService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperienceDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ExperienceDto dto) {
        return ResponseEntity.ok(experienceService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        experienceService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
