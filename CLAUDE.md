# PiggyBank Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-24

## Active Technologies
- Python 3.11+ (backend), TypeScript with React 18+ (frontend) + FastAPI (backend API), SQLAlchemy ORM, React 18, Ionic Framework, Capacitor (mobile capabilities) (001-family-banking-system)
- SQLite with Write-Ahead Logging (WAL) mode on Fly.io persistent volumes (001-family-banking-system)
- TypeScript with React 18+ + React, Ionic Framework (existing) (002-avatar-system)
- N/A (frontend assets only; database field already exists) (002-avatar-system)

- Python 3.11+ (backend), TypeScript with React 18+ (frontend) + FastAPI (backend API), React 18, Ionic Framework, Capacitor (mobile capabilities) (001-family-banking-system)

## Project Structure

```text
src/
tests/
```

## Commands

cd src [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] pytest [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] ruff check .

## Code Style

Python 3.11+ (backend), TypeScript with React 18+ (frontend): Follow standard conventions

## Recent Changes
- 002-avatar-system: Added TypeScript with React 18+ + React, Ionic Framework (existing)
- 001-family-banking-system: Added Python 3.11+ (backend), TypeScript with React 18+ (frontend) + FastAPI (backend API), SQLAlchemy ORM, React 18, Ionic Framework, Capacitor (mobile capabilities)

- 001-family-banking-system: Added Python 3.11+ (backend), TypeScript with React 18+ (frontend) + FastAPI (backend API), React 18, Ionic Framework, Capacitor (mobile capabilities)

<!-- MANUAL ADDITIONS START -->

## Environment Configuration

### Backend (`piggybank-api` on Fly.io)

| Secret | Description |
|--------|-------------|
| `JWT_SECRET_KEY` | JWT signing secret |
| `CORS_ORIGINS_STR` | Comma-separated list of allowed frontend origins |
| `DATABASE_URL` | Set in `fly.toml`: `sqlite:////data/piggybank.db` |

### Frontend (`piggybank-app` on Fly.io)

| Build arg | Description |
|-----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL, set in `frontend/fly.toml` under `[build.args]` — baked in at build time |

### Deployed URLs

| App | Fly.io URL | Custom domain |
|-----|-----------|---------------|
| Frontend | `piggybank-app.fly.dev` | `wallet.jashub.net` |
| Backend | `piggybank-api.fly.dev` | `wallet-api.jashub.net` |

<!-- MANUAL ADDITIONS END -->
