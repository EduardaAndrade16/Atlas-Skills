# Atlas Skills

Aplicacao para cadastro de perfis profissionais, competencias, cursos, certificacoes, projetos e acompanhamento de aprendizagem.

## Arquitetura

- Frontend: React, TypeScript, Vite e Tailwind CSS.
- Backend: Express/TypeScript em `server.ts`, servido na porta 3000.
- Persistencia do backend: colecoes criptografadas AES-256-GCM em `data/encrypted/`, com dados de perfil e historico isolados por conta.
- Modo simulado: persistencia local por usuario no navegador. A geracao Gemini nao possui fallback simulado.
- IA: integracao Gemini existente, executada somente no backend; a chave nao e enviada ao navegador.

## Configuracao e execucao

Requisitos: Node.js e npm.

1. Instale dependencias com `npm install`.
2. Crie `.env` a partir de `.env.example` e configure `GEMINI_API_KEY` no servidor. `GEMINI_MODEL` e opcional.
3. Inicie frontend e backend com `npm run dev` e acesse `http://localhost:3000`.

A chave Gemini deve permanecer apenas no ambiente do servidor. Sem chave, com falha de rede, limite de requisicoes ou resposta invalida, a API retorna erro explicito; nenhuma trilha predefinida e exibida como substituta.

## Trilhas personalizadas

Na area **Cursos e Trilhas**, gere uma trilha usando o perfil atualizado da conta. Sao enviados apenas os campos profissionais necessarios: objetivo/area, competencias, cursos e certificacoes cadastrados, formacao, projetos e experiencias. Nome, email, telefone, links pessoais e credenciais nao sao incluidos no contexto enviado ao Gemini.

Os recursos sugeridos sao selecionados somente do catalogo de materiais cadastrado na plataforma. A resposta da Gemini e validada no servidor e referencias a cursos que nao existam no catalogo sao rejeitadas. Quando nao ha material adequado, a atividade informa que nenhum recurso correspondente foi encontrado.

Cada versao gerada e armazenada no navegador por usuario; novas geracoes nao removem trilhas anteriores nem o mapa de progresso. Para manter esse historico, use o mesmo navegador/perfil local.

## Dados e migracao

Novos cadastros comecam sem dados profissionais ficticios. `database/seed.sql` nao cria usuarios, perfis, cursos ou trilhas de demonstracao. Colecoes preexistentes sao preservadas: o perfil demonstrativo original e seus dados associados, quando identificados pela assinatura exata do perfil, ficam ocultos na interface e nas recomendacoes sem serem apagados. Modulos antigos identificados pelos IDs estaticos de demonstracao tambem permanecem armazenados, mas nao sao exibidos.

Nao versione `.env`, `data/encrypted/` ou outros dados locais. O arquivo `.env.example` e apenas um modelo sem segredos.

## Validacao

- `npm run lint`: verificacao TypeScript.
- `npm run build`: build de producao.
