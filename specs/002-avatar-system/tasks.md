# Tasks: Avatar System

**Input**: Design documents from `/specs/002-avatar-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested - test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths use web app structure: `frontend/`

---

## Phase 1: Setup

**Purpose**: Create directory structure and add avatar assets

- [x] T001 Create avatar assets directory at `frontend/public/avatars/`
- [ ] T002 [P] Add Minecraft Vindicator image at `frontend/public/avatars/mc-vind.png` **[MANUAL - needs image file]**
- [ ] T003 [P] Add Minecraft Creeper image at `frontend/public/avatars/mc-creep.png` **[MANUAL - needs image file]**

---

## Phase 2: Foundational

**Purpose**: Create shared avatar registry and Avatar component used by all user stories

**Note**: This is a small feature - foundational work IS the core implementation

- [x] T004 Create avatar constants file with AVATAR_REGISTRY and utility functions at `frontend/src/constants/avatars.ts`
- [x] T005 Create reusable Avatar component at `frontend/src/components/Avatar.tsx`
- [x] T006 [P] Create Avatar component styles at `frontend/src/components/Avatar.css`

**Checkpoint**: Avatar registry and component ready for integration

---

## Phase 3: User Story 1 - Parent Selects Image Avatar for New Child (Priority: P1)

**Goal**: Parents can select from both emoji and image avatars when creating a child. Avatar displays correctly across all views.

**Independent Test**: Create a new child with Minecraft Vindicator avatar, verify it displays as image on dashboard, transactions, and forms.

### Implementation for User Story 1

- [x] T007 [US1] Update AddChild.tsx to import and use AVATAR_OPTIONS from constants at `frontend/src/pages/parent/AddChild.tsx`
- [x] T008 [US1] Update AddChild.tsx avatar picker to render images for image-type avatars at `frontend/src/pages/parent/AddChild.tsx`
- [x] T009 [US1] Update ParentDashboard.tsx to use Avatar component for child cards at `frontend/src/pages/parent/ParentDashboard.tsx`
- [x] T010 [P] [US1] Update Transactions.tsx to use Avatar component for tabs and header at `frontend/src/pages/parent/Transactions.tsx`
- [x] T011 [P] [US1] Update TransactionForm.tsx to use Avatar component at `frontend/src/pages/parent/TransactionForm.tsx`

**Checkpoint**: New children can be created with image avatars, displayed correctly everywhere

---

## Phase 4: User Story 2 - Existing Child Displays Correctly (Priority: P2)

**Goal**: Backward compatibility - existing children with emoji avatars continue displaying correctly.

**Independent Test**: View existing child accounts with emoji avatars after update. All should render as emoji text.

### Implementation for User Story 2

- [x] T012 [US2] Verify Avatar component handles emoji fallback correctly (null/unknown renders default) at `frontend/src/components/Avatar.tsx`
- [x] T013 [US2] Test with existing child data - verify emoji avatars render as text at `frontend/src/components/Avatar.tsx`

**Checkpoint**: Both new image avatars and legacy emoji avatars display correctly

---

## Phase 5: User Story 3 - Parent Updates Child's Avatar (Priority: P3)

**Goal**: Parents can change an existing child's avatar between emoji and image types.

**Independent Test**: Edit existing child, change avatar from emoji to Minecraft character (or vice versa), verify change persists and displays.

### Implementation for User Story 3

- [x] T014 [US3] Verify existing edit child flow supports avatar changes (check if ManageFamily or similar has edit) - research at `frontend/src/pages/parent/` **[RESULT: No edit child UI exists]**
- [ ] T015 [US3] If edit UI exists: update to use AVATAR_OPTIONS for avatar picker at `frontend/src/pages/parent/ManageFamily.tsx` **[SKIPPED - no edit UI]**
- [x] T016 [US3] If no edit UI: document as future enhancement in spec (no code change needed) **[Avatar editing is future enhancement]**

**Checkpoint**: Avatar changes work end-to-end (if edit UI exists)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [x] T017 [P] Remove old AVATAR_OPTIONS constant from AddChild.tsx (now in constants/avatars.ts) at `frontend/src/pages/parent/AddChild.tsx`
- [ ] T018 [P] Verify avatar assets are under 500KB total at `frontend/public/avatars/` **[BLOCKED - needs T002/T003 image assets]**
- [ ] T019 Run quickstart.md verification steps **[BLOCKED - needs T002/T003 image assets]**
- [ ] T020 Manual test all avatar sizes (sm, md, lg, xl) across views **[BLOCKED - needs T002/T003 image assets]**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup (assets must exist)
- **User Stories (Phase 3-5)**: All depend on Foundational (registry + component must exist)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only - core feature
- **User Story 2 (P2)**: Depends on Phase 2 only - can run parallel to US1
- **User Story 3 (P3)**: Depends on Phase 2 only - can run parallel to US1/US2

### Within Phases

- T002, T003 can run in parallel (different files)
- T005, T006 can run in parallel (component + styles)
- T010, T011 can run in parallel (different page files)

---

## Parallel Example: Setup Phase

```bash
# After T001 creates directory, launch asset additions in parallel:
Task: "Add Minecraft Vindicator image at frontend/public/avatars/mc-vind.png"
Task: "Add Minecraft Creeper image at frontend/public/avatars/mc-creep.png"
```

## Parallel Example: User Story 1 Page Updates

```bash
# After T009 (dashboard), these can run in parallel:
Task: "Update Transactions.tsx to use Avatar component"
Task: "Update TransactionForm.tsx to use Avatar component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (add assets)
2. Complete Phase 2: Foundational (registry + component)
3. Complete Phase 3: User Story 1 (integrate into all pages)
4. **STOP and VALIDATE**: Test creating child with image avatar
5. Deploy if ready - core value delivered

### Incremental Delivery

1. Setup + Foundational → Avatar system ready
2. User Story 1 → Image avatar selection works → **MVP Complete**
3. User Story 2 → Backward compatibility verified
4. User Story 3 → Avatar editing (if UI exists)
5. Polish → Cleanup and final validation

---

## Notes

- Frontend-only feature - no backend changes
- Existing VARCHAR(10) field supports both emoji and identifiers
- Avatar images must be added manually (not generated)
- Total tasks: 20
- User Story 1: 5 tasks (core feature)
- User Story 2: 2 tasks (compatibility verification)
- User Story 3: 3 tasks (edit flow, may be N/A)
- Setup/Foundational/Polish: 10 tasks
