package com.atlasskills.controller;

import com.atlasskills.model.dto.SoftSkillDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.SoftSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/skills/soft")
@RequiredArgsConstructor
public class SoftSkillController {

    private final SoftSkillService softSkillService;

    @GetMapping
    public ResponseEntity<List<SoftSkillDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(softSkillService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<SoftSkillDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SoftSkillDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(softSkillService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SoftSkillDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SoftSkillDto dto) {
        return ResponseEntity.ok(softSkillService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        softSkillService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
