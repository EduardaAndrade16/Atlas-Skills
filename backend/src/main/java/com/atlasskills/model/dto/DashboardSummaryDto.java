package com.atlasskills.model.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private Integer completionPercentage;
    private Integer hardSkillsCount;
    private Integer softSkillsCount;
    private Integer coursesCount;
    private Integer certificationsCount;
    private Integer projectsCount;
    private Integer experiencesCount;
    private Integer educationCount;
    private List<HardSkillDto> topSkills;
    private List<ExperienceDto> recentExperiences;
    private UserProfileDto profile;
}
