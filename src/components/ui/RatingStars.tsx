"use client";

import React from 'react';
import { Star } from 'lucide-react';

type RatingStarsProps = {
  value: number; // 1..max
  onChange: (value: number) => void;
  max?: number; // default 5
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string; // accessible label for the group
};

export default function RatingStars({
  value,
  onChange,
  max = 5,
  disabled = false,
  size = 'md',
  className = '',
  label = 'Rating',
}: RatingStarsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const current = hovered ?? value;
  const iconSize = size === 'lg' ? 28 : size === 'sm' ? 18 : 22;

  const clamp = (n: number) => Math.min(Math.max(n, 1), max);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(value + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(value - 1));
    } else if (e.key >= '1' && e.key <= String(max)) {
      const num = Number(e.key);
      onChange(clamp(num));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`inline-flex items-center gap-1 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const active = current >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
            disabled={disabled}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(null)}
            onClick={() => !disabled && onChange(n)}
            className={`p-1 rounded transition-colors ${!disabled ? 'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}`}
          >
            <Star
              width={iconSize}
              height={iconSize}
              className={`${active ? 'text-yellow-400' : 'text-gray-300'}`}
              strokeWidth={2.2}
              // When active, fill with current text color to render a solid star
              fill={active ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
}
