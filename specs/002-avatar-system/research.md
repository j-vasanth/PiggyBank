# Research: Avatar System

**Feature**: 002-avatar-system
**Date**: 2025-12-09

## Research Question 1: Asset Import Strategy

**Question**: How to import PNG/SVG assets in Vite/React for optimal bundling?

**Decision**: Use Vite's static asset handling with assets in `public/avatars/` directory

**Rationale**:
- Vite automatically handles static assets in `public/` directory
- Assets referenced via URL path (e.g., `/avatars/mc-vind.png`)
- No import statements needed - cleaner mapping code
- Assets served as-is without bundling, allowing cache headers
- Consistent path regardless of component location

**Alternatives Considered**:
1. **Import statements** (`import avatar from './mc-vind.png'`): Requires importing in mapping file, bundles into JS, complicates dynamic loading
2. **Assets in src/assets/**: Works but requires import; Vite adds hash to filename making dynamic references harder
3. **External CDN**: Adds external dependency, complicates offline/Capacitor deployment

**Implementation**:
```typescript
// Store assets in: frontend/public/avatars/mc-vind.png
// Reference as: '/avatars/mc-vind.png'
export const AVATAR_REGISTRY: Record<string, AvatarAsset> = {
  'mc-vind': { src: '/avatars/mc-vind.png', name: 'Vindicator' },
  'mc-creep': { src: '/avatars/mc-creep.png', name: 'Creeper' },
};
```

---

## Research Question 2: Emoji Detection

**Question**: Reliable method to distinguish emoji characters from identifier strings?

**Decision**: Simple registry lookup - if avatar ID exists in `AVATAR_REGISTRY`, it's an image avatar

**Rationale**:
- `AVATAR_REGISTRY` only contains image avatars
- Single lookup: `avatar in AVATAR_REGISTRY` → image, otherwise → emoji
- No string parsing, pattern matching, or regex needed
- Type information already exists in `AVATAR_OPTIONS.type` for selection UI

**Alternatives Considered**:
1. **Emoji regex**: Complex, varies by platform, unnecessary
2. **Hyphen pattern matching**: Overcomplicated when registry lookup is sufficient
3. **Type field in database**: Requires schema change, unnecessary

**Implementation**:
```typescript
export function isImageAvatar(avatar: string | null): boolean {
  if (!avatar) return false;
  return avatar in AVATAR_REGISTRY;
}
```

---

## Research Question 3: Image Sizing

**Question**: How to handle different avatar sizes (64px, 56px, 20px) with single assets?

**Decision**: Use CSS `object-fit: cover` with container sizing; provide single high-res asset (128px or 256px)

**Rationale**:
- Single asset simplifies management
- CSS handles scaling to any size
- `object-fit: cover` maintains aspect ratio
- 128px source is sufficient for all current sizes (max used is 64px)
- Keeps asset file sizes small (< 50KB each for PNG at 128px)

**Alternatives Considered**:
1. **Multiple sizes per avatar**: More assets to manage, overkill for simple use case
2. **SVG only**: Perfect scaling but Minecraft pixel art loses character as SVG
3. **srcset**: HTML picture element complexity, not needed for small size range

**Implementation**:
```typescript
// Avatar component handles sizing via CSS
const sizeMap = {
  sm: '20px',   // Tabs
  md: '44px',   // Transaction items
  lg: '56px',   // Transaction form
  xl: '64px',   // Dashboard cards
};

// CSS applied to both img and emoji container
<div style={{ width: size, height: size }}>
  {isImage ? (
    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    <span style={{ fontSize: `calc(${size} * 0.6)` }}>{avatar}</span>
  )}
</div>
```

---

## Summary

| Question | Decision | Key Benefit |
|----------|----------|-------------|
| Asset Import | `public/avatars/` directory | Simple URL paths, no bundling |
| Emoji Detection | Registry lookup | Single `in` check, uses existing data |
| Image Sizing | Single 128px asset + CSS | One asset per avatar |

All questions resolved. Ready to proceed to Phase 1 design.
