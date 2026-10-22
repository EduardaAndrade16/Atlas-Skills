package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.ProjectDto;
import com.atlasskills.model.entity.Project;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<ProjectDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return projectRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto create(Long userId, ProjectDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        Project project = Project.builder()
                .profile(profile)
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .role(dto.getRole().trim())
                .technologies(dto.getTechnologies() != null ? dto.getTechnologies() : new ArrayList<>())
                .repositoryUrl(dto.getRepositoryUrl())
                .liveUrl(dto.getLiveUrl())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        return mapToDto(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto update(Long userId, Long projectId, ProjectDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Project project = projectRepository.findByIdAndProfileId(projectId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado ou não pertence ao usuário."));

        project.setTitle(dto.getTitle().trim());
        project.setDescription(dto.getDescription().trim());
        project.setRole(dto.getRole().trim());
        if (dto.getTechnologies() != null) {
            project.setTechnologies(dto.getTechnologies());
        }
        project.setRepositoryUrl(dto.getRepositoryUrl());
        project.setLiveUrl(dto.getLiveUrl());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());

        return mapToDto(projectRepository.save(project));
    }

    @Transactional
    public void delete(Long userId, Long projectId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Project project = projectRepository.findByIdAndProfileId(projectId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado ou não pertence ao usuário."));

        projectRepository.delete(project);
    }

    private ProjectDto mapToDto(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .role(p.getRole())
                .technologies(p.getTechnologies())
                .repositoryUrl(p.getRepositoryUrl())
                .liveUrl(p.getLiveUrl())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
    }
}
