# Fidelidade App

Sistema completo de gerenciamento de transacoes e programa de fidelidade por pontos. Permite importacao de transacoes via CSV, controle de saldo por CPF, extrato detalhado e relatorio administrativo com filtros avancados.

---


## Como rodar o projeto

### Pre-requisitos

- [Docker](https://www.docker.com/) instalado (inclui Docker Compose)
- Portas **3306**, **3000** e **5173** livres na maquina

### Passo a passo

#### 1. Clonar o repositorio

```bash
git clone <url-do-repositorio>
cd js-test
```

#### 2. Subir os containers

```bash
docker compose up --build
```

Esse comando:
1. Cria o container **MySQL 8.0** com o database `app_db`
2. Aguarda o MySQL ficar saudavel (healthcheck)
3. Builda e inicia o **backend** na porta `3000`
4. Builda e inicia o **frontend** na porta `5173`
5. As tabelas sao criadas automaticamente pelo Sequelize (sync)

#### 3. Acessar a aplicacao

| Servico | URL |
|---|---|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| API | [http://localhost:3000/api](http://localhost:3000/api) |

#### 4. Criar um usuario

Acesse [http://localhost:5173/register](http://localhost:5173/register) e cadastre com nome, email, CPF e senha (minimo 6 caracteres).

#### 5. Importar transacoes

Apos o login, va em **Importar CSV** e envie um arquivo `.csv` com o formato:

```csv
cpf,transaction_description,transaction_date,points_value,monetary_value,status
123.456.789-00,Compra no marketplace,2025-01-15,100,50.00,approved
123.456.789-00,Devolucao,2025-01-20,50,25.00,rejected
987.654.321-00,Assinatura mensal,2025-02-01,200,99.90,pending
```

Os status aceitos sao: `approved`/`aprovado`, `rejected`/`rejeitado`, `pending`/`pendente`.

---

## Arquitetura

### Monorepo (npm Workspaces)

O projeto utiliza **npm Workspaces** para gerenciar backend e frontend em um unico repositorio, compartilhando dependencias e scripts de forma centralizada.

```
js-test/
├── packages/
│   ├── backend/          # API REST — Node.js, Express, Sequelize, MySQL
│   └── frontend/         # SPA — React, Vite, Tailwind CSS
├── docker-compose.yml    # Orquestracao dos 3 containers
└── package.json          # Workspace root
```

---

## Stack Tecnologica

### Backend

| Tecnologia | Finalidade |
|---|---|
| **Node.js + TypeScript** | Runtime e linguagem com tipagem estatica |
| **Express 5** | Framework HTTP para a API REST |
| **Sequelize 6** | ORM para modelagem e queries no MySQL |
| **MySQL 8.0** | Banco de dados relacional |
| **tsyringe** | Container de injecao de dependencia (DI) |
| **class-validator + class-transformer** | Validacao e transformacao automatica de DTOs |
| **bcryptjs** | Hash seguro de senhas |
| **jsonwebtoken (JWT)** | Autenticacao stateless via token |
| **multer** | Middleware de upload de arquivos |
| **csv-parser** | Parsing de arquivos CSV em streaming |
| **Jest + ts-jest** | Framework de testes unitarios |

### Frontend

| Tecnologia | Finalidade |
|---|---|
| **React 19** | Biblioteca de UI com hooks |
| **TypeScript** | Tipagem estatica em todo o frontend |
| **Vite** | Bundler ultrarapido com Hot Module Replacement (HMR) |
| **Tailwind CSS 3** | Estilizacao utility-first responsiva |
| **React Router 6** | Roteamento SPA com rotas protegidas |
| **Formik + Yup** | Gerenciamento e validacao de formularios |
| **react-hot-toast** | Notificacoes toast nao intrusivas |

### Infraestrutura

| Tecnologia | Finalidade |
|---|---|
| **Docker + Docker Compose** | Containerizacao e orquestracao dos servicos |
| **Volume mounts** | Hot reload no desenvolvimento (frontend via Vite HMR, backend via nodemon) |
| **MySQL healthcheck** | Backend so inicia apos o banco estar pronto |

---

## Padrao de Camadas (Backend)

```
Routes  →  Controllers  →  Services  →  Repositories  →  Models (Sequelize)
```

- **Routes** — definem endpoints e aplicam middlewares (auth, upload)
- **Controllers** — recebem a request, validam DTOs via `class-validator`, delegam para services
- **Services** — toda logica de negocio (upload CSV, calculo de saldo, paginacao)
- **Repositories** — acesso ao banco via Sequelize (queries, filtros, agregacoes)
- **Models** — definicao das tabelas (`User`, `Transaction`) com tipagem Sequelize
- **DTOs** — validacao declarativa com decorators (`@IsEmail`, `@IsDateString`, `@Min`)
- **Middlewares** — autenticacao JWT, tratamento global de erros, upload multer

---

## Testes Unitarios (Backend)

O backend possui **86 testes unitarios** com **Jest + ts-jest**, organizados por camada:

```
src/__tests__/
├── utils/
│   ├── cpf.test.ts              # normalizeCpf, formatCpf
│   ├── pagination.test.ts       # resolvePage (offsets, limites, arredondamento)
│   ├── queryTransform.test.ts   # parseQueryNumber (string, number, array, edge cases)
│   ├── response.test.ts         # sendSuccess (status codes, mensagens)
│   ├── validate.test.ts         # validateDto com RegisterDto e LoginDto
│   └── AppError.test.ts         # AppError (statusCode, instanceof, heranca)
├── middlewares/
│   ├── auth.middleware.test.ts   # sem token, token invalido, token valido, token expirado
│   └── error.middleware.test.ts  # AppError, erro generico 500, ValidationError 422
├── services/
│   ├── AuthService.test.ts       # register, login, hash de senha, conflito de email/CPF
│   └── TransactionService.test.ts # uploadCsv, getAdminReport, getUserStatement, getWalletBalance
└── controllers/
    ├── AuthController.test.ts       # register 201, login 200, tratamento de erros
    └── TransactionController.test.ts # upload, report, statement, wallet, getCpfs
```

Os testes utilizam **mocks dos repositorios**, isolando completamente a logica de negocio sem depender do banco de dados.

```bash
npm test               # roda todos os testes
npm run test:coverage  # roda com relatorio de cobertura
```

---

## Endpoints da API

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| `POST` | `/api/auth/register` | Nao | Registrar novo usuario (nome, email, CPF, senha) |
| `POST` | `/api/auth/login` | Nao | Login — retorna JWT |
| `POST` | `/api/transactions/upload` | Sim | Upload de CSV com transacoes |
| `GET` | `/api/transactions/report` | Sim | Relatorio admin com filtros e paginacao |
| `GET` | `/api/transactions/statement` | Sim | Extrato do usuario logado |
| `GET` | `/api/transactions/wallet` | Sim | Saldo de pontos aprovados |
| `GET` | `/api/transactions/cpfs` | Sim | Lista de CPFs distintos no sistema |

**Formato padrao de resposta:**

```json
{
  "status": "success",
  "message": "Descricao da operacao",
  "data": { }
}
```

---

## Paginas do Frontend

| Rota | Pagina | Descricao |
|---|---|---|
| `/login` | Login | Autenticacao com email e senha |
| `/register` | Cadastro | Registro com nome, email, CPF e senha |
| `/wallet` | Carteira | Saldo de pontos aprovados com filtro multi-CPF |
| `/statement` | Extrato | Transacoes do usuario logado com filtros e resumo |
| `/upload` | Importar CSV | Upload e processamento de arquivo CSV |
| `/report` | Relatorio | Relatorio administrativo com filtros avancados |

---

## Features

- **Interface em portugues brasileiro** — labels, mensagens de erro e validacoes em pt-BR
- **Layout responsivo** — adapta-se a mobile, tablet e desktop via Tailwind CSS
- **Autenticacao JWT** — login persistido em localStorage com rotas protegidas
- **Importacao CSV** — upload com feedback de transacoes criadas/ignoradas
- **Filtros avancados** — CPF (multi-select dropdown), periodo (date range pt-BR dd/mm/aaaa), status, descricao, valor monetario
- **Paginacao** — navegacao por paginas com reset automatico ao filtrar
- **Mascaras de input** — datas em formato dd/mm/aaaa, valores decimais com virgula (0,00)
- **Calendario nativo** — botao de calendario abre o date picker do navegador
- **Truncamento de texto** — descricoes longas (50+ caracteres) com tooltip no hover
- **Tratamento de erros amigavel** — mensagens em pt-BR, nunca expoe stack traces ou erros tecnicos
- **Resumo congruente** — cards de totais no extrato refletem os mesmos filtros da tabela
- **Animacoes** — transicoes suaves de entrada (slide-up, fade-in)
- **Componentes reutilizaveis** — Table, Pagination, Badge, Button, CpfDropdown, PtBrDateRangeField, Skeleton, Spinner

---

## Comandos uteis

### Rodar testes

```bash
# Dentro do container
docker compose exec backend npm test

# Localmente (requer Node.js)
cd packages/backend
npm test

# Com relatorio de cobertura
npm run test:coverage
```

### Logs

```bash
# Todos os containers
docker compose logs -f

# Apenas backend
docker compose logs -f backend
```

### Reiniciar um servico

```bash
docker compose restart backend
```

### Parar os containers

```bash
# Parar (mantendo dados do banco)
docker compose down

# Parar e remover volumes (limpa o banco completamente)
docker compose down -v
```

### Rodar sem Docker (desenvolvimento local)

```bash
# Instalar dependencias na raiz
npm install

# Criar .env em packages/backend/
cp .env.example packages/backend/.env

# Rodar backend e frontend simultaneamente
npm run dev
```

---

## Variaveis de ambiente

Configuradas automaticamente pelo `docker-compose.yml`. Para rodar localmente, crie um `.env` em `packages/backend/`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=app_db
DB_USER=root
DB_PASS=secret
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
```

---

## Scripts do Workspace

| Comando | Descricao |
|---|---|
| `npm run dev` | Inicia backend + frontend simultaneamente |
| `npm run dev:backend` | Inicia apenas o backend |
| `npm run dev:frontend` | Inicia apenas o frontend |
| `npm run build` | Compila ambos os pacotes para producao |
