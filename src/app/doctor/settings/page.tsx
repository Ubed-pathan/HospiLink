'use client';

import React from 'react';
import { authAPI, userAPI, doctorAPI } from '@/lib/api-services';
import type { User, Doctor } from '@/lib/types';

export default function DoctorSettingsPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [profileForm, setProfileForm] = React.useState<{ name: string; email: string; phone?: string; address?: string }>({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<string | null>(null);
  const [pwForm, setPwForm] = React.useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [me, setMe] = React.useState<{ id?: string; name?: string; email?: string; username?: string } | null>(null);
  const [doc, setDoc] = React.useState<Doctor | null>(null);
  const [editMode, setEditMode] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await userAPI.getProfile();
        if (!active) return;
        setUser(u);
        setProfileForm({ name: u.name || '', email: u.email || '', phone: u.phone, address: u.address });
      } catch {
        if (!active) return;
        setUser(null);
      }
    })();
    // Read current auth user from broadcast for immediate display
    try {
      const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: { id?: string; name?: string; email?: string; username?: string } } };
      if (w.__HOSPILINK_AUTH__?.user) {
        const authUser = w.__HOSPILINK_AUTH__.user;
        setMe(authUser || null);
        setProfileForm((prev) => ({
          name: prev.name || authUser?.name || '',
          email: prev.email || authUser?.email || '',
          phone: prev.phone,
          address: prev.address,
        }));
      }
    } catch {}
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated: boolean; user?: { id?: string; name?: string; email?: string; username?: string } } | undefined;
      if (detail?.isAuthenticated) {
        setMe(detail.user || null);
        const u = detail.user;
        setProfileForm((prev) => ({
          name: prev.name || u?.name || '',
          email: prev.email || u?.email || '',
          phone: prev.phone,
          address: prev.address,
        }));
      }
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => { active = false; window.removeEventListener('hospilink-auth-ready', onReady); };
  }, []);

  // Also hydrate from auth user whenever it changes, without overriding existing values
  React.useEffect(() => {
    if (!me) return;
    setProfileForm((prev) => ({
      name: prev.name || me.name || '',
      email: prev.email || me.email || '',
      phone: prev.phone,
      address: prev.address,
    }));
  }, [me]);

  const initials = React.useMemo(() => {
    const n = (user?.name || '').trim();
    if (!n) return 'DR';
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || '';
    return (a + b || a).toUpperCase();
  }, [user?.name]);

  const derivedUsername = React.useMemo(() => {
    const email = profileForm.email || user?.email || '';
    if (!email) return '';
    const local = email.split('@')[0] || '';
    return local || '';
  }, [profileForm.email, user?.email]);

  const saveProfile = async () => {
    setProfileMsg(null);
    if (!profileForm.name?.trim()) {
      setProfileMsg('Name is required');
      return;
    }
    setSavingProfile(true);
    try {
      const payload: Partial<User> = {
  name: profileForm.name.trim(),
  email: profileForm.email,
  phone: profileForm.phone,
  address: profileForm.address,
      };
      const updated = await userAPI.updateProfile(payload);
      setUser(updated);
      setProfileMsg('Profile updated');
  setEditMode(false);
    } catch (e) {
      const err = e as { message?: string } | undefined;
      setProfileMsg(err?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError('Fill all fields');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    setPwError('Password change will be available soon.');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      if (typeof window !== 'undefined') window.location.href = '/auth/signin';
    }
  };

  // Load doctor details by matching auth user id/email
  React.useEffect(() => {
    let cancelled = false;
    const loadDoctor = async () => {
      try {
        const docs = await doctorAPI.getAllDoctors();
        const id = me?.id || user?.id;
        const email = (me?.email || user?.email || '').toLowerCase();
        const found = docs.find((d) => (id && d.id === id) || (email && d.email && d.email.toLowerCase() === email)) || null;
        if (!cancelled) setDoc(found);
      } catch {
        if (!cancelled) setDoc(null);
      }
    };
    // Only attempt when we have at least an id/email hint
    if (me?.id || user?.id || me?.email || user?.email) {
      loadDoctor();
    }
    return () => { cancelled = true; };
  }, [me?.id, me?.email, user?.id, user?.email]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Profile */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">{initials}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500">Manage your account details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">Edit</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditMode(false); setProfileForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone, address: user?.address }); setProfileMsg(null); }} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button onClick={saveProfile} disabled={savingProfile} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black/85 disabled:opacity-60">{savingProfile ? 'Saving…' : 'Save'}</button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-900">Full name</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                readOnly={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Username</label>
              <input
                type="text"
                aria-disabled="true"
                readOnly
                className="mt-1 block w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm text-black cursor-not-allowed"
                value={derivedUsername}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.phone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                readOnly={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Address</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.address || ''}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                readOnly={!editMode}
              />
            </div>
            {profileMsg && <div className="md:col-span-2 flex items-center justify-end"><span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{profileMsg}</span></div>}
          </div>
      </section>

      {/* Doctor Profile (read-only) */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Profile</h3>
        {!doc ? (
          <p className="text-sm text-gray-600">Doctor details not available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Specialization</div>
              <div className="text-sm text-gray-900">{doc.specialization || doc.specialty || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Experience</div>
              <div className="text-sm text-gray-900">{doc.experience ?? 0} years</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Qualification</div>
              <div className="text-sm text-gray-900">{Array.isArray(doc.qualification) ? (doc.qualification.join(', ') || '-') : '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Clinic / Location</div>
              <div className="text-sm text-gray-900">{doc.location || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Availability</div>
              <div className="text-sm text-gray-900">
                {doc.availableSlots && doc.availableSlots.length >= 2 ? `${doc.availableSlots[0]} - ${doc.availableSlots[1]}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="text-sm">{doc.isAvailable ? <span className="px-2 py-0.5 rounded-full text-xs border bg-green-50 text-green-700 border-green-200">Present</span> : <span className="px-2 py-0.5 rounded-full text-xs border bg-red-50 text-red-700 border-red-200">Absent</span>}</div>
            </div>
          </div>
        )}
      </section>

      {/* Security */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Current password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">New password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Confirm password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </div>
        </div>
        {pwError && <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 mt-3">{pwError}</p>}
        <div className="mt-4">
          <button onClick={changePassword} className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black/85">Change password</button>
        </div>
      </section>

      {/* Session */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session</h3>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="px-4 py-2 rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 text-sm font-medium">Logout</button>
          <button onClick={logout} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium">Logout all devices</button>
        </div>
      </section>
    </div>
  );
}
