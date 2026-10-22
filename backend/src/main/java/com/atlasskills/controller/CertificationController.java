package com.atlasskills.controller;

import com.atlasskills.model.dto.CertificationDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.CertificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    @GetMapping
    public ResponseEntity<List<CertificationDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(certificationService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<CertificationDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CertificationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificationService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CertificationDto dto) {
        return ResponseEntity.ok(certificationService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        certificationService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
