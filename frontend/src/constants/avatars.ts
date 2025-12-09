/**
 * Avatar Registry - Single source of truth for all avatar types
 * Supports both image-based avatars and emoji avatars
 */

export interface AvatarEntry {
  type: 'emoji' | 'image';
  name: string;
  src?: string; // Only for image type
}

// Single registry for ALL avatars
export const AVATAR_REGISTRY: Record<string, AvatarEntry> = {
  // Image avatars (Minecraft)
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

// Derived arrays for picker UI
export const AVATAR_OPTIONS = Object.entries(AVATAR_REGISTRY);
export const IMAGE_AVATARS = AVATAR_OPTIONS.filter(([_, entry]) => entry.type === 'image');
export const EMOJI_AVATARS = AVATAR_OPTIONS.filter(([_, entry]) => entry.type === 'emoji');

/**
 * Check if avatar is an image-based avatar
 */
export function isImageAvatar(avatar: string | null): boolean {
  return avatar ? AVATAR_REGISTRY[avatar]?.type === 'image' : false;
}

/**
 * Get image source for avatar
 * Returns null for emoji avatars or unknown avatars
 */
export function getAvatarSrc(avatar: string): string | null {
  const entry = AVATAR_REGISTRY[avatar];
  return entry?.type === 'image' ? entry.src! : null;
}

/**
 * Get display name for avatar
 */
export function getAvatarName(avatar: string): string {
  return AVATAR_REGISTRY[avatar]?.name ?? 'Unknown';
}
