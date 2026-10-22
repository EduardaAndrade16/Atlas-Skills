package com.atlasskills.service;

import com.atlasskills.exception.ResourceNotFoundException;
import com.atlasskills.model.dto.CourseDto;
import com.atlasskills.model.entity.Course;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<CourseDto> getAll(Long userId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        return courseRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDto create(Long userId, CourseDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);

        Course course = Course.builder()
                .profile(profile)
                .name(dto.getName().trim())
                .institution(dto.getInstitution().trim())
                .workloadHours(dto.getWorkloadHours())
                .status(dto.getStatus())
                .startDate(dto.getStartDate())
                .completionDate(dto.getCompletionDate())
                .certificateUrl(dto.getCertificateUrl())
                .build();

        return mapToDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto update(Long userId, Long courseId, CourseDto dto) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Course course = courseRepository.findByIdAndProfileId(courseId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado ou não pertence ao usuário."));

        course.setName(dto.getName().trim());
        course.setInstitution(dto.getInstitution().trim());
        course.setWorkloadHours(dto.getWorkloadHours());
        course.setStatus(dto.getStatus());
        course.setStartDate(dto.getStartDate());
        course.setCompletionDate(dto.getCompletionDate());
        course.setCertificateUrl(dto.getCertificateUrl());

        return mapToDto(courseRepository.save(course));
    }

    @Transactional
    public void delete(Long userId, Long courseId) {
        UserProfile profile = profileService.getProfileEntityByUserId(userId);
        Course course = courseRepository.findByIdAndProfileId(courseId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado ou não pertence ao usuário."));

        courseRepository.delete(course);
    }

    private CourseDto mapToDto(Course c) {
        return CourseDto.builder()
                .id(c.getId())
                .name(c.getName())
                .institution(c.getInstitution())
                .workloadHours(c.getWorkloadHours())
                .status(c.getStatus())
                .startDate(c.getStartDate())
                .completionDate(c.getCompletionDate())
                .certificateUrl(c.getCertificateUrl())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .build();
    }
}
