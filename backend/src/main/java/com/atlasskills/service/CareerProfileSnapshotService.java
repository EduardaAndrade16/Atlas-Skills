package com.atlasskills.service;

import com.atlasskills.model.dto.UserProfileDto;
import com.atlasskills.repository.CertificationRepository;
import com.atlasskills.repository.HardSkillRepository;
import com.atlasskills.repository.ProjectRepository;
import com.atlasskills.repository.SoftSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerProfileSnapshotService {

    private final ProfileService profileService;
    private final HardSkillRepository hardSkillRepository;
    private final SoftSkillRepository softSkillRepository;
    private final CertificationRepository certificationRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public CareerProfileSnapshot getSnapshot(Long userId) {
        UserProfileDto profile = profileService.getProfile(userId);
        Long profileId = profile.getId();

        List<HardSkillInput> hardSkills = hardSkillRepository.findByProfileId(profileId).stream()
                .map(skill -> new HardSkillInput(
                        skill.getName(),
                        skill.getLevel().name(),
                        skill.getYearsOfExperience()))
                .toList();
        List<String> softSkills = softSkillRepository.findByProfileId(profileId).stream()
                .map(skill -> skill.getName() + " (" + skill.getLevel().name() + ")")
                .toList();
        List<String> certifications = certificationRepository.findByProfileId(profileId).stream()
                .map(certification -> certification.getName() + " - " + certification.getIssuingOrganization())
                .toList();
        List<ProjectInput> projects = projectRepository.findByProfileId(profileId).stream()
                .map(project -> new ProjectInput(project.getTechnologies()))
                .toList();

        return new CareerProfileSnapshot(
                profile.getPrimaryArea(),
                profile.getCareerGoal(),
                hardSkills,
                softSkills,
                certifications,
                projects);
    }

    public record CareerProfileSnapshot(
            String primaryArea,
            String careerGoal,
            List<HardSkillInput> hardSkills,
            List<String> softSkills,
            List<String> certifications,
            List<ProjectInput> projects
    ) {}

    public record HardSkillInput(String name, String level, int yearsOfExperience) {}

    public record ProjectInput(List<String> technologies) {}
}
