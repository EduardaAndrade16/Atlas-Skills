package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.SoftSkillDto;
import com.atlasskills.model.entity.SoftSkill;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.SoftSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoftSkillService {

    private final SoftSkillRepository softSkillRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<SoftSkillDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return softSkillRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SoftSkillDto create(Long userId, SoftSkillDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        SoftSkill skill = SoftSkill.builder()
                .profile(profile)
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .level(dto.getLevel())
                .contextExample(dto.getContextExample())
                .build();

        return mapToDto(softSkillRepository.save(skill));
    }

    @Transactional
    public SoftSkillDto update(Long userId, Long skillId, SoftSkillDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        SoftSkill skill = softSkillRepository.findByIdAndProfileId(skillId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Soft skill não encontrada ou não pertence ao usuário."));

        skill.setName(dto.getName().trim());
        skill.setDescription(dto.getDescription());
        skill.setLevel(dto.getLevel());
        skill.setContextExample(dto.getContextExample());

        return mapToDto(softSkillRepository.save(skill));
    }

    @Transactional
    public void delete(Long userId, Long skillId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        SoftSkill skill = softSkillRepository.findByIdAndProfileId(skillId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Soft skill não encontrada ou não pertence ao usuário."));

        softSkillRepository.delete(skill);
    }

    private SoftSkillDto mapToDto(SoftSkill s) {
        return SoftSkillDto.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .level(s.getLevel())
                .contextExample(s.getContextExample())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .build();
    }
}
