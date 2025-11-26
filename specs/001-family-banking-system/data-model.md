# Data Model: Family Banking System

**Feature**: 001-family-banking-system
**Date**: 2025-11-24 (Updated)
**Database**: SQLite with SQLAlchemy ORM (WAL mode enabled)
**Concurrency**: Pessimistic locking with `BEGIN IMMEDIATE` transactions

## Overview

This document defines the database schema for PiggyBank's family banking system. All entities follow the research decisions in `research.md` and functional requirements in `spec.md`.

**Key Design Decision**: Uses SQLite with pessimistic locking instead of PostgreSQL with optimistic locking for simpler concurrency handling and cost-effective deployment (~75% cost savings).

## Entity Relationship Diagram

```
Family (1) ----< (N) ParentAdmin
Family (1) ----< (N) Child
Family (1) ----< (N) Invitation

Child (1) ----< (N) Transaction
Child (1) ----< (N) Request

ParentAdmin (1) ----< (N) Transaction (as performer)
ParentAdmin (1) ----< (N) Request (as approver)
ParentAdmin (1) ----< (N) Invitation (as creator)
ParentAdmin (1) ----< (N) Notification
Child (1) ----< (N) Notification

(All entities inherit from User base type for polymorphic auth)
```

## Core Entities

### Family

Represents a household unit containing parent admins and children.

**Table**: `families`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique family identifier |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Family creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Validation Rules**:
- None (minimal data by design)

**Indexes**:
- PRIMARY KEY on `id`

---

### ParentAdmin

User with full permissions to manage family, children, and transactions.

**Table**: `parent_admins`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique parent identifier |
| family_id | UUID | FOREIGN KEY (families.id), NOT NULL | Associated family |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username (no email required per FR-001) |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Validation Rules**:
- `username`: 3-50 characters, alphanumeric + underscore only, case-insensitive uniqueness
- `password`: Minimum 8 characters (validated before hashing, not stored)

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username` (case-insensitive: `LOWER(username)`)
- INDEX on `family_id` (foreign key lookup)

**Notes**:
- Future OAuth support: Add nullable `oauth_provider` and `oauth_token_encrypted` columns without schema migration
- First parent admin to create family becomes founder (tracked implicitly by creation timestamp)

---

### Child

Child account belonging to a family, with balance and PIN authentication.

**Table**: `children`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique child identifier |
| family_id | UUID | FOREIGN KEY (families.id), NOT NULL | Associated family |
| name | VARCHAR(100) | NOT NULL | Child's display name |
| avatar | VARCHAR(50) | NOT NULL | Avatar identifier (from predefined set) |
| pin_hash | VARCHAR(255) | NOT NULL | bcrypt hashed PIN (4-6 digits per FR-032) |
| balance | NUMERIC(10, 2) | NOT NULL, DEFAULT 0.00, CHECK (balance >= 0) | Current balance in USD |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Validation Rules**:
- `name`: 1-100 characters, Unicode support (international names)
- `avatar`: Must match predefined avatar set (validated at application layer)
- `pin`: 4-6 digits (validated before hashing, not stored)
- `balance`: Non-negative (enforced by CHECK constraint per FR-012)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `family_id` (foreign key lookup)
- INDEX on `(family_id, updated_at DESC)` (recent activity queries)

**Notes**:
- Pessimistic locking: Balance updates use `BEGIN IMMEDIATE` transactions (FR-036)
- No version column needed (database handles locking automatically)
- Maximum transaction amount $1,000 enforced at application layer (FR-027)

---

### Transaction

Immutable record of balance changes (deposits or deductions).

**Table**: `transactions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique transaction identifier |
| child_id | UUID | FOREIGN KEY (children.id), NOT NULL | Target child account |
| parent_admin_id | UUID | FOREIGN KEY (parent_admins.id), NOT NULL | Parent who performed transaction |
| type | VARCHAR(20) | NOT NULL, CHECK (type IN ('deposit', 'deduction')) | Transaction type |
| amount | NUMERIC(10, 2) | NOT NULL, CHECK (amount > 0 AND amount <= 1000) | Transaction amount (FR-027) |
| reason | TEXT | NOT NULL | Description/justification (FR-028) |
| balance_after | NUMERIC(10, 2) | NOT NULL | Child's balance after this transaction (denormalized for history) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Transaction timestamp (FR-010) |

**Validation Rules**:
- `amount`: $0.01 - $1,000.00 (FR-027)
- `reason`: 1-500 characters minimum (FR-028)
- `type`: Enum validation ('deposit' or 'deduction')

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `child_id` (transaction history queries)
- INDEX on `(child_id, created_at DESC)` (ordered history)
- INDEX on `parent_admin_id` (audit trail)

**Notes**:
- Immutable: no UPDATE or DELETE operations allowed (FR-013)
- `balance_after` denormalized for performance (avoids recalculating historical balances)

---

### Request

Child-initiated credit or expenditure request pending parent approval.

**Table**: `requests`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique request identifier |
| child_id | UUID | FOREIGN KEY (children.id), NOT NULL | Child who submitted request |
| type | VARCHAR(20) | NOT NULL, CHECK (type IN ('credit', 'expenditure')) | Request type (FR-014, FR-015) |
| amount | NUMERIC(10, 2) | NOT NULL, CHECK (amount > 0 AND amount <= 1000) | Requested amount |
| reasoning | TEXT | NOT NULL | Child's justification (FR-014, FR-015) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'approved', 'denied')) | Request status |
| approved_by_id | UUID | FOREIGN KEY (parent_admins.id), NULLABLE | Parent who processed request (NULL if pending) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Request submission timestamp |
| processed_at | TIMESTAMP | NULLABLE | Approval/denial timestamp (NULL if pending) |

**Validation Rules**:
- `amount`: $0.01 - $1,000.00 (FR-027)
- `reasoning`: 1-500 characters minimum
- `status`: Must transition pending -> (approved | denied), no reversals

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `child_id` (child's request history)
- INDEX on `(status, created_at)` (pending requests queue for parents)
- INDEX on `approved_by_id` (audit trail)

**State Transitions**:
```
pending -> approved (creates Transaction, updates Child.balance)
pending -> denied (no balance change)
```

**Notes**:
- Approved requests automatically create Transaction records (FR-018)
- Prevents duplicate processing via status check (FR-020)

---

### Invitation

Invitation link for adding co-admin parents to family.

**Table**: `invitations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique invitation identifier |
| family_id | UUID | FOREIGN KEY (families.id), NOT NULL | Target family |
| created_by_id | UUID | FOREIGN KEY (parent_admins.id), NOT NULL | Parent who created invitation |
| invitation_code | VARCHAR(32) | UNIQUE, NOT NULL | Unique code embedded in invitation link |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'accepted', 'revoked')) | Invitation status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Invitation creation timestamp |
| accepted_at | TIMESTAMP | NULLABLE | Acceptance timestamp (NULL if not accepted) |
| revoked_at | TIMESTAMP | NULLABLE | Revocation timestamp (NULL if not revoked) |

**Validation Rules**:
- `invitation_code`: 32-character random string (cryptographically secure)
- `status`: Must transition pending -> (accepted | revoked), no reversals

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `invitation_code`
- INDEX on `(family_id, status)` (active invitations lookup)
- INDEX on `created_by_id` (audit trail)

**State Transitions**:
```
pending -> accepted (creates ParentAdmin, expires invitation immediately per FR-003)
pending -> revoked (by creator per FR-035)
```

**Notes**:
- No time-based expiration (valid indefinitely until accepted or revoked per clarification)
- Only one invitation can be accepted per code (uniqueness constraint)

---

### Notification

In-app notification for request status updates.

**Table**: `notifications`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | NOT NULL | Recipient (ParentAdmin or Child UUID) |
| user_type | VARCHAR(20) | NOT NULL, CHECK (user_type IN ('parent_admin', 'child')) | Recipient type for polymorphic FK |
| type | VARCHAR(50) | NOT NULL | Notification type (see below) |
| content | JSONB | NOT NULL | Type-specific notification data |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status (FR-034) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Notification creation timestamp |

**Notification Types**:
- `request_created`: Child submitted request (sent to all parent admins)
- `request_approved`: Parent approved request (sent to child)
- `request_denied`: Parent denied request (sent to child)

**Content Schema** (JSON):
```json
{
  "request_id": "uuid",
  "child_name": "string",
  "amount": "decimal",
  "reasoning": "string"
}
```

**SQLite Note**: Uses TEXT column with JSON validation. SQLite's `JSON1` extension provides JSON functions for querying.

**Validation Rules**:
- `content`: Must be valid JSON matching type-specific schema

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `(user_id, user_type, is_read)` (unread notifications query per FR-034)
- INDEX on `(user_id, created_at DESC)` (notification history)

**Notes**:
- Polymorphic user reference (both parents and children receive notifications)
- Frontend polls `/api/v1/notifications/unread` every 30 seconds (per research.md decision)

---

## Pessimistic Locking Strategy

### Implementation (FR-036, FR-037)

**Purpose**: Prevent concurrent transaction conflicts when multiple parent admins modify the same child's balance simultaneously.

**Mechanism**:
1. Transaction starts with `BEGIN IMMEDIATE` (acquires write lock on database)
2. Backend reads child balance (lock held during entire transaction)
3. Backend validates balance (for deductions) and updates
4. Backend creates transaction record
5. Transaction commits (releases lock)
6. If second admin attempts concurrent transaction, they wait for first to complete

**Affected Entities**:
- `Child.balance` (locked during transaction)
- No version column needed (database handles locking)

**SQL Example (SQLite)**:
```sql
-- Start immediate transaction (locks database for writes)
BEGIN IMMEDIATE;

-- Read child balance (lock held)
SELECT id, balance FROM children WHERE id = 'child-uuid';

-- Update balance
UPDATE children
SET balance = balance + 50.00,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'child-uuid';

-- Insert transaction record
INSERT INTO transactions (id, child_id, parent_admin_id, type, amount, reason, balance_after, created_at)
VALUES ('tx-uuid', 'child-uuid', 'parent-uuid', 'deposit', 50.00, 'Weekly allowance', 175.00, CURRENT_TIMESTAMP);

-- Commit (releases lock)
COMMIT;
```

**SQLAlchemy Implementation**:
```python
from sqlalchemy import text

def create_transaction(db: Session, child_id: str, amount: Decimal, reason: str):
    # Start immediate transaction
    db.execute(text("BEGIN IMMEDIATE"))

    # Read child with lock held
    child = db.query(Child).filter(Child.id == child_id).first()

    # Validate balance for deductions
    if transaction_type == "deduction" and child.balance < amount:
        db.rollback()
        raise InsufficientBalanceError()

    # Update balance
    child.balance += amount
    child.updated_at = datetime.utcnow()

    # Create transaction record
    transaction = Transaction(
        id=generate_uuid(),
        child_id=child_id,
        parent_admin_id=current_admin_id,
        type=transaction_type,
        amount=amount,
        reason=reason,
        balance_after=child.balance,
        created_at=datetime.utcnow()
    )
    db.add(transaction)

    # Commit (releases lock)
    db.commit()
    return transaction
```

**Concurrency Behavior**:
- **Scenario**: Parent A and Parent B both try to add $50 deposit to Emma's account simultaneously
- **Result**: Parent A's transaction acquires lock first, completes successfully (Emma: $100 → $150)
- Parent B's transaction waits (~10-50ms), then acquires lock and completes (Emma: $150 → $200)
- **Total**: Emma's balance is $200 (both transactions applied correctly, no lost updates)

---

## Database Constraints Summary

### Foreign Key Constraints
- `parent_admins.family_id -> families.id` (CASCADE DELETE)
- `children.family_id -> families.id` (CASCADE DELETE)
- `transactions.child_id -> children.id` (RESTRICT DELETE)
- `transactions.parent_admin_id -> parent_admins.id` (RESTRICT DELETE)
- `requests.child_id -> children.id` (CASCADE DELETE)
- `requests.approved_by_id -> parent_admins.id` (SET NULL)
- `invitations.family_id -> families.id` (CASCADE DELETE)
- `invitations.created_by_id -> parent_admins.id` (RESTRICT DELETE)

### Check Constraints
- `children.balance >= 0` (FR-012: prevent negative balances)
- `transactions.amount > 0 AND amount <= 1000` (FR-027)
- `requests.amount > 0 AND amount <= 1000` (FR-027)
- `transactions.type IN ('deposit', 'deduction')`
- `requests.type IN ('credit', 'expenditure')`
- `requests.status IN ('pending', 'approved', 'denied')`
- `invitations.status IN ('pending', 'accepted', 'revoked')`

### Unique Constraints
- `parent_admins.username` (case-insensitive)
- `invitations.invitation_code`

---

## Migration Strategy

**Tool**: Alembic (Python database migration tool)

**Database Location**: `backend/database/piggybank.db` (SQLite file)

**SQLite Configuration** (before first migration):
```python
# backend/src/config/database.py
from sqlalchemy import create_engine, event

DATABASE_URL = "sqlite:///database/piggybank.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Enable WAL mode and foreign keys on every connection
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()
```

**Initial Migration**:
```bash
# Create database directory
mkdir -p backend/database

# Create initial schema
alembic revision --autogenerate -m "Initial schema: families, parents, children, transactions, requests, invitations, notifications"

# Apply migration
alembic upgrade head

# Verify database created
ls -lh backend/database/piggybank.db
```

**Seed Data** (Development/Testing):
- Predefined avatar set (stored as static assets, IDs in database)
- Test family with 1 parent admin, 2 children, sample transactions

**Backup Strategy**:
```bash
# Manual backup (SQLite .backup command)
sqlite3 backend/database/piggybank.db ".backup backup/piggybank_$(date +%Y%m%d).db"

# Or simple file copy
cp backend/database/piggybank.db backup/

# Fly.io persistent volume snapshots (automated daily backups)
fly volumes snapshots create <volume-id>
```

---

## Performance Considerations

### Expected Load (per Success Criteria)
- Families: 1 per deployment instance
- Parent admins: 1-3 per family
- Children: 1-5 per family (SC-005)
- Transactions: Up to 1000 per child (SC-006)

### Query Patterns
1. **Most Frequent**: Get child balance (SELECT children.balance WHERE id = ?)
2. **Second Most Frequent**: Get transaction history (SELECT * FROM transactions WHERE child_id = ? ORDER BY created_at DESC)
3. **Parent Dashboard**: Get all children for family (SELECT * FROM children WHERE family_id = ?)
4. **Pending Requests**: Get all pending requests for family (JOIN children to filter by family_id)

### Index Justification
All indexes support high-frequency query patterns identified above. No premature optimization (Principle I).

---

## Data Retention Policy

**MVP**: Indefinite retention (FR-013)

**Future Considerations** (out of scope):
- Archive transactions older than 5 years
- GDPR compliance: export family data on request
- Account deletion: archive vs hard delete

---

## Notes on Constitution Compliance

**Simplicity First**:
- **SQLite over PostgreSQL**: Single-file database, no managed service, simpler deployment (~75% cost savings)
- **Pessimistic over optimistic locking**: No version columns, no retry logic, database handles concurrency
- Direct relational schema (no NoSQL complexity)
- Minimal denormalization (only `transactions.balance_after` for performance)
- No audit log table (transactions themselves are immutable audit trail)
- No repository pattern needed (direct SQLAlchemy ORM access)

**API-First Design**:
- Schema drives OpenAPI contract generation (Phase 1 next step)
- Pydantic models map directly to database models
- Simplified contracts (no `expected_version` field, no 409 Conflict responses)

**Incremental Value Delivery**:
- Schema supports P1 (create family, add child, first transaction) independently
- P2-P5 features (requests, multi-admin, visualizations) build on same schema
- No breaking changes required as features are added
