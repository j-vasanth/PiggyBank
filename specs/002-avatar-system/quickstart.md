# Quickstart: Avatar System Implementation

**Feature**: 002-avatar-system
**Date**: 2025-12-09

## Prerequisites

- Avatar image assets (PNG, ~128px) for Minecraft characters
- Running development environment (`npm run dev` in frontend/)

## Implementation Order

### Step 1: Add Avatar Assets

```bash
# Create directory
mkdir -p frontend/public/avatars

# Add avatar images (provided externally)
# - frontend/public/avatars/mc-vind.png   (Minecraft Vindicator)
# - frontend/public/avatars/mc-creep.png  (Minecraft Creeper)
```

### Step 2: Create Avatar Constants

Create `frontend/src/constants/avatars.ts`:

```typescript
export interface AvatarEntry {
  type: 'emoji' | 'image';
  name: string;
  src?: string;  // Only for image type
}

// Single registry for ALL avatars
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

// Derived array for picker UI: [id, entry][]
export const AVATAR_OPTIONS = Object.entries(AVATAR_REGISTRY);

export function isImageAvatar(avatar: string | null): boolean {
  return avatar ? AVATAR_REGISTRY[avatar]?.type === 'image' : false;
}

export function getAvatarSrc(avatar: string): string | null {
  const entry = AVATAR_REGISTRY[avatar];
  return entry?.type === 'image' ? entry.src! : null;
}
```

### Step 3: Create Avatar Component

Create `frontend/src/components/Avatar.tsx`:

```typescript
import React from 'react';
import { isImageAvatar, getAvatarSrc } from '../constants/avatars';
import './Avatar.css';

interface AvatarProps {
  avatar: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 20,
  md: 44,
  lg: 56,
  xl: 64,
};

export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  size = 'lg',
  className = '',
}) => {
  const dimension = sizeMap[size];
  const isImage = avatar && isImageAvatar(avatar);
  const src = avatar ? getAvatarSrc(avatar) : null;

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {isImage && src ? (
        <img
          src={src}
          alt="Avatar"
          className="avatar__image"
        />
      ) : (
        <span className="avatar__emoji">
          {avatar || '👤'}
        </span>
      )}
    </div>
  );
};
```

Create `frontend/src/components/Avatar.css`:

```css
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--kash-gold-500) 0%, var(--kash-gold-400) 100%);
  overflow: hidden;
  flex-shrink: 0;
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__emoji {
  line-height: 1;
}

.avatar--sm .avatar__emoji { font-size: 12px; }
.avatar--md .avatar__emoji { font-size: 24px; }
.avatar--lg .avatar__emoji { font-size: 28px; }
.avatar--xl .avatar__emoji { font-size: 32px; }
```

### Step 4: Update AddChild Avatar Picker

Update `frontend/src/pages/parent/AddChild.tsx`:

```typescript
// Replace existing AVATAR_OPTIONS import
import { AVATAR_OPTIONS } from '../../constants/avatars';

// Update avatar picker grid to handle both types
// AVATAR_OPTIONS is [id, entry][] from Object.entries()
{AVATAR_OPTIONS.map(([id, entry]) => (
  <button
    key={id}
    type="button"
    className={`avatar-option ${formData.avatar === id ? 'selected' : ''}`}
    onClick={() => setFormData({ ...formData, avatar: id })}
  >
    {entry.type === 'image' ? (
      <img src={entry.src} alt={entry.name} />
    ) : (
      <span>{id}</span>
    )}
  </button>
))}
```

### Step 5: Update Display Components

Replace inline avatar rendering in these files with the Avatar component:

**ParentDashboard.tsx**:
```typescript
import { Avatar } from '../../components/Avatar';

// Replace: <div className="child-card__avatar">{child.avatar || '👤'}</div>
// With:    <Avatar avatar={child.avatar} size="xl" className="child-card__avatar" />
```

**Transactions.tsx**:
```typescript
import { Avatar } from '../../components/Avatar';

// Child tabs: <Avatar avatar={child.avatar} size="sm" />
// Child header: <Avatar avatar={selectedChild.avatar} size="xl" />
```

**TransactionForm.tsx**:
```typescript
import { Avatar } from '../../components/Avatar';

// Replace: <div className="transaction-form__avatar">{child.avatar || '👤'}</div>
// With:    <Avatar avatar={child.avatar} size="lg" />
```

## Verification

1. **New Child with Image Avatar**:
   - Go to Add Child
   - Select Minecraft Vindicator
   - Create child
   - Verify image displays on dashboard

2. **Existing Child with Emoji**:
   - View dashboard with existing children
   - Verify emoji avatars still display correctly

3. **All Views**:
   - Check avatar displays on: Dashboard, Transactions tabs, Transaction header, Deposit/Deduct forms

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Image not loading | Check file exists in `public/avatars/` |
| Wrong size | Verify size prop matches expected dimension |
| Emoji showing for image avatar | Check identifier matches AVATAR_REGISTRY key exactly |
