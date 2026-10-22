package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.HardSkillDto;
import com.atlasskills.model.entity.HardSkill;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.HardSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HardSkillService {

    private final HardSkillRepository hardSkillRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<HardSkillDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return hardSkillRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HardSkillDto create(Long userId, HardSkillDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        HardSkill skill = HardSkill.builder()
                .profile(profile)
                .name(dto.getName().trim())
                .category(dto.getCategory().trim())
                .level(dto.getLevel())
                .yearsOfExperience(dto.getYearsOfExperience() != null ? dto.getYearsOfExperience() : 0)
                .build();

        return mapToDto(hardSkillRepository.save(skill));
    }

    @Transactional
    public HardSkillDto update(Long userId, Long skillId, HardSkillDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        HardSkill skill = hardSkillRepository.findByIdAndProfileId(skillId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Competência técnica não encontrada ou não pertence ao usuário."));

        skill.setName(dto.getName().trim());
        skill.setCategory(dto.getCategory().trim());
        skill.setLevel(dto.getLevel());
        if (dto.getYearsOfExperience() != null) {
            skill.setYearsOfExperience(dto.getYearsOfExperience());
        }

        return mapToDto(hardSkillRepository.save(skill));
    }

    @Transactional
    public void delete(Long userId, Long skillId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        HardSkill skill = hardSkillRepository.findByIdAndProfileId(skillId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Competência técnica não encontrada ou não pertence ao usuário."));

        hardSkillRepository.delete(skill);
    }

    private HardSkillDto mapToDto(HardSkill s) {
        return HardSkillDto.builder()
                .id(s.getId())
                .name(s.getName())
                .category(s.getCategory())
                .level(s.getLevel())
                .yearsOfExperience(s.getYearsOfExperience())
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .build();
    }
}
