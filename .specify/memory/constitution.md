<!--
Sync Impact Report:
─────────────────────────────────────────────────────────────────────────────
Version Change: 1.0.0 → 2.0.0

Amendment Type: MAJOR (Breaking governance change - principle removal)

Removed Principles:
- IV. Privacy & Security - Data protection for family financial information
  (All authentication, encryption, and access control rules removed)

Remaining Principles:
1. Simplicity First - YAGNI, minimal viable features, no premature optimization
2. API-First Design - Contract-driven development with clear boundaries
3. Incremental Value Delivery - Small testable changes, independent feature delivery

Rationale for MAJOR bump:
Removing a core principle that mandated security requirements is a breaking change
to governance. Previous features designed under v1.0.0 included mandatory security
gates (authentication, encryption, audit logging). These requirements are no longer
constitutional obligations under v2.0.0.

Templates Status:
- ✅ .specify/templates/plan-template.md (reviewed - no security-specific gates)
- ✅ .specify/templates/spec-template.md (reviewed - no security-specific requirements)
- ✅ .specify/templates/tasks-template.md (reviewed - no security-specific task types)
- ✅ .claude/commands/*.md (reviewed - no security-specific workflow steps)

Follow-up Actions:
- Security is now optional rather than mandatory; teams may choose to implement
  security features based on feature requirements rather than constitutional mandate
- Existing features with security implementations remain valid but are no longer
  constitutionally required to maintain those implementations
─────────────────────────────────────────────────────────────────────────────
-->

# PiggyBank Constitution

## Core Principles

### I. Simplicity First

Every feature MUST start with the simplest solution that delivers value. Complex
architectures, abstractions, or patterns MUST be justified against simpler
alternatives. YAGNI (You Aren't Gonna Need It) is the default position.

**Rules**:
- Start with direct implementations; no premature abstraction
- Single responsibility: each component has one clear purpose
- Prefer composition over inheritance; avoid deep hierarchies
- Remove unused code immediately; no commented-out code
- Question every dependency: can we do without it?

**Rationale**: In a family banking app, clarity and maintainability trump clever
engineering. Parents and developers alike benefit from straightforward logic.
Complexity is technical debt that compounds with each feature.

### II. API-First Design

All features MUST be designed as APIs before implementation. Contracts define
boundaries between frontend and backend, between services, and between components.
Every API MUST have a documented contract before coding begins.

**Rules**:
- Define request/response schemas in contracts/ before implementation
- Backend endpoints expose JSON APIs following RESTful conventions
- Frontend consumes APIs through typed service layers (TypeScript interfaces)
- Breaking changes require version increments (v1, v2) or deprecation periods
- Contract tests verify API compliance before integration tests

**Rationale**: Parents and children access the same data through different
interfaces. Clear contracts prevent coupling and enable parallel development of
frontend and backend. Contract-first prevents implementation details from leaking
across boundaries.

### III. Incremental Value Delivery

Features MUST be broken into independently deployable, testable increments. Each
increment MUST deliver user value without waiting for the complete feature set.
Every commit should leave the system in a working state.

**Rules**:
- User stories are prioritized (P1, P2, P3) by value
- Implement P1 stories completely before moving to P2
- Each story is independently testable and demonstrable
- Commit boundaries align with working functionality (feature flags for incomplete work)
- Deploy to staging after each story completion; production when ready

**Rationale**: A child adding their first dollar to the piggy bank is value, even
if withdrawals aren't implemented yet. Small increments reduce risk, gather feedback
faster, and maintain team momentum. Parents can start using core features while
advanced features are still in development.

## Technical Constraints

**Technology Stack**:
- Backend: Python 3.11+ with FastAPI framework
- Frontend: React 18+ with TypeScript, Ionic Framework, Capacitor
- Build: Vite for fast development and optimized production builds
- Deployment: Docker containers on Fly.io with Nginx reverse proxy
- Database: SQLite with persistent volumes (cost-effective single-tenant deployment)
- Testing: pytest (backend), Vitest + React Testing Library (frontend)

**Architecture Requirements**:
- Backend exposes RESTful JSON APIs at `/api/v1/*` endpoints
- Frontend as Single Page Application (SPA) with client-side routing
- Mobile capabilities via Capacitor (iOS/Android) from same React codebase
- Stateless backend API design (authentication via tokens, no server sessions)
- Database migrations managed via Alembic (backend) or similar migration tool

**Performance & Scale**:
- Target: Family use (1-10 users per deployment instance)
- Response time: API endpoints < 200ms p95 for CRUD operations
- Frontend: Initial load < 3 seconds on 3G connection
- Offline capability: Not required for MVP; consider for v2

## Development Workflow

**Specification-Driven Development**:
1. Feature specification (`/speckit.specify`) defines user stories and requirements
2. Implementation plan (`/speckit.plan`) defines technical approach and architecture
3. Task breakdown (`/speckit.tasks`) creates dependency-ordered implementation tasks
4. Implementation (`/speckit.implement`) executes tasks with validation gates
5. Each phase MUST validate against this constitution before proceeding

**Quality Gates**:
- Constitution check MUST pass before Phase 0 research begins
- API contracts MUST be defined before implementation starts
- Tests MUST be written and fail before implementation (if TDD requested)
- Code reviews verify simplicity principles before merge
- Each user story MUST be independently testable before marked complete

**Branching & Commits**:
- Feature branches named `###-feature-name` (### = story number)
- Commits are atomic: one logical change per commit
- Commit messages follow conventional commits (feat:, fix:, docs:, refactor:)
- No direct commits to main; all changes via pull requests
- Pull requests link to feature specification in `/specs/`

## Governance

**Constitutional Authority**:
This constitution supersedes all other development practices. When specification
templates, command workflows, or team habits conflict with these principles, the
constitution takes precedence.

**Amendment Procedure**:
1. Propose amendment with rationale in GitHub issue or team discussion
2. Document impact on existing features and templates
3. Update constitution with version increment (see versioning rules below)
4. Update all affected templates (plan, spec, tasks) to align
5. Notify team and update project documentation

**Versioning Rules** (Semantic Versioning):
- **MAJOR** (X.0.0): Remove or redefine core principles; breaking governance changes
- **MINOR** (X.Y.0): Add new principle; expand existing principle with new rules
- **PATCH** (X.Y.Z): Clarify wording; fix typos; non-semantic refinements

**Compliance Reviews**:
- Every pull request MUST verify compliance with applicable principles
- Complexity violations MUST be justified in plan.md "Complexity Tracking" section
- Quarterly review of constitution effectiveness; propose amendments as needed

**Runtime Guidance**:
For day-to-day development guidance, refer to specification templates in
`.specify/templates/` and command workflows in `.claude/commands/`. These templates
operationalize constitutional principles into concrete workflows.

**Version**: 2.0.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2025-11-24
