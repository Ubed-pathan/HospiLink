'use client';

import React from 'react';

type Slice = { label: string; value: number; color: string };

export default function DonutChart({
  data,
  size = 140,
  thickness = 16,
}: { data: Slice[]; size?: number; thickness?: number }) {
  const total = Math.max(1, data.reduce((a, b) => a + (b.value || 0), 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="donut chart">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {data.map((s, i) => {
          const frac = (s.value || 0) / total;
          const length = frac * circumference;
          const circle = (
            <circle
              key={i}
              r={radius}
              cx={0}
              cy={0}
              fill="transparent"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return circle;
        })}
        {/* inner hole */}
        <circle r={radius - thickness} cx={0} cy={0} fill="white" />
      </g>
    </svg>
  );
}
