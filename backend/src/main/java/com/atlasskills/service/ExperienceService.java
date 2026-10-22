package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.ExperienceDto;
import com.atlasskills.model.entity.Experience;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<ExperienceDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return experienceRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExperienceDto create(Long userId, ExperienceDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        Experience exp = Experience.builder()
                .profile(profile)
                .company(dto.getCompany().trim())
                .position(dto.getPosition().trim())
                .workModel(dto.getWorkModel())
                .startDate(dto.getStartDate())
                .endDate(Boolean.TRUE.equals(dto.getIsCurrent()) ? null : dto.getEndDate())
                .isCurrent(Boolean.TRUE.equals(dto.getIsCurrent()))
                .activities(dto.getActivities().trim())
                .build();

        return mapToDto(experienceRepository.save(exp));
    }

    @Transactional
    public ExperienceDto update(Long userId, Long expId, ExperienceDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Experience exp = experienceRepository.findByIdAndProfileId(expId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Experiência profissional não encontrada ou não pertence ao usuário."));

        exp.setCompany(dto.getCompany().trim());
        exp.setPosition(dto.getPosition().trim());
        exp.setWorkModel(dto.getWorkModel());
        exp.setStartDate(dto.getStartDate());
        exp.setIsCurrent(Boolean.TRUE.equals(dto.getIsCurrent()));
        exp.setEndDate(Boolean.TRUE.equals(dto.getIsCurrent()) ? null : dto.getEndDate());
        exp.setActivities(dto.getActivities().trim());

        return mapToDto(experienceRepository.save(exp));
    }

    @Transactional
    public void delete(Long userId, Long expId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Experience exp = experienceRepository.findByIdAndProfileId(expId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Experiência profissional não encontrada ou não pertence ao usuário."));

        experienceRepository.delete(exp);
    }

    private ExperienceDto mapToDto(Experience e) {
        return ExperienceDto.builder()
                .id(e.getId())
                .company(e.getCompany())
                .position(e.getPosition())
                .workModel(e.getWorkModel())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .isCurrent(e.getIsCurrent())
                .activities(e.getActivities())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }
}
