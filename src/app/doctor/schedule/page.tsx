'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { doctorAPI } from '@/lib/api-services';
import { CheckCircle2, Loader2, XCircle, UserCheck, Clock, AlertTriangle } from 'lucide-react';

export default function DoctorSchedulePage() {
  const [doctorUsername, setDoctorUsername] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const [isPresent, setIsPresent] = React.useState<boolean>(true);
  const [from, setFrom] = React.useState<string>('09:00');
  const [to, setTo] = React.useState<string>('17:00');

  // Load doctor username from global auth
  React.useEffect(() => {
    const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { username?: string } } };
    const candidate = w.__HOSPILINK_AUTH__?.user?.username;
    if (candidate) setDoctorUsername(String(candidate));
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user?: { username?: string } } | undefined;
      if (detail?.user?.username) setDoctorUsername(String(detail.user.username));
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  const loadProfile = React.useCallback(async (uname: string) => {
    setLoading(true);
    setError(null);
    try {
      const d = await doctorAPI.getByUsername(uname);
      setIsPresent(Boolean(d.isPresent));
      setFrom(d.availableTimeFrom || '09:00');
      setTo(d.availableTimeTo || '17:00');
    } catch (e) {
      const msg = (e as { message?: string })?.message || 'Failed to load profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!doctorUsername) return;
    loadProfile(doctorUsername);
  }, [doctorUsername, loadProfile]);

  const handleSave = async () => {
    if (!doctorUsername) return;
    if (!from || !to || from >= to) {
      setError('Please set a valid availability time range.');
      return;
    }
    setSaving('saving');
    setError(null);
    try {
      await doctorAPI.updatePresence(isPresent);
      await doctorAPI.updateAvailability(from, to);
      setSaving('saved');
      setTimeout(() => setSaving('idle'), 1200);
    } catch (e) {
      const raw = (e as { message?: string })?.message || 'Failed to save changes';
      const msg = /404/.test(raw) ? 'Save endpoint not found (404). Please configure your backend routes.' : raw;
      setSaving('error');
      setError(msg);
      setTimeout(() => setSaving('idle'), 1500);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
          <UserCheck className="w-4 h-4" /> Doctor Schedule
        </div>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">Availability & Presence</h2>
        <p className="text-gray-600 mt-1">Control your visible status and working hours shown to patients.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Presence */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm text-gray-600">Current status</div>
            <div className="mt-0.5 inline-flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPresent ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span className="font-semibold text-gray-900">{isPresent ? 'Present' : 'Absent'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPresent((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${isPresent ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
            aria-pressed={isPresent}
          >
            {isPresent ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {isPresent ? 'Mark Absent' : 'Mark Present'}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gray-100" />

        {/* Availability */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Availability window</div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="time" value={from} onChange={(e)=> setFrom(e.target.value)} className="w-full pl-9 pr-3 py-3 border-2 border-gray-300 rounded-lg text-base bg-white text-black focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <span className="text-gray-500 text-sm text-center">to</span>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="time" value={to} onChange={(e)=> setTo(e.target.value)} className="w-full pl-9 pr-3 py-3 border-2 border-gray-300 rounded-lg text-base bg-white text-black focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Format: 24‑hour (HH:mm)</span>
            {from && to && from >= to && (
              <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="w-3 h-3" /> Invalid time range</span>
            )}
          </div>

          {/* Quick presets removed as requested */}
        </div>

        {/* Actions */}
        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving==='saving' || loading || (!!from && !!to && from >= to)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            {saving==='saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-4 space-y-2">
          <div className="h-10 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
