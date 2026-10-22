package com.atlasskills.controller;

import com.atlasskills.model.dto.HardSkillDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.HardSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/skills/hard")
@RequiredArgsConstructor
public class HardSkillController {

    private final HardSkillService hardSkillService;

    @GetMapping
    public ResponseEntity<List<HardSkillDto>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(hardSkillService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<HardSkillDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HardSkillDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hardSkillService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HardSkillDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody HardSkillDto dto) {
        return ResponseEntity.ok(hardSkillService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        hardSkillService.delete(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
