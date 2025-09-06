"use client";

import React from "react";
import { authAPI, userAPI } from "@/lib/api-services";
import type { User } from "@/lib/types";

export default function AdminSettingsPage() {
  // Local user state (avoid Recoil to prevent ReactCurrentDispatcher error)
  const [user, setUser] = React.useState<User | null>(null);
  const [pwForm, setPwForm] = React.useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [profileForm, setProfileForm] = React.useState<{ name: string; email: string; phone?: string; address?: string }>({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<string | null>(null);

  // Load user profile safely on client
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
    return () => { active = false; };
  }, []);

  const initials = React.useMemo(() => {
    const n = (user?.name || '').trim();
    if (!n) return 'AD';
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
        // Allow phone/address updates if provided
        phone: profileForm.phone,
        address: profileForm.address,
      };
      const updated = await userAPI.updateProfile(payload);
      setUser(updated);
      setProfileMsg('Profile updated');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update profile';
      setProfileMsg(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    // Placeholder: backend endpoint not wired in this project.
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError('Fill all fields');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    setPwError("Password change will be available soon.");
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      try {
        (window as unknown as { __HOSPILINK_AUTH__?: { isAuthenticated: boolean; user?: unknown } }).__HOSPILINK_AUTH__ = { isAuthenticated: false, user: null as unknown as undefined } as unknown as { isAuthenticated: boolean; user?: unknown };
        window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: false, user: null } }));
      } catch {}
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Profile */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
            {initials}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-900">Full name</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <input
                type="email"
                aria-disabled="true"
                readOnly
                className="mt-1 block w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm text-black cursor-not-allowed"
                value={profileForm.email}
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
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.phone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Address</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={profileForm.address || ''}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end">
              <div className="flex items-center gap-3">
                <button onClick={saveProfile} disabled={savingProfile} className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black/85 disabled:opacity-60">{savingProfile ? 'Saving…' : 'Save profile'}</button>
                {profileMsg && <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{profileMsg}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

  {/* Preferences removed as requested */}

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
