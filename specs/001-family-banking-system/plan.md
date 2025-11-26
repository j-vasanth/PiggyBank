# Implementation Plan: Family Banking System

**Branch**: `001-family-banking-system` | **Date**: 2025-11-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-family-banking-system/spec.md`

**Note**: This plan has been regenerated to reflect updated requirements: SQLite database (replacing PostgreSQL) and pessimistic locking (replacing optimistic locking) for simplified architecture and cost-effective deployment.

## Summary

PiggyBank is a family banking system that allows parents to manage virtual allowance accounts for their children. The system enables parents to create a family account, add children with avatars and balances, perform deposits and deductions, while children can view their balance history and request transactions. The application prioritizes simplicity and engaging user experience with minimal steps for common operations.

**Key Architecture Change**: Using SQLite with pessimistic locking instead of PostgreSQL with optimistic locking for simpler concurrency handling and cost-effective single-tenant deployment on Fly.io persistent volumes.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript with React 18+ (frontend)
**Primary Dependencies**: FastAPI (backend API), SQLAlchemy ORM, React 18, Ionic Framework, Capacitor (mobile capabilities)
**Storage**: SQLite with Write-Ahead Logging (WAL) mode on Fly.io persistent volumes
**Testing**: pytest (backend), Vitest + React Testing Library (frontend)
**Target Platform**: Docker containers on Fly.io with persistent volumes; iOS/Android via Capacitor
**Project Type**: Web + Mobile (API backend with React SPA frontend compiled to mobile)
**Performance Goals**: API endpoints <200ms p95 for CRUD operations, frontend initial load <3 seconds on 3G
**Constraints**: Family-scale (1-10 users per instance), transaction history up to 1000 records without degradation, 5 child accounts + 3 parent admins per family
**Scale/Scope**: MVP targeting single-family self-hosted deployments, ~15-20 screens (parent vs child views), core banking operations (deposits, deductions, requests, history)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity First

**Assessment**: ✅ PASS

- **SQLite over PostgreSQL**: Simpler deployment (single file database, no managed database service)
- **Pessimistic locking over optimistic**: Simpler concurrency model (no version columns, no retry logic, database handles serialization)
- API-first architecture with clear separation of concerns (backend API, frontend SPA)
- User stories prioritized P1-P5 to deliver incremental value
- No premature abstraction: straightforward CRUD operations for transactions

**Rationale for Database Choice**:
- SQLite eliminates managed database costs (Fly Postgres is expensive for single-tenant app)
- Pessimistic locking is simpler than optimistic locking (no application-level version tracking)
- SQLite WAL mode provides concurrent reads + serialized writes (sufficient for family-scale concurrency)
- Single file database on persistent volume is easier to backup and restore

**Potential Risks**:
- Ionic Framework + Capacitor adds mobile compilation layer (justified by cross-platform requirement)
- Multiple user roles (parent admin vs child) requires authorization logic (domain requirement)

### II. API-First Design

**Assessment**: ✅ PASS with ACTION REQUIRED

- Feature spec defines clear entities (Family, Parent, Child, Transaction, Request, Invitation)
- RESTful API pattern mandated in constitution (`/api/v1/*` endpoints)
- Functional requirements specify data contracts (amounts, reasons, timestamps)
- Pessimistic locking simplifies API contracts (no version field in requests, no 409 Conflict responses)

**ACTION REQUIRED**: Phase 1 must generate OpenAPI contracts in `contracts/` directory before implementation

### III. Incremental Value Delivery

**Assessment**: ✅ PASS

- User stories prioritized by independent value delivery:
  - P1: Parent creates family and adds first child (core value)
  - P2: Parent manages transactions (daily operations)
  - P3: Child requests transactions (enhanced engagement)
  - P4: Multi-parent administration (family dynamics)
  - P5: Progress visualization (engagement feature)
- Each story is independently testable per acceptance scenarios
- Feature can be deployed incrementally (P1 delivers value without P2-P5)

**Overall**: Constitution compliance APPROVED for Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/001-family-banking-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/           # SQLAlchemy models
│   ├── services/         # Business logic with pessimistic locking
│   ├── api/
│   │   └── v1/          # RESTful endpoints (/api/v1/*)
│   ├── auth/            # Authentication providers
│   └── config/          # Settings, env vars
├── tests/
│   ├── contract/        # API contract tests (validate OpenAPI compliance)
│   ├── integration/     # Database + service integration tests
│   └── unit/            # Pure business logic tests
├── alembic/             # Database migrations
├── database/            # SQLite database file location
│   └── piggybank.db     # SQLite database (WAL mode)
└── requirements.txt     # Python dependencies

frontend/
├── src/
│   ├── components/      # Reusable UI components (Avatar, TransactionList, BalanceCard)
│   ├── pages/
│   │   ├── parent/     # Parent admin views (Dashboard, ManageChildren, TransactionForm)
│   │   └── child/      # Child views (MyBalance, RequestForm, History)
│   ├── services/        # API client services (typed TypeScript interfaces)
│   ├── hooks/           # React hooks for state management
│   ├── theme/           # Ionic theming (child-friendly vs minimal parent UI)
│   └── types/           # TypeScript type definitions matching backend contracts
├── tests/
│   ├── unit/            # Component tests (React Testing Library)
│   └── integration/     # User flow tests (Vitest)
├── capacitor.config.ts  # Mobile build configuration
└── package.json         # Node dependencies

docker/
├── backend.Dockerfile
├── frontend.Dockerfile
└── fly.toml             # Fly.io deployment config with persistent volume

.github/
└── workflows/           # CI/CD for testing and deployment
```

**Structure Decision**: Web + Mobile architecture. Backend exposes stateless JSON API at `/api/v1/*`, frontend is React SPA consuming the API through typed service layer. Capacitor compiles the same React codebase to iOS/Android native apps. SQLite database stored on Fly.io persistent volume for cost-effective single-tenant deployment.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. Constitution check passed. SQLite + pessimistic locking reduces complexity compared to PostgreSQL + optimistic locking.
