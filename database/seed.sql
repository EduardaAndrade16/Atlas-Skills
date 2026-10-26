-- ==============================================================================
-- ATLAS SKILLS - SCRIPT DE CARGA DE DADOS INICIAIS (SEED DATA)
-- ==============================================================================

USE atlas_skills;

-- 1. As 6 Áreas Profissionais Principais da Plataforma
INSERT INTO professional_areas (id, name, description, market_demand, icon_name) VALUES
(1, 'Desenvolvimento Backend', 'Arquitetura de microsserviços, APIs REST, modelagem de banco de dados, concorrência e resiliência.', 'ALTA', 'Server'),
(2, 'Desenvolvimento Frontend', 'Interfaces de usuário reativas, TypeScript, React, acessibilidade, performance web e design system.', 'ALTA', 'Layout'),
(3, 'Engenharia de Dados', 'Pipelines ETL/ELT, modelagem analítica, consultas SQL complexas, Big Data e governança.', 'MUITO_ALTA', 'Database'),
(4, 'DevOps & Cloud', 'Infraestrutura como código, contêineres Docker/Kubernetes, CI/CD, observabilidade e nuvem.', 'MUITO_ALTA', 'Cloud'),
(5, 'Cibersegurança & Redes', 'Segurança de aplicações (OWASP), criptografia, resposta a incidentes, autenticação e proteção de dados.', 'ALTA', 'Shield'),
(6, 'Inteligência Artificial & Arquitetura', 'Integração de LLMs, arquiteturas distribuídas escaláveis, Clean Architecture e engenharia de software.', 'MUITO_ALTA', 'Cpu')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Usuário de Demonstração
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
(1, 'Eduarda Andrade', 'eduarda.andrade@atlasskills.com', '123456', 'USER', '2026-01-15 10:00:00')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Perfil do Usuário
INSERT INTO user_profiles (id, user_id, headline, bio, primary_area, career_goal, phone, location, linkedin_url, github_url, portfolio_url) VALUES
(1, 1,
 'Engenheira de Software Full Stack & Arquiteta Cloud',
 'Desenvolvedora apaixonada por ecossistemas distribuídos, microsserviços em Spring Boot e interfaces responsivas com React. Foco contínuo em boas práticas, escalabilidade e arquiteturas limpas.',
 'Desenvolvimento Backend',
 'Tech Lead / Arquiteta de Soluções Cloud Senior',
 '+55 (11) 98765-4321',
 'São Paulo, SP - Brasil',
 'https://linkedin.com/in/eduarda-andrade',
 'https://github.com/eduarda-andrade',
 'https://eduarda.dev')
ON DUPLICATE KEY UPDATE headline=VALUES(headline);

-- 4. Áreas Secundárias do Perfil
DELETE FROM user_profile_secondary_areas WHERE profile_id = 1;
INSERT INTO user_profile_secondary_areas (profile_id, area_name) VALUES
(1, 'Arquitetura de Software'),
(1, 'Frontend Moderno'),
(1, 'DevOps & CI/CD');

-- 5. Hard Skills
DELETE FROM hard_skills WHERE user_id = 1;
INSERT INTO hard_skills (id, user_id, name, category, level, years_of_experience) VALUES
(1, 1, 'Java 17 / Spring Boot 3', 'Backend', 'AVANCADO', 4),
(2, 1, 'TypeScript & React', 'Frontend', 'AVANCADO', 3),
(3, 1, 'MySQL & PostgreSQL', 'Banco de Dados', 'INTERMEDIARIO', 3),
(4, 1, 'Docker & Kubernetes', 'DevOps / Cloud', 'INTERMEDIARIO', 2),
(5, 1, 'REST APIs & JWT Auth', 'Arquitetura', 'ESPECIALISTA', 4),
(6, 1, 'Tailwind CSS', 'Frontend', 'ESPECIALISTA', 3);

-- 6. Soft Skills
DELETE FROM soft_skills WHERE user_id = 1;
INSERT INTO soft_skills (id, user_id, name, description, level, context_example) VALUES
(1, 1, 'Comunicação Assertiva', 'Capacidade de alinhar expectativas entre times técnicos e de negócios.', 'AVANCADO', 'Apresentação de arquiteturas e mentoria técnica de pares.'),
(2, 1, 'Resolução de Problemas Complexos', 'Abordagem analítica para debugar gargalos e criar soluções resilientes.', 'ESPECIALISTA', 'Diagnóstico de concorrência em transações financeiras.'),
(3, 1, 'Trabalho Colaborativo', 'Espírito de equipe, code review empático e facilitação de cerimônias ágeis.', 'AVANCADO', 'Pair programming e alinhamentos diários em equipes remotas.'),
(4, 1, 'Adaptabilidade e Aprendizado Rápido', 'Agilidade na assimilação de novos frameworks, ferramentas e domínios.', 'ESPECIALISTA', 'Migração de monólito para microsserviços em poucas sprints.');

-- 7. Cursos
DELETE FROM courses WHERE user_id = 1;
INSERT INTO courses (id, user_id, name, institution, workload_hours, status, start_date, completion_date, certificate_url) VALUES
(1, 1, 'Spring Boot 3 & Microsserviços com Docker', 'Alura', 60, 'CONCLUIDO', '2025-02-10', '2025-04-15', 'https://cursos.exemplo.com/cert/sp3-60h'),
(2, 1, 'Arquitetura Limpa e DDD na Prática', 'Full Cycle', 80, 'CONCLUIDO', '2025-06-01', '2025-09-20', 'https://cursos.exemplo.com/cert/clean-arch-80h'),
(3, 1, 'React 19, TypeScript e Server Components', 'Rocketseat', 45, 'EM_ANDAMENTO', '2026-01-10', NULL, NULL);

-- 8. Certificações
DELETE FROM certifications WHERE user_id = 1;
INSERT INTO certifications (id, user_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url) VALUES
(1, 1, 'AWS Certified Solutions Architect – Associate', 'Amazon Web Services (AWS)', '2025-05-15', '2028-05-15', 'AWS-SAA-839219', 'https://aws.amazon.com/verification'),
(2, 1, 'Oracle Certified Professional: Java SE 17 Developer', 'Oracle', '2024-11-20', NULL, 'OCP-17-99201', 'https://catalog-education.oracle.com');

-- 9. Projetos
DELETE FROM projects WHERE user_id = 1;
INSERT INTO projects (id, user_id, title, description, role, repository_url, live_url, start_date, end_date) VALUES
(1, 1, 'Atlas Skills Platform', 'Plataforma completa de gestão de competências, perfis profissionais e mapeamento de carreira integrada com Spring Boot e React.', 'Tech Lead & Full Stack Developer', 'https://github.com/atlas-skills/atlas-platform', 'https://atlas-skills.dev', '2026-01-01', NULL),
(2, 1, 'Cloud Event Broker Microservices', 'Sistema assíncrono para ingestão e processamento de eventos de alta taxa de transferência com Spring Cloud Stream e RabbitMQ.', 'Backend Architect', 'https://github.com/atlas-skills/event-broker', NULL, '2025-08-01', '2025-12-15');

-- 10. Tecnologias dos Projetos
DELETE FROM project_technologies WHERE project_id IN (1, 2);
INSERT INTO project_technologies (project_id, technology_name) VALUES
(1, 'Java 17'), (1, 'Spring Boot'), (1, 'React'), (1, 'TypeScript'), (1, 'MySQL'), (1, 'JWT'), (1, 'Tailwind CSS'),
(2, 'Spring Boot'), (2, 'RabbitMQ'), (2, 'PostgreSQL'), (2, 'Docker'), (2, 'JUnit 5');

-- 11. Formação Acadêmica
DELETE FROM education WHERE user_id = 1;
INSERT INTO education (id, user_id, institution, degree, field_of_study, status, start_date, end_date) VALUES
(1, 1, 'Universidade de São Paulo (USP)', 'Bacharelado em Ciência da Computação', 'Ciência da Computação & Engenharia de Software', 'CONCLUIDO', '2020-02-01', '2024-12-15'),
(2, 1, 'FIAP', 'Pós-Graduação / Especialização em Cloud Computing & DevOps Architecture', 'Arquitetura Cloud e Sistemas Distribuídos', 'EM_ANDAMENTO', '2025-03-01', NULL);

-- 12. Experiências Profissionais
DELETE FROM experiences WHERE user_id = 1;
INSERT INTO experiences (id, user_id, company, position, work_model, start_date, end_date, is_current, activities) VALUES
(1, 1, 'Nexus Tech Solutions', 'Engenheira de Software Full Stack Pleno', 'REMOTO', '2024-03-01', NULL, TRUE, 'Desenvolvimento e sustentação de microsserviços em Spring Boot 3; implementação de pipelines CI/CD; modelagem de dados no MySQL e criação de SPAs em React com TypeScript.'),
(2, 1, 'Innovate Inovação Digital', 'Desenvolvedora Backend Jr', 'HIBRIDO', '2022-08-01', '2024-02-28', FALSE, 'Criação de endpoints REST, automação de testes unitários com JUnit 5 e Mockito, integração de sistemas legados e otimização de consultas SQL.');

-- 13. Categorias das Trilhas
INSERT INTO track_categories (key_name, title, subtitle, description) VALUES
('hard-skills', 'Hard Skills', 'Competências Técnicas & Engenharia', 'Sistemas operacionais, redes, linguagens, arquitetura e cibersegurança.'),
('soft-skills', 'Soft Skills', 'Competências Comportamentais', 'Comunicação assertiva, resolução de problemas, liderança e adaptabilidade.'),
('linkedin', 'LinkedIn', 'Posicionamento & Presença Digital', 'Otimização de perfil, narrativa profissional, conexões e atração de recrutadores.'),
('curriculo', 'Currículo', 'Apresentação & Compatibilidade ATS', 'Estruturação estratégica, quantificação de impacto e alinhamento a vagas.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 14. Módulos das Trilhas
INSERT INTO track_modules (id, category_key, title, description, order_num) VALUES
('mod-hs-1', 'hard-skills', 'Módulo 1: Fundamentos de Cibersegurança & Sistemas', 'Conceitos fundamentais de sistemas operacionais, redes e princípios de segurança.', 1),
('mod-hs-2', 'hard-skills', 'Módulo 2: Segurança de Aplicações & Web', 'Mitigação de vulnerabilidades comuns, autenticação e proteção de APIs.', 2),
('mod-ss-1', 'soft-skills', 'Módulo 1: Comunicação & Alinhamento Profissional', 'Técnicas de clareza, alinhamento de expectativas e negociação.', 1),
('mod-ss-2', 'soft-skills', 'Módulo 2: Resolução de Problemas & Tomada de Decisão', 'Diagnóstico analítico, postura sob pressão e aprendizado com falhas.', 2),
('mod-li-1', 'linkedin', 'Módulo 1: Estruturação & Posicionamento do Perfil', 'Otimização dos campos essenciais do perfil para atrair recrutadores.', 1),
('mod-li-2', 'linkedin', 'Módulo 2: Validação Social, Portfólio & Networking', 'Exposição de realizações e engajamento estratégico na rede.', 2),
('mod-cv-1', 'curriculo', 'Módulo 1: Arquitetura & Compatibilidade com ATS', 'Layouts limpos, hierarquia visual e legibilidade para robôs e recrutadores.', 1),
('mod-cv-2', 'curriculo', 'Módulo 2: Descrição de Experiências & Resultados Quantificados', 'Transformação de listas de tarefas em conquistas demonstráveis.', 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 15. Atividades das Trilhas
INSERT INTO track_activities (id, module_id, title, order_num, why_learn, what_you_will_learn) VALUES
('act-hs-1', 'mod-hs-1', 'Sistemas Operacionais & Ambientes Linux', 1,
 'O domínio de sistemas operacionais e comandos Linux é a base essencial para administrar servidores e rodar contêineres.',
 '["Estrutura hierárquica de diretórios e permissões POSIX no Linux", "Gerenciamento de processos e fluxos de entrada/saída", "Comandos essenciais de terminal para inspeção e administração"]'),
('act-hs-2', 'mod-hs-1', 'Redes de Computadores & Protocolos de Comunicação', 2,
 'Entender protocolos como TCP/IP, DNS, HTTP/S e SSH permite projetar microsserviços eficientes e seguros.',
 '["Camadas do modelo OSI e pilha TCP/IP", "Roteamento, sub-redes e resolução de nomes (DNS)", "Diagnóstico de conectividade com ferramentas de rede"]'),
('act-hs-3', 'mod-hs-1', 'Fundamentos de Segurança da Informação & Tríade CIA', 3,
 'A segurança deve ser pensada desde o design arquitetural (Security by Design), protegendo dados sensíveis.',
 '["Tríade CIA: Confidencialidade, Integridade e Disponibilidade", "Criptografia simétrica, assimétrica e hashing", "Políticas de privilégio mínimo e MFA"]'),
('act-hs-4', 'mod-hs-2', 'OWASP Top 10 e Vulnerabilidades Comuns', 1,
 'Conhecer e mitigar SQLi, XSS e falhas de autenticação é requisito indispensável para desenvolvedores modernos.',
 '["Principais vetores de ataque OWASP", "Validação e sanitização estrita de entradas em APIs", "Implementação de cabeçalhos HTTP seguros"]'),
('act-hs-5', 'mod-hs-2', 'Autenticação Segura & Gestão de Tokens (JWT/OAuth2)', 2,
 'A correta manipulação de identidades e sessões é o alicerce para APIs resilientes em ambientes distribuídos.',
 '["Fluxos de autorização OAuth 2.0 e OpenID Connect", "Boas práticas de assinatura e refresh tokens", "Prevenção a ataques CSRF"]'),
('act-ss-1', 'mod-ss-1', 'Comunicação Assertiva no Ambiente Técnico', 1,
 'A capacidade de traduzir complexidade técnica para diferentes públicos acelera entregas e evita retrabalhos.',
 '["Escuta ativa e alinhamento de expectativas", "Estruturação de mensagens técnicas claras", "Comunicação não-violenta no cotidiano de squads"]'),
('act-ss-2', 'mod-ss-1', 'Apresentação de Soluções e Negociação com Stakeholders', 2,
 'Defender uma escolha técnica exige argumentação baseada em valor de negócio e mitigação de riscos.',
 '["Construção de business cases técnicos", "Princípios de negociação ganha-ganha", "Manejo construtivo de resistências"]'),
('act-ss-3', 'mod-ss-2', 'Diagnóstico Estruturado e Postura Sob Pressão', 1,
 'Manter o controle emocional e seguir métodos analíticos salva entregas durante incidentes em produção.',
 '["Técnica dos 5 Porquês e Diagrama de Causa-Raiz", "Priorização rápida por gravidade e urgência", "Cultura de Blameless Post-Mortem"]'),
('act-li-1', 'mod-li-1', 'Título Profissional de Alto Impacto', 1,
 'O título é o primeiro elemento visto por recrutadores e pelos algoritmos do LinkedIn.',
 '["Fórmula de alto impacto: Cargo | Especialidades | Proposta de Valor", "Eliminação de clichês que reduzem o ranking", "Mapeamento de palavras-chave mais buscadas"]'),
('act-li-2', 'mod-li-1', 'Seção Sobre: Storytelling e Trajetória Profissional', 2,
 'O resumo conecta seu histórico com suas aspirações e diferenciais competitivos.',
 '["Estrutura em 3 partes: Quem sou, o que domino e onde desejo atuar", "Inclusão de conquistas mensuráveis e tecnologias centrais", "Chamada para ação clara"]'),
('act-li-3', 'mod-li-2', 'Destaque de Projetos & Solicitação de Recomendações', 1,
 'Recomendações e links para projetos reais constroem prova social imediata.',
 '["Configuração estratégica da seção de Destaques", "Como solicitar recomendações personalizadas", "Engajamento e comentários de valor em postagens"]'),
('act-cv-1', 'mod-cv-1', 'Estruturação Ideal para Sistemas ATS (Robôs de Triagem)', 1,
 'Mais de 75% dos currículos passam por triagem automatizada (ATS). Um formato inadequado descarta o candidato.',
 '["Formatos seguros (PDF legível vs DOCX)", "Hierarquia de cabeçalhos sem colunas quebradas", "Incorporação de palavras-chave da vaga"]'),
('act-cv-2', 'mod-cv-1', 'Resumo Profissional Inicial de Alto Impacto', 2,
 'Recrutadores gastam de 6 a 10 segundos na primeira leitura. Um bom resumo garante leitura completa.',
 '["Síntese em 3 a 4 linhas com senioridade e stack", "Destaque de maiores sucessos no topo", "Adaptação ao foco da oportunidade"]'),
('act-cv-3', 'mod-cv-2', 'Metodologia STAR e Resultados com Métricas', 1,
 'Demonstrar contexto, ação e impacto quantificado diferencia seu currículo dos concorrentes.',
 '["Fórmula: Verbo de Ação + Contexto + Métrica de Impacto", "Exemplos de ganhos de performance e estabilidade", "Revisão minuciosa contra ambiguidades"]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 16. Cursos das Atividades
INSERT INTO activity_courses (id, activity_id, title, platform, url, description, is_free, is_demo, estimated_duration) VALUES
('c-hs-1', 'act-hs-1', 'Fundamentos de Linux (Demonstração)', 'Fundação Bradesco - Escola Virtual', 'https://www.ev.org.br', 'Capacitação introdutória sobre conceitos de sistemas operacionais e terminal Linux.', TRUE, TRUE, '20h'),
('c-hs-2', 'act-hs-1', 'Formação Linux & DevOps (Demonstração)', 'Alura', 'https://www.alura.com.br', 'Trilha completa com servidores, scripts bash, permissões e automação de rotinas.', FALSE, TRUE, '45h'),
('c-hs-3', 'act-hs-2', 'Introdução a Redes de Computadores (Demonstração)', 'Coursera / Google', 'https://www.coursera.org', 'Curso introdutório gratuito sobre como a internet e as redes corporativas funcionam.', TRUE, TRUE, '25h'),
('c-ss-1', 'act-ss-1', 'Comunicação Assertiva no Trabalho (Demonstração)', 'Fundação Bradesco - Escola Virtual', 'https://www.ev.org.br', 'Capacitação prática para expressar ideias e defender pontos de vista com clareza e respeito.', TRUE, TRUE, '10h'),
('c-li-1', 'act-li-1', 'Otimização de Perfil no LinkedIn (Demonstração)', 'LinkedIn Learning', 'https://www.linkedin.com/learning', 'Orientações práticas para destacar suas competências e experiências na rede profissional.', FALSE, TRUE, '4h'),
('c-cv-1', 'act-cv-1', 'Como Criar um Currículo Vencedor (Demonstração)', 'Fundação Estudar - Na Prática', 'https://www.napratica.org.br', 'Guia passo a passo para estruturar um currículo profissional de impacto.', TRUE, TRUE, '5h')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 17. Progresso Inicial da Trilha
INSERT INTO user_track_progress (user_id, activity_id, completed) VALUES
(1, 'act-hs-1', TRUE),
(1, 'act-ss-1', TRUE),
(1, 'act-li-1', TRUE)
ON DUPLICATE KEY UPDATE completed=VALUES(completed);

-- 18. Oportunidades de Emprego (Vagas)
INSERT INTO job_opportunities (
  id, title, company, logo_url, location, work_model, seniority, min_salary, max_salary, area, description,
  required_skills, desirable_skills, benefits, application_url, application_email, is_active, is_demo, created_at
) VALUES
('job-1', 'Engenheiro de Software Backend Sênior (Java / Spring)', 'Nubank', NULL, 'São Paulo, SP (Híbrido)', 'HIBRIDO', 'SENIOR', 13000.00, 18500.00, 'Desenvolvimento',
 'Lidere o desenvolvimento de novos produtos financeiros com microsserviços resilientes em Java 17 e Spring Boot. Atuação em sistemas distribuídos de alta concorrência.',
 '["Java 17", "Spring Boot", "Microsserviços", "SQL", "Docker", "REST APIs"]',
 '["Kafka", "AWS", "JUnit 5", "CI/CD", "Kubernetes"]',
 '["Vale Refeição e Alimentação flexível", "Plano de Saúde e Dental Bradesco Seguros", "Participação nos Lucros (PLR)", "Auxílio Home Office mensal"]',
 'https://nubank.com.br/carreiras', 'tech-talents@nubank.com.br', TRUE, TRUE, '2026-10-15 14:00:00'),

('job-2', 'Desenvolvedor Frontend Pleno (React & TypeScript)', 'Mercado Livre', NULL, 'São Paulo, SP (Remoto Brasil)', 'REMOTO', 'PLENO', 8500.00, 12000.00, 'Desenvolvimento',
 'Construa interfaces ricas, performáticas e acessíveis para milhões de usuários diários. Trabalho conjunto com times de UX e design system utilizando React 19 e Tailwind CSS.',
 '["React", "TypeScript", "Tailwind CSS", "HTML/CSS", "Git", "Clean Code"]',
 '["Next.js", "Jest / Vitest", "Figma", "Redux Toolkit", "GraphQL"]',
 '["100% Remoto com auxílio infraestrutura", "Plano de Saúde SulAmérica", "Vale Alimentação R$ 1.100/mês", "Desconto de 20% no marketplace"]',
 'https://mercadolivre.com/carreiras', 'vagas-frontend@mercadolivre.com', TRUE, TRUE, '2026-10-16 11:30:00'),

('job-3', 'Analista de Infraestrutura & DevOps Jr', 'Stone Pagamentos', NULL, 'Rio de Janeiro, RJ (Presencial)', 'PRESENCIAL', 'JUNIOR', 4500.00, 6800.00, 'DevOps',
 'Apoio na sustentação de ambientes em nuvem, automação de deploys, criação de scripts bash/python e monitoramento de transações financeiras.',
 '["Linux", "Docker", "Git", "Redes de Computadores", "Shell Script"]',
 '["Kubernetes", "Terraform", "AWS", "Prometheus", "Grafana"]',
 '["Vale Refeição R$ 45/dia", "Plano de Saúde Unimed", "Seguro de vida", "Gympass", "Bônus semestral"]',
 'https://stone.com.br/carreiras', 'infra-talents@stone.com.br', TRUE, TRUE, '2026-10-17 09:15:00'),

('job-4', 'Especialista em Cibersegurança & AppSec', 'Itaú Unibanco', NULL, 'São Paulo, SP (Híbrido)', 'HIBRIDO', 'ESPECIALISTA', 16000.00, 22000.00, 'Cibersegurança',
 'Definição de padrões de segurança de aplicações (AppSec), testes de intrusão, modelagem de ameaças e implantação de pipelines DevSecOps.',
 '["Segurança da Informação", "OWASP Top 10", "OAuth2 / JWT", "Testes de Penetração", "DevSecOps"]',
 '["Certificações CISSP / CEH", "Cloud Security", "SAST/DAST", "Criptografia"]',
 '["Remuneração variável anual atrativa", "Plano de saúde extensivo à família", "Previdência complementar", "Auxílio creche"]',
 'https://itau.com.br/carreiras', 'cybersecurity-recruiting@itau.com.br', TRUE, TRUE, '2026-10-18 10:45:00'),

('job-5', 'Analista de Dados & Business Intelligence Jr', 'Mercado Livre', NULL, 'Osasco, SP (Híbrido)', 'HIBRIDO', 'JUNIOR', 5500.00, 7900.00, 'Dados',
 'Gere insights operacionais e de negócio com dashboards analíticos, queries SQL complexas e relatórios automatizados.',
 '["SQL", "Python", "Power BI", "Excel Avançado"]',
 '["Git", "Estatística", "ETL", "BigQuery"]',
 '["Transporte corporativo e refeição no campus MELI", "Descontos no Mercado Livre", "Plano de carreira com mentorias", "Bônus anual"]',
 'https://careers-meli.mercadolibre.com', 'analytics-jobs@mercadolivre.com', TRUE, TRUE, '2026-10-19 08:00:00'),

('job-6', 'Analista de Qualidade de Software (QA Automation)', 'PagBank', NULL, 'São Paulo, SP (Remoto)', 'REMOTO', 'PLENO', 6800.00, 9300.00, 'QA',
 'Garantir a estabilidade e qualidade funcional das plataformas de pagamentos e conta digital com testes automatizados em Cypress.',
 '["Testes Automatizados", "Cypress", "Git", "JavaScript", "Metodologias Ágeis"]',
 '["Postman", "CI/CD", "TypeScript", "Jest", "Testes de Carga"]',
 '["100% remoto com jornada flexível", "Caju Multibenefícios R$ 1.250/mês", "Plano de Saúde Bradesco", "Wellhub corporativo"]',
 'https://pagbank.com.br/carreiras', 'qa-talents@pagbank.com.br', TRUE, TRUE, '2026-10-19 16:20:00'),

('job-7', 'Estágio em Desenvolvimento Web & Frontend', 'Hotmart', NULL, 'Belo Horizonte, MG (Remoto Brasil)', 'REMOTO', 'ESTAGIO', 2400.00, 3100.00, 'Desenvolvimento',
 'Apoio na construção de componentes de interface, correção de bugs e testes visuais com mentoria técnica direta.',
 '["HTML", "CSS", "JavaScript", "Git", "Lógica de Programação"]',
 '["React", "TypeScript", "Figma", "Boa Comunicação"]',
 '["Bolsa auxílio com reajuste semestral", "Vale Alimentação R$ 850/mês", "Trilha de capacitação técnica acelerada"]',
 'https://hotmart.com/pt-br/carreiras', 'estagio-tech@hotmart.com', TRUE, TRUE, '2026-10-20 10:10:00'),

('job-8', 'Arquiteto de Soluções Cloud & Sistemas Sênior', 'CI&T', NULL, 'Campinas, SP (Remoto Brasil)', 'REMOTO', 'SENIOR', 14500.00, 19800.00, 'Arquitetura',
 'Liderança técnica na concepção de arquiteturas corporativas de missão crítica, governança de microsserviços e estratégias cloud.',
 '["Arquitetura de Software", "AWS", "Microsserviços", "Docker", "Kubernetes", "Java"]',
 '["Kafka", "Design Patterns", "Cloud Security", "Terraform", "Node.js"]',
 '["Remoto permanente", "Remuneração variável anual", "Plano de Saúde Unimed Quarto Individual", "Acesso livre plataformas de cursos"]',
 'https://ciandt.com/br/pt-br/carreiras', 'careers-latam@ciandt.com', TRUE, TRUE, '2026-10-21 09:00:00')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 19. Candidaturas Iniciais
INSERT INTO job_applications (id, user_id, job_id, status, applied_at, notes, next_step) VALUES
('app-1', 1, 'job-1', 'EM_PROCESSO', '2026-10-22 14:00:00', 'Entrevista técnica agendada com o time de engenharia.', 'Apresentação de case de microsserviços'),
('app-2', 1, 'job-2', 'CANDIDATADO', '2026-10-23 09:30:00', 'Currículo enviado pelo portal de vagas.', 'Aguardando retorno da triagem de RH'),
('app-3', 1, 'job-8', 'INTERESSADO', NULL, 'Vaga alinhada com meu objetivo de carreira.', 'Revisar portfólio antes de aplicar')
ON DUPLICATE KEY UPDATE status=VALUES(status);
