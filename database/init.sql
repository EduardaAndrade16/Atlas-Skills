-- =============================================================================
-- ATLAS SKILLS PLATFORM - DDL & DML INITIAL DATABASE SCRIPT
-- Compatibilidade: MySQL 8.0+ / MariaDB 10.5+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `atlas_skills_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `atlas_skills_db`;

-- -----------------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABELA DE PERFIL PROFISSIONAL (user_profiles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL UNIQUE,
  `headline` VARCHAR(200) NULL,
  `bio` TEXT NULL,
  `primary_area` VARCHAR(120) NOT NULL,
  `career_goal` VARCHAR(160) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `location` VARCHAR(120) NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `github_url` VARCHAR(255) NULL,
  `portfolio_url` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABELA DE ÁREAS SECUNDÁRIAS (profile_secondary_areas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `profile_secondary_areas` (
  `profile_id` BIGINT NOT NULL,
  `area_name` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`profile_id`, `area_name`),
  CONSTRAINT `fk_secondary_areas_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABELA DE HARD SKILLS (hard_skills)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hard_skills` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `level` VARCHAR(30) NOT NULL,
  `years_of_experience` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_hard_skills_profile` (`profile_id`),
  CONSTRAINT `fk_hard_skills_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABELA DE SOFT SKILLS (soft_skills)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `soft_skills` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `level` VARCHAR(30) NOT NULL,
  `context_example` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_soft_skills_profile` (`profile_id`),
  CONSTRAINT `fk_soft_skills_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABELA DE CURSOS E CAPACITAÇÕES (courses)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `institution` VARCHAR(120) NOT NULL,
  `workload_hours` INT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'CONCLUIDO',
  `start_date` DATE NULL,
  `completion_date` DATE NULL,
  `certificate_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_courses_profile` (`profile_id`),
  CONSTRAINT `fk_courses_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TABELA DE CERTIFICAÇÕES (certifications)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `certifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `issuing_organization` VARCHAR(120) NOT NULL,
  `issue_date` DATE NOT NULL,
  `expiration_date` DATE NULL,
  `credential_id` VARCHAR(100) NULL,
  `credential_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_certifications_profile` (`profile_id`),
  CONSTRAINT `fk_certifications_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABELA DE PROJETOS (projects)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `repository_url` VARCHAR(255) NULL,
  `live_url` VARCHAR(255) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_projects_profile` (`profile_id`),
  CONSTRAINT `fk_projects_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABELA DE TECNOLOGIAS DOS PROJETOS (project_technologies)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_technologies` (
  `project_id` BIGINT NOT NULL,
  `technology_name` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`project_id`, `technology_name`),
  CONSTRAINT `fk_project_tech_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TABELA DE FORMAÇÃO ACADÊMICA (education)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `education` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `institution` VARCHAR(160) NOT NULL,
  `degree` VARCHAR(100) NOT NULL,
  `field_of_study` VARCHAR(140) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'CONCLUIDO',
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_education_profile` (`profile_id`),
  CONSTRAINT `fk_education_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. TABELA DE EXPERIÊNCIAS PROFISSIONAIS (experiences)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` BIGINT NOT NULL,
  `company` VARCHAR(140) NOT NULL,
  `position` VARCHAR(120) NOT NULL,
  `work_model` VARCHAR(30) NOT NULL DEFAULT 'REMOTO',
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `is_current` BOOLEAN NOT NULL DEFAULT FALSE,
  `activities` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_experiences_profile` (`profile_id`),
  CONSTRAINT `fk_experiences_profile` FOREIGN KEY (`profile_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA OPCIONAL (Usuário Demo e Perfil Inicial)
-- Senha de teste padrão: password123 (Hash BCrypt com rounds=10)
-- =============================================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`)
VALUES (
  1,
  'Eduarda Andrade',
  'eduarda.andrade@atlasskills.com',
  '$2a$10$tZ2c6k9Jq5s7yF3/N1p0teMvV8H2v6.F8Fq7yO3s0.d3J/G3m5kQG',
  'ROLE_USER'
) ON DUPLICATE KEY UPDATE `id` = `id`;

INSERT INTO `user_profiles` (`id`, `user_id`, `headline`, `bio`, `primary_area`, `career_goal`, `phone`, `location`, `linkedin_url`, `github_url`, `portfolio_url`)
VALUES (
  1,
  1,
  'Engenheira de Software Full Stack & Arquiteta Cloud',
  'Desenvolvedora focada em ecossistemas de alta performance em Spring Boot e interfaces interativas em React.',
  'Desenvolvimento Backend & Cloud',
  'Tech Lead / Arquiteta de Soluções Cloud Senior',
  '+55 (11) 98765-4321',
  'São Paulo, SP - Brasil',
  'https://linkedin.com/in/eduarda-andrade',
  'https://github.com/eduarda-andrade',
  'https://eduarda.dev'
) ON DUPLICATE KEY UPDATE `id` = `id`;

INSERT IGNORE INTO `profile_secondary_areas` (`profile_id`, `area_name`)
VALUES (1, 'Arquitetura de Software'), (1, 'Frontend Moderno'), (1, 'DevOps & CI/CD');

INSERT INTO `hard_skills` (`profile_id`, `name`, `category`, `level`, `years_of_experience`)
VALUES
  (1, 'Java 17 / Spring Boot 3', 'Backend', 'AVANCADO', 4),
  (1, 'TypeScript & React', 'Frontend', 'AVANCADO', 3),
  (1, 'MySQL & PostgreSQL', 'Banco de Dados', 'INTERMEDIARIO', 3),
  (1, 'Docker & Kubernetes', 'DevOps / Cloud', 'INTERMEDIARIO', 2),
  (1, 'REST APIs & JWT Auth', 'Arquitetura', 'ESPECIALISTA', 4);

INSERT INTO `soft_skills` (`profile_id`, `name`, `description`, `level`, `context_example`)
VALUES
  (1, 'Comunicação Assertiva', 'Alinhamento claro entre engenharia e produto.', 'AVANCADO', 'Mediação de decisões técnicas e design reviews.'),
  (1, 'Resolução de Problemas', 'Diagnóstico rápido e estruturado de causa raiz.', 'ESPECIALISTA', 'Resolução de problemas de concorrência e banco de dados.');
