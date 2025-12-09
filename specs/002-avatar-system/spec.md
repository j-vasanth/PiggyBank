# Feature Specification: Avatar System

**Feature Branch**: `002-avatar-system`
**Created**: 2025-12-09
**Status**: Draft
**Input**: User description: "Add image-based avatars (Minecraft characters like Vindicator, Creeper) alongside existing emoji avatars. Store avatars as SVG/PNG assets with short identifier codes mapped in code."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parent Selects Image Avatar for New Child (Priority: P1)

A parent creates a new child account and can choose from both emoji avatars and new image-based avatars (like Minecraft characters). The selected avatar displays throughout the app on the child's card, transactions, and wherever the child is shown.

**Why this priority**: This is the core functionality - without the ability to select and display image avatars, the feature has no value. This enables parents to set engaging, fun avatars for their children.

**Independent Test**: Can be fully tested by creating a new child, selecting a Minecraft avatar (e.g., Vindicator), and verifying it displays correctly on the dashboard card and transaction pages.

**Acceptance Scenarios**:

1. **Given** a parent is creating a new child account, **When** they reach the avatar selection step, **Then** they should see both emoji options and image-based avatar options (Minecraft characters)
2. **Given** a parent selects a Minecraft Vindicator avatar, **When** the child is created, **Then** the avatar should display as an image (not text) on the child card
3. **Given** a child has an image-based avatar, **When** viewing the child on any page (dashboard, transactions, forms), **Then** the avatar renders as an `<img>` tag with the correct asset
4. **Given** a parent selects an emoji avatar (legacy), **When** the child is created, **Then** the avatar should display as text (emoji character) maintaining backward compatibility

---

### User Story 2 - Existing Child Displays Correctly (Priority: P2)

Existing children with emoji avatars continue to display correctly after the avatar system update. The system detects whether an avatar is an emoji or identifier and renders appropriately.

**Why this priority**: Backward compatibility is essential - existing data must continue working. Without this, the update would break existing child accounts.

**Independent Test**: Can be tested by viewing existing child accounts (with emoji avatars) after deploying the update. All existing avatars should render correctly as emojis.

**Acceptance Scenarios**:

1. **Given** a child has an existing emoji avatar (e.g., "🦖"), **When** the parent views the dashboard, **Then** the avatar displays as the emoji character
2. **Given** a child has an existing emoji avatar, **When** viewing on transactions page, **Then** the avatar displays correctly as emoji
3. **Given** a mix of children (some with emoji, some with image avatars), **When** viewing the dashboard, **Then** each displays in the correct format

---

### User Story 3 - Parent Updates Child's Avatar (Priority: P3)

A parent can change an existing child's avatar, switching between emoji and image-based options. The change reflects immediately across all views.

**Why this priority**: Nice-to-have for flexibility, but the core value is delivered by P1 (initial selection). Children may want to change avatars over time.

**Independent Test**: Can be tested by editing an existing child's profile, selecting a different avatar type, and verifying the change persists and displays.

**Acceptance Scenarios**:

1. **Given** a child has an emoji avatar, **When** parent changes it to a Minecraft avatar, **Then** all views update to show the new image avatar
2. **Given** a child has an image avatar, **When** parent changes it to an emoji, **Then** all views update to show the emoji character

---

### Edge Cases

- What happens when an avatar asset file is missing? System should fall back to a default avatar or placeholder image.
- What happens with invalid avatar identifiers in the database? System renders a fallback (e.g., default user icon).
- How are legacy emoji avatars distinguished from new identifiers? Simple registry lookup - if the avatar value exists in AVATAR_REGISTRY, it's an image; otherwise render as emoji text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store avatar images as SVG or PNG assets in `frontend/src/assets/avatars/`
- **FR-002**: System MUST use short identifier codes (max 10 characters) to reference image avatars (e.g., `mc-vind` for Minecraft Vindicator, `mc-creep` for Minecraft Creeper)
- **FR-003**: System MUST maintain an in-code mapping (TypeScript object) between avatar identifiers and their asset file paths
- **FR-004**: System MUST store the avatar identifier (short code) in the child record in the database (existing VARCHAR(10) field)
- **FR-005**: System MUST support both legacy emoji avatars (stored as emoji characters) and new image-based avatars (stored as identifiers) for backward compatibility
- **FR-006**: System MUST render image-based avatars using `<img>` tags and emoji avatars as text, determined by avatar identifier format
- **FR-007**: System MUST provide an avatar selection interface showing all available avatars (both emoji and image-based) in the AddChild form
- **FR-008**: System MUST display the correct avatar type across all views: dashboard cards, transaction headers, transaction tabs, transaction forms

### Key Entities

- **Avatar Asset**: Image file (PNG/SVG) stored in `frontend/src/assets/avatars/` directory
- **Avatar Mapping**: TypeScript constant mapping identifier codes to asset paths and display names
- **Child.avatar**: Existing database field (VARCHAR 10) storing either emoji character or identifier code

## Clarifications

### Session 2025-12-09

- Q: Should the database schema change? → A: No, the existing VARCHAR(10) field is sufficient for both emoji characters and short identifiers
- Q: Where should the avatar mapping live? → A: In a dedicated TypeScript file in the frontend (e.g., `frontend/src/constants/avatars.ts`)
- Q: How to detect emoji vs identifier? → A: Simple registry lookup - if avatar ID exists in AVATAR_REGISTRY it's an image, otherwise it's an emoji

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parents can select from at least 2 Minecraft avatars (Vindicator, Creeper) plus existing 12 emoji options
- **SC-002**: Image avatars render correctly at all sizes used in the app (64px cards, 56px forms, 20px tabs)
- **SC-003**: Existing children with emoji avatars continue displaying correctly (zero regression)
- **SC-004**: Avatar selection and display adds < 100ms to page load time
- **SC-005**: Avatar assets total < 500KB to maintain fast load times

### Assumptions

- Avatar images will be sourced/created externally and added to the assets folder
- Avatar identifiers use naming convention: `mc-*` for Minecraft, `em-*` for emoji-style images
- No backend changes required - only frontend asset management and rendering logic
