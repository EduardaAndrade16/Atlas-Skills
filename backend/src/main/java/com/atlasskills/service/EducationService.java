package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.EducationDto;
import com.atlasskills.model.entity.Education;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.EducationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository educationRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<EducationDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return educationRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EducationDto create(Long userId, EducationDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        Education edu = Education.builder()
                .profile(profile)
                .institution(dto.getInstitution().trim())
                .degree(dto.getDegree().trim())
                .fieldOfStudy(dto.getFieldOfStudy().trim())
                .status(dto.getStatus())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        return mapToDto(educationRepository.save(edu));
    }

    @Transactional
    public EducationDto update(Long userId, Long educationId, EducationDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Education edu = educationRepository.findByIdAndProfileId(educationId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Formação acadêmica não encontrada ou não pertence ao usuário."));

        edu.setInstitution(dto.getInstitution().trim());
        edu.setDegree(dto.getDegree().trim());
        edu.setFieldOfStudy(dto.getFieldOfStudy().trim());
        edu.setStatus(dto.getStatus());
        edu.setStartDate(dto.getStartDate());
        edu.setEndDate(dto.getEndDate());

        return mapToDto(educationRepository.save(edu));
    }

    @Transactional
    public void delete(Long userId, Long educationId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Education edu = educationRepository.findByIdAndProfileId(educationId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Formação acadêmica não encontrada ou não pertence ao usuário."));

        educationRepository.delete(edu);
    }

    private EducationDto mapToDto(Education e) {
        return EducationDto.builder()
                .id(e.getId())
                .institution(e.getInstitution())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .status(e.getStatus())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }
}
