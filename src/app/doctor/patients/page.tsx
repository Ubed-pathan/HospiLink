'use client';

import React from 'react';
import { appointmentAPI } from '@/lib/api-services';
import type { PatientsOfDoctorDto } from '@/lib/types';
import { Loader2, Users, AlertTriangle, Mail, CalendarClock } from 'lucide-react';

export default function DoctorPatientsPage() {
  const [doctorUsername, setDoctorUsername] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [patients, setPatients] = React.useState<PatientsOfDoctorDto[]>([]);

  // Load doctor username from global auth
  React.useEffect(() => {
    const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { username?: string } } };
    const u = w.__HOSPILINK_AUTH__?.user;
    if (u?.username) setDoctorUsername(String(u.username));
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user?: { username?: string } } | undefined;
      if (detail?.user?.username) setDoctorUsername(String(detail.user.username));
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  const loadPatients = React.useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentAPI.getAllPatientsOfDoctor(username);
      setPatients(data);
    } catch (e) {
      const msg = (e as { message?: string })?.message || 'Failed to load patients';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!doctorUsername) return;
    loadPatients(doctorUsername);
  }, [doctorUsername, loadPatients]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
          <Users className="w-4 h-4" /> Patients
        </div>
      </div>

      {error && (
        <div className="mb-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All patients</h3>
          {loading ? (<Loader2 className="w-4 h-4 animate-spin text-gray-500" />) : null}
        </div>
        <div className="divide-y divide-gray-100">
          {patients.length === 0 && !loading ? (
            <div className="p-6 text-sm text-gray-500">No patients found.</div>
          ) : (
            patients.map((p) => (
              <div key={p.appointmentId} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-medium text-gray-900">{p.usersFullName || 'Patient'}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {p.usersEmail}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" /> {formatDateTime(p.appointmentTime)}
                    <span className="mx-2">•</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass(p.appointmentStatus)}`}>{p.appointmentStatus}</span>
                  </div>
                  {p.reason ? (
                    <div className="mt-1 text-xs text-gray-700">Reason: {p.reason}</div>
                  ) : null}
                </div>
                <div className="text-xs text-gray-500">Appt ID: {p.appointmentId}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value: string | undefined) {
  if (!value) return '';
  // Show local date + 12h time from ISO-like string
  try {
    const d = new Date(value);
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${date} ${time}`;
  } catch {
    return String(value);
  }
}

function badgeClass(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('complete')) return 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200';
  if (s.includes('cancel')) return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200';
  if (s.includes('pending')) return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
  return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200';
}
