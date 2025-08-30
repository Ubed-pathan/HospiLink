'use client';

import React from 'react';
import MiniBarChart from '@/components/charts/MiniBarChart';
import MiniLineChart from '@/components/charts/MiniLineChart';
import Link from 'next/link';

export default function DoctorHome() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <Link href="/doctor/appointments" className="px-3 py-2 rounded-md border bg-blue-600 text-white hover:bg-blue-700">View Appointments</Link>
          <Link href="/doctor/schedule" className="px-3 py-2 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50">Edit Schedule</Link>
          <Link href="/doctor/patients" className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">My Patients</Link>
          <Link href="/doctor/settings" className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">Profile & Settings</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { label: 'Today Appointments', value: 14, trend: [8,10,12,11,14] },
          { label: 'This Week', value: 52, trend: [9,11,13,12,7,0,0] },
          { label: 'Pending Reviews', value: 6, trend: [2,1,3,4,3,2] },
          { label: 'Avg Rating', value: '4.8', trend: [4.6,4.7,4.7,4.8] },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{k.value}</div>
            <div className="mt-3">
              {k.label === 'Avg Rating' ? (
                <MiniLineChart values={k.trend as number[]} />
              ) : (
                <MiniBarChart values={k.trend as number[]} height={48} />
              )}
            </div>
          </div>
        ))}
      </div>

  <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
          <span className="text-sm text-gray-500">Next 24 hours</span>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { time: '09:00 AM', patient: 'Rahul Sharma', reason: 'Follow-up' },
            { time: '09:30 AM', patient: 'Anita Desai', reason: 'New Consultation' },
            { time: '10:15 AM', patient: 'Vikram Rao', reason: 'Lab Results' },
            { time: '11:00 AM', patient: 'Saira Khan', reason: 'Back Pain' },
          ].map((a, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div>
                <div className="text-gray-900 font-medium">{a.time}</div>
                <div className="text-sm text-gray-500">{a.patient}</div>
              </div>
              <div className="text-sm text-gray-700">{a.reason}</div>
            </div>
          ))}
  </div>
  <div className="mt-3 text-xs text-gray-500">Tip: Keep your availability updated in the Schedule tab so patients can book you.</div>
      </div>
    </div>
  );
}
