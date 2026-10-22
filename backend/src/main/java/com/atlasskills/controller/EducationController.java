package com.atlasskills.controller;

import com.atlasskills.model.dto.EducationDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping
    public ResponseEntity<List<EducationDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(educationService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<EducationDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EducationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(educationService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EducationDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody EducationDto dto) {
        return ResponseEntity.ok(educationService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        educationService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
