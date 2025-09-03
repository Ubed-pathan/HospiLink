"use client";

import React from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { adminAppointmentAPI, doctorAPI } from '@/lib/api-services';
import type { AppointmentDtoForAdminDashboard, Doctor } from '@/lib/types';

type Row = {
  id: string;
  time?: string | null;
  status: string;
  patientName?: string;
  patientEmail?: string;
  doctorName?: string;
  doctorEmail?: string;
  reason?: string;
  createdAt?: string | null;
};

const normalizeStatus = (raw?: string) => {
  if (!raw) return 'UNKNOWN';
  const s = raw.toUpperCase();
  if (s.includes('CANCEL')) return 'CANCELLED';
  if (s.includes('COMPLETE')) return 'COMPLETED';
  if (s.includes('CONFIRM')) return 'CONFIRMED';
  if (s.includes('SCHEDULE')) return 'SCHEDULED';
  if (s.includes('PENDING')) return 'PENDING';
  return s;
};

export default function AdminAppointmentsPage() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [list, docs] = await Promise.all([
          adminAppointmentAPI.getAllForDashboard(),
          doctorAPI.getAllDoctors().catch(() => [] as Doctor[]),
        ]);
        if (!active) return;
        const isHex24 = (s: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s.trim());
        const findDoctor = (a: AppointmentDtoForAdminDashboard): Doctor | undefined => {
          if (a.doctorId) {
            const byId = docs.find((d) => d.id === a.doctorId);
            if (byId) return byId;
          }
          if (a.doctorsEmail) {
            const byEmail = docs.find((d) => (d.email || '').toLowerCase() === a.doctorsEmail!.toLowerCase());
            if (byEmail) return byEmail;
          }
          if (a.doctorsFullName) {
            const needle = a.doctorsFullName.replace(/^dr\.?\s+/i, '').trim().toLowerCase();
            const byName = docs.find((d) => (d.name || '').trim().toLowerCase() === needle || (`dr. ${d.name}`.toLowerCase() === a.doctorsFullName!.toLowerCase()));
            if (byName) return byName;
          }
          return undefined;
        };
        const deriveFromEmail = (email?: string) => {
          if (!email) return '';
          const local = email.split('@')[0] || '';
          const parts = local.split(/[._-]+/).filter(Boolean);
          if (parts.length === 0) return '';
          return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        };
        const looksLikeNaturalName = (s?: string) => !!s && !isHex24(s) && /[A-Za-z]/.test(s) && /\s|\./.test(s);
        const mapped: Row[] = (list || []).map((a: AppointmentDtoForAdminDashboard) => {
          const doc = findDoctor(a);
          const emailName = deriveFromEmail(a.doctorsEmail);
          const safeDoctorName = doc
            ? `Dr. ${doc.name}`
            : looksLikeNaturalName(a.doctorsFullName)
              ? a.doctorsFullName!
              : emailName
                ? `Dr. ${emailName}`
                : 'Doctor';
          return {
            id: a.appointmentId || a.id || '',
            time: a.appointmentTime ?? a.appointmentDateTime ?? a.createdAt ?? null,
            status: normalizeStatus(a.appointmentStatus ?? a.AppointmentStatus ?? a.status),
            patientName: a.usersFullName,
            patientEmail: a.usersEmail,
            doctorName: safeDoctorName,
            doctorEmail: a.doctorsEmail,
            reason: a.reason,
            createdAt: a.createdAt ?? null,
          } as Row;
        });
        setRows(mapped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load appointments';
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      (r.patientName || '').toLowerCase().includes(t) ||
      (r.patientEmail || '').toLowerCase().includes(t) ||
      (r.doctorName || '').toLowerCase().includes(t) ||
      (r.doctorEmail || '').toLowerCase().includes(t) ||
      (r.reason || '').toLowerCase().includes(t) ||
      (r.status || '').toLowerCase().includes(t)
    );
  }, [rows, q]);

  const fmt = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  };

  const StatusPill = ({ status }: { status: string }) => {
    const s = status.toUpperCase();
    const cls =
      s === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
      s === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
      s === 'CONFIRMED' || s === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
      s === 'PENDING' ? 'bg-gray-50 text-gray-700 border-gray-200' :
      'bg-gray-50 text-gray-600 border-gray-200';
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${cls}`}>{s}</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Appointments
          </h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-5 mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by patient, doctor, email, reason, or status"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="max-h-[600px] overflow-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-xs md:text-sm">
                  <th className="px-4 py-3 w-[160px]">Time</th>
                  <th className="px-4 py-3 w-[110px]">Status</th>
                  <th className="px-4 py-3 w-[240px]">Patient</th>
                  <th className="px-4 py-3 w-[240px]">Doctor</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 w-[160px]">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-gray-500 text-sm">Loading appointments…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-gray-500 text-sm">No appointments found</td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 text-sm whitespace-nowrap">{fmt(r.time)}</td>
                      <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 text-sm font-medium">{r.patientName || '—'}</div>
                        <div className="text-gray-600 text-xs">{r.patientEmail || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 text-sm font-medium">{r.doctorName || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 text-sm truncate" title={r.reason || ''}>{r.reason || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm whitespace-nowrap">{fmt(r.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
