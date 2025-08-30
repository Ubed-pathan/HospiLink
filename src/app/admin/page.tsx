'use client';

import React from 'react';
import MiniBarChart from '@/components/charts/MiniBarChart';
import MiniLineChart from '@/components/charts/MiniLineChart';

export default function AdminHome() {
  const kpis = [
    { label: 'Total Appointments', value: 1247, trend: [89,95,108,112,98,105,118,124,116,132,128,135] },
    { label: 'Total Doctors', value: 86, trend: [60,62,65,68,70,72,75,78,80,83,85,86] },
    { label: 'Total Patients', value: 5230, trend: [4100,4300,4450,4600,4700,4800,4900,5000,5050,5100,5150,5230] },
    { label: 'Avg Rating', value: '4.7', trend: [4.3,4.4,4.5,4.6,4.6,4.7] },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{k.value}</div>
            <div className="mt-3">
              {typeof k.trend[0] === 'number' && k.trend.length > 8 ? (
                <MiniBarChart values={k.trend as number[]} height={48} />
              ) : (
                <MiniLineChart values={k.trend as number[]} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Monthly Appointments</h2>
            <span className="text-sm text-gray-500">This Year</span>
          </div>
          <MiniLineChart values={[89,95,108,112,98,105,118,124,116,132,128,135]} width={640} height={160} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Top Departments</h2>
          <div className="space-y-3">
            {[
              { name: 'Cardiology', count: 320 },
              { name: 'Orthopedics', count: 275 },
              { name: 'Neurology', count: 210 },
            ].map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="text-gray-700">{d.name}</span>
                <span className="text-gray-900 font-medium">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
