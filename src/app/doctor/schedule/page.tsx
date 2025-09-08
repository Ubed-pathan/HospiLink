'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { doctorAPI } from '@/lib/api-services';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

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
      const msg = (e as { message?: string })?.message || 'Failed to save changes';
      setSaving('error');
      setError(msg);
      setTimeout(() => setSaving('idle'), 1500);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
      <p className="text-sm text-gray-600 mb-4">Update your presence and availability window.</p>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-gray-900 font-semibold">{isPresent ? 'Present' : 'Absent'}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsPresent((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${isPresent ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
            aria-pressed={isPresent}
          >
            {isPresent ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {isPresent ? 'Mark Absent' : 'Mark Present'}
          </button>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">Availability</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">From</label>
              <input type="time" value={from} onChange={(e)=> setFrom(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <span className="text-gray-500">to</span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">To</label>
              <input type="time" value={to} onChange={(e)=> setTo(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">Times use 24-hour format (HH:mm).</div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving==='saving' || loading} className="inline-flex items-center gap-2">
            {saving==='saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save changes
          </Button>
          <Button variant="ghost" onClick={() => doctorUsername && loadProfile(doctorUsername)} disabled={loading} className="text-gray-700">
            Refresh
          </Button>
          {saving==='saved' && <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" />Saved</span>}
          {saving==='error' && <span className="inline-flex items-center gap-1 text-red-600 text-sm"><XCircle className="w-4 h-4" />Failed</span>}
        </div>
      </div>

      {loading && (
        <div className="mt-3 text-sm text-gray-500 inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      )}
    </div>
  );
}
