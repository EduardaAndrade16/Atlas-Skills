package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.CertificationDto;
import com.atlasskills.model.entity.Certification;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<CertificationDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return certificationRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CertificationDto create(Long userId, CertificationDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        Certification cert = Certification.builder()
                .profile(profile)
                .name(dto.getName().trim())
                .issuingOrganization(dto.getIssuingOrganization().trim())
                .issueDate(dto.getIssueDate())
                .expirationDate(dto.getExpirationDate())
                .credentialId(dto.getCredentialId())
                .credentialUrl(dto.getCredentialUrl())
                .build();

        return mapToDto(certificationRepository.save(cert));
    }

    @Transactional
    public CertificationDto update(Long userId, Long certId, CertificationDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Certification cert = certificationRepository.findByIdAndProfileId(certId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificação não encontrada ou não pertence ao usuário."));

        cert.setName(dto.getName().trim());
        cert.setIssuingOrganization(dto.getIssuingOrganization().trim());
        cert.setIssueDate(dto.getIssueDate());
        cert.setExpirationDate(dto.getExpirationDate());
        cert.setCredentialId(dto.getCredentialId());
        cert.setCredentialUrl(dto.getCredentialUrl());

        return mapToDto(certificationRepository.save(cert));
    }

    @Transactional
    public void delete(Long userId, Long certId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Certification cert = certificationRepository.findByIdAndProfileId(certId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificação não encontrada ou não pertence ao usuário."));

        certificationRepository.delete(cert);
    }

    private CertificationDto mapToDto(Certification c) {
        return CertificationDto.builder()
                .id(c.getId())
                .name(c.getName())
                .issuingOrganization(c.getIssuingOrganization())
                .issueDate(c.getIssueDate())
                .expirationDate(c.getExpirationDate())
                .credentialId(c.getCredentialId())
                .credentialUrl(c.getCredentialUrl())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .build();
    }
}
