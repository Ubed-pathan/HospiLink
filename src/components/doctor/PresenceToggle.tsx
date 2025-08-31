'use client';

import React from 'react';

type PresenceToggleProps = {
  className?: string;
  onChange?: (isPresent: boolean) => void;
  showLabel?: boolean;
};

export default function PresenceToggle({ className = '', onChange, showLabel = true }: PresenceToggleProps) {
  const [isPresent, setIsPresent] = React.useState<boolean>(true);
  const storageKey = 'doctor:isPresent';

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved != null) setIsPresent(saved === 'true');
    } catch {}
  }, []);

  const toggle = () => {
    setIsPresent((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      onChange?.(next);
      return next;
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="presence-toggle">
  {showLabel && <span className="text-sm text-gray-600">Status:</span>}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isPresent}
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-colors ${
          isPresent
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }`}
        title={isPresent ? 'Present' : 'Absent'}
      >
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            isPresent ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-xs font-medium">{isPresent ? 'Present' : 'Absent'}</span>
      </button>
    </div>
  );
}
