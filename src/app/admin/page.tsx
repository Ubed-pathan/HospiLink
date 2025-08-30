'use client';

import React from 'react';
import MiniBarChart from '@/components/charts/MiniBarChart';
import MiniLineChart from '@/components/charts/MiniLineChart';
import Link from 'next/link';
import { mockAppointments, mockDoctors, mockDepartments } from '@/lib/mockData';

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
            {mockDepartments.slice(0, 3).map((d) => {
              const count = mockAppointments.filter((a) => a.departmentId === d.id).length;
              return (
                <div key={d.id} className="flex items-center justify-between">
                  <span className="text-gray-700">{d.name}</span>
                  <span className="text-gray-900 font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Doctor</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAppointments.slice(0, 6).map((a) => {
                  const doc = mockDoctors.find((d) => d.id === a.doctorId);
                  const dept = mockDepartments.find((d) => d.id === (a.departmentId || doc?.departmentId));
                  return (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-900">{a.date}</td>
                      <td className="py-2 pr-4">{a.time || a.timeSlot || '-'}</td>
                      <td className="py-2 pr-4">{doc ? `Dr. ${doc.name}` : '-'}</td>
                      <td className="py-2 pr-4">{dept?.name || '-'}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs border ${a.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : a.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Top Doctors</h2>
          <div className="space-y-3">
            {mockDoctors
              .slice(0, 5)
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">Dr. {d.name}</div>
                    <div className="text-xs text-gray-500">{d.specialization}</div>
                  </div>
                  <div className="text-sm text-gray-700">⭐ {d.rating?.toFixed ? d.rating.toFixed(1) : d.rating}</div>
                </div>
              ))}
          </div>
          <div className="mt-4">
            <Link href="/admin/doctors" className="text-sm text-blue-600 hover:underline">Manage doctors</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
