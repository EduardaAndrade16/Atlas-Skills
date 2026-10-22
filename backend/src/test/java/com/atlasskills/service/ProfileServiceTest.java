package com.atlasskills.service;

import com.atlasskills.model.dto.DashboardSummaryDto;
import com.atlasskills.model.dto.UserProfileDto;
import com.atlasskills.model.entity.HardSkill;
import com.atlasskills.model.entity.User;
import com.atlasskills.model.entity.UserProfile;
import com.atlasskills.model.enums.SkillLevel;
import com.atlasskills.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private HardSkillRepository hardSkillRepository;

    @Mock
    private SoftSkillRepository softSkillRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CertificationRepository certificationRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private EducationRepository educationRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @InjectMocks
    private ProfileService profileService;

    private User sampleUser;
    private UserProfile sampleProfile;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Eduarda Andrade")
                .email("eduarda@atlasskills.com")
                .password("encoded_pass")
                .build();

        sampleProfile = UserProfile.builder()
                .id(10L)
                .user(sampleUser)
                .headline("Tech Lead & Arquiteta Cloud")
                .bio("Especialista em microsserviços Spring Boot e SPAs React.")
                .primaryArea("Desenvolvimento Backend & Cloud")
                .careerGoal("Principal Engineer")
                .build();
    }

    @Test
    @DisplayName("Deve retornar o perfil do usuário corretamente")
    void shouldReturnUserProfile() {
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleProfile));

        UserProfileDto result = profileService.getProfile(1L);

        assertThat(result).isNotNull();
        assertThat(result.getHeadline()).isEqualTo("Tech Lead & Arquiteta Cloud");
        assertThat(result.getPrimaryArea()).isEqualTo("Desenvolvimento Backend & Cloud");
    }

    @Test
    @DisplayName("Deve calcular resumo do dashboard com porcentagem de preenchimento")
    void shouldCalculateDashboardSummaryAndCompletion() {
        when(userProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleProfile));
        
        HardSkill skill1 = HardSkill.builder()
                .id(1L)
                .name("Java 17")
                .category("Backend")
                .level(SkillLevel.AVANCADO)
                .yearsOfExperience(4)
                .build();

        when(hardSkillRepository.findByProfileId(10L)).thenReturn(List.of(skill1));
        when(softSkillRepository.findByProfileId(10L)).thenReturn(Collections.emptyList());
        when(courseRepository.findByProfileId(10L)).thenReturn(Collections.emptyList());
        when(certificationRepository.findByProfileId(10L)).thenReturn(Collections.emptyList());
        when(projectRepository.findByProfileId(10L)).thenReturn(Collections.emptyList());
        when(educationRepository.findByProfileId(10L)).thenReturn(Collections.emptyList());
        when(experienceRepository.findByProfileId(10L)).thenReturn(Collections.emptyList());

        DashboardSummaryDto summary = profileService.getSummary(1L);

        assertThat(summary).isNotNull();
        assertThat(summary.getHardSkillsCount()).isEqualTo(1);
        assertThat(summary.getCompletionPercentage()).isGreaterThan(40);
        assertThat(summary.getTopSkills()).hasSize(1);
    }
}
