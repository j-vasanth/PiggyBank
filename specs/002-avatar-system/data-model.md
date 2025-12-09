# Data Model: Avatar System

**Feature**: 002-avatar-system
**Date**: 2025-12-09

## Overview

No database schema changes required. This feature uses the existing `child.avatar` VARCHAR(10) field which can store either:
- Emoji characters (e.g., `🦖`) - legacy format
- Short identifier codes (e.g., `mc-vind`) - new format

## Existing Schema (No Changes)

### Child Table

```sql
-- backend/src/models/child.py (existing)
CREATE TABLE child (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar VARCHAR(10),          -- Stores emoji OR identifier (max 10 chars)
    pin_hash TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES family(id)
);
```

**Avatar Field**:
- Type: VARCHAR(10)
- Nullable: Yes (fallback to default avatar)
- Contents: Emoji character OR short identifier code

## Frontend Data Structures

### Avatar Registry (Single Source of Truth)

```typescript
// frontend/src/constants/avatars.ts

interface AvatarEntry {
  type: 'emoji' | 'image';
  name: string;
  src?: string;  // Only for image type
}

// Single registry for ALL avatars (both emoji and image)
export const AVATAR_REGISTRY: Record<string, AvatarEntry> = {
  // Image avatars
  'mc-vind': { type: 'image', name: 'Vindicator', src: '/avatars/mc-vind.png' },
  'mc-creep': { type: 'image', name: 'Creeper', src: '/avatars/mc-creep.png' },

  // Emoji avatars
  '🦄': { type: 'emoji', name: 'Unicorn' },
  '🦖': { type: 'emoji', name: 'Dinosaur' },
  '🤖': { type: 'emoji', name: 'Robot' },
  '🐱': { type: 'emoji', name: 'Cat' },
  '🐶': { type: 'emoji', name: 'Dog' },
  '🐼': { type: 'emoji', name: 'Panda' },
  '🦁': { type: 'emoji', name: 'Lion' },
  '🐵': { type: 'emoji', name: 'Monkey' },
  '🐧': { type: 'emoji', name: 'Penguin' },
  '🐋': { type: 'emoji', name: 'Whale' },
  '🦋': { type: 'emoji', name: 'Butterfly' },
  '🚀': { type: 'emoji', name: 'Rocket' },
};

// Derived: array of [id, entry] for picker UI
export const AVATAR_OPTIONS = Object.entries(AVATAR_REGISTRY);
```

### Utility Functions

```typescript
// frontend/src/constants/avatars.ts

export function isImageAvatar(avatar: string | null): boolean {
  return avatar ? AVATAR_REGISTRY[avatar]?.type === 'image' : false;
}

export function getAvatarSrc(avatar: string): string | null {
  const entry = AVATAR_REGISTRY[avatar];
  return entry?.type === 'image' ? entry.src! : null;
}

export function getAvatarName(avatar: string): string {
  return AVATAR_REGISTRY[avatar]?.name ?? 'Unknown';
}
```

## Validation Rules

| Field | Rule | Enforcement |
|-------|------|-------------|
| avatar | Max 10 characters | Backend schema + frontend form |
| avatar | Either valid emoji or valid identifier | Frontend validation before save |
| avatar | Identifier must exist in AVATAR_REGISTRY | Frontend rendering fallback |

## Backward Compatibility

Existing children with emoji avatars require no migration:

| Existing Data | Detection | Rendering |
|---------------|-----------|-----------|
| `🦖` | Not in AVATAR_REGISTRY → emoji | Render as text |
| `🐱` | Not in AVATAR_REGISTRY → emoji | Render as text |
| `mc-vind` | In AVATAR_REGISTRY → image | Render as `<img>` |
| `invalid` | Not in AVATAR_REGISTRY → emoji | Render as text (fallback) |
