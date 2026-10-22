package com.atlasskills.config;

import com.atlasskills.model.entity.*;
import com.atlasskills.model.enums.*;
import com.atlasskills.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test") // Não executa durante os testes unitários automatizados para manter os testes isolados
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final HardSkillRepository hardSkillRepository;
    private final SoftSkillRepository softSkillRepository;
    private final CourseRepository courseRepository;
    private final CertificationRepository certificationRepository;
    private final ProjectRepository projectRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Inicializando dados de demonstração no banco H2 em memória...");

        // 1. Criar Usuário Demo
        User user = User.builder()
                .name("Eduarda Andrade")
                .email("eduarda.andrade@atlasskills.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        User savedUser = userRepository.save(user);

        // 2. Criar Perfil Profissional
        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .headline("Engenheira de Software Full Stack & Arquiteta Cloud")
                .bio("Desenvolvedora apaixonada por ecossistemas distribuídos, microsserviços em Spring Boot e interfaces responsivas com React.")
                .primaryArea("Desenvolvimento Backend & Cloud")
                .secondaryAreas(List.of("Arquitetura de Software", "Frontend Moderno", "DevOps & CI/CD"))
                .careerGoal("Tech Lead / Arquiteta de Soluções Cloud Senior")
                .phone("+55 (11) 98765-4321")
                .location("São Paulo, SP - Brasil")
                .linkedinUrl("https://linkedin.com/in/eduarda-andrade")
                .githubUrl("https://github.com/eduarda-andrade")
                .portfolioUrl("https://eduarda.dev")
                .build();
        UserProfile savedProfile = userProfileRepository.save(profile);

        // 3. Hard Skills
        hardSkillRepository.saveAll(List.of(
                HardSkill.builder().profile(savedProfile).name("Java 17 / Spring Boot 3").category("Backend").level(SkillLevel.AVANCADO).yearsOfExperience(4).build(),
                HardSkill.builder().profile(savedProfile).name("TypeScript & React").category("Frontend").level(SkillLevel.AVANCADO).yearsOfExperience(3).build(),
                HardSkill.builder().profile(savedProfile).name("H2 & MySQL").category("Banco de Dados").level(SkillLevel.INTERMEDIARIO).yearsOfExperience(3).build(),
                HardSkill.builder().profile(savedProfile).name("Docker & Kubernetes").category("DevOps / Cloud").level(SkillLevel.INTERMEDIARIO).yearsOfExperience(2).build(),
                HardSkill.builder().profile(savedProfile).name("REST APIs & JWT Auth").category("Arquitetura").level(SkillLevel.ESPECIALISTA).yearsOfExperience(4).build()
        ));

        // 4. Soft Skills
        softSkillRepository.saveAll(List.of(
                SoftSkill.builder().profile(savedProfile).name("Comunicação Assertiva").description("Alinhamento técnico e facilitação com produto.").level(SkillLevel.AVANCADO).contextExample("Mediação em design reviews e alinhamentos ágeis.").build(),
                SoftSkill.builder().profile(savedProfile).name("Resolução de Problemas").description("Diagnóstico rápido de causa raiz e mitigação de incidentes.").level(SkillLevel.ESPECIALISTA).contextExample("Investigação e solução de gargalos de concorrência.").build()
        ));

        // 5. Cursos
        courseRepository.saveAll(List.of(
                Course.builder().profile(savedProfile).name("Spring Boot 3 & Microsserviços com Docker").institution("Alura").workloadHours(60).status(CourseStatus.CONCLUIDO).startDate(LocalDate.of(2025, 2, 10)).completionDate(LocalDate.of(2025, 4, 15)).certificateUrl("https://cursos.exemplo.com/cert/sp3-60h").build(),
                Course.builder().profile(savedProfile).name("Arquitetura Limpa e DDD na Prática").institution("Full Cycle").workloadHours(80).status(CourseStatus.CONCLUIDO).startDate(LocalDate.of(2025, 6, 1)).completionDate(LocalDate.of(2025, 9, 20)).build()
        ));

        // 6. Certificações
        certificationRepository.saveAll(List.of(
                Certification.builder().profile(savedProfile).name("AWS Certified Solutions Architect – Associate").issuingOrganization("Amazon Web Services (AWS)").issueDate(LocalDate.of(2025, 5, 15)).expirationDate(LocalDate.of(2028, 5, 15)).credentialId("AWS-SAA-839219").credentialUrl("https://aws.amazon.com/verification").build(),
                Certification.builder().profile(savedProfile).name("Oracle Certified Professional: Java SE 17 Developer").issuingOrganization("Oracle").issueDate(LocalDate.of(2024, 11, 20)).credentialId("OCP-17-99201").build()
        ));

        // 7. Projetos
        projectRepository.saveAll(List.of(
                Project.builder().profile(savedProfile).title("Atlas Skills Platform").description("Plataforma de gestão de competências, perfis e mapeamento de carreira com Spring Boot e React.").role("Tech Lead").technologies(List.of("Java 17", "Spring Boot", "H2 Database", "React", "TypeScript", "JWT")).repositoryUrl("https://github.com/atlas-skills/atlas-platform").liveUrl("https://atlas-skills.dev").startDate(LocalDate.of(2026, 1, 1)).build()
        ));

        // 8. Formação Acadêmica
        educationRepository.saveAll(List.of(
                Education.builder().profile(savedProfile).institution("Universidade de São Paulo (USP)").degree("Bacharelado").fieldOfStudy("Ciência da Computação").status(EducationStatus.CONCLUIDO).startDate(LocalDate.of(2020, 2, 1)).endDate(LocalDate.of(2024, 12, 15)).build()
        ));

        // 9. Experiências
        experienceRepository.saveAll(List.of(
                Experience.builder().profile(savedProfile).company("Nexus Tech Solutions").position("Engenheira de Software Full Stack Pleno").workModel(WorkModel.REMOTO).startDate(LocalDate.of(2024, 3, 1)).isCurrent(true).activities("Desenvolvimento e sustentação de microsserviços em Spring Boot 3; modelagem de dados e interfaces em React.").build()
        ));

        log.info("Banco H2 populado com sucesso! Usuário de teste: eduarda.andrade@atlasskills.com / password123");
    }
}
