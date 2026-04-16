# 🎾 Ranking Kids — Beach Tennis Academy

Sistema de ranking para academias de Beach Tennis. Exibe classificação pública de alunos por categoria, com painel administrativo completo para professores e administradores.

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Credenciais Padrão](#credenciais-padrão)
- [Rotas da API](#rotas-da-api)
- [Funcionalidades por Perfil](#funcionalidades-por-perfil)
- [Banco de Dados](#banco-de-dados)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral

O Ranking Kids é uma aplicação fullstack em monorepo com:

- **Visualização pública** do ranking filtrado por categoria (Adulto / Kids / Todos), com pódio animado, estatísticas e tabela de classificação
- **Painel administrativo** acessado via login com email e senha, com abas para edição de ranking, gestão de temporadas, dashboard e gestão de usuários
- **Banco de dados local** (SQLite) — sem dependência de serviços externos

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js · Fastify · TypeScript |
| ORM / Banco | Prisma · SQLite |
| Autenticação | JWT (`@fastify/jwt`) · bcryptjs |
| Frontend | React 18 · Vite · TypeScript |
| Estilo | Tailwind CSS · CSS custom properties |
| Gráficos | Recharts |
| Monorepo | npm workspaces |

---

## Estrutura do Projeto

```
rankingkids/
├── package.json               # Raiz — workspaces + scripts globais
│
├── packages/
│   └── types/                 # Tipos TypeScript compartilhados
│       └── src/index.ts       # Aluno, Temporada, Usuario, payloads...
│
└── apps/
    ├── api/                   # Backend Fastify
    │   ├── .env               # DATABASE_URL, JWT_SECRET, PORT
    │   ├── prisma/
    │   │   ├── schema.prisma  # Models do banco
    │   │   ├── seed.ts        # Dados iniciais
    │   │   └── dev.db         # Arquivo SQLite (gerado automaticamente)
    │   └── src/
    │       ├── server.ts      # Entry point
    │       ├── plugins/
    │       │   ├── prisma.ts  # Decorator server.prisma
    │       │   └── auth.ts    # Decorators autenticar / autenticarAdmin
    │       └── routes/
    │           ├── auth.ts
    │           ├── alunos.ts
    │           ├── temporadas.ts
    │           ├── usuarios.ts
    │           └── export.ts
    │
    └── web/                   # Frontend React
        ├── vite.config.ts     # Proxy /api → localhost:3001
        ├── tailwind.config.js
        └── src/
            ├── App.tsx        # Raiz — estado e orquestração
            ├── index.css      # Estilos globais (tokens + componentes)
            ├── lib/
            │   ├── api.ts     # Chamadas à API (fetch wrapper tipado)
            │   └── utils.ts   # calcularRanking, corAvatar, iniciais...
            ├── hooks/
            │   ├── useAuth.ts
            │   ├── useRanking.ts
            │   ├── useTemporadas.ts
            │   └── useToast.ts
            └── components/
                ├── Header.tsx
                ├── FilterTabs.tsx
                ├── StatsRow.tsx
                ├── Podium.tsx
                ├── RankingTable.tsx
                ├── Toast.tsx
                └── admin/
                    ├── LoginModal.tsx
                    ├── AdminPanel.tsx
                    ├── StudentEditor.tsx
                    ├── SeasonManager.tsx
                    ├── UserManager.tsx
                    └── Dashboard.tsx
```

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm 9+

### Setup completo (primeira vez)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd rankingkids

# 2. Instala dependências, cria o banco e popula com dados iniciais
npm run setup
```

O comando `setup` executa em sequência:
1. `npm install` — instala todas as dependências do monorepo
2. `npm run db:migrate` — cria o arquivo `dev.db` e aplica as migrations
3. `npm run db:seed` — cria os usuários padrão e popula alunos de exemplo

### Rodar em desenvolvimento

```bash
npm run dev
```

Isso sobe os dois serviços simultaneamente:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |

---

## Credenciais Padrão

Criadas automaticamente pelo seed.

### Administrador

| Campo | Valor |
|---|---|
| Email | `admin@rankingkids.com` |
| Senha | `admin123` |
| Role | `ADMIN` |
| Acesso | Tudo — incluindo criar temporadas, gerenciar usuários |

### Professor

| Campo | Valor |
|---|---|
| Email | `professor@rankingkids.com` |
| Senha | `beach2025` |
| Role | `PROFESSOR` |
| Acesso | Editar pontos, adicionar/remover alunos, editar semana |

> Para acessar o painel, clique em **🔒 Área do Professor** na página principal e informe as credenciais acima.

---

## Rotas da API

A API roda em `http://localhost:3001`. Rotas marcadas com 🔒 exigem header `Authorization: Bearer <token>` (obtido no login). Rotas marcadas com 👑 exigem role `ADMIN`.

### Health

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica se a API está no ar |

### Autenticação — `/api/auth`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login com email e senha. Retorna `{ token, usuario }` |
| GET | `/api/auth/me` | 🔒 | Dados do usuário autenticado |
| PATCH | `/api/auth/me/senha` | 🔒 | Altera a senha do usuário logado |

**Exemplo de login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@rankingkids.com","senha":"beach2025"}'
```

**Resposta:**
```json
{
  "token": "eyJhbGci...",
  "usuario": {
    "id": 2,
    "nome": "Professor",
    "email": "professor@rankingkids.com",
    "role": "PROFESSOR",
    "ativo": true
  }
}
```

### Alunos — `/api/alunos`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/alunos` | — | Lista alunos. Query: `?categoria=Kids&temporadaId=1` |
| POST | `/api/alunos` | 🔒 | Cria aluno. Body: `{ nome, categoria, pontos?, temporadaId? }` |
| PATCH | `/api/alunos/:id` | 🔒 | Atualiza aluno. Body: `{ pontos?, nome?, categoria? }` |
| POST | `/api/alunos/salvar-lote` | 🔒 | Salva vários pontos de uma vez. Body: `{ atualizacoes: [{ id, pontos }] }` |
| DELETE | `/api/alunos/:id` | 🔒 | Remove aluno |
| GET | `/api/alunos/:id/historico` | 🔒 | Histórico de alterações de pontos do aluno |

**Exemplos:**
```bash
# Listar todos os alunos da temporada ativa
curl http://localhost:3001/api/alunos

# Listar apenas Kids
curl "http://localhost:3001/api/alunos?categoria=Kids"

# Adicionar aluno (com token)
curl -X POST http://localhost:3001/api/alunos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","categoria":"Kids","pontos":500}'

# Salvar lote de pontos
curl -X POST http://localhost:3001/api/alunos/salvar-lote \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"atualizacoes":[{"id":1,"pontos":1000},{"id":2,"pontos":850}]}'
```

### Temporadas — `/api/temporadas`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/temporadas` | — | Lista todas as temporadas |
| GET | `/api/temporadas/ativa` | — | Retorna a temporada com `ativa: true` |
| POST | `/api/temporadas` | 👑 | Cria temporada. Body: `{ nome, numero, semanaAtual? }` |
| PATCH | `/api/temporadas/:id` | 🔒 | Atualiza nome ou semanaAtual |
| PATCH | `/api/temporadas/:id/ativar` | 👑 | Ativa esta temporada (desativa todas as demais) |

### Usuários — `/api/usuarios`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/usuarios` | 👑 | Lista todos os usuários |
| POST | `/api/usuarios` | 👑 | Cria usuário. Body: `{ nome, email, senha, role? }` |
| PATCH | `/api/usuarios/:id` | 👑 | Atualiza dados ou redefine senha |
| DELETE | `/api/usuarios/:id` | 👑 | Desativa usuário (soft delete) |

### Export — `/api/export`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/export/ranking` | — | Download CSV. Query: `?temporadaId=1&categoria=Kids` |

**Exemplo:**
```bash
# Baixar CSV de todos os alunos da temporada ativa
curl "http://localhost:3001/api/export/ranking" -o ranking.csv

# Apenas Kids de uma temporada específica
curl "http://localhost:3001/api/export/ranking?temporadaId=1&categoria=Kids" -o ranking-kids.csv
```

---

## Funcionalidades por Perfil

### Público (sem login)

- Visualizar ranking com filtro por categoria
- Pódio animado para top 3 (visível ao filtrar por Adulto ou Kids)
- Cards de estatísticas (participantes, maior pontuação, categorias)
- Barra de aproveitamento proporcional por aluno

### Professor 🔒

Acesso via **🔒 Área do Professor** → login com email e senha.

- **Aba Ranking**: editar pontos de qualquer aluno, adicionar novos alunos, remover alunos, salvar em lote
- **Aba Temporadas**: editar a semana atual da temporada ativa
- **Aba Dashboard**: gráfico de barras com top 10, histórico de alterações por aluno
- **Exportar CSV**: botão no topo do painel
- **Alterar senha**: botão 🔑 no topo do painel

### Administrador 👑

Todas as permissões do Professor, mais:

- **Aba Temporadas**: criar novas temporadas, ativar temporadas anteriores
- **Aba Usuários**: criar contas de Professor ou Admin, desativar usuários

---

## Banco de Dados

O banco é um arquivo SQLite em `apps/api/prisma/dev.db`, criado automaticamente na primeira migration.

### Modelos

```
Usuario
  id, nome, email, senhaHash, role (ADMIN|PROFESSOR), ativo, criadoEm

Temporada
  id, nome, numero, semanaAtual, ativa, criadoEm

Aluno
  id, nome, categoria (Adulto|Kids), pontos, temporadaId, criadoEm

HistoricoPontos
  id, alunoId, pontosAnt, pontosNov, usuarioNome, criadoEm
```

> Toda alteração de pontos — seja via edição individual (`PATCH /alunos/:id`) ou em lote (`POST /alunos/salvar-lote`) — é registrada automaticamente em `HistoricoPontos` com o nome do usuário que fez a mudança.

### Visualizar o banco com interface gráfica

```bash
npm run db:studio
# Abre o Prisma Studio em http://localhost:5555
```

### Recriar o banco do zero

```bash
# Apaga o banco e recria do zero
rm apps/api/prisma/dev.db
npm run db:migrate
npm run db:seed
```

---

## Scripts Disponíveis

Na raiz do monorepo:

| Script | Descrição |
|---|---|
| `npm run setup` | Setup completo: install + migrate + seed |
| `npm run dev` | Sobe API (3001) e Web (3000) simultaneamente |
| `npm run dev:api` | Sobe apenas a API |
| `npm run dev:web` | Sobe apenas o frontend |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio (UI visual do banco) |
| `npm run build` | Compila API e Web para produção |

---

## Variáveis de Ambiente

Arquivo `apps/api/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="rankingkids-jwt-secret-2025-change-in-production"
PORT=3001
```

> Em produção, troque o `JWT_SECRET` por uma string longa e aleatória.
