'use client';

import React from 'react';
import { userAPI } from '@/lib/api-services';
import Link from 'next/link';

type UserLike = {
  name?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
};

export default function DoctorSettingsEditPage() {
  const [me, setMe] = React.useState<UserLike | null>(null);
  const [form, setForm] = React.useState<{ phone?: string; address?: string }>({});
  const [saving, setSaving] = React.useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const w = window as unknown as { __HOSPILINK_AUTH__?: { user?: UserLike } };
      const u = w.__HOSPILINK_AUTH__?.user;
      if (u) {
        setMe(u);
        setForm({ phone: u.phoneNumber || '', address: u.address || '' });
      }
    } catch {
      /* no-op */
    }
    const onReady = (e: Event) => {
      const custom = e as CustomEvent<{ isAuthenticated?: boolean; user?: UserLike }>;
      const detail = custom.detail;
      if (detail?.isAuthenticated && detail.user) {
        const u = detail.user;
        setMe(u);
        setForm({ phone: u.phoneNumber || '', address: u.address || '' });
      }
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  const handleSave = async () => {
    setSaving('saving');
    setError(null);
    try {
      await userAPI.updateProfile({ phone: form.phone, address: form.address });
      setSaving('saved');
      setTimeout(()=> setSaving('idle'), 1500);
    } catch (e) {
      setSaving('error');
      setError((e as { message?: string })?.message || 'Failed to update');
      setTimeout(()=> setSaving('idle'), 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <Link href="/doctor/settings" className="text-sm text-blue-600 hover:underline">Back</Link>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Full name</label>
            <input type="text" value={me?.name || ''} readOnly className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input type="email" value={me?.email || ''} readOnly className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input type="text" value={me?.username || ''} readOnly className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Phone</label>
            <input type="tel" value={form.phone || ''} onChange={e=> setForm(f=> ({ ...f, phone: e.target.value }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Address</label>
            <input type="text" value={form.address || ''} onChange={e=> setForm(f=> ({ ...f, address: e.target.value }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving==='saving'} className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black/85 disabled:opacity-60">{saving==='saving' ? 'Saving…' : 'Save changes'}</button>
          {saving==='saved' && <span className="text-sm text-green-600">Saved</span>}
          {saving==='error' && <span className="text-sm text-red-600">Error</span>}
        </div>
      </div>
    </div>
  );
}
