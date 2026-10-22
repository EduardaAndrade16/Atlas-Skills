package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.*;
import com.atlasskills.model.entity.*;
import com.atlasskills.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final HardSkillRepository hardSkillRepository;
    private final SoftSkillRepository softSkillRepository;
    private final CourseRepository courseRepository;
    private final CertificationRepository certificationRepository;
    private final ProjectRepository projectRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;

    @Transactional(readOnly = true)
    public UserProfile getProfileEntityByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado para o usuário ID: " + userId));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long userId) {
        UserProfile profile = getProfileEntityByUserId(userId);
        return mapToDto(profile);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UserProfileDto dto) {
        UserProfile profile = getProfileEntityByUserId(userId);

        profile.setHeadline(dto.getHeadline());
        profile.setBio(dto.getBio());
        profile.setPrimaryArea(dto.getPrimaryArea());
        if (dto.getSecondaryAreas() != null) {
            profile.setSecondaryAreas(dto.getSecondaryAreas());
        }
        profile.setCareerGoal(dto.getCareerGoal());
        profile.setPhone(dto.getPhone());
        profile.setLocation(dto.getLocation());
        profile.setLinkedinUrl(dto.getLinkedinUrl());
        profile.setGithubUrl(dto.getGithubUrl());
        profile.setPortfolioUrl(dto.getPortfolioUrl());

        UserProfile saved = userProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary(Long userId) {
        UserProfile profile = getProfileEntityByUserId(userId);
        Long profileId = profile.getId();

        List<HardSkill> hardSkills = hardSkillRepository.findByProfileId(profileId);
        List<SoftSkill> softSkills = softSkillRepository.findByProfileId(profileId);
        List<Course> courses = courseRepository.findByProfileId(profileId);
        List<Certification> certifications = certificationRepository.findByProfileId(profileId);
        List<Project> projects = projectRepository.findByProfileId(profileId);
        List<Education> educations = educationRepository.findByProfileId(profileId);
        List<Experience> experiences = experienceRepository.findByProfileId(profileId);

        // Calculate completeness
        int score = 0;
        if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) score += 10;
        if (profile.getBio() != null && !profile.getBio().isBlank()) score += 10;
        if (profile.getPrimaryArea() != null && !profile.getPrimaryArea().isBlank()) score += 10;
        if (profile.getCareerGoal() != null && !profile.getCareerGoal().isBlank()) score += 10;
        if (hardSkills.size() >= 3) score += 15; else if (!hardSkills.isEmpty()) score += 8;
        if (softSkills.size() >= 2) score += 10; else if (!softSkills.isEmpty()) score += 5;
        if (!courses.isEmpty()) score += 10;
        if (!certifications.isEmpty()) score += 10;
        if (!projects.isEmpty()) score += 10;
        if (!educations.isEmpty()) score += 5;

        List<HardSkillDto> topSkills = hardSkills.stream()
                .limit(5)
                .map(this::mapSkillToDto)
                .collect(Collectors.toList());

        List<ExperienceDto> recentExperiences = experiences.stream()
                .limit(3)
                .map(this::mapExperienceToDto)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .completionPercentage(Math.min(100, score))
                .hardSkillsCount(hardSkills.size())
                .softSkillsCount(softSkills.size())
                .coursesCount(courses.size())
                .certificationsCount(certifications.size())
                .projectsCount(projects.size())
                .educationCount(educations.size())
                .experiencesCount(experiences.size())
                .topSkills(topSkills)
                .recentExperiences(recentExperiences)
                .profile(mapToDto(profile))
                .build();
    }

    private UserProfileDto mapToDto(UserProfile profile) {
        return UserProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .primaryArea(profile.getPrimaryArea())
                .secondaryAreas(profile.getSecondaryAreas())
                .careerGoal(profile.getCareerGoal())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .updatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null)
                .build();
    }

    private HardSkillDto mapSkillToDto(HardSkill s) {
        return HardSkillDto.builder()
                .id(s.getId())
                .name(s.getName())
                .category(s.getCategory())
                .level(s.getLevel())
                .yearsOfExperience(s.getYearsOfExperience())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .build();
    }

    private ExperienceDto mapExperienceToDto(Experience exp) {
        return ExperienceDto.builder()
                .id(exp.getId())
                .company(exp.getCompany())
                .position(exp.getPosition())
                .workModel(exp.getWorkModel())
                .startDate(exp.getStartDate())
                .endDate(exp.getEndDate())
                .isCurrent(exp.getIsCurrent())
                .activities(exp.getActivities())
                .createdAt(exp.getCreatedAt() != null ? exp.getCreatedAt().toString() : null)
                .build();
    }
}
