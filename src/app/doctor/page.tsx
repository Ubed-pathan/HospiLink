'use client';

import React from 'react';
import Link from 'next/link';
import MiniBarChart from '@/components/charts/MiniBarChart';
import MiniLineChart from '@/components/charts/MiniLineChart';
import { adminAppointmentAPI, doctorAPI, reviewAPI } from '@/lib/api-services';

type AdminAppt = import('@/lib/types').AppointmentDtoForAdminDashboard;
type Doctor = import('@/lib/types').Doctor;

function parseApptDate(a: AdminAppt): Date | null {
  const ts = a.appointmentTime || a.appointmentDateTime || a.createdAt;
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

function formatTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mm = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${hours}:${mm} ${ampm}`;
}

function getStatus(a: AdminAppt): string {
  const anyA = a as AdminAppt & { appointmentStatus?: string; AppointmentStatus?: string };
  return (
    a.status || anyA.appointmentStatus || anyA.AppointmentStatus || ''
  )
    .toString()
    .toLowerCase();
}

function getUserEmailLocal(a: AdminAppt): string | undefined {
  const withEmail = a as AdminAppt & { usersEmail?: string };
  const email = withEmail.usersEmail;
  return email ? email.split('@')[0] : undefined;
}

export default function DoctorHome() {
  const [loading, setLoading] = React.useState(true);
  const [, setError] = React.useState<string | null>(null);
  const [, setDoctor] = React.useState<Doctor | null>(null);
  const [appts, setAppts] = React.useState<AdminAppt[]>([]);
  const [avgRating, setAvgRating] = React.useState<number>(0);
  const [pendingReviews, setPendingReviews] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { id?: string; email?: string; role?: string; roles?: string[] } } };
        const me = w.__HOSPILINK_AUTH__?.user;
        const myId = me?.id;
        const myEmail = me?.email;

        // Fetch all dashboard appointments then filter by current doctor
        const raw = await adminAppointmentAPI.getAllForDashboard();
        const mine = raw.filter((a) => {
          const did = (a.doctorId || '') as string;
          const demail = (a as AdminAppt & { doctorsEmail?: string }).doctorsEmail;
          const okById = myId && did && did === myId;
          const okByEmail = myEmail && demail && demail.toLowerCase() === myEmail.toLowerCase();
          return okById || okByEmail;
        });
        // Sort by time ascending
        mine.sort((a, b) => {
          const da = parseApptDate(a)?.getTime() ?? 0;
          const db = parseApptDate(b)?.getTime() ?? 0;
          return da - db;
        });
        if (!cancelled) setAppts(mine);

        // Find my doctor profile for rating (match by email or id)
        try {
          const docs = await doctorAPI.getAllDoctors();
          const d = docs.find((x) => (myId && x.id === myId) || (myEmail && x.email && x.email.toLowerCase() === myEmail.toLowerCase())) || null;
          if (!cancelled) setDoctor(d);
          if (!cancelled && d && typeof d.rating === 'number') {
            setAvgRating(d.rating);
          }
        } catch {}

        // Reviews: compute average and pending = completed appts without reviews
        if (myId) {
          try {
            const reviews = await reviewAPI.getDoctorReviews(myId);
            if (Array.isArray(reviews) && reviews.length) {
              const sum = reviews.reduce((acc: number, r: { rating?: number }) => acc + (typeof r.rating === 'number' ? r.rating : 0), 0);
              const avg = sum / reviews.length;
              if (!cancelled) setAvgRating((prev) => (prev > 0 ? prev : avg));
            }
            const completed = mine.filter((a) => {
              const s = (a.status || (a as AdminAppt & { appointmentStatus?: string; AppointmentStatus?: string }).appointmentStatus || (a as AdminAppt & { appointmentStatus?: string; AppointmentStatus?: string }).AppointmentStatus || '').toString().toLowerCase();
              return s === 'completed' || s === 'confirmed';
            }).length;
            const pending = Math.max(0, completed - (Array.isArray(reviews) ? reviews.length : 0));
            if (!cancelled) setPendingReviews(pending);
          } catch {}
        }
      } catch (e) {
        const err = e as { message?: string } | undefined;
        if (!cancelled) setError(err?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const startOfWeek = (d: Date) => {
    const dt = new Date(d);
    const day = dt.getDay(); // 0=Sun
    const diff = (day + 6) % 7; // make Monday start
    dt.setDate(dt.getDate() - diff);
    dt.setHours(0,0,0,0);
    return dt;
  };
  const endOfWeek = (d: Date) => {
    const start = startOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    return end;
  };

  const todayCount = appts.filter((a) => {
    const dt = parseApptDate(a);
    if (!dt) return false;
    const status = getStatus(a);
    if (status === 'cancelled' || status === 'no-show') return false;
    return isSameDay(dt, now);
  }).length;

  const weekCount = appts.filter((a) => {
    const dt = parseApptDate(a);
    if (!dt) return false;
    const status = getStatus(a);
    if (status === 'cancelled' || status === 'no-show') return false;
    return dt >= startOfWeek(now) && dt <= endOfWeek(now);
  }).length;

  const upcoming = appts
    .map((a) => ({ a, dt: parseApptDate(a) }))
    .filter((x) => !!x.dt)
    .filter((x) => (x.dt as Date) >= new Date())
    .slice(0, 8);

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
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Today Appointments</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : todayCount}</div>
          <div className="mt-3"><MiniBarChart values={[todayCount]} height={48} /></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : weekCount}</div>
          <div className="mt-3"><MiniBarChart values={[weekCount]} height={48} /></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Pending Reviews</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : pendingReviews}</div>
          <div className="mt-3"><MiniBarChart values={[pendingReviews]} height={48} /></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Avg Rating</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : (avgRating ? avgRating.toFixed(1) : '—')}</div>
          <div className="mt-3"><MiniLineChart values={[avgRating || 0]} /></div>
        </div>
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
                {loading && (
                  <tr><td colSpan={3} className="py-4 text-center text-gray-500">Loading…</td></tr>
                )}
                {!loading && upcoming.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-gray-500">No upcoming appointments.</td></tr>
                )}
                {!loading && upcoming.slice(0, 6).map(({ a, dt }, idx) => (
                  <tr key={(a.id || a.appointmentId || idx) as React.Key} className="hover:bg-gray-50/50">
                    <td className="py-2.5 pr-4 text-gray-900 font-medium whitespace-nowrap">{dt ? formatTime(dt) : '-'}</td>
                    <td className="py-2.5 pr-4 text-gray-900 whitespace-nowrap">{a.usersFullName || getUserEmailLocal(a) || 'Patient'}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{a.reason || 'Consultation'}</span>
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
