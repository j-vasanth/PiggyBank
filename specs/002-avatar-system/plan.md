# Implementation Plan: Avatar System

**Branch**: `002-avatar-system` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-avatar-system/spec.md`

## Summary

Add image-based avatar support (Minecraft characters) alongside existing emoji avatars. Avatars stored as PNG/SVG assets with short identifier codes (max 10 chars) mapped to file paths in TypeScript. Frontend-only changes - no backend modifications required since existing VARCHAR(10) field supports both emoji characters and short identifiers.

## Technical Context

**Language/Version**: TypeScript with React 18+
**Primary Dependencies**: React, Ionic Framework (existing)
**Storage**: N/A (frontend assets only; database field already exists)
**Testing**: Vitest + React Testing Library (existing)
**Target Platform**: Web SPA + iOS/Android via Capacitor
**Project Type**: Web application (frontend changes only)
**Performance Goals**: < 100ms added to page load; < 500KB total avatar assets
**Constraints**: Avatar identifiers max 10 characters; backward compatible with emoji avatars
**Scale/Scope**: ~4 components to update; 1 new constants file; 2+ avatar assets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | PASS | Direct implementation - single constants file for mapping, simple conditional render logic |
| II. API-First Design | PASS | No API changes required; uses existing child.avatar field |
| III. Incremental Value | PASS | P1 story delivers complete avatar selection + display; P2/P3 are independent |

**No violations requiring justification.**

## Project Structure

### Documentation (this feature)

```text
specs/002-avatar-system/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal - no schema changes)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── assets/
│   │   └── avatars/           # NEW: Avatar image assets
│   │       ├── mc-vind.png    # Minecraft Vindicator
│   │       └── mc-creep.png   # Minecraft Creeper
│   ├── constants/
│   │   └── avatars.ts         # NEW: Avatar mapping and utilities
│   ├── components/
│   │   └── Avatar.tsx         # NEW: Reusable avatar render component
│   └── pages/parent/
│       ├── AddChild.tsx       # UPDATE: Use new avatar picker
│       ├── ParentDashboard.tsx # UPDATE: Use Avatar component
│       ├── Transactions.tsx   # UPDATE: Use Avatar component
│       └── TransactionForm.tsx # UPDATE: Use Avatar component
└── tests/
    └── components/
        └── Avatar.test.tsx    # NEW: Avatar component tests
```

**Structure Decision**: Frontend-only changes following existing web application structure. New assets folder for avatar images, new constants file for mapping, new reusable Avatar component to centralize render logic.

## Complexity Tracking

> No violations to justify - implementation follows simplicity principles.

---

## Phase 0: Research

### Research Questions

1. **Asset Import Strategy**: How to import PNG/SVG assets in Vite/React for optimal bundling?
2. **Emoji Detection**: Reliable method to distinguish emoji characters from identifier strings?
3. **Image Sizing**: How to handle different avatar sizes (64px, 56px, 20px) with single assets?

### Findings

See [research.md](./research.md) for detailed findings.

---

## Phase 1: Design

### Data Model

See [data-model.md](./data-model.md) - No schema changes required. Documents avatar mapping structure.

### Component Design

**Avatar Component** (`frontend/src/components/Avatar.tsx`):
- Props: `avatar: string | null`, `size: 'sm' | 'md' | 'lg' | 'xl'`, `className?: string`
- Logic: Detect if avatar is emoji or identifier, render `<img>` or text accordingly
- Fallback: Default avatar icon if null or invalid

**Avatar Registry** (`frontend/src/constants/avatars.ts`):
```typescript
// Single registry for ALL avatars
export const AVATAR_REGISTRY: Record<string, AvatarEntry> = {
  // Image avatars
  'mc-vind': { type: 'image', name: 'Vindicator', src: '/avatars/mc-vind.png' },
  'mc-creep': { type: 'image', name: 'Creeper', src: '/avatars/mc-creep.png' },
  // Emoji avatars
  '🦄': { type: 'emoji', name: 'Unicorn' },
  '🦖': { type: 'emoji', name: 'Dinosaur' },
  // ... all emojis
};

// Derived array for picker UI
export const AVATAR_OPTIONS = Object.entries(AVATAR_REGISTRY);

export function isImageAvatar(avatar: string | null): boolean {
  return avatar ? AVATAR_REGISTRY[avatar]?.type === 'image' : false;
}
```

### Quickstart

See [quickstart.md](./quickstart.md) for implementation guide.
