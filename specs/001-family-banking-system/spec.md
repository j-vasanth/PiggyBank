# Feature Specification: Family Banking System

**Feature Branch**: `001-family-banking-system`
**Created**: 2025-11-24
**Status**: Draft
**Input**: User description: "Parent creates a family account. Parent can invite other parents as admins. Parent or other parent admins can add their child as a child account with the child's name and avatar. Parents (or admins) can add deposits to the child's balance. parents or admins can deduct an amount from their child's balance. Children can request a credit with a reasoning. Children can request expenditure with reasoning, expenditure deducts their balance. Children can view all their balance history, historically aggregated and in ways that show progress. Parents can view their children's balance history and all transactions. The app must be sleek and fun to use for children. The act must be minimal."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parent Creates Account, Creates Family & Adds First Child (Priority: P1)

A parent opens the PiggyBank app for the first time and creates their individual parent account with username and password. After account creation, they create a family (becoming its first admin), set up their first child's account with a name and avatar, then make the first deposit to initialize the child's virtual piggy bank.

**Why this priority**: This is the absolute foundation of the system. Without the ability to create a parent account, establish a family, and add a child with an initial balance, no other features can function. This represents the minimum viable product that delivers immediate value.

**Independent Test**: Can be fully tested by having a parent sign up for their account, create a family, add one child profile, and make one deposit. Success means the child has a visible balance that can be viewed.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they complete the parent account registration process, **Then** they should have a unique parent account with username and password credentials
2. **Given** a parent has created their account, **When** they create a family with a family name, **Then** a unique family account should be created with the parent as the first admin
3. **Given** a parent has created a family, **When** they add a child with name and avatar, **Then** the child profile should be created with a zero balance within that family
4. **Given** a child profile exists, **When** the parent adds a deposit with an amount, **Then** the child's balance should increase by that amount
5. **Given** a child has a balance, **When** the child logs in, **Then** they should see their current balance displayed

---

### User Story 2 - Parent Manages Child Transactions (Priority: P2)

A parent manages their child's piggy bank by adding deposits (allowance, birthday money, chore earnings) and making deductions (purchases the parent made on behalf of the child). All transactions include descriptions for transparency.

**Why this priority**: This enables the core banking operations that make PiggyBank useful on a daily basis. Parents need to frequently update balances as real-world cash transactions happen.

**Independent Test**: Can be tested with an existing family account and child profile. Parent adds multiple deposits and deductions, and both parent and child can see the updated balance and transaction history.

**Acceptance Scenarios**:

1. **Given** a child account exists, **When** a parent adds a deposit with amount and reason, **Then** the balance increases and the transaction is recorded with timestamp
2. **Given** a child has sufficient balance, **When** a parent deducts an amount with reason, **Then** the balance decreases and the transaction is recorded
3. **Given** transactions have been made, **When** the parent views the child's account, **Then** they see a complete transaction history with dates, amounts, and reasons
4. **Given** transactions have been made, **When** the child views their account, **Then** they see their transaction history in an engaging, child-friendly format

---

### User Story 3 - Child Requests Transactions (Priority: P3)

A child can request a credit (asking for allowance or reporting cash received) or request an expenditure (asking permission to spend money). Parents receive notifications and can approve or deny these requests.

**Why this priority**: This adds child agency and teaches financial responsibility, but the system works without it (parents can manually enter all transactions). It enhances the experience but isn't blocking for basic functionality.

**Independent Test**: Can be tested with existing family and child accounts. Child submits requests, parent reviews and approves/denies them, and balances update accordingly upon approval.

**Acceptance Scenarios**:

1. **Given** a child is logged in, **When** they submit a credit request with amount and reasoning, **Then** the request should be visible to all parent admins for approval and an in-app notification should be created
2. **Given** a child is logged in, **When** they submit an expenditure request with amount and reasoning, **Then** the request should be visible to all parent admins and marked as pending
3. **Given** a parent receives a credit request, **When** they approve it, **Then** the child's balance increases and the child receives an in-app notification of approval
4. **Given** a parent receives an expenditure request, **When** they approve it, **Then** the child's balance decreases and the child receives an in-app notification of approval
5. **Given** a parent receives any request, **When** they deny it, **Then** the balance remains unchanged and the child receives an in-app notification of the denial

---

### User Story 4 - Multi-Parent Administration (Priority: P4)

The founding parent can invite other parents (e.g., other parent, grandparent, guardian) as co-admins by generating a one-time invitation link. The invited person can either use an existing parent account to join the family, or create a new parent account and automatically join the family. Once the link is used once, it expires and cannot be reused. All admins have equal permissions to manage children and transactions within the family account.

**Why this priority**: This is important for real-world family dynamics but not essential for launch. A single-parent household or families comfortable with one admin can use the system fully without this feature.

**Independent Test**: Can be tested with an existing family account. First parent invites second parent via invitation mechanism, second parent either joins with existing account or creates new account, becomes co-admin, and the invitation link expires immediately after use.

**Acceptance Scenarios**:

1. **Given** a parent admin exists, **When** they generate an invitation link, **Then** a unique one-time invitation link is created that remains valid until used or revoked
2. **Given** an invitation link exists, **When** an existing parent uses the link to join, **Then** they become a co-admin with full permissions to that family and the invitation link expires immediately
3. **Given** an invitation link exists, **When** a new user uses the link to create an account, **Then** they create a parent account and automatically become a co-admin to that family, and the invitation link expires immediately
4. **Given** an invitation link has been used once, **When** another user tries to use the same link, **Then** the system rejects it with an "invitation already used" error
5. **Given** an unused invitation link exists, **When** the inviting parent revokes it, **Then** the link becomes invalid and cannot be used
6. **Given** multiple parent admins exist, **When** any admin adds a transaction, **Then** all admins can see the transaction in the history
7. **Given** multiple parent admins exist, **When** any admin adds or modifies a child account, **Then** the changes are visible to all admins

---

### User Story 5 - Progress Visualization for Children (Priority: P5)

Children can view their balance history through engaging visualizations that show progress over time, including charts, achievement milestones, and aggregated statistics (total earned, total spent, savings rate).

**Why this priority**: This enhances engagement and teaches financial literacy, but the core banking functionality works without it. Nice-to-have for making the app "sleek and fun" as requested.

**Independent Test**: Can be tested with an existing child account that has transaction history. Child views various visualizations and can understand their financial progress through charts and milestones.

**Acceptance Scenarios**:

1. **Given** a child has transaction history, **When** they view their progress dashboard, **Then** they see a chart showing balance changes over time
2. **Given** a child has earned and spent money, **When** they view their statistics, **Then** they see totals for deposits, deductions, and net savings
3. **Given** a child reaches a milestone (e.g., first $10 saved, first 10 transactions), **When** the milestone is achieved, **Then** they receive a celebratory notification or badge
4. **Given** a child views their history, **When** they select different time periods, **Then** the visualizations update to show that period's data

---

### Edge Cases

- What happens when a parent tries to deduct more than the child's current balance? System prevents the transaction and displays an error message showing current balance and attempted deduction amount.
- What happens when multiple admins try to modify the same child's balance simultaneously? System uses pessimistic locking (row-level locks) to serialize concurrent access; the second admin's transaction waits for the first to complete, then proceeds with the current balance.
- What happens when a child submits multiple expenditure requests that would exceed their balance if all approved? System should flag this to parents during approval.
- What happens when an invited parent never accepts the invitation? The invitation remains valid indefinitely until the inviting parent manually revokes it or another user consumes it; no automatic time-based expiration.
- What happens when someone tries to use an invitation link that has already been used? System displays "invitation already used" error and does not grant access.
- What happens when an existing parent uses an invitation link while already logged in? System adds their existing parent account as a co-admin to the inviting family.
- What happens when a new user uses an invitation link? System guides them through parent account creation, then automatically adds them as co-admin to the inviting family.
- What happens when all parent admins lose access to their accounts? System needs a recovery mechanism (account recovery out of scope for MVP).
- What happens if a child or parent tries to enter an invalid amount (negative, zero, or exceeding $1,000)? System validates and rejects invalid inputs with clear error message indicating the allowed range ($0.01 - $1,000.00).
- What happens when a parent removes a child account? System should archive rather than delete to preserve history, or require explicit confirmation for permanent deletion.

## Requirements *(mandatory)*

### Functional Requirements

**Account Management**

- **FR-001**: System MUST allow users to create a parent account with unique username and password (no email required); authentication system MUST be designed to support future OAuth integration
- **FR-038**: System MUST allow a parent to create a family with a family name after creating their parent account; parent becomes the first admin of that family
- **FR-039**: System MUST support a parent belonging to multiple families as an admin
- **FR-002**: System MUST allow parent admins to add child accounts with name, avatar, and 4-6 digit PIN code for child authentication within their family
- **FR-003**: System MUST allow any parent admin to generate a unique one-time invitation link with embedded code; link remains valid until used once or manually revoked by inviting parent; link expires immediately after first use
- **FR-040**: System MUST allow an existing parent to join a family using an invitation link, adding them as a co-admin to that family
- **FR-041**: System MUST allow a new user to use an invitation link during account creation, automatically creating their parent account and adding them as co-admin to the inviting family
- **FR-042**: System MUST prevent reuse of invitation links; once a link is used, any subsequent attempts must be rejected with clear error message
- **FR-035**: System MUST allow the inviting parent to revoke/cancel an unused invitation link at any time
- **FR-004**: System MUST grant all parent admins equal permissions to manage children and transactions within their family
- **FR-005**: System MUST support multiple child accounts within a single family account
- **FR-006**: System MUST allow parent admins to view all children's accounts within their family
- **FR-007**: System MUST allow children to access only their own account information

**Transaction Management**

- **FR-008**: System MUST allow parent admins to add deposits to any child's balance with amount and reason
- **FR-009**: System MUST allow parent admins to deduct amounts from any child's balance with amount and reason
- **FR-010**: System MUST record all transactions with timestamp, amount, reason, and admin who performed it
- **FR-011**: System MUST update child balances in real-time when transactions are recorded
- **FR-036**: System MUST use pessimistic locking (row-level locks) to prevent concurrent transaction conflicts on the same child account
- **FR-037**: System MUST serialize concurrent transactions by acquiring locks, ensuring the second transaction processes after the first completes
- **FR-012**: System MUST prevent deductions that would result in negative balances; parent must deposit funds before deducting amounts exceeding current balance
- **FR-013**: System MUST persist all transaction history permanently (or according to data retention policy)

**Request System**

- **FR-014**: System MUST allow children to submit credit requests with amount and reasoning
- **FR-015**: System MUST allow children to submit expenditure requests with amount and reasoning
- **FR-016**: System MUST notify all parent admins when a child submits a request via in-app notification (visible when parent opens app)
- **FR-017**: System MUST allow any parent admin to approve or deny pending requests
- **FR-018**: System MUST update balances only upon approval of requests
- **FR-019**: System MUST notify children when their requests are approved or denied via in-app notification (visible when child opens app)
- **FR-034**: System MUST display notification badge or indicator showing count of unread notifications for pending requests and status updates
- **FR-020**: System MUST prevent duplicate processing of the same request (only one approval needed)

**History & Reporting**

- **FR-021**: System MUST display complete transaction history to parent admins for each child
- **FR-022**: System MUST display transaction history to children for their own account
- **FR-023**: System MUST show historical balance changes over time
- **FR-024**: System MUST aggregate statistics (total deposits, total deductions, net balance) for children
- **FR-025**: System MUST present child-facing interfaces in an engaging, age-appropriate, visually appealing manner
- **FR-026**: System MUST present parent-facing interfaces with minimal steps to complete common actions

**Data & Validation**

- **FR-027**: System MUST validate all transaction amounts as positive numbers between $0.01 and $1,000.00
- **FR-028**: System MUST require reasons/descriptions for all transactions
- **FR-029**: System MUST support standard currency denominations (dollars and cents or equivalent)
- **FR-030**: System MUST prevent unauthorized access (children cannot access other children's accounts, non-admins cannot access family accounts)
- **FR-031**: System MUST authenticate parent admins via username/password credentials
- **FR-032**: System MUST authenticate children via 4-6 digit PIN codes set by parent admins
- **FR-033**: System authentication architecture MUST use abstraction layer to enable future OAuth provider integration without data migration

### Key Entities

- **Parent Account**: Individual user account for a parent/guardian; has unique username and password credentials (future OAuth token support); can be admin of multiple families; independent of any specific family
- **Family**: Represents a household unit; has family name, unique identifier, creation timestamp; contains multiple parent admins and child accounts; created by a parent after they create their account
- **Family Membership**: Junction entity linking parent accounts to families as admins; a parent can be admin of multiple families; all admins have equal permissions within that family
- **Child Account**: Belongs to one family; has name, avatar, 4-6 digit PIN code, current balance; read-only access for the child user
- **Transaction**: Represents a balance change; has type (deposit/deduction), amount, reason, timestamp, performing admin, target child account; immutable once recorded
- **Request**: Submitted by child; has type (credit/expenditure), amount, reasoning, timestamp, status (pending/approved/denied), approving admin (if processed)
- **Invitation**: Sent by existing parent admin to invite co-admin to their family; has unique one-time code/link, target family, creation timestamp, status (pending/accepted/revoked/used); no time-based expiration; can be manually revoked by creator; expires immediately after first use

## Clarifications

### Session 2025-11-24

- Q: What authentication mechanism should parents and children use to log in? → A: Username/password (no email required) for parents with 4-6 digit PIN for children; architecture must support future migration to OAuth (Google) for parent authentication
- Q: How should the system deliver notifications to parents when children submit requests and to children when requests are approved/denied? → A: In-app notifications only (notification badge/list visible when user opens app)
- Q: How long should invitation links remain valid if not accepted? → A: No expiration unless manually revoked (link valid indefinitely until used or canceled by inviting parent)
- Q: How should the system handle concurrent transaction attempts by multiple admins on the same child account? → A: Pessimistic locking (row-level database locks) to serialize transactions; second admin waits for first to complete
- Q: What is the maximum transaction amount allowed to prevent "extremely large" input errors? → A: $1,000 per transaction

### Session 2025-11-26

- Q: Should parents create a "family account" first or a personal parent account first? → A: Parent creates their individual parent account first, then creates a family (becoming its first admin). This allows parents to potentially be admins of multiple families.
- Q: How should invitation links work when inviting other parents? → A: Invitation links are one-time use only. An invited person can either (1) use an existing parent account to join the family as co-admin, or (2) create a new parent account and automatically join as co-admin. Once used once, the link expires and cannot be reused.
- Q: What happens if someone tries to use an already-used invitation link? → A: System displays clear "invitation already used" error and denies access.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parents can create a family account, add a child, and record the first transaction in under 5 minutes
- **SC-002**: Parents can complete common transactions (deposit or deduction) in under 30 seconds
- **SC-003**: Children can view their current balance and recent transactions within 3 seconds of logging in
- **SC-004**: 90% of children aged 6-12 can navigate to their balance and request a transaction without adult help
- **SC-005**: The system supports at least 5 child accounts per family and 3 parent admins per family without performance degradation
- **SC-006**: Transaction history displays correctly for accounts with up to 1000 transactions
- **SC-007**: 85% of parents report the app interface is "easy" or "very easy" to use for daily transactions
- **SC-008**: Child engagement metrics show at least 60% of children check their balance at least twice per week
- **SC-009**: Parent request approval turnaround time averages under 24 hours for active families
- **SC-010**: Zero data loss occurs during concurrent admin operations on the same family account; conflicts are prevented through pessimistic locking (transactions are serialized)

### Assumptions

- Parents and children have access to devices capable of running the app (mobile or web)
- Parents can create accounts without email (username-based); OAuth migration path preserved for future enhancement
- Children have basic reading skills appropriate for their age (app targets ages 6-14)
- Families understand virtual money tracking and that PiggyBank does not handle real financial accounts or transfers
- One parent will always remain active as an admin (account recovery is out of scope for MVP)
- Currency is in US dollars (internationalization can be added later)
- Maximum transaction amount is $1,000 per deposit or deduction (suitable for typical children's allowances, gifts, and purchases)
- Negative balances are prevented entirely; system enforces non-negative balance constraint
- Avatar selection is from a predefined set (custom avatar upload can be added later)
