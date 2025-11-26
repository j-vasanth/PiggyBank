# Tasks: Family Banking System

**Input**: Design documents from `/specs/001-family-banking-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Not explicitly requested in spec.md - tests are OPTIONAL and not included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Web + Mobile app with backend and frontend:
- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Docker**: `docker/`
- **Database**: `backend/database/` (SQLite file location)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure: backend/src/{models,services,api/v1,auth,config}, backend/tests/{unit,integration}, backend/alembic, backend/database
- [ ] T002 Create frontend directory structure: frontend/src/{components,pages/{parent,child},services,hooks,theme,types}, frontend/tests/{unit,integration}
- [ ] T003 Initialize Python 3.11+ project with FastAPI in backend/requirements.txt (fastapi, uvicorn, sqlalchemy, alembic, pydantic, python-jose, passlib, bcrypt)
- [ ] T004 Initialize TypeScript + React project with Vite in frontend/package.json (react, react-router-dom, @ionic/react, @capacitor/core, axios, vite, typescript)
- [ ] T005 [P] Create backend/.env.example with DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_DAYS
- [ ] T006 [P] Create frontend/.env.example with VITE_API_BASE_URL
- [ ] T007 [P] Configure SQLite database connection with WAL mode in backend/src/config/database.py
- [ ] T008 [P] Configure CORS settings for frontend in backend/src/config/settings.py
- [ ] T009 [P] Setup Alembic for database migrations in backend/alembic.ini and backend/alembic/env.py
- [ ] T010 [P] Create Docker configuration in docker/backend.Dockerfile, docker/frontend.Dockerfile, docker/docker-compose.yml
- [ ] T011 [P] Create fly.toml for Fly.io deployment with persistent volume mount configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 Create base SQLAlchemy model class in backend/src/models/base.py with id, created_at, updated_at fields
- [ ] T013 Create Family model in backend/src/models/family.py with id, created_at, updated_at
- [ ] T014 Create ParentAdmin model in backend/src/models/parent_admin.py with id, family_id, username, password_hash, created_at, updated_at
- [ ] T015 Create Child model in backend/src/models/child.py with id, family_id, name, avatar, pin_hash, balance, created_at, updated_at
- [ ] T016 Create Transaction model in backend/src/models/transaction.py with id, child_id, parent_admin_id, type, amount, reason, balance_after, created_at
- [ ] T017 Create Request model in backend/src/models/request.py with id, child_id, type, amount, reasoning, status, approved_by_id, created_at, processed_at
- [ ] T018 Create Invitation model in backend/src/models/invitation.py with id, family_id, created_by_id, invitation_code, status, created_at, accepted_at, revoked_at
- [ ] T019 Create Notification model in backend/src/models/notification.py with id, user_id, user_type, type, content, is_read, created_at
- [ ] T020 Create initial Alembic migration for all models with indexes and constraints in backend/alembic/versions/001_initial_schema.py
- [ ] T021 Create JWT token utilities in backend/src/auth/jwt_utils.py with create_token, decode_token, verify_token functions
- [ ] T022 Create password hashing utilities in backend/src/auth/password_utils.py with hash_password, verify_password functions
- [ ] T023 Create AuthProvider abstract base class in backend/src/auth/providers/base.py with authenticate and create_credentials methods
- [ ] T024 Implement UsernamePasswordProvider in backend/src/auth/providers/username_password.py with bcrypt password verification
- [ ] T025 Create authentication dependencies in backend/src/auth/dependencies.py with get_current_user, require_parent_admin, require_child decorators
- [ ] T026 Create FastAPI app initialization in backend/src/main.py with CORS middleware and router registration
- [ ] T027 Create API error handlers in backend/src/api/v1/errors.py for 400, 401, 403, 404, 409 responses
- [ ] T028 Create Pydantic schemas for error responses in backend/src/api/v1/schemas/error.py
- [ ] T029 [P] Create TypeScript API client base in frontend/src/services/api.ts with axios configuration and auth interceptors
- [ ] T030 [P] Create authentication context in frontend/src/hooks/useAuth.tsx with login, logout, and token management
- [ ] T031 [P] Create Ionic theme configuration in frontend/src/theme/variables.css for parent (minimal) and child (colorful) themes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Parent Creates Family Account & Adds First Child (Priority: P1) <� MVP

**Goal**: A parent can create a family account, add their first child with name and avatar, and make an initial deposit to start the virtual piggy bank.

**Independent Test**: Have a parent sign up, create a family, add one child profile, and make one deposit. Success means the child has a visible balance that can be viewed.

### Implementation for User Story 1

- [ ] T032 [P] [US1] Create Pydantic schemas for family registration in backend/src/api/v1/schemas/auth.py (RegisterFamilyRequest, RegisterFamilyResponse)
- [ ] T033 [P] [US1] Create Pydantic schemas for child management in backend/src/api/v1/schemas/child.py (CreateChildRequest, ChildResponse)
- [ ] T034 [P] [US1] Create Pydantic schemas for transactions in backend/src/api/v1/schemas/transaction.py (CreateTransactionRequest, TransactionResponse)
- [ ] T035 [US1] Implement FamilyService in backend/src/services/family_service.py with create_family method
- [ ] T036 [US1] Implement AuthService in backend/src/services/auth_service.py with register_family, login_parent, login_child methods
- [ ] T037 [US1] Implement ChildService in backend/src/services/child_service.py with create_child, get_child, list_children methods
- [ ] T038 [US1] Implement TransactionService in backend/src/services/transaction_service.py with create_transaction (BEGIN IMMEDIATE locking), get_history methods
- [ ] T039 [US1] Create /auth/register-family endpoint in backend/src/api/v1/routes/auth.py implementing FR-001
- [ ] T040 [US1] Create /auth/login endpoint in backend/src/api/v1/routes/auth.py for parent admin login
- [ ] T041 [US1] Create /auth/child-login endpoint in backend/src/api/v1/routes/auth.py implementing FR-032
- [ ] T042 [US1] Create POST /children endpoint in backend/src/api/v1/routes/children.py implementing FR-002
- [ ] T043 [US1] Create GET /children endpoint in backend/src/api/v1/routes/children.py implementing FR-006
- [ ] T044 [US1] Create GET /children/{child_id} endpoint in backend/src/api/v1/routes/children.py implementing FR-007
- [ ] T045 [US1] Create POST /transactions endpoint in backend/src/api/v1/routes/transactions.py implementing FR-008, FR-009, FR-036, FR-037
- [ ] T046 [US1] Create GET /transactions/{child_id} endpoint in backend/src/api/v1/routes/transactions.py implementing FR-021, FR-022
- [ ] T047 [P] [US1] Create TypeScript types in frontend/src/types/auth.ts for RegisterFamilyRequest, LoginRequest, AuthResponse
- [ ] T048 [P] [US1] Create TypeScript types in frontend/src/types/child.ts for Child, CreateChildRequest
- [ ] T049 [P] [US1] Create TypeScript types in frontend/src/types/transaction.ts for Transaction, CreateTransactionRequest
- [ ] T050 [US1] Create auth API client methods in frontend/src/services/authService.ts (registerFamily, loginParent, loginChild)
- [ ] T051 [US1] Create child API client methods in frontend/src/services/childService.ts (createChild, getChild, listChildren)
- [ ] T052 [US1] Create transaction API client methods in frontend/src/services/transactionService.ts (createTransaction, getHistory)
- [ ] T053 [P] [US1] Create Avatar component in frontend/src/components/Avatar.tsx displaying predefined avatar images
- [ ] T054 [P] [US1] Create BalanceCard component in frontend/src/components/BalanceCard.tsx showing child name, avatar, and current balance
- [ ] T055 [P] [US1] Create TransactionList component in frontend/src/components/TransactionList.tsx displaying transaction history
- [ ] T056 [US1] Create RegisterFamilyPage in frontend/src/pages/parent/RegisterFamilyPage.tsx with username/password form
- [ ] T057 [US1] Create ParentLoginPage in frontend/src/pages/parent/ParentLoginPage.tsx with username/password form
- [ ] T058 [US1] Create ChildLoginPage in frontend/src/pages/child/ChildLoginPage.tsx with child selection and PIN entry
- [ ] T059 [US1] Create ParentDashboard in frontend/src/pages/parent/ParentDashboard.tsx listing all children with BalanceCard components
- [ ] T060 [US1] Create AddChildPage in frontend/src/pages/parent/AddChildPage.tsx with name, avatar selector, and PIN setup
- [ ] T061 [US1] Create CreateTransactionPage in frontend/src/pages/parent/CreateTransactionPage.tsx with deposit/deduction form implementing FR-027, FR-028
- [ ] T062 [US1] Create ChildBalancePage in frontend/src/pages/child/ChildBalancePage.tsx showing current balance and TransactionList
- [ ] T063 [US1] Add React Router routes in frontend/src/App.tsx for all parent and child pages
- [ ] T064 [US1] Implement validation logic for transaction amounts ($0.01-$1,000) and reasons in frontend forms per FR-027, FR-028
- [ ] T065 [US1] Implement insufficient balance error handling in backend and frontend per FR-012

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. A parent can create a family, add a child, deposit money, and both parent and child can view the balance.

---

## Phase 4: User Story 2 - Parent Manages Child Transactions (Priority: P2)

**Goal**: A parent can manage their child's piggy bank by adding deposits and making deductions with descriptions, and both parent and child can see the complete transaction history.

**Independent Test**: With an existing family account and child profile, parent adds multiple deposits and deductions, and both parent and child can see the updated balance and transaction history.

**Note**: Most core transaction functionality was implemented in US1. This phase focuses on enhancing the transaction management experience.

### Implementation for User Story 2

- [ ] T066 [P] [US2] Create TransactionHistoryPage in frontend/src/pages/parent/TransactionHistoryPage.tsx with filtering and pagination
- [ ] T067 [P] [US2] Create ChildTransactionHistoryPage in frontend/src/pages/child/ChildTransactionHistoryPage.tsx with child-friendly design per FR-025
- [ ] T068 [US2] Add pagination parameters (limit, offset) to transaction history API in backend/src/services/transaction_service.py
- [ ] T069 [US2] Add transaction history pagination to GET /transactions/{child_id} endpoint in backend/src/api/v1/routes/transactions.py
- [ ] T070 [US2] Implement transaction history pagination in frontend/src/services/transactionService.ts
- [ ] T071 [P] [US2] Create TransactionDetailModal component in frontend/src/components/TransactionDetailModal.tsx showing amount, reason, timestamp, performing parent
- [ ] T072 [P] [US2] Implement child-friendly transaction history styling in frontend/src/pages/child/ChildTransactionHistoryPage.tsx with colors and icons
- [ ] T073 [US2] Add quick action buttons for common deposit amounts in frontend/src/pages/parent/CreateTransactionPage.tsx per FR-026
- [ ] T074 [US2] Add confirmation dialog for deductions in frontend/src/pages/parent/CreateTransactionPage.tsx
- [ ] T075 [US2] Create success/error toast notifications in frontend/src/components/Toast.tsx for transaction operations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Transaction management is fully featured with history viewing and user-friendly interfaces.

---

## Phase 5: User Story 3 - Child Requests Transactions (Priority: P3)

**Goal**: A child can request a credit or expenditure with reasoning, parents receive in-app notifications, and can approve or deny requests which update balances accordingly.

**Independent Test**: With existing family and child accounts, child submits requests, parent reviews and approves/denies them, and balances update correctly upon approval.

### Implementation for User Story 3

- [ ] T076 [P] [US3] Create Pydantic schemas for requests in backend/src/api/v1/schemas/request.py (CreateRequestRequest, RequestResponse)
- [ ] T077 [P] [US3] Create Pydantic schemas for notifications in backend/src/api/v1/schemas/notification.py (NotificationResponse)
- [ ] T078 [US3] Implement RequestService in backend/src/services/request_service.py with create_request, approve_request, deny_request, get_pending_requests methods
- [ ] T079 [US3] Implement NotificationService in backend/src/services/notification_service.py with create_notification, get_unread, mark_read methods implementing FR-034
- [ ] T080 [US3] Create POST /requests endpoint in backend/src/api/v1/routes/requests.py implementing FR-014, FR-015, FR-016
- [ ] T081 [US3] Create GET /requests/pending endpoint in backend/src/api/v1/routes/requests.py for parent admins
- [ ] T082 [US3] Create POST /requests/{request_id}/approve endpoint in backend/src/api/v1/routes/requests.py implementing FR-017, FR-018, FR-019, FR-020
- [ ] T083 [US3] Create POST /requests/{request_id}/deny endpoint in backend/src/api/v1/routes/requests.py implementing FR-017, FR-019
- [ ] T084 [US3] Create GET /notifications/unread endpoint in backend/src/api/v1/routes/notifications.py implementing FR-034
- [ ] T085 [US3] Create POST /notifications/{notification_id}/mark-read endpoint in backend/src/api/v1/routes/notifications.py
- [ ] T086 [P] [US3] Create TypeScript types in frontend/src/types/request.ts for Request, CreateRequestRequest
- [ ] T087 [P] [US3] Create TypeScript types in frontend/src/types/notification.ts for Notification
- [ ] T088 [US3] Create request API client methods in frontend/src/services/requestService.ts (createRequest, getPendingRequests, approveRequest, denyRequest)
- [ ] T089 [US3] Create notification API client methods in frontend/src/services/notificationService.ts (getUnread, markRead)
- [ ] T090 [P] [US3] Create RequestCard component in frontend/src/components/RequestCard.tsx displaying request details with approve/deny buttons
- [ ] T091 [P] [US3] Create NotificationBadge component in frontend/src/components/NotificationBadge.tsx showing unread count
- [ ] T092 [P] [US3] Create NotificationList component in frontend/src/components/NotificationList.tsx displaying notification history
- [ ] T093 [US3] Create RequestMoneyPage in frontend/src/pages/child/RequestMoneyPage.tsx with credit/expenditure form per FR-014, FR-015
- [ ] T094 [US3] Create PendingRequestsPage in frontend/src/pages/parent/PendingRequestsPage.tsx listing all pending requests with RequestCard components
- [ ] T095 [US3] Create NotificationsPage in frontend/src/pages/parent/NotificationsPage.tsx with NotificationList component
- [ ] T096 [US3] Add NotificationBadge to parent navigation header in frontend/src/components/ParentHeader.tsx
- [ ] T097 [US3] Implement notification polling (every 30 seconds) in frontend/src/hooks/useNotifications.tsx per research.md decision
- [ ] T098 [US3] Add request approval/denial confirmation dialogs in frontend/src/pages/parent/PendingRequestsPage.tsx
- [ ] T099 [US3] Implement duplicate request processing prevention (status check) in backend/src/services/request_service.py per FR-020
- [ ] T100 [US3] Add success notification to child when request is approved/denied in frontend/src/pages/child/ChildNotificationsPage.tsx

**Checkpoint**: All user stories 1-3 should now be independently functional. Children can request transactions, parents receive notifications and can approve/deny, balances update correctly.

---

## Phase 6: User Story 4 - Multi-Parent Administration (Priority: P4)

**Goal**: The founding parent can invite other parents as co-admins via invitation links, invited parents can accept and gain full admin permissions, and inviting parents can revoke unused invitations.

**Independent Test**: With an existing family account, first parent invites second parent via invitation mechanism, second parent accepts and gains full admin access to all children and transactions.

### Implementation for User Story 4

- [ ] T101 [P] [US4] Create Pydantic schemas for invitations in backend/src/api/v1/schemas/invitation.py (InvitationResponse, AcceptInvitationRequest)
- [ ] T102 [US4] Implement InvitationService in backend/src/services/invitation_service.py with create_invitation, accept_invitation, revoke_invitation methods
- [ ] T103 [US4] Create POST /invitations endpoint in backend/src/api/v1/routes/invitations.py implementing FR-003 with 32-character secure random invitation_code
- [ ] T104 [US4] Create POST /invitations/{invitation_code}/accept endpoint in backend/src/api/v1/routes/invitations.py implementing FR-003, FR-004 with immediate expiration
- [ ] T105 [US4] Create POST /invitations/{invitation_id}/revoke endpoint in backend/src/api/v1/routes/invitations.py implementing FR-035
- [ ] T106 [P] [US4] Create TypeScript types in frontend/src/types/invitation.ts for Invitation, AcceptInvitationRequest
- [ ] T107 [US4] Create invitation API client methods in frontend/src/services/invitationService.ts (createInvitation, acceptInvitation, revokeInvitation)
- [ ] T108 [P] [US4] Create InvitationCard component in frontend/src/components/InvitationCard.tsx displaying invitation link and revoke button
- [ ] T109 [US4] Create ManageInvitationsPage in frontend/src/pages/parent/ManageInvitationsPage.tsx with create invitation button and list of pending invitations
- [ ] T110 [US4] Create AcceptInvitationPage in frontend/src/pages/AcceptInvitationPage.tsx (public route) with username/password registration form
- [ ] T111 [US4] Add invitation link generation logic with frontend URL in backend/src/services/invitation_service.py
- [ ] T112 [US4] Implement copy-to-clipboard functionality for invitation links in frontend/src/components/InvitationCard.tsx
- [ ] T113 [US4] Add validation to ensure invitation_code is unique and cryptographically secure in backend/src/services/invitation_service.py
- [ ] T114 [US4] Implement authorization checks ensuring all parent admins have equal permissions in backend/src/auth/dependencies.py per FR-004
- [ ] T115 [US4] Add "Manage Co-Admins" navigation item to parent dashboard in frontend/src/pages/parent/ParentDashboard.tsx

**Checkpoint**: Multi-parent administration is fully functional. Parents can invite co-admins, invitations can be accepted and revoked, all admins have equal permissions.

---

## Phase 7: User Story 5 - Progress Visualization for Children (Priority: P5)

**Goal**: Children can view their balance history through engaging visualizations including charts, achievement milestones, and aggregated statistics (total earned, total spent, savings rate).

**Independent Test**: With an existing child account that has transaction history, child views various visualizations and can understand their financial progress through charts and milestones.

### Implementation for User Story 5

- [ ] T116 [P] [US5] Create Pydantic schemas for statistics in backend/src/api/v1/schemas/statistics.py (ChildStatisticsResponse)
- [ ] T117 [US5] Implement StatisticsService in backend/src/services/statistics_service.py with calculate_statistics, check_milestones methods
- [ ] T118 [US5] Create GET /children/{child_id}/statistics endpoint in backend/src/api/v1/routes/children.py implementing FR-024
- [ ] T119 [US5] Implement statistics calculation logic (total deposits, total deductions, net savings) in backend/src/services/statistics_service.py
- [ ] T120 [US5] Implement milestone detection logic (first $10 saved, first 10 transactions, etc.) in backend/src/services/statistics_service.py per acceptance scenario 3
- [ ] T121 [P] [US5] Create TypeScript types in frontend/src/types/statistics.ts for ChildStatistics, Milestone
- [ ] T122 [US5] Create statistics API client methods in frontend/src/services/statisticsService.ts (getStatistics)
- [ ] T123 [P] [US5] Install charting library in frontend/package.json (chart.js or recharts)
- [ ] T124 [P] [US5] Create BalanceChart component in frontend/src/components/BalanceChart.tsx showing balance over time per acceptance scenario 1
- [ ] T125 [P] [US5] Create StatisticsCard component in frontend/src/components/StatisticsCard.tsx displaying total earned, total spent, net savings per acceptance scenario 2
- [ ] T126 [P] [US5] Create MilestoneCard component in frontend/src/components/MilestoneCard.tsx with celebratory badges per acceptance scenario 3
- [ ] T127 [US5] Create ProgressDashboardPage in frontend/src/pages/child/ProgressDashboardPage.tsx with BalanceChart, StatisticsCard, and MilestoneCard components
- [ ] T128 [US5] Implement time period filters (week, month, year, all time) for chart in frontend/src/components/BalanceChart.tsx per acceptance scenario 4
- [ ] T129 [US5] Add celebratory animations for milestone achievements in frontend/src/components/MilestoneCard.tsx
- [ ] T130 [US5] Style progress visualizations with child-friendly colors and icons per FR-025
- [ ] T131 [US5] Add "My Progress" navigation item to child dashboard in frontend/src/pages/child/ChildBalancePage.tsx

**Checkpoint**: All user stories 1-5 are complete. Children have engaging progress visualizations that teach financial literacy.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T132 [P] Update backend/README.md with setup instructions, API documentation links, and architecture overview
- [ ] T133 [P] Update frontend/README.md with development setup, build instructions, and component structure
- [ ] T134 [P] Create predefined avatar asset files in frontend/public/avatars/ (unicorn, dinosaur, robot, cat, dog, etc.)
- [ ] T135 [P] Configure Capacitor for iOS in frontend/capacitor.config.ts with app ID and bundle identifier
- [ ] T136 [P] Configure Capacitor for Android in frontend/capacitor.config.ts with package name
- [ ] T137 [P] Add SQLite database backup script in backend/scripts/backup_database.sh using .backup command
- [ ] T138 [P] Create seed data script in backend/src/scripts/seed_dev_data.py with test family, children, and transactions per quickstart.md
- [ ] T139 [P] Add API request/response logging middleware in backend/src/middleware/logging.py
- [ ] T140 [P] Implement rate limiting middleware in backend/src/middleware/rate_limit.py to prevent abuse
- [ ] T141 [P] Add input sanitization for text fields (names, reasons) in backend/src/api/v1/routes/* to prevent XSS
- [ ] T142 [P] Implement CSRF protection for state-changing operations in backend/src/middleware/csrf.py
- [ ] T143 [P] Add error boundary component in frontend/src/components/ErrorBoundary.tsx for graceful error handling
- [ ] T144 [P] Create loading spinner component in frontend/src/components/LoadingSpinner.tsx for async operations
- [ ] T145 [P] Implement offline detection and retry logic in frontend/src/hooks/useOffline.tsx
- [ ] T146 [P] Add performance monitoring for API endpoints <200ms p95 per performance goals
- [ ] T147 [P] Optimize frontend bundle size for <3 seconds initial load on 3G per performance goals
- [ ] T148 Code cleanup: Remove unused imports, add type annotations, standardize error messages
- [ ] T149 Security audit: Review authentication flows, validate all user inputs, check for SQL injection vulnerabilities
- [ ] T150 Run through quickstart.md validation: Setup database, seed data, test all user flows end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 � P2 � P3 � P4 � P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 transaction functionality but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds request system on top of US1 transactions, independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Extends authentication system, independently testable
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Adds visualizations on top of US1 transaction data, independently testable

### Within Each User Story

- Backend models and services before API endpoints
- Pydantic schemas before API endpoints
- TypeScript types before frontend components
- API client methods before UI components
- Base components before pages that use them
- Core implementation before polish/enhancement

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks (T012-T019: models) can run in parallel
- Within US1: T032-T034 (schemas) can run in parallel, T047-T049 (types) can run in parallel, T053-T055 (components) can run in parallel
- Within US2: T066-T067, T071-T072 can run in parallel
- Within US3: T076-T077, T086-T087, T090-T092 can run in parallel
- Within US4: T101, T106, T108 can run in parallel
- Within US5: T116, T121, T123-T126 can run in parallel
- All Polish tasks marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1

```bash
# After Foundational phase is complete, launch all schemas in parallel:
Task T032: "Create Pydantic schemas for family registration"
Task T033: "Create Pydantic schemas for child management"
Task T034: "Create Pydantic schemas for transactions"

# Launch all TypeScript types in parallel:
Task T047: "Create TypeScript types for auth"
Task T048: "Create TypeScript types for child"
Task T049: "Create TypeScript types for transaction"

# Launch all base components in parallel:
Task T053: "Create Avatar component"
Task T054: "Create BalanceCard component"
Task T055: "Create TransactionList component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T011)
2. Complete Phase 2: Foundational (T012-T031) **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T032-T065)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: A parent can create a family account, add a child with avatar and PIN, make deposits/deductions, and both parent and child can view the balance and transaction history. This is a complete, usable product.

### Incremental Delivery

1. Complete Setup + Foundational (T001-T031) � Foundation ready
2. Add User Story 1 (T032-T065) � Test independently � Deploy/Demo (**MVP!**)
3. Add User Story 2 (T066-T075) � Test independently � Deploy/Demo (Enhanced transaction management)
4. Add User Story 3 (T076-T100) � Test independently � Deploy/Demo (Request system with notifications)
5. Add User Story 4 (T101-T115) � Test independently � Deploy/Demo (Multi-parent support)
6. Add User Story 5 (T116-T131) � Test independently � Deploy/Demo (Progress visualizations)
7. Polish (T132-T150) � Final production-ready release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T031)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T032-T065) - Highest priority MVP
   - **Developer B**: User Story 3 (T076-T100) - Can work in parallel (different endpoints)
   - **Developer C**: User Story 4 (T101-T115) - Can work in parallel (different endpoints)
3. Stories complete and integrate independently
4. Team proceeds to US2 and US5 after MVP validation

---

## Task Count Summary

- **Setup (Phase 1)**: 11 tasks
- **Foundational (Phase 2)**: 20 tasks (blocking all stories)
- **User Story 1 (Phase 3)**: 34 tasks (MVP)
- **User Story 2 (Phase 4)**: 10 tasks
- **User Story 3 (Phase 5)**: 25 tasks
- **User Story 4 (Phase 6)**: 15 tasks
- **User Story 5 (Phase 7)**: 16 tasks
- **Polish (Phase 8)**: 19 tasks
- **Total**: 150 tasks

### Tasks per User Story

- US1: 34 tasks (foundation of the entire app)
- US2: 10 tasks (enhances US1 transaction experience)
- US3: 25 tasks (adds request system and notifications)
- US4: 15 tasks (multi-parent administration)
- US5: 16 tasks (progress visualizations)

### Parallel Opportunities Identified

- 31 tasks marked [P] across all phases can run in parallel within their phase
- 5 user stories can be worked on in parallel after Foundational phase (if team capacity allows)
- Significant parallelization opportunities within US1 (schemas, types, components)

### Suggested MVP Scope

**Minimum Viable Product**: Complete Setup + Foundational + User Story 1 only (65 tasks total)

This delivers:
- Parent family account creation and login
- Child account creation with avatar and PIN
- Deposit and deduction management with pessimistic locking
- Transaction history viewing for both parent and child
- Mobile-ready responsive UI with Ionic Framework

**Estimated effort**: With a single developer working sequentially, this represents approximately 2-3 weeks of full-time work. With multiple developers working in parallel on Setup/Foundational and then splitting US1 components, this could be reduced to 1-2 weeks.

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- SQLite with pessimistic locking (BEGIN IMMEDIATE) simplifies concurrency - no version columns needed
- All paths assume backend/ and frontend/ directories at repository root per plan.md
- Pessimistic locking implementation: Use `BEGIN IMMEDIATE` transactions in TransactionService per research.md
- Authentication uses JWT tokens with provider abstraction for future OAuth support per research.md
- Notifications use database polling (30 seconds) instead of WebSockets per research.md
- React Context API for state management (no Redux) per research.md
- All transaction amounts validated as $0.01-$1,000 per FR-027
- Child-friendly UI per FR-025, minimal parent UI per FR-026
- No tests included as they were not explicitly requested in spec.md
