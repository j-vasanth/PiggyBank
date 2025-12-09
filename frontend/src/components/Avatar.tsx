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
