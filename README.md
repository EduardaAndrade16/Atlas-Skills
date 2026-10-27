# Atlas Skills - Plataforma de Desenvolvimento Profissional

Plataforma funcional de mapeamento de competências, desenvolvimento profissional e gestão de trajetória técnica, com arquitetura preparada para recomendação inteligente por IA, catálogo de cursos e vagas de emprego.

---

## 1. Visão Geral e Arquitetura

O **Atlas Skills** é composto por uma arquitetura desacoplada em camadas:

- **Front-end**: React 19, TypeScript, Vite, Tailwind CSS e Lucide React.
- **Back-end**: Java 17, Spring Boot 3.2.4, Spring Security 6 com JWT (JJWT 0.12.5), Spring Data JPA, Hibernate, Bean Validation e JUnit 5 / Mockito.
- **Banco de Dados de Desenvolvimento & Testes**: **H2 Database em memória**, eliminando a necessidade de instalação de banco de dados externo para rodar localmente ou executar testes automatizados.
- **Banco de Dados de Produção (Migração Futura)**: Configuração pronta em perfil `mysql` (`application-mysql.yml`) e script DDL completo em `database/init.sql`.

```text
atlas-skills/
├── backend/
│   ├── pom.xml                                     # H2 em escopo runtime e teste, JPA, Spring Security, JJWT
│   └── src/
│       ├── main/
│       │   ├── java/com/atlasskills/
│       │   │   ├── AtlasSkillsApplication.java     # Classe principal Spring Boot
│       │   │   ├── config/DataInitializer.java     # População automática do H2 com dados demo ao iniciar
│       │   │   ├── controller/                     # Endpoints REST (Auth, Profile, Skills, Courses, etc.)
│       │   │   ├── service/                        # Lógica de negócio, validação de propriedade e score
│       │   │   ├── repository/                     # Repositórios JPA com isolamento por usuário
│       │   │   ├── model/                          # Entidades JPA, DTOs com Bean Validation e Enums
│       │   │   ├── security/                       # Filtro JWT, H2 Console liberado e SecurityConfig
│       │   │   └── exception/                      # GlobalExceptionHandler RFC 7807
│       │   └── resources/
│       │       ├── application.yml                 # H2 in-memory + H2 Console habilitado (Padrão)
│       │       ├── application-test.yml            # Perfil H2 isolado para JUnit 5 / Mockito
│       │       └── application-mysql.yml           # Perfil opcional para migração futura para MySQL
│       └── test/                                   # Testes automatizados executados 100% em memória
├── database/
│   └── init.sql                                    # Script DDL/DML para MySQL (produção futura)
├── src/                                            # Front-end React + TypeScript
├── .env.example                                    # Modelo de variáveis de ambiente
└── README.md                                       # Guia completo
```

---

## 2. Pré-requisitos para Execução Local

- **Java JDK 17** ou superior instalado (`java -version`).
- **Apache Maven 3.8+** instalado (`mvn -version`).
- **Node.js 18+** e **npm** (`node -v`).
- *Nenhum banco de dados externo é exigido! O H2 Database roda em memória automaticamente.*

---

## 3. Banco de Dados H2 em Memória & Console Web

Por padrão, a aplicação inicia com o banco de dados **H2 em memória**:

- **URL JDBC**: `jdbc:h2:mem:atlas_skills_db`
- **Usuário**: `sa`
- **Senha**: *(em branco)*
- **DDL Automático**: O Hibernate cria e atualiza todas as tabelas na inicialização (`ddl-auto: update`).
- **Carga de Dados de Demonstração**: O `DataInitializer` só é executado com o perfil Spring `dev`; não cria uma conta com senha conhecida em outros ambientes.

### Acessando o H2 Console (Ambiente de Desenvolvimento)
1. Inicie o back-end Spring Boot com o perfil de desenvolvimento (`mvn spring-boot:run -Dspring-boot.run.profiles=dev`).
2. Abra seu navegador em: `http://localhost:8080/api/v1/h2-console`
3. No campo **JDBC URL**, insira: `jdbc:h2:mem:atlas_skills_db`
4. Deixe o campo **User Name** como `sa` e a senha vazia.
5. Clique em **Connect** para visualizar todas as tabelas (`USERS`, `USER_PROFILES`, `HARD_SKILLS`, `SOFT_SKILLS`, etc.) e executar queries SQL diretamente!

---

## 4. Executando o Back-end (Spring Boot)

1. Entre no diretório do backend:
   ```bash
   cd backend
   ```

2. Execute a suíte completa de testes automatizados:
   ```bash
   mvn clean test
   ```
   *Os testes utilizam o H2 em memória via `application-test.yml`, sem necessidade de qualquer serviço externo.*

3. Inicie o servidor Spring Boot com H2:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
   *A API estará pronta em `http://localhost:8080/api/v1` com dados demo carregados somente no perfil `dev`. O Spring Boot também carrega o `.env` da raiz automaticamente quando iniciado a partir de `backend/`. Não use o perfil `dev` em produção.*

5. Para habilitar o roadmap com Gemini, preencha `GEMINI_API_KEY` e, opcionalmente, `GEMINI_MODEL` no `.env` da raiz antes de iniciar o backend. O arquivo `.env.example` já contém o modelo dessas variáveis. A análise envia ao Google Gemini a área, o objetivo profissional, hard/soft skills, certificações e tecnologias dos projetos do usuário autenticado; não envia nome, e-mail, telefone ou links pessoais. A chave permanece somente no backend.

4. *(Opcional - Migração Futura para MySQL)*:
   Para migrar para MySQL sem alterar código ou entidades, basta iniciar com o perfil `mysql`:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## 5. Executando o Front-end (React + Vite)

1. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```

2. Crie seu arquivo `.env` a partir do modelo:
   ```bash
   cp .env.example .env
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *Acesse `http://localhost:3000` no seu navegador.*

---

## 6. Endpoints da API REST (Documentação)

Todos os endpoints privados requerem o cabeçalho `Authorization: Bearer <token_jwt>`.

| Método | Endpoint | Protegido | Descrição |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Não | Cadastro de novo usuário |
| `POST` | `/api/v1/auth/login` | Não | Autenticação e geração de token JWT |
| `GET` | `/api/v1/auth/me` | Sim | Dados do usuário autenticado |
| `POST` | `/api/v1/auth/change-password` | Sim | Alteração de senha |
| `GET` | `/api/v1/health` | Não | Status de saúde da aplicação |
| `GET` | `/api/v1/profile` | Sim | Consulta dados do perfil profissional |
| `PUT` | `/api/v1/profile` | Sim | Atualização dos dados do perfil |
| `GET` | `/api/v1/profile/summary` | Sim | Resumo consolidado do perfil e score de preenchimento |
| `POST` | `/api/v1/ai/gap-analysis` | Sim | Análise de lacunas e roadmap personalizado com Gemini |
| `GET` | `/api/v1/skills/hard` | Sim | Listagem de hard skills do usuário |
| `POST` | `/api/v1/skills/hard` | Sim | Inclusão de nova hard skill |
| `PUT` | `/api/v1/skills/hard/{id}` | Sim | Edição de hard skill |
| `DELETE`| `/api/v1/skills/hard/{id}` | Sim | Exclusão de hard skill |
| `GET` | `/api/v1/skills/soft` | Sim | Listagem de soft skills |
| `POST` | `/api/v1/skills/soft` | Sim | Inclusão de soft skill |
| `PUT` | `/api/v1/skills/soft/{id}` | Sim | Edição de soft skill |
| `DELETE`| `/api/v1/skills/soft/{id}` | Sim | Exclusão de soft skill |
| `GET` | `/api/v1/courses` | Sim | Listagem de cursos |
| `POST` | `/api/v1/courses` | Sim | Cadastro de novo curso |
| `PUT` | `/api/v1/courses/{id}` | Sim | Edição de curso |
| `DELETE`| `/api/v1/courses/{id}` | Sim | Exclusão de curso |
| `GET` | `/api/v1/certifications` | Sim | Listagem de certificações |
| `POST` | `/api/v1/certifications` | Sim | Cadastro de certificação |
| `PUT` | `/api/v1/certifications/{id}` | Sim | Edição de certificação |
| `DELETE`| `/api/v1/certifications/{id}` | Sim | Exclusão de certificação |
| `GET` | `/api/v1/projects` | Sim | Listagem de projetos práticos |
| `POST` | `/api/v1/projects` | Sim | Cadastro de novo projeto |
| `PUT` | `/api/v1/projects/{id}` | Sim | Edição de projeto |
| `DELETE`| `/api/v1/projects/{id}` | Sim | Exclusão de projeto |
| `GET` | `/api/v1/education` | Sim | Listagem de formações acadêmicas |
| `POST` | `/api/v1/education` | Sim | Cadastro de formação acadêmica |
| `PUT` | `/api/v1/education/{id}` | Sim | Edição de formação acadêmica |
| `DELETE`| `/api/v1/education/{id}` | Sim | Exclusão de formação acadêmica |
| `GET` | `/api/v1/experiences` | Sim | Listagem de experiências profissionais |
| `POST` | `/api/v1/experiences` | Sim | Cadastro de experiência profissional |
| `PUT` | `/api/v1/experiences/{id}` | Sim | Edição de experiência profissional |
| `DELETE`| `/api/v1/experiences/{id}` | Sim | Exclusão de experiência profissional |

---

## 7. Garantias de Segurança e Propriedade de Dados

1. **Autenticação Stateless**: Não há sessões em memória no servidor; cada requisição é validada de forma criptográfica através do token JWT no filtro `JwtAuthenticationFilter`.
2. **Criptografia de Senhas**: As senhas são processadas com o algoritmo `BCrypt` com sal gerado automaticamente antes da gravação no banco. Senhas em texto puro nunca são persistidas ou expostas em logs.
3. **Isolamento e Posse de Dados**: Todas as operações de consulta, alteração ou exclusão validam o identificador extraído do token JWT (`userPrincipal.getId()`). Não é possível alterar dados de terceiros alterando IDs na requisição HTTP.
4. **Validação de Entrada**: O uso de `jakarta.validation` (`@NotBlank`, `@Email`, `@Size`, `@NotNull`, `@Min`) com tratamento centralizado no `GlobalExceptionHandler` previne injeção de dados corrompidos.

---

## 8. Guia de Teste do Fluxo de Ponta a Ponta

1. **Acessar a Aplicação**: Abra `http://localhost:3000`.
2. **Cadastro ou Demonstração**:
   - Para testar com dados reais: clique na aba **"Criar Conta"**, informe Nome, E-mail, Senha e Confirmação.
   - Para teste rápido: utilize o botão **"Preencher com Perfil Demo"**.
3. **Gerenciamento do Perfil**:
   - Vá para a aba **"Perfil Profissional"**: edite sua Headline, Biografia, Área Principal, Áreas Secundárias e Objetivo Profissional. Clique em **"Salvar Alterações"**.
4. **Cadastrar Competências Técnicas (Hard Skills)**:
   - Acesse **"Hard Skills"**, clique em **"Nova Hard Skill"**, preencha tecnologia, categoria, anos de experiência e nível (Básico, Intermediário, Avançado ou Especialista).
5. **Cadastrar Soft Skills, Cursos, Certificações e Projetos**:
   - Adicione suas informações nas respectivas seções; note a atualização do indicador de preenchimento no **Painel Principal**.
6. **Alternância de Conectividade**:
   - Em **"Configurações"**, teste a conectividade com o Spring Boot pelo botão **"Testar Conexão com Spring Boot"** ou alterne entre o **Motor Integrado Atlas** e o modo **Spring Boot**.
7. **Exportar Dados**:
   - Em **"Configurações"**, utilize a opção **"Exportar Perfil em JSON"** para baixar seu backup completo.
8. **Dados temporários da sessão**:
   - Os dados do perfil ficam disponíveis enquanto a sessão estiver ativa. Ao clicar em **"Encerrar Sessão"**, os dados do perfil e o progresso são removidos; a conta e as credenciais permanecem cadastradas.
