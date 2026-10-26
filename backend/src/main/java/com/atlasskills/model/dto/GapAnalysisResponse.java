package com.atlasskills.model.dto;

import java.util.List;

public record GapAnalysisResponse(
        int readinessScore,
        String summary,
        List<SkillGap> identifiedGaps,
        List<RecommendedTrack> recommendedTracks
) {
    public record SkillGap(
            String skill,
            String currentLevel,
            String targetLevel,
            String impact
    ) {}

    public record RecommendedTrack(
            String title,
            String description,
            int estimatedHours,
            List<String> steps
    ) {}
}
