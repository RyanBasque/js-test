# Monorepo

Full-stack monorepo with an Express/TypeScript backend and a React/Vite/TypeScript frontend, managed via npm workspaces.

## Structure

```
.
├── packages/
│   ├── backend/        # Express API (port 3000)
│   └── frontend/       # React + Vite (port 5173)
├── .env.example
├── package.json
└── README.md
```

## Setup

**1. Install dependencies** (run once from the root):

```bash
npm install
```

**2. Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values (see comments in the file).

## Running

| Command | Description |
|---|---|
| `npm run dev` | Start both backend and frontend concurrently |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build both packages for production |

Once running:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

## Packages

### `packages/backend`

Express server written in TypeScript. Uses `tsx` for zero-config dev-time execution with watch mode.

| Script | Description |
|---|---|
| `npm run dev` | Start with hot-reload via `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |

### `packages/frontend`

React 19 app scaffolded with Vite. In dev mode, `/api/*` requests are proxied to the backend.

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
