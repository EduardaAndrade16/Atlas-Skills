package com.atlasskills.controller;

import com.atlasskills.model.dto.GapAnalysisResponse;
import com.atlasskills.security.UserPrincipal;
import com.atlasskills.service.GeminiGapAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiGapAnalysisService gapAnalysisService;

    @PostMapping("/gap-analysis")
    public ResponseEntity<GapAnalysisResponse> generateGapAnalysis(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(gapAnalysisService.analyze(principal.getId()));
    }
}
