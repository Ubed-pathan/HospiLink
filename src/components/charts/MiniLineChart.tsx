'use client';

import React from 'react';

type MiniLineChartProps = {
  values: number[];
  height?: number;
  width?: number;
  stroke?: string;
  fill?: string;
};

export default function MiniLineChart({
  values,
  height = 56,
  width = 140,
  stroke = '#16A34A',
  fill = 'rgba(22,163,74,0.1)'
}: MiniLineChartProps) {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const dx = width / Math.max(1, values.length - 1);
  const mapY = (v: number) => {
    const range = max - min || 1;
    return height - ((v - min) / range) * (height - 6) - 3;
  };
  const points = values.map((v, i) => `${i * dx},${mapY(v)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="line chart">
      <polyline points={`0,${height} ${points} ${width},${height}`} fill={fill} stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>
  );
}
