# Research: Family Banking System

**Date**: 2025-11-24
**Feature**: 001-family-banking-system
**Note**: Updated to reflect SQLite + pessimistic locking decision

## Overview

This document captures research findings that resolve technical unknowns from the planning phase. Each decision is documented with rationale and alternatives considered to align with Constitutional Principle I (Simplicity First).

## Database Choice: SQLite vs PostgreSQL

### Decision

**SQLite** with Write-Ahead Logging (WAL) mode on Fly.io persistent volumes

### Rationale

1. **Cost-Effective Deployment**: SQLite eliminates the need for managed PostgreSQL service on Fly.io. Fly Postgres costs ~$30-50/month for small instances, while SQLite runs on the same compute instance with persistent volumes (~$0.15/GB/month).

2. **Simpler Deployment**: Single-file database (`piggybank.db`) on persistent volume. No database connection strings, no managed service setup, no network latency between app and database.

3. **Pessimistic Locking Support**: SQLite with WAL mode supports `BEGIN IMMEDIATE` transactions for pessimistic locking, which is simpler than optimistic locking (no version columns, no retry logic).

4. **Family-Scale Concurrency**: SQLite WAL mode allows concurrent readers + single writer. For family-scale app (1-10 users, low write frequency), this is sufficient. Parent admins performing concurrent transactions are rare.

5. **Backup Simplicity**: Single file backup with `.backup` command or volume snapshots. Restore is as simple as copying the file.

6. **Aligns with Constitution**: Simplicity First principle prioritizes simpler deployment and concurrency model over PostgreSQL's advanced features (which aren't needed for family scale).

### Alternatives Considered

**PostgreSQL (Managed Fly Postgres)**:
- ✅ Robust row-level locking for high concurrency
- ✅ Better for multi-tenant applications with many concurrent users
- ✅ Advanced features (JSON columns, full-text search, PostGIS)
- ❌ Expensive for single-tenant app ($30-50/month vs $2-5/month for SQLite on persistent volume)
- ❌ More complex deployment (managed service, connection pooling, network latency)
- ❌ Overkill for family-scale concurrency (1-10 users)

**Rejected because**: Cost and complexity outweigh benefits. SQLite with pessimistic locking is simpler and sufficient for family-scale requirements.

### Implementation Notes

- **WAL Mode**: Enable with `PRAGMA journal_mode=WAL;` for concurrent reads
- **Connection String**: `sqlite:///database/piggybank.db` (relative to backend root)
- **Pessimistic Locking**: Use `BEGIN IMMEDIATE` transactions in SQLAlchemy
- **Fly.io Volume**: Mount persistent volume at `/app/database/` for database storage
- **Backup Strategy**: Daily volume snapshots + manual `.backup` command for critical updates

---

## Concurrency Control: Pessimistic vs Optimistic Locking

### Decision

**Pessimistic Locking** with `BEGIN IMMEDIATE` transactions (SQLite) or `SELECT FOR UPDATE` (if migrating to PostgreSQL)

### Rationale

1. **Simpler Implementation**: No version column tracking, no application-level conflict detection, no retry logic. Database handles serialization automatically.

2. **SQLite Compatibility**: SQLite's locking model naturally fits pessimistic locking. WAL mode + `BEGIN IMMEDIATE` ensures write transactions are serialized.

3. **Family-Scale Concurrency**: Concurrent writes are rare (2-3 parent admins max, low transaction frequency). Pessimistic locking wait times are negligible (<50ms).

4. **Fewer Edge Cases**: No "lost update" scenarios, no "stale read" errors to handle in UI. First transaction acquires lock, second transaction waits and processes with correct balance.

5. **Simplified API Contract**: No `expected_version` field in request bodies, no 409 Conflict responses. Frontend doesn't need retry logic.

### Alternatives Considered

**Optimistic Locking (with version column)**:
- ✅ Better for high-concurrency scenarios with many concurrent writers
- ✅ Non-blocking reads (no waiting for locks)
- ❌ More complex: version column, conflict detection, retry logic in frontend
- ❌ User experience: "Balance changed, please retry" errors are annoying
- ❌ Not needed for family-scale concurrency (concurrent writes are rare)

**Rejected because**: Adds unnecessary complexity (version tracking, retry logic, 409 responses) for a concurrency level that doesn't justify it. Simplicity First principle favors pessimistic locking for low-write-frequency applications.

### Implementation Pattern

**SQLite (BEGIN IMMEDIATE)**:
```python
def add_transaction(db: Session, child_id: int, amount: Decimal, reason: str):
    # Start immediate transaction (locks database for writes)
    db.execute(text("BEGIN IMMEDIATE"))

    # Read child balance (locked for duration of transaction)
    child = db.query(Child).filter(Child.id == child_id).first()

    # Validate balance (for deductions)
    if transaction_type == "deduction" and child.balance < amount:
        db.rollback()
        raise InsufficientBalanceError()

    # Update balance
    child.balance += amount  # or -= for deduction

    # Create transaction record
    transaction = Transaction(
        child_id=child_id,
        amount=amount,
        reason=reason,
        balance_after=child.balance
    )
    db.add(transaction)
    db.commit()  # Releases lock
```

**Alternative (PostgreSQL with SELECT FOR UPDATE)**:
```python
def add_transaction(db: Session, child_id: int, amount: Decimal, reason: str):
    # Acquire row-level lock
    child = db.query(Child).filter(Child.id == child_id).with_for_update().first()

    # Validate and update (same as above)
    # ...
    db.commit()
```

---

## Authentication Patterns

### Decision

**Token-based authentication with provider abstraction layer**

Architecture:
```python
# Abstract AuthProvider interface
class AuthProvider(ABC):
    @abstractmethod
    def authenticate(self, credentials) -> User:
        pass

    @abstractmethod
    def create_credentials(self, user, params) -> Credentials:
        pass

# Concrete implementations
class UsernamePasswordProvider(AuthProvider):
    def authenticate(self, credentials):
        # bcrypt password verification
        pass

class OAuthProvider(AuthProvider):  # Future implementation
    def authenticate(self, credentials):
        # OAuth token verification
        pass

# Service layer uses abstraction
class AuthService:
    def __init__(self, provider: AuthProvider):
        self.provider = provider
```

### Rationale

1. **Simplicity First**: Start with direct username/password implementation; OAuth provider is empty scaffold until needed
2. **Future-Proof**: FR-033 requires OAuth migration without data migration; abstraction layer enables swapping providers
3. **Single Responsibility**: Authentication logic separated from user management
4. **Stateless Backend**: JWT tokens (access + refresh) avoid server-side session storage per constitution requirement

### Token Strategy

- **Access Token**: Short-lived (15 minutes), contains user_id, role (parent/child), family_id
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
- **Storage**: Frontend stores tokens in memory + httpOnly cookies (web) or secure storage (mobile)

### Alternatives Considered

**Session-based authentication**:
- ❌ Violates constitution requirement for stateless backend
- ❌ Complicates horizontal scaling
- ❌ Incompatible with mobile app architecture (Capacitor)

**Direct OAuth implementation without abstraction**:
- ❌ Violates FR-033 requirement for future OAuth migration without data migration
- ❌ Would require breaking changes to auth flow later

---

## FastAPI Best Practices for Family Banking Domain

### Decision

**Direct SQLAlchemy models with Pydantic schemas (no repository pattern)**

### Rationale

1. **Simplicity First**: FastAPI + SQLAlchemy ORM provides direct database access without additional abstraction layers
2. **Constitution Compliance**: Avoid repository pattern unless complexity justified (Principle I: no premature abstraction)
3. **Type Safety**: Pydantic schemas provide automatic validation and OpenAPI documentation generation
4. **Small Scale**: Family-scale app (5 children, 3 admins, 1000 transactions) doesn't warrant repository complexity

### Architecture

```python
# Direct ORM access in service layer
class TransactionService:
    def create_transaction(self, db: Session, child_id: int, amount: Decimal, reason: str):
        # BEGIN IMMEDIATE for pessimistic locking
        db.execute(text("BEGIN IMMEDIATE"))

        # Read child with lock held
        child = db.query(Child).filter(Child.id == child_id).first()

        # Update balance
        child.balance += amount

        # Create transaction record
        transaction = Transaction(child_id=child_id, amount=amount, reason=reason)
        db.add(transaction)
        db.commit()
```

### Alternatives Considered

**Repository Pattern**:
- ❌ Adds abstraction layer without clear benefit at family scale
- ❌ More files, more indirection, harder to trace data flow
- ❌ Violates Principle I (no premature abstraction)

**Accepted because**: Direct SQLAlchemy access is simpler and sufficient for domain complexity.

---

## In-App Notification Architecture

### Decision

**Database-backed notification table with polling (no WebSockets or push for MVP)**

### Rationale

1. **Simplicity First**: Database table + REST API is simpler than WebSocket server or push notification infrastructure
2. **No External Dependencies**: Avoids Firebase, APNs, or other push services per clarification decision (in-app only)
3. **Sufficient for Use Case**: Family members check app periodically; real-time delivery not critical (SC-009: 24-hour approval turnaround)
4. **Stateless Backend**: No WebSocket connections to manage

### Implementation

```python
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Parent or child
    type = Column(String)  # "request_created", "request_approved", "request_denied"
    content = Column(JSON)  # {request_id, child_name, amount, reason}
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Frontend polling strategy
# - Poll /api/v1/notifications/unread every 30 seconds when app is active
# - Display badge count + notification list on demand
```

### Alternatives Considered

**WebSockets for real-time notifications**:
- ❌ Adds complexity (WebSocket server, connection management, reconnection logic)
- ❌ Not needed for non-urgent family banking notifications
- ❌ Complicates deployment (stateful connections)

**Push Notifications (Firebase/APNs)**:
- ❌ External dependency (Firebase/Apple developer account)
- ❌ Rejected in clarification session (in-app only decision)

**Server-Sent Events (SSE)**:
- ❌ Still requires keeping connections open (stateful)
- ❌ More complex than polling for family-scale app

---

## Frontend State Management

### Decision

**React Context API + Custom Hooks (no Redux/MobX)**

### Rationale

1. **Simplicity First**: Context API is built into React; no additional state management library needed
2. **Sufficient Complexity**: Family app has limited shared state (auth user, active family, notifications)
3. **TypeScript Integration**: Context + hooks provide type-safe state access without boilerplate

### Architecture

```typescript
// AuthContext: current user, login/logout
// FamilyContext: active family data, children list
// NotificationContext: unread count, notification list

// Custom hooks encapsulate API calls + context updates
function useTransactions(childId: number) {
    const [transactions, setTransactions] = useState([]);

    const addDeposit = async (amount, reason) => {
        const result = await api.transactions.create({ childId, amount, reason });
        setTransactions([...transactions, result]);
    };

    return { transactions, addDeposit };
}
```

### Alternatives Considered

**Redux/Redux Toolkit**:
- ❌ Overkill for family-scale app state complexity
- ❌ Additional boilerplate (actions, reducers, store configuration)
- ❌ Violates Principle I (question every dependency)

**MobX**:
- ❌ Adds observable pattern complexity
- ❌ Not needed for simple CRUD operations

**Zustand/Jotai**:
- ❌ While simpler than Redux, Context API is even simpler and built-in
- ❌ Another dependency to maintain

---

## Summary

All technical unknowns from Technical Context resolved:

| Decision Area | Decision | Key Rationale |
|--------------|----------|---------------|
| Database | SQLite with WAL mode | Cost-effective ($2-5/mo vs $30-50/mo), simpler deployment (single file) |
| Concurrency | Pessimistic locking | Simpler than optimistic (no version columns, no retry logic) |
| Auth patterns | Token-based with provider abstraction | Future OAuth migration, stateless backend requirement |
| State management | React Context API + hooks | Simplicity first, sufficient for domain complexity |
| Notification delivery | Database + polling | In-app only requirement, stateless architecture |

**Constitution Compliance**: All decisions prioritize Simplicity First while meeting functional requirements. Complexity is justified only where explicitly required:
- SQLite over PostgreSQL: Simpler + cheaper for single-tenant deployment
- Pessimistic over optimistic locking: Simpler concurrency model for low-write-frequency app
- No repository pattern: Direct ORM access sufficient for family scale
- No state management libraries: Context API built-in to React

**Cost Analysis**:
- **PostgreSQL approach**: $30-50/month (managed database) + $5-10/month (compute) = **$35-60/month**
- **SQLite approach**: $2-5/month (persistent volume) + $5-10/month (compute) = **$7-15/month**
- **Savings**: ~$28-45/month (~75% cost reduction)

**Next Phase**: Proceed to Phase 1 (data model design, API contracts, quickstart guide) with SQLite + pessimistic locking architecture.
