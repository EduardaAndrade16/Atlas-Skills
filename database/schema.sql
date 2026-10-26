-- ==============================================================================
-- ATLAS SKILLS - SCRIPT DE CRIAÇÃO DO BANCO DE DADOS E TABELAS
-- Compatível com MySQL 8.0+ / MySQL Workbench
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS atlas_skills
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE atlas_skills;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS job_opportunities;
DROP TABLE IF EXISTS user_track_progress;
DROP TABLE IF EXISTS activity_courses;
DROP TABLE IF EXISTS track_activities;
DROP TABLE IF EXISTS track_modules;
DROP TABLE IF EXISTS track_categories;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS education;
DROP TABLE IF EXISTS project_technologies;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS certifications;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS soft_skills;
DROP TABLE IF EXISTS hard_skills;
DROP TABLE IF EXISTS professional_areas;
DROP TABLE IF EXISTS user_profile_secondary_areas;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Usuários
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Perfil Profissional
CREATE TABLE user_profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  headline VARCHAR(255),
  bio TEXT,
  primary_area VARCHAR(150) NOT NULL,
  career_goal VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(150),
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Áreas Secundárias do Perfil
CREATE TABLE user_profile_secondary_areas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  profile_id BIGINT NOT NULL,
  area_name VARCHAR(150) NOT NULL,
  CONSTRAINT fk_secondary_areas_profile FOREIGN KEY (profile_id) REFERENCES user_profiles (id) ON DELETE CASCADE,
  INDEX idx_sec_area_name (area_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Áreas Profissionais Catalogadas
CREATE TABLE professional_areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  market_demand VARCHAR(50) NOT NULL DEFAULT 'ALTA',
  icon_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Hard Skills
CREATE TABLE hard_skills (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  level ENUM('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'ESPECIALISTA') NOT NULL,
  years_of_experience INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hard_skills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_hard_skills_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Soft Skills
CREATE TABLE soft_skills (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  level ENUM('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'ESPECIALISTA') NOT NULL,
  context_example TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_soft_skills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_soft_skills_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Cursos
CREATE TABLE courses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  workload_hours INT,
  status ENUM('EM_ANDAMENTO', 'CONCLUIDO', 'INTERROMPIDO') NOT NULL DEFAULT 'EM_ANDAMENTO',
  start_date DATE,
  completion_date DATE,
  certificate_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_courses_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Certificações
CREATE TABLE certifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiration_date DATE,
  credential_id VARCHAR(150),
  credential_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_certifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_certifications_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Projetos
CREATE TABLE projects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  role VARCHAR(150),
  repository_url VARCHAR(500),
  live_url VARCHAR(500),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_projects_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tecnologias de Projetos
CREATE TABLE project_technologies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  technology_name VARCHAR(100) NOT NULL,
  CONSTRAINT fk_proj_tech_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  INDEX idx_proj_tech_name (technology_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Formação Acadêmica
CREATE TABLE education (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255) NOT NULL,
  status ENUM('EM_ANDAMENTO', 'CONCLUIDO', 'TRANCADO', 'INCOMPLETO') NOT NULL DEFAULT 'EM_ANDAMENTO',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_education_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_education_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Experiências
CREATE TABLE experiences (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  work_model ENUM('REMOTO', 'HIBRIDO', 'PRESENCIAL') NOT NULL DEFAULT 'REMOTO',
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  activities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_experiences_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_experiences_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Categorias de Trilhas
CREATE TABLE track_categories (
  key_name VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Módulos de Aprendizagem
CREATE TABLE track_modules (
  id VARCHAR(80) PRIMARY KEY,
  category_key VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_num INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_track_modules_cat FOREIGN KEY (category_key) REFERENCES track_categories (key_name) ON DELETE CASCADE,
  INDEX idx_track_modules_cat (category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Atividades das Trilhas
CREATE TABLE track_activities (
  id VARCHAR(80) PRIMARY KEY,
  module_id VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_num INT NOT NULL DEFAULT 1,
  why_learn TEXT,
  what_you_will_learn JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_track_activities_mod FOREIGN KEY (module_id) REFERENCES track_modules (id) ON DELETE CASCADE,
  INDEX idx_track_activities_mod (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Cursos Recomendados nas Atividades
CREATE TABLE activity_courses (
  id VARCHAR(80) PRIMARY KEY,
  activity_id VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  platform VARCHAR(150) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_act_courses_act FOREIGN KEY (activity_id) REFERENCES track_activities (id) ON DELETE CASCADE,
  INDEX idx_act_courses_act (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Progresso das Trilhas por Usuário
CREATE TABLE user_track_progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  activity_id VARCHAR(80) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_track_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_track_progress_act FOREIGN KEY (activity_id) REFERENCES track_activities (id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_activity (user_id, activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Oportunidades de Emprego (Vagas)
CREATE TABLE job_opportunities (
  id VARCHAR(80) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  location VARCHAR(255) NOT NULL,
  work_model ENUM('REMOTO', 'HIBRIDO', 'PRESENCIAL') NOT NULL,
  seniority ENUM('ESTAGIO', 'JUNIOR', 'PLENO', 'SENIOR', 'ESPECIALISTA', 'LEAD') NOT NULL,
  min_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  area VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  required_skills JSON NOT NULL,
  desirable_skills JSON,
  benefits JSON,
  application_url VARCHAR(500),
  application_email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_job_area (area),
  INDEX idx_job_work_model (work_model),
  INDEX idx_job_seniority (seniority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Candidaturas a Vagas
CREATE TABLE job_applications (
  id VARCHAR(80) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  job_id VARCHAR(80) NOT NULL,
  status ENUM('INTERESSADO', 'CANDIDATURA_PLANEJADA', 'CANDIDATADO', 'EM_PROCESSO', 'ENTREVISTA', 'APROVADO', 'REPROVADO', 'ENCERRADO') NOT NULL DEFAULT 'INTERESSADO',
  applied_at TIMESTAMP NULL,
  notes TEXT,
  next_step VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_app_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_job_app_job FOREIGN KEY (job_id) REFERENCES job_opportunities (id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_job (user_id, job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
