"use client";

import React from 'react';
import MiniBarChart from '@/components/charts/MiniBarChart';
import MiniLineChart from '@/components/charts/MiniLineChart';
import Link from 'next/link';
import { mockDoctors } from '@/lib/mockData';
import { adminUserAPI, doctorAPI, adminAppointmentAPI } from '@/lib/api-services';
import { AppointmentDtoForAdminDashboard, Doctor } from '@/lib/types';

export default function AdminHome() {
  const now = React.useMemo(() => new Date(), []);
  const [apptCounts, setApptCounts] = React.useState<{ total: number; month: number; today: number } | null>(null);
  const [loadingAppts, setLoadingAppts] = React.useState(false);
  const [apptsError, setApptsError] = React.useState<string | null>(null);
  const [doctorCount, setDoctorCount] = React.useState<number | null>(null);
  const [userCount, setUserCount] = React.useState<number | null>(null);
  const [loadingCounts, setLoadingCounts] = React.useState(false);
  const [countsError, setCountsError] = React.useState<string | null>(null);

  // Top Departments state
  const [appointments, setAppointments] = React.useState<AppointmentDtoForAdminDashboard[] | null>(null);
  const [doctors, setDoctors] = React.useState<Doctor[] | null>(null);
  // Fetch doctors and appointments for Top Departments
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [docs, appts] = await Promise.all([
          doctorAPI.getAllDoctors().catch((e: unknown) => { throw new Error((e as Error)?.message || 'Doctors fetch failed'); }),
          adminAppointmentAPI.getAllForDashboard().catch((e: unknown) => { throw new Error((e as Error)?.message || 'Appointments fetch failed'); })
        ]);
        if (!active) return;
        setDoctors(Array.isArray(docs) ? docs : []);
        setAppointments(Array.isArray(appts) ? appts : []);
      } catch (_err: unknown) {
        if (!active) return;
        // Show error only if both fail
        setDoctors([]);
        setAppointments([]);
      }
    })();
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoadingCounts(true);
      setCountsError(null);
      try {
        const [doctors, users] = await Promise.all([
          doctorAPI.getAllDoctors().catch((e: unknown) => { throw new Error((e as Error)?.message || 'Doctors fetch failed'); }),
          adminUserAPI.list().catch((e: unknown) => { throw new Error((e as Error)?.message || 'Users fetch failed'); }),
        ]);
        if (!active) return;
        setDoctorCount(Array.isArray(doctors) ? doctors.length : 0);
        setUserCount(Array.isArray(users) ? users.length : 0);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Failed to load counts';
        setCountsError(msg);
      } finally {
        if (active) setLoadingCounts(false);
      }
    })();
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoadingAppts(true);
      setApptsError(null);
      try {
        const list = await adminAppointmentAPI.getAllForDashboard();
        if (!active) return;
        const total = Array.isArray(list) ? list.length : 0;
        const y = now.getFullYear();
        const m = now.getMonth();
        const day = now.getDate();
        const parseDate = (primary?: string, alt1?: string, alt2?: string) => {
          const src = primary || alt1 || alt2;
          return src ? new Date(src) : null;
        };
        const isSameYM = (d: Date) => d.getFullYear() === y && d.getMonth() === m;
        const isSameYMD = (d: Date) => isSameYM(d) && d.getDate() === day;
        let month = 0;
        let today = 0;
        for (const a of list) {
          const d = parseDate(a.appointmentTime, a.appointmentDateTime, a.createdAt);
          if (!d || isNaN(d.getTime())) continue;
          if (isSameYM(d)) month += 1;
          if (isSameYMD(d)) today += 1;
        }
        setApptCounts({ total, month, today });
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Failed to load appointments';
        setApptsError(msg);
      } finally {
        if (active) setLoadingAppts(false);
      }
    })();
    return () => { active = false; };
  }, [now]);

  const kpis = [
    { label: 'Total Appointments', value: apptCounts?.total ?? (loadingAppts ? '...' : 0), trend: [89,95,108,112,98,105,118,124,116,132,128,135] },
    { label: 'This Month', value: apptCounts?.month ?? (loadingAppts ? '...' : 0), trend: [12,18,22,28,19,24] },
    { label: 'Today', value: apptCounts?.today ?? (loadingAppts ? '...' : 0), trend: [3,5,4,6] },
    { label: 'Total Doctors', value: doctorCount ?? '—', trend: [60,62,65,68,70,72,75,78,80,83,85,86] },
    { label: 'Registered Users', value: userCount ?? '—', trend: [4100,4300,4450,4600,4700,4800,4900,5000,5050,5100,5150,5230] },
    { label: 'Avg Rating', value: '4.7', trend: [4.3,4.4,4.5,4.6,4.6,4.7] },
  ];

  return (
  <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {countsError && (
          <div className="sm:col-span-2 lg:col-span-4 p-3 border border-yellow-200 bg-yellow-50 text-yellow-800 rounded text-sm">
            {countsError}
          </div>
        )}
        {apptsError && (
          <div className="sm:col-span-2 lg:col-span-4 p-3 border border-yellow-200 bg-yellow-50 text-yellow-800 rounded text-sm">
            {apptsError}
          </div>
        )}
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{loadingCounts && (k.label === 'Total Doctors' || k.label === 'Registered Users') ? '...' : k.value}</div>
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
      <span className="text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">This Year</span>
          </div>
          <MiniLineChart values={[89,95,108,112,98,105,118,124,116,132,128,135]} width={640} height={160} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Top Departments</h2>
          <div className="space-y-3">
            {(!doctors || !appointments) ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              (() => {
                // Build department name list from doctors
                const deptNames = Array.from(new Set(doctors.map(d => (d.department || d.specialization || '').trim()).filter(Boolean)));
                // Count appointments per department name
                const deptCounts = deptNames.map(name => ({
                  name,
                  count: appointments.filter(a => {
                    const doc = doctors.find(d => d.id === a.doctorId);
                    const docDept = (doc?.department || doc?.specialization || '').trim();
                    return docDept === name;
                  }).length
                }));
                // Sort and show top 3
                return deptCounts.sort((a, b) => b.count - a.count).slice(0, 3).map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="text-gray-700">{d.name}</span>
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">{d.count}</span>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
    <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
    <Link href="/admin/appointments" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2.5 pr-4">Date</th>
                  <th className="py-2.5 pr-4">Time</th>
                  <th className="py-2.5 pr-4">Doctor</th>
                  <th className="py-2.5 pr-4">Reason</th>
                  <th className="py-2.5 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments && doctors
                  ? appointments.map((a) => {
                      // Locate doctor by id; if missing, try by full name
                      let doc: Doctor | undefined;
                      if (a.doctorId) {
                        doc = doctors.find((d) => d.id === a.doctorId);
                      }
                      if (!doc && a.doctorsFullName) {
                        const name = a.doctorsFullName.replace(/^dr\.?\s+/i, '').trim().toLowerCase();
                        doc = doctors.find((d) => (d.name || '').trim().toLowerCase() === name || (`dr. ${d.name}`.toLowerCase() === a.doctorsFullName!.toLowerCase()));
                      }
                      // Date/time formatting dd/MM/yyyy and hh:mm am/pm
                      const dateSrc = a.appointmentTime || a.appointmentDateTime || a.createdAt;
                      let dateStr = '—';
                      let timeStr = '—';
                      if (dateSrc) {
                        const d = new Date(dateSrc);
                        if (!isNaN(d.getTime())) {
                          const dd = String(d.getDate()).padStart(2, '0');
                          const mm = String(d.getMonth() + 1).padStart(2, '0');
                          const yyyy = d.getFullYear();
                          dateStr = `${dd}/${mm}/${yyyy}`;
                          const hrs = d.getHours();
                          const mins = String(d.getMinutes()).padStart(2, '0');
                          const am = hrs < 12;
                          const hrs12 = String(((hrs + 11) % 12) + 1).padStart(2, '0');
                          timeStr = `${hrs12}:${mins} ${am ? 'am' : 'pm'}`;
                        }
                      }
                      const docName = a.doctorsFullName || (doc ? `Dr. ${doc.name}` : '—');
                      const statusRaw = a.appointmentStatus || a.AppointmentStatus || a.status || '';
                      const s = statusRaw.toString().toUpperCase();
                      const cls = s.includes('COMPLETE')
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : s.includes('CANCEL')
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : s.includes('CONFIRM') || s.includes('SCHEDULE')
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200';
                      return (
                        <tr key={a.appointmentId || a.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 pr-4 text-gray-900 whitespace-nowrap">{dateStr}</td>
                          <td className="py-2.5 pr-4 text-gray-900 font-medium whitespace-nowrap">{timeStr}</td>
                          <td className="py-2.5 pr-4 text-gray-900 font-medium whitespace-nowrap">{docName}</td>
                          <td className="py-2.5 pr-4 max-w-[220px]">
                            <div className="text-gray-900 text-xs sm:text-sm truncate" title={a.reason || ''}>{a.reason || '—'}</div>
                          </td>
                          <td className="py-2.5 pr-4">
                            {s ? (
                              <span className={`px-2 py-0.5 rounded text-xs border ${cls}`}>{s}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  : null}
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
      <div className="text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">⭐ {d.rating?.toFixed ? d.rating.toFixed(1) : d.rating}</div>
                </div>
              ))}
          </div>
          <div className="mt-4">
    <Link href="/admin/doctors" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">Manage doctors</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
