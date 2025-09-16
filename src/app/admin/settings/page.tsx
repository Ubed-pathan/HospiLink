"use client";

import React from "react";
import { authAPI, userAPI } from "@/lib/api-services";
import { mockUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";

export default function AdminSettingsPage() {
  // Local user state (avoid Recoil to prevent ReactCurrentDispatcher error)
  const [user, setUser] = React.useState<User | null>(null);
  const [pwForm, setPwForm] = React.useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [profileForm, setProfileForm] = React.useState<{ name: string; email: string; phone?: string; address?: string }>({ name: '', email: '' });
  // savingProfile removed; modal save manages UX
  const [profileMsg, setProfileMsg] = React.useState<string | null>(null);
  // Edit modal state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState<{
    name: string;
    email: string;
    username: string;
    phone?: string;
    address?: string;
    age?: string; // keep as string for controlled input; parse to number on save
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }>({ name: '', email: '', username: '' });
  // Extra admin details primarily from loadOnRefresh
  const [adminDetails, setAdminDetails] = React.useState<{
    username?: string;
    roles?: string[];
    age?: number;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  } | null>(null);

  // Helper: ensure we have a usable admin user from available sources
  const ensureAdminUser = React.useCallback((src?: Partial<User> | null): User => {
    const mockAdmin = mockUsers.find((u) => u.role === 'admin');
    return {
      id: (src?.id as string) || (mockAdmin?.id as string) || 'admin-1',
      role: (src?.role as User['role']) || (mockAdmin?.role as User['role']) || 'admin',
      name: (src?.name as string) || (mockAdmin?.name as string) || 'Admin User',
      email: (src?.email as string) || (mockAdmin?.email as string) || '',
      phone: (src?.phone as string) || (mockAdmin?.phone as string) || (mockAdmin?.contactNumber as string) || undefined,
      address: (src?.address as string) || (mockAdmin?.address as string) || undefined,
      contactNumber: src?.contactNumber,
      dateOfBirth: src?.dateOfBirth,
      gender: src?.gender,
      emergencyContact: src?.emergencyContact,
      createdAt: src?.createdAt,
      updatedAt: src?.updatedAt,
      profileImage: src?.profileImage,
    } as User;
  }, []);

  // Load admin profile prioritizing loadOnRefresh (loadOnRefresh -> user API -> mock)
  React.useEffect(() => {
    let active = true;
    (async () => {
      const apply = (u: User) => {
        setUser(u);
        setProfileForm({ name: u.name || '', email: u.email || '', phone: u.phone, address: u.address });
      };
      try {
        const r = await authAPI.loadOnRefresh();
        if (!active) return;
        const fullName = [r?.firstName, r?.middleName, r?.lastName].filter(Boolean).join(' ').trim() || r?.name || undefined;
        const ensured = ensureAdminUser({
          id: r?.id,
          role: (r?.role as User['role']) || 'admin',
          name: fullName,
          email: r?.email,
          phone: r?.phoneNumber || r?.phone,
          address: r?.address,
        });
        apply(ensured);
        setAdminDetails({
          username: r?.username,
          roles: Array.isArray(r?.roles) ? r.roles : undefined,
          age: typeof r?.age === 'number' ? r.age : undefined,
          city: r?.city,
          state: r?.state,
          country: r?.country,
          zipCode: r?.zipCode,
        });
        return;
      } catch {}
      try {
        const u = await userAPI.getProfile();
        if (!active) return;
        const ensured = ensureAdminUser(u as unknown as Partial<User>);
        apply(ensured);
        setAdminDetails((prev) => prev || { username: ensured.email?.split('@')[0] || 'admin', roles: ['ADMIN'] });
        return;
      } catch {}
      if (!active) return;
      const ensured = ensureAdminUser(null);
      apply(ensured);
      const mock = mockUsers.find((m) => m.role === 'admin');
      setAdminDetails({
        username: (mock?.email?.split('@')[0]) || 'admin',
        roles: ['ADMIN'],
      });
    })();
    return () => { active = false; };
  }, [ensureAdminUser]);

  const initials = React.useMemo(() => {
    const n = (user?.name || '').trim();
    if (!n) return 'AD';
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || '';
    return (a + b || a).toUpperCase();
  }, [user?.name]);

  const derivedUsername = React.useMemo(() => {
    if (adminDetails?.username) return adminDetails.username;
    const email = profileForm.email || user?.email || '';
    if (!email) return '';
    const local = email.split('@')[0] || '';
    return local || '';
  }, [adminDetails?.username, profileForm.email, user?.email]);

  // Removed inline saveProfile; saving happens via modal saveEdit

  // Open edit modal with current values
  const openEdit = () => {
    setEditForm({
      name: profileForm.name || '',
      email: profileForm.email || '',
      username: derivedUsername || '',
      phone: profileForm.phone,
      address: profileForm.address,
      age: (typeof adminDetails?.age === 'number' ? String(adminDetails?.age) : ''),
      city: adminDetails?.city || '',
      state: adminDetails?.state || '',
      country: adminDetails?.country || '',
      zipCode: adminDetails?.zipCode || '',
    });
    setEditOpen(true);
  };

  // Save from modal (tries API, falls back to local update if API is unavailable)
  const saveEdit = async () => {
    setProfileMsg(null);
    if (!editForm.name?.trim()) {
      setProfileMsg('Name is required');
      return;
    }
  // begin modal save
    try {
      const payload: Partial<User> = {
        name: editForm.name.trim(),
        phone: editForm.phone,
        address: editForm.address,
      };
      try {
        const updated = await userAPI.updateProfile(payload);
        setUser(updated);
        setProfileForm({
          name: updated.name || editForm.name,
          email: updated.email || editForm.email,
          phone: updated.phone ?? editForm.phone,
          address: updated.address ?? editForm.address,
        });
        setProfileMsg('Profile updated');
      } catch {
        // Graceful fallback: update local UI and inform user (useful when API returns 404 during demo)
        setProfileForm({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
        });
        setProfileMsg('Saved locally (API unavailable)');
      }

      // Try to persist system details via userAPI.updateUserById if we have an id
      const id = user?.id;
      const safeNum = (v?: string): number | undefined => {
        if (v == null) return undefined;
        const n = parseInt(String(v).trim(), 10);
        return Number.isFinite(n) ? n : undefined;
      };
      const detailsPayload = {
        age: safeNum(editForm.age) ?? (typeof adminDetails?.age === 'number' ? adminDetails?.age : undefined),
        city: (editForm.city && editForm.city.trim()) || adminDetails?.city,
        state: (editForm.state && editForm.state.trim()) || adminDetails?.state,
        country: (editForm.country && editForm.country.trim()) || adminDetails?.country,
        zipCode: (editForm.zipCode && editForm.zipCode.trim()) || adminDetails?.zipCode,
      } as Record<string, unknown>;
      // Only call API if we have an ID
      if (id) {
        try {
          const updatedAny = await userAPI.updateUserById(id, detailsPayload);
          // Attempt to read back normalized values, else use what we sent
          const newAge = (typeof updatedAny?.age === 'number') ? updatedAny.age : detailsPayload.age as number | undefined;
          const newDetails = {
            username: adminDetails?.username,
            roles: adminDetails?.roles,
            age: newAge,
            city: (updatedAny?.city as string) ?? (detailsPayload.city as string | undefined),
            state: (updatedAny?.state as string) ?? (detailsPayload.state as string | undefined),
            country: (updatedAny?.country as string) ?? (detailsPayload.country as string | undefined),
            zipCode: (updatedAny?.zipCode as string) ?? (detailsPayload.zipCode as string | undefined),
          };
          setAdminDetails(newDetails);
        } catch {
          // Local fallback for system details as well
          setAdminDetails({
            username: adminDetails?.username,
            roles: adminDetails?.roles,
            age: detailsPayload.age as number | undefined,
            city: detailsPayload.city as string | undefined,
            state: detailsPayload.state as string | undefined,
            country: detailsPayload.country as string | undefined,
            zipCode: detailsPayload.zipCode as string | undefined,
          });
        }
      } else {
        // No id; just update locally
        setAdminDetails({
          username: adminDetails?.username,
          roles: adminDetails?.roles,
          age: detailsPayload.age as number | undefined,
          city: detailsPayload.city as string | undefined,
          state: detailsPayload.state as string | undefined,
          country: detailsPayload.country as string | undefined,
          zipCode: detailsPayload.zipCode as string | undefined,
        });
      }
    } finally {
      setEditOpen(false);
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

      {/* Admin Info - Single consolidated card */}
      <section className="bg-white/80 backdrop-blur border border-gray-200/60 rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">{initials}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Admin Profile</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {Array.isArray(adminDetails?.roles) && adminDetails!.roles.length > 0 ? (
                adminDetails!.roles.map((r) => (
                  <span key={r} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border bg-gray-50 text-gray-700 border-gray-200">{r}</span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No roles</span>
              )}
            </div>
          </div>
          <div>
            <button onClick={openEdit} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Edit</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input type="text" readOnly aria-disabled="true" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-gray-50 cursor-not-allowed" value={derivedUsername} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input type="email" readOnly aria-disabled="true" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-gray-50 cursor-not-allowed" value={profileForm.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Full name</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Phone</label>
            <input type="tel" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={profileForm.phone || ''} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900">Address</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={profileForm.address || ''} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">System details</h4>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KV label="Age" value={typeof adminDetails?.age === 'number' ? String(adminDetails.age) : '-'} />
            <KV label="City" value={adminDetails?.city || '-'} />
            <KV label="State" value={adminDetails?.state || '-'} />
            <KV label="Country" value={adminDetails?.country || '-'} />
            <KV label="ZIP code" value={adminDetails?.zipCode || '-'} />
          </dl>
        </div>

        {profileMsg && (
          <div className="mt-4 text-xs px-2 py-1 inline-block rounded bg-blue-50 text-blue-700 border border-blue-200">{profileMsg}</div>
        )}
      </section>

      {/* Edit Modal (like doctor settings) */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Admin Profile" size="lg">
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Username</label>
              <input readOnly aria-disabled="true" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-gray-50 cursor-not-allowed" value={editForm.username} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <input readOnly aria-disabled="true" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-gray-50 cursor-not-allowed" value={editForm.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Full name</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Phone</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900">Address</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Age</label>
              <input type="number" min={0} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.age || ''} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">City</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">State</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.state || ''} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Country</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.country || ''} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">ZIP code</label>
              <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={editForm.zipCode || ''} onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm">Cancel</button>
          <button onClick={saveEdit} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Save</button>
        </ModalFooter>
      </Modal>

      {/* Security */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Current password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">New password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Confirm password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </div>
        </div>
        {pwError && <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 mt-3">{pwError}</p>}
        <div className="mt-4">
          <button onClick={changePassword} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Change password</button>
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

function KV({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 break-words">{(value ?? '') !== '' ? value : '-'}</dd>
    </div>
  );
}
