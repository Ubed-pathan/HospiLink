'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { appointmentAPI } from '@/lib/api-services';
import type { DoctorAppointmentDto } from '@/lib/types';
import { CalendarDays, Mail, User as UserIcon, Search, RefreshCcw, Check, X, Loader2 } from 'lucide-react';

type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';

function formatDateTime12h(isoLike: string | undefined): { date: string; time: string } {
  if (!isoLike) return { date: '', time: '' };
  // Accept both 'YYYY-MM-DDTHH:mm' and 'YYYY-MM-DD HH:mm'
  const normalized = isoLike.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    // Fallback: split manually HH:mm
    const [date] = normalized.split('T');
    const time24 = normalized.split('T')[1]?.slice(0, 5) || '';
    const [hStr, mStr] = time24.split(':');
    const h = Number(hStr || 0);
    const m = Number(mStr || 0);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { date: date || '', time: `${h12}:${m.toString().padStart(2, '0')} ${ampm}` };
  }
  const date = d.toISOString().slice(0, 10);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return { date, time: `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}` };
}

const statusBadge = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'bg-green-100 text-green-800 border-green-200';
  if (s === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
  if (s === 'scheduled') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function DoctorAppointmentsPage() {
  const [doctorUsername, setDoctorUsername] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<DoctorAppointmentDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [query, setQuery] = React.useState('');
  const [rowBusy, setRowBusy] = React.useState<Record<string, 'complete' | 'cancel' | null>>({});

  // Hydrate doctor id from global auth
  React.useEffect(() => {
    const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { username?: string; role?: string; roles?: string[] } } };
    const candidate = w.__HOSPILINK_AUTH__?.user?.username;
    if (candidate) setDoctorUsername(String(candidate));
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated: boolean; user?: { username?: string } } | undefined;
      if (detail?.user?.username) setDoctorUsername(String(detail.user.username));
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  const fetchData = React.useCallback(async (uname: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await appointmentAPI.getDoctorAppointments(uname);
      setItems(list);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || 'Failed to load appointments';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!doctorUsername) return;
    fetchData(doctorUsername);
  }, [doctorUsername, fetchData]);

  const handleComplete = async (id: string) => {
    setRowBusy((m) => ({ ...m, [id]: 'complete' }));
    try {
      await appointmentAPI.completeAppointmentById(id);
      setItems((list) => list.map((it) => (it.appointmentId === id ? { ...it, appointmentStatus: 'COMPLETED' } : it)));
    } catch (e) {
      // Surface a lightweight inline error via state banner
      const msg = (e as { message?: string })?.message || 'Failed to complete appointment';
      setError(msg);
    } finally {
      setRowBusy((m) => ({ ...m, [id]: null }));
    }
  };

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm('Cancel this appointment?');
    if (!confirmed) return;
    setRowBusy((m) => ({ ...m, [id]: 'cancel' }));
    try {
      await appointmentAPI.cancelAppointmentById(id);
      setItems((list) => list.map((it) => (it.appointmentId === id ? { ...it, appointmentStatus: 'CANCELLED' } : it)));
    } catch (e) {
      const msg = (e as { message?: string })?.message || 'Failed to cancel appointment';
      setError(msg);
    } finally {
      setRowBusy((m) => ({ ...m, [id]: null }));
    }
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      const sOk = status === 'all' || (a.appointmentStatus || '').toLowerCase() === status;
      const qOk = !q || (a.usersFullName || '').toLowerCase().includes(q) || (a.userEmail || '').toLowerCase().includes(q);
      return sOk && qOk;
    });
  }, [items, status, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage your appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => doctorUsername && fetchData(doctorUsername)}
            disabled={loading}
            title="Refresh appointments"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-gray-700 shadow-sm hover:bg-white hover:shadow focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-gray-500'}`} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Search className="w-4 h-4" /></span>
            <Input forceLight tone="blue" className="pl-9" placeholder="Search by patient name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="md:ml-auto">
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
              {(['all','scheduled','completed','cancelled'] as StatusFilter[]).map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={status === s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 text-sm ${idx<3?'border-r':''} focus:outline-none ${status === s ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2.5 px-3 w-[140px]">Date</th>
                <th className="py-2.5 px-3 w-[110px]">Time</th>
                <th className="py-2.5 px-3 w-[260px]">Patient</th>
                <th className="py-2.5 px-3 w-[280px]">Reason</th>
                <th className="py-2.5 px-3 w-[120px]">Status</th>
                <th className="py-2.5 px-3 w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-8 px-3 text-center text-gray-500" colSpan={6}>Loading appointments…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="py-8 px-3 text-center text-gray-500" colSpan={6}>No appointments found</td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const dt = formatDateTime12h(a.appointmentTime);
                  const isCompleting = rowBusy[a.appointmentId] === 'complete';
                  const isCancelling = rowBusy[a.appointmentId] === 'cancel';
                  const sLower = (a.appointmentStatus || '').toLowerCase();
                  const canComplete = sLower !== 'completed' && !isCompleting;
                  const canCancel = sLower !== 'cancelled' && !isCancelling;
                  return (
                    <tr key={a.appointmentId} className="border-b last:border-0">
                      <td className="py-2.5 px-3 text-gray-900">{dt.date}</td>
                      <td className="py-2.5 px-3 text-gray-900">{dt.time}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700"><UserIcon className="w-4 h-4" /></span>
                          <div>
                            <div className="font-medium text-gray-900">{a.usersFullName || '—'}</div>
                            <div className="text-xs text-gray-600 inline-flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{a.userEmail || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 truncate">{a.reason || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${statusBadge(a.appointmentStatus)}`}>
                          {a.appointmentStatus || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={!canComplete}
                            onClick={() => handleComplete(a.appointmentId)}
                            className={`bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500/30 disabled:opacity-50 ${isCompleting ? 'cursor-wait' : ''}`}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {isCompleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              {isCompleting ? 'Completing…' : 'Complete'}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!canCancel}
                            onClick={() => handleCancel(a.appointmentId)}
                            className={isCancelling ? 'cursor-wait' : ''}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                              {isCancelling ? 'Cancelling…' : 'Cancel'}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-2">
        <CalendarDays className="w-4 h-4" />
        Times shown in your local time (12‑hour format)
      </div>
    </div>
  );
}
