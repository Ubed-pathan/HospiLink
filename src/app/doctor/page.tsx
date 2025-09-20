'use client';

import React from 'react';
import Link from 'next/link';
import MiniBarChart from '@/components/charts/MiniBarChart';
import DonutChart from '@/components/charts/DonutChart';
import { appointmentAPI, doctorAPI, reviewAPI } from '@/lib/api-services';

type DoctorAppt = import('@/lib/types').DoctorAppointmentDto;
type Doctor = import('@/lib/types').Doctor;

function parseApptDate(a: { appointmentTime?: string | null }): Date | null {
  const ts = a.appointmentTime;
  if (!ts) return null;
  const normalized = ts.replace(' ', 'T');
  const d = new Date(normalized);
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

function getStatus(a: { appointmentStatus?: string | null; status?: string | null }): string {
  return (a.appointmentStatus || a.status || '').toString().toLowerCase();
}

function getUserEmailLocal(a: { userEmail?: string | null; usersEmail?: string | null }): string | undefined {
  const email = a.userEmail || a.usersEmail || undefined;
  return email ? email.split('@')[0] : undefined;
}

export default function DoctorHome() {
  const [loading, setLoading] = React.useState(true);
  const [, setError] = React.useState<string | null>(null);
  const [, setDoctor] = React.useState<Doctor | null>(null);
  const [appts, setAppts] = React.useState<DoctorAppt[]>([]);
  const [avgRating, setAvgRating] = React.useState<number>(0);
  const [pendingReviews, setPendingReviews] = React.useState<number>(0);
  const [reviewCount, setReviewCount] = React.useState<number>(0);
  const [me, setMe] = React.useState<{ id?: string; name?: string; email?: string; username?: string } | null>(null);
  const [isPresent, setIsPresent] = React.useState<boolean | null>(null);
  const [presenceUpdating, setPresenceUpdating] = React.useState(false);
  const [presenceError, setPresenceError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    // Capture current user immediately and on auth ready
    try {
      const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { id?: string; email?: string; name?: string; username?: string } } };
      if (w.__HOSPILINK_AUTH__?.user) setMe(w.__HOSPILINK_AUTH__.user || null);
    } catch {}
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated: boolean; user?: { id?: string; email?: string; name?: string; username?: string } } | undefined;
      if (detail?.isAuthenticated) {
        setMe(detail.user || null);
      }
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
  const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { id?: string; email?: string; role?: string; roles?: string[]; username?: string } } };
        const me = w.__HOSPILINK_AUTH__?.user;
        const myId = me?.id;
        const myEmail = me?.email;
        const myUsername = me?.username;

        // Prefer direct doctor appointments API (authoritative)
        let doctorAppts: DoctorAppt[] = [];
        if (myUsername) {
          try {
            doctorAppts = await appointmentAPI.getDoctorAppointments(myUsername);
          } catch {
            doctorAppts = [];
          }
        }
        // Sort ascending by time
        doctorAppts.sort((a, b) => {
          const da = parseApptDate(a)?.getTime() ?? 0;
          const db = parseApptDate(b)?.getTime() ?? 0;
          return da - db;
        });
        if (!cancelled) setAppts(doctorAppts);

        // Find my doctor profile (kept for potential fallback)
        try {
          const docs = await doctorAPI.getAllDoctors();
          const d = docs.find((x) => (myId && x.id === myId) || (myEmail && x.email && x.email.toLowerCase() === myEmail.toLowerCase())) || null;
          if (!cancelled) setDoctor(d);
          if (!cancelled && d && typeof (d as { isPresent?: unknown }).isPresent === 'boolean') {
            setIsPresent(!!(d as { isPresent?: boolean }).isPresent);
          }
          // We don't set avgRating from doctor profile anymore; prefer live review aggregation below
        } catch {}

        // Reviews: compute average and pending = completed appts without reviews.
        // Fallback: if direct reviews API returns 0, derive from embedded appointment feedbacks.
        if (myId) {
          try {
            const reviews = await reviewAPI.getDoctorReviews(myId);
            type ReviewLike = { rating?: unknown; Rating?: unknown; stars?: unknown; score?: unknown };
            const extractRating = (r: ReviewLike): number | null => {
              const raw = r?.rating ?? r?.Rating ?? r?.stars ?? r?.score;
              if (typeof raw === 'number' && !isNaN(raw)) return raw;
              if (typeof raw === 'string') {
                const cleaned = raw.trim();
                const part = cleaned.includes('/') ? cleaned.split('/')[0] : cleaned;
                const num = parseFloat(part);
                if (!isNaN(num)) return num;
              }
              return null;
            };
            let validRatings: number[] = Array.isArray(reviews) ? reviews.map(extractRating).filter((n): n is number => n !== null && n >= 0) : [];
            // Fallback to embedded feedbacks in appointments if none from API
            if (!validRatings.length) {
              const embedded = doctorAppts.flatMap((a) => Array.isArray(a.feedbacks) ? a.feedbacks : []);
              type EmbeddedLike = { rating?: unknown; Rating?: unknown; stars?: unknown; score?: unknown };
              const embeddedRatings = embedded.map((f: EmbeddedLike) => extractRating(f)).filter((n): n is number => n !== null && !isNaN(n) && n >= 0);
              validRatings = embeddedRatings;
            }
            if (!cancelled) setReviewCount(validRatings.length);
            if (validRatings.length) {
              const sum = validRatings.reduce((acc, n) => acc + n, 0);
              const avg = sum / validRatings.length;
              if (!cancelled) setAvgRating(avg);
            } else if (!cancelled) {
              setAvgRating(0);
            }
            const completed = doctorAppts.filter((a) => {
              const s = (a.appointmentStatus || '').toString().toLowerCase();
              return s === 'completed' || s === 'confirmed';
            }).length;
            const pending = Math.max(0, completed - validRatings.length);
            if (!cancelled) setPendingReviews(pending);
          } catch {
            // On error fallback to embedded feedbacks entirely
            const embedded = doctorAppts.flatMap((a) => Array.isArray(a.feedbacks) ? a.feedbacks : []);
            type FallbackLike = { rating?: unknown; Rating?: unknown; stars?: unknown; score?: unknown };
            const extractFallback = (f: FallbackLike): number | null => {
              const raw = f?.rating ?? f?.Rating ?? f?.stars ?? f?.score;
              if (typeof raw === 'number' && !isNaN(raw)) return raw;
              if (typeof raw === 'string') {
                const cleaned = raw.trim();
                const part = cleaned.includes('/') ? cleaned.split('/')[0] : cleaned;
                const num = parseFloat(part);
                if (!isNaN(num)) return num;
              }
              return null;
            };
            const ratings = embedded.map(extractFallback).filter((n): n is number => n !== null && n >= 0);
            if (!cancelled) {
              setReviewCount(ratings.length);
              setAvgRating(ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0);
              const completed = doctorAppts.filter((a) => {
                const s = (a.appointmentStatus || '').toString().toLowerCase();
                return s === 'completed' || s === 'confirmed';
              }).length;
              setPendingReviews(Math.max(0, completed - ratings.length));
            }
          }
        }
      } catch (e) {
        const err = e as { message?: string } | undefined;
        if (!cancelled) setError(err?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
  load();
  return () => { cancelled = true; window.removeEventListener('hospilink-auth-ready', onReady); };
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

  // Status distribution for donut
  const statusCounts = appts.reduce(
    (acc, a) => {
      const s = getStatus(a);
      if (s === 'cancelled' || s === 'no-show') acc.cancelled += 1;
      else if (s === 'completed' || s === 'confirmed') acc.completed += 1;
      else acc.scheduled += 1;
      return acc;
    },
    { scheduled: 0, completed: 0, cancelled: 0 }
  );
  const donutData = [
    { label: 'Scheduled', value: statusCounts.scheduled, color: '#3B82F6' },
    { label: 'Completed', value: statusCounts.completed, color: '#10B981' },
    { label: 'Cancelled', value: statusCounts.cancelled, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Current Doctor Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold">
            {(() => {
              const n = (me?.name || me?.username || me?.email || 'DR').toString();
              const parts = n.split(/\s+/);
              const a = parts[0]?.[0] || n[0] || 'D';
              const b = parts[1]?.[0] || '';
              return (a + b).toUpperCase();
            })()}
          </div>
          <div>
            <div className="text-sm text-gray-500">Signed in as</div>
            <div className="text-lg font-semibold text-gray-900">
              {me?.name || (me?.email ? me.email.split('@')[0] : me?.username) || 'Doctor'}
            </div>
            <div className="text-xs text-gray-600">
              {me?.email || ''}{me?.username ? ((me?.email ? ' · ' : '') + `@${me.username}`) : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <button
              type="button"
              disabled={presenceUpdating || isPresent===null}
              onClick={async () => {
                if (!me?.username) return;
                if (isPresent === null) return;
                const next = !isPresent;
                setPresenceUpdating(true);
                setPresenceError(null);
                setIsPresent(next); // optimistic
                try {
                  if (typeof doctorAPI.updateDoctorPresentyStatus === 'function') {
                    await doctorAPI.updateDoctorPresentyStatus(me.username, next);
                  }
                } catch (e) {
                  setIsPresent(!next); // revert
                  const msg = (e as { message?: string })?.message || 'Failed to update status';
                  setPresenceError(msg);
                } finally {
                  setPresenceUpdating(false);
                }
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium shadow-sm transition ${
                isPresent ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              } ${presenceUpdating ? 'opacity-60 cursor-wait' : ''}`}
              aria-pressed={!!isPresent}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${isPresent ? 'bg-green-500' : 'bg-red-500'}`} />
              {presenceUpdating ? 'Updating…' : isPresent ? 'Present (Tap to mark Absent)' : 'Absent (Tap to mark Present)'}
            </button>
          </div>
          {presenceError && <div className="text-xs text-red-600" role="alert">{presenceError}</div>}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href="/doctor/appointments" className="w-full text-center px-3 py-2 rounded-md border bg-blue-600 text-white hover:bg-blue-700">View Appointments</Link>
          <Link href="/doctor/schedule" className="w-full text-center px-3 py-2 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50">Edit Schedule</Link>
          <Link href="/doctor/patients" className="w-full text-center px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">My Patients</Link>
          <Link href="/doctor/settings" className="w-full text-center px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">Profile & Settings</Link>
        </div>
      </div>
      {/* KPI + Donut row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                Avg Rating
                {!loading && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-2xl font-bold text-gray-900">{loading ? '—' : (reviewCount ? avgRating.toFixed(1) : '—')}</div>
                {!loading && reviewCount > 0 && (
                  <div className="flex items-center gap-0.5" aria-label={`Average rating ${avgRating.toFixed(1)} out of 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.round(avgRating) ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Removed sparkline per request */}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <DonutChart data={donutData} />
            <div className="space-y-1 text-sm">
              {donutData.map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.label}</span>
                  <span className="ml-auto font-medium text-gray-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Appointments</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : appts.length}</div>
          <div className="mt-3"><MiniBarChart values={[appts.length]} height={48} /></div>
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
                  <tr key={(a.appointmentId || idx) as React.Key} className="hover:bg-gray-50/50">
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
