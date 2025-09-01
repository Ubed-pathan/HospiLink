"use client";

import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, themeState } from "@/lib/atoms";
import { authAPI } from "@/lib/api-services";

export default function AdminSettingsPage() {
  const { user } = useRecoilValue(authState);
  const setTheme = useSetRecoilState(themeState);
  const [theme, setLocalTheme] = React.useState<'light' | 'dark'>(() => 'light');
  const [emailNotif, setEmailNotif] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = window.localStorage.getItem('hl:pref:emailNotif');
    return v ? v === '1' : true;
  });
  const [smsNotif, setSmsNotif] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const v = window.localStorage.getItem('hl:pref:smsNotif');
    return v ? v === '1' : false;
  });
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [pwForm, setPwForm] = React.useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // try read theme from DOM or localStorage
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setLocalTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const initials = React.useMemo(() => {
    const n = (user?.name || '').trim();
    if (!n) return 'AD';
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || '';
    return (a + b || a).toUpperCase();
  }, [user?.name]);

  const username = React.useMemo(() => {
    const email = user?.email || '';
    return email.includes('@') ? email.split('@')[0] : (user?.name || 'admin').toLowerCase().replace(/\s+/g, '.');
  }, [user?.email, user?.name]);

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      // theme
      setTheme(theme);
      if (typeof window !== 'undefined') {
        // persist basic prefs locally for demo
        window.localStorage.setItem('hl:pref:theme', theme);
        window.localStorage.setItem('hl:pref:emailNotif', emailNotif ? '1' : '0');
        window.localStorage.setItem('hl:pref:smsNotif', smsNotif ? '1' : '0');
        // apply theme class immediately
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
      setSavedAt(Date.now());
    } finally {
      setSavingPrefs(false);
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
      if (typeof window !== 'undefined') window.location.href = '/auth/signin';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Admin Information */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Information</h3>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
            {initials}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div>
              <div className="text-xs text-gray-500">Full name</div>
              <div className="text-gray-900 font-medium">{user?.name || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-gray-900">{user?.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Username</div>
              <div className="text-gray-900">{username}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Roles</div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(user?.roles?.length ? user.roles : [user?.role]).map((r) => (
                  <span key={r} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200 capitalize">{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-4">
            <div className="text-sm font-medium text-gray-900">Theme</div>
            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="theme" value="light" checked={theme==='light'} onChange={() => setLocalTheme('light')} />
                <span>Light</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="theme" value="dark" checked={theme==='dark'} onChange={() => setLocalTheme('dark')} />
                <span>Dark</span>
              </label>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md p-4">
            <div className="text-sm font-medium text-gray-900">Notifications</div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                <span>Email updates</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />
                <span>SMS alerts</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={savePreferences} disabled={savingPrefs} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">Save preferences</button>
          {savedAt && (<span className="text-xs text-gray-500">Saved</span>)}
        </div>
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
