'use client';

import React from 'react';
import MiniBarChart from '@/components/charts/MiniBarChart';
import MiniLineChart from '@/components/charts/MiniLineChart';
import Link from 'next/link';

export default function DoctorHome() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href="/doctor/appointments" className="w-full text-center px-3 py-2 rounded-md border bg-blue-600 text-white hover:bg-blue-700">View Appointments</Link>
          <Link href="/doctor/schedule" className="w-full text-center px-3 py-2 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50">Edit Schedule</Link>
          <Link href="/doctor/patients" className="w-full text-center px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">My Patients</Link>
          <Link href="/doctor/settings" className="w-full text-center px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">Profile & Settings</Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/doctor/appointments" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">Manage</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2.5 pr-4">Time</th>
                  <th className="py-2.5 pr-4">Patient</th>
                  <th className="py-2.5 pr-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { time: '09:00 AM', patient: 'Rahul Sharma', reason: 'Follow-up' },
                  { time: '09:30 AM', patient: 'Anita Desai', reason: 'New Consultation' },
                  { time: '10:15 AM', patient: 'Vikram Rao', reason: 'Lab Results' },
                  { time: '11:00 AM', patient: 'Saira Khan', reason: 'Back Pain' },
                ].map((a, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 pr-4 text-gray-900 font-medium whitespace-nowrap">{a.time}</td>
                    <td className="py-2.5 pr-4 text-gray-900 whitespace-nowrap">{a.patient}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{a.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/doctor/appointments/new" className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">Create Appointment</Link>
            <Link href="/doctor/patients" className="block w-full text-center border border-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50">View Patients</Link>
            <Link href="/doctor/settings" className="block w-full text-center border border-blue-200 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50">Update Profile</Link>
          </div>
          <div className="mt-3 text-xs text-gray-500">Tip: Keep your availability updated in the Schedule tab so patients can book you.</div>
        </div>
      </div>
  </div>
  );
}
