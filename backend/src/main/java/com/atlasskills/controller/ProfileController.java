package com.atlasskills.controller;

import com.atlasskills.model.dto.DashboardSummaryDto;
import com.atlasskills.model.dto.UserProfileDto;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getId()));
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserProfileDto dto) {
        return ResponseEntity.ok(profileService.updateProfile(principal.getId(), dto));
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getSummary(principal.getId()));
    }
}
