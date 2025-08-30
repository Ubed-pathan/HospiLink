'use client';

import React from 'react';

type MiniBarChartProps = {
  values: number[];
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  highlightIndex?: number;
};

export default function MiniBarChart({
  values,
  height = 48,
  barWidth = 6,
  gap = 4,
  color = '#2563EB',
  highlightIndex,
}: MiniBarChartProps) {
  const max = Math.max(1, ...values);
  const width = values.length * barWidth + (values.length - 1) * gap;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="bar chart">
      {values.map((v, i) => {
        const h = Math.max(1, Math.round((v / max) * (height - 4)));
        const x = i * (barWidth + gap);
        const y = height - h;
        const isHi = typeof highlightIndex === 'number' && highlightIndex === i;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={2}
            fill={isHi ? '#1D4ED8' : color}
            opacity={isHi ? 1 : 0.85}
          />
        );
      })}
    </svg>
  );
}
