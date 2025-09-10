'use client';

import React from 'react';
import { userAPI, doctorAPI } from '@/lib/api-services';
import type { User } from '@/lib/types';

type AuthUser = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  username?: string;
  roles?: string[];
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  age?: number;
  gender?: string | null;
};

export default function DoctorSettingsPage() {
  const [me, setMe] = React.useState<AuthUser | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<{ phone: string; address: string }>({ phone: '', address: '' });
  const [docProfile, setDocProfile] = React.useState<{ specialization?: string; availableTimeFrom?: string; availableTimeTo?: string; isPresent?: boolean; doctorAddress?: string } | null>(null);

  React.useEffect(() => {
    // Preload from global auth snapshot if present
    try {
      const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: AuthUser } };
      if (w.__HOSPILINK_AUTH__?.user) setMe(w.__HOSPILINK_AUTH__.user || null);
    } catch {}
    // Then listen once for the ready event
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated?: boolean; user?: AuthUser } | undefined;
      if (detail?.isAuthenticated && detail.user) setMe(detail.user);
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  React.useEffect(() => {
    // seed editable fields from auth snapshot
    setForm({ phone: me?.phoneNumber || '', address: me?.address || '' });
  }, [me?.phoneNumber, me?.address]);

  const fullName = React.useMemo(() => {
    if (!me) return '';
    const composed = [me.firstName, me.middleName, me.lastName].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    return (me.name && me.name.trim()) || composed;
  }, [me]);

  const initials = React.useMemo(() => {
    const n = (fullName || '').trim();
    if (!n) return 'DR';
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || '';
    return (a + b || a).toUpperCase();
  }, [fullName]);

  const displayUsername = React.useMemo(() => me?.username || '', [me?.username]);

  const rolesText = React.useMemo(() => {
    if (!me?.roles?.length) return '';
    const map: Record<string, string> = { user: 'patient', doctor: 'doctor', admin: 'admin' };
    return me.roles.map(r => map[String(r).toLowerCase()] || String(r)).join(', ');
  }, [me?.roles]);

  // Load doctor profile for bottom card
  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!me?.username) return;
      try {
        const d = await doctorAPI.getByUsername(me.username);
        const doc = d as unknown as { specialization?: string; availableTimeFrom?: string; availableTimeTo?: string; isPresent?: boolean; doctorAddress?: string };
        if (!cancelled) setDocProfile({
          specialization: doc.specialization,
          availableTimeFrom: doc.availableTimeFrom,
          availableTimeTo: doc.availableTimeTo,
          isPresent: doc.isPresent,
          doctorAddress: doc.doctorAddress,
        });
      } catch {
        if (!cancelled) setDocProfile(null);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [me?.username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated: User = await userAPI.updateProfile({ phone: form.phone, address: form.address });
      setMe((prev) => ({ ...(prev || {}), phoneNumber: updated.phone || form.phone, address: updated.address || form.address }));
      setEditMode(false);
    } catch {
      // keep lightweight: no toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">{initials}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500">Manage your account details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-900">Full name</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={fullName || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={me?.email || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-gray-50 cursor-not-allowed" value={displayUsername} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Roles</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={rolesText} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Phone</label>
            <input type="tel" className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm text-black ${editMode ? 'border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-300'}`} value={editMode ? form.phone : (me?.phoneNumber || '')} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} readOnly={!editMode} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900">Address</label>
            <input type="text" className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm text-black ${editMode ? 'border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-300'}`} value={editMode ? form.address : (me?.address || '')} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} readOnly={!editMode} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">City</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={me?.city || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">State</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={me?.state || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Country</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={me?.country || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">ZIP code</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={me?.zipCode || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Age</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={(me?.age ?? '') !== '' ? String(me?.age) : ''} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Gender</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" value={(me?.gender ?? '') as string} readOnly />
          </div>
          <div className="md:col-span-2 flex items-center gap-2 justify-end mt-2">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">Edit</button>
            ) : (
              <>
                <button onClick={() => { setEditMode(false); setForm({ phone: me?.phoneNumber || '', address: me?.address || '' }); }} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black/85 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Doctor Profile (read-only) */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Profile</h3>
        {!docProfile ? (
          <p className="text-sm text-gray-600">Doctor details not available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Specialization</div>
              <div className="text-sm text-gray-900">{docProfile.specialization || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Clinic / Location</div>
              <div className="text-sm text-gray-900">{docProfile.doctorAddress || me?.address || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Availability</div>
              <div className="text-sm text-gray-900">{docProfile.availableTimeFrom && docProfile.availableTimeTo ? `${docProfile.availableTimeFrom} - ${docProfile.availableTimeTo}` : '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="text-sm">{docProfile.isPresent ? <span className="px-2 py-0.5 rounded-full text-xs border bg-green-50 text-green-700 border-green-200">Present</span> : <span className="px-2 py-0.5 rounded-full text-xs border bg-red-50 text-red-700 border-red-200">Absent</span>}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
