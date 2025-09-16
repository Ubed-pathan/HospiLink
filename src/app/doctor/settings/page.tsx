'use client';

import React from 'react';
import { doctorAPI, authAPI } from '@/lib/api-services';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import type { Doctor } from '@/lib/types';

type AuthUser = {
  id?: string;
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
  const [doctor, setDoctor] = React.useState<Doctor | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [pwForm, setPwForm] = React.useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    age: '',
  });
  const enrichTriedRef = React.useRef(false);
  // Populate form whenever modal opens and 'me' available (ensures names appear)
  React.useEffect(() => {
    if (!editOpen || !me) return;
    // Derive first/middle/last if missing using 'name'
    let { firstName, middleName, lastName } = me;
    if (!firstName && me.name) {
      const parts = me.name.trim().split(/\s+/);
      firstName = parts[0] || '';
      if (parts.length === 2) {
        lastName = parts[1];
      } else if (parts.length > 2) {
        middleName = parts.slice(1, parts.length - 1).join(' ');
        lastName = parts[parts.length - 1];
      }
    }
    setForm(f => ({
      ...f,
      firstName: firstName || '',
      middleName: middleName || '',
      lastName: lastName || '',
      email: me.email || f.email,
      username: me.username || f.username,
      phone: me.phoneNumber || f.phone,
      gender: (me.gender === 'male' || me.gender === 'female' || me.gender === 'other' ? me.gender : f.gender) as typeof f.gender,
      address: me.address || f.address,
      city: me.city || f.city,
      state: me.state || f.state,
      country: me.country || f.country,
      zipCode: me.zipCode || f.zipCode,
      age: typeof me.age === 'number' ? String(me.age) : f.age,
    }));
  }, [editOpen, me]);

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

  // Fetch doctor profile by username (full DTO)
  React.useEffect(() => {
    if (!me?.username) return;
    let cancelled = false;
    (async () => {
      try {
        const d = await doctorAPI.getByUsername(me.username!);
        if (!cancelled) {
          // Map DTO into our Doctor type shape minimally for display fields already used
          const mapped: Doctor = {
            id: String(d.id || ''),
            name: [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() || d.username || 'Doctor',
            email: d.email,
            phone: d.phoneNumber,
            specialization: d.specialization,
            department: undefined,
            departmentId: undefined,
            experience: typeof d.experienceYears === 'number' ? d.experienceYears : 0,
            qualification: d.qualification ? d.qualification.split(',').map(q=> q.trim()).filter(Boolean) : undefined,
            rating: typeof d.rating === 'number' ? d.rating : 0,
            reviewCount: typeof d.reviewCount === 'number' ? d.reviewCount : 0,
            location: d.doctorAddress || d.city,
            availableSlots: (d.availableTimeFrom && d.availableTimeTo) ? [d.availableTimeFrom, d.availableTimeTo] : undefined,
            isAvailable: Boolean(d.isPresent),
            createdAt: d.joinedDate ? String(d.joinedDate) : undefined,
            updatedAt: undefined,
          } as Doctor;
          setDoctor(mapped);
          // Also enrich 'me' with missing fields directly from DTO
          setMe(prev => prev ? {
            ...prev,
            firstName: prev.firstName || d.firstName,
            middleName: prev.middleName || d.middleName,
            lastName: prev.lastName || d.lastName,
            phoneNumber: prev.phoneNumber || d.phoneNumber,
            address: prev.address || d.doctorAddress,
            city: prev.city || d.city,
            state: prev.state || d.state,
            country: prev.country || d.country,
            zipCode: prev.zipCode || d.zipCode,
            age: typeof prev.age === 'number' ? prev.age : (typeof d.age === 'number' ? d.age : prev.age),
            gender: prev.gender ?? (d.gender as string | null | undefined) ?? null,
          } : prev);
        }
      } catch {
        if (!cancelled) setDoctor(null);
      }
    })();
    return () => { cancelled = true; };
  }, [me?.username]);

  // Enrich user data via loadOnRefresh if some fields missing
  React.useEffect(() => {
    if (!me) return;
    if (enrichTriedRef.current) return; // already attempted enrichment
    const missing = [
      me.phoneNumber,
      me.address,
      me.city,
      me.state,
      me.country,
      me.zipCode,
    ].some(v => !v);
    // Treat age/gender as optional; do not loop if backend returns null/undefined
    if (!missing) {
      enrichTriedRef.current = true;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await authAPI.loadOnRefresh();
        const u = (data?.user ?? data) as Partial<AuthUser> | undefined;
        if (!u || cancelled) return;
        setMe(prev => ({
          ...prev,
          firstName: prev?.firstName || u.firstName,
          middleName: prev?.middleName || u.middleName,
          lastName: prev?.lastName || u.lastName,
          phoneNumber: prev?.phoneNumber || u.phoneNumber,
          address: prev?.address || u.address,
          city: prev?.city || u.city,
          state: prev?.state || u.state,
          country: prev?.country || u.country,
          zipCode: prev?.zipCode || u.zipCode,
          gender: prev?.gender !== undefined ? prev?.gender : (u.gender as string | null | undefined) ?? null,
          age: typeof prev?.age === 'number' ? prev?.age : (typeof u.age === 'number' ? u.age : prev?.age),
        }));
      } catch {
        // swallow
      } finally {
        enrichTriedRef.current = true; // prevent further attempts regardless of success
      }
    })();
    return () => { cancelled = true; };
  }, [me]);

  const fullName = React.useMemo(() => {
    if (!me) return '';
    const composed = [me.firstName, me.middleName, me.lastName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Prefer composed pieces so middleName shows; fallback to provided name
    return composed || (me.name?.trim() || '');
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

  const changePassword = async () => {
    // Placeholder: backend endpoint may not be wired in this project.
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

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E1F2F] via-[#24425D] to-[#8747D0] opacity-95" />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/10 text-white flex items-center justify-center text-xl md:text-2xl font-bold ring-1 ring-white/20 backdrop-blur">
              {initials}
            </div>
            <div className="text-white">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{fullName || 'Doctor'}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs md:text-sm text-white/80">
                <span>@{displayUsername || 'username'}</span>
                {rolesText && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-white/10 ring-1 ring-white/20 text-white/90">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-80"><path d="M12 2l3 7h7l-5.5 4 2.5 7-7-4.5L5.5 20 8 13 2 9h7l3-7z" fill="currentColor"/></svg>
                    {rolesText}
                  </span>
                )}
                {me?.email && <span className="opacity-90">{me.email}</span>}
                {me?.phoneNumber && <span className="opacity-90">• {me.phoneNumber}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (me) {
                  setForm({
                    firstName: me.firstName || '',
                    middleName: me.middleName || '',
                    lastName: me.lastName || '',
                    email: me.email || '',
                    username: me.username || '',
                    phone: me.phoneNumber || '',
                    gender: (me.gender === 'male' || me.gender === 'female' || me.gender === 'other' ? me.gender : '') as '' | 'male' | 'female' | 'other',
                    address: me.address || '',
                    city: me.city || '',
                    state: me.state || '',
                    country: me.country || '',
                    zipCode: me.zipCode || '',
                    age: typeof me.age === 'number' ? String(me.age) : '',
                  });
                }
                setEditOpen(true);
              }}
              className="px-4 py-2 rounded-md bg-white text-[#0E1F2F] text-sm font-medium hover:bg-white/90 shadow-sm"
            >Edit Profile</button>
          </div>
        </div>
      </section>

      {/* Account details */}
      <section className="bg-white/80 backdrop-blur border border-gray-200/60 shadow-sm rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <KV label="Full name" value={fullName || '-'} />
          <KV label="Email" value={me?.email || '-'} />
          <KV label="Username" value={displayUsername || '-'} />
          <KV label="Roles" value={rolesText || '-'} />
          <KV label="Phone" value={me?.phoneNumber || '-'} />
          <KV label="Gender" value={(me?.gender ?? '-') as string} />
          <KV label="Age" value={(me?.age ?? '-') as unknown as string} />
          <div className="sm:col-span-2">
            <KV label="Address" value={me?.address || '-'} />
          </div>
          <KV label="City" value={me?.city || '-'} />
          <KV label="State" value={me?.state || '-'} />
          <KV label="Country" value={me?.country || '-'} />
          <KV label="ZIP code" value={me?.zipCode || '-'} />
        </dl>
      </section>

      {/* Doctor Profile Card (restored) */}
      <section className="bg-white/80 backdrop-blur border border-gray-200/60 shadow-sm rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Doctor Profile</h3>
        {!doctor ? (
          <p className="text-sm text-gray-600">Doctor details not available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Specialization" value={doctor.specialization || '-'} />
            <Info label="Experience" value={typeof doctor.experience === 'number' ? `${doctor.experience} years` : '-'} />
            <Info label="Qualification" value={Array.isArray(doctor.qualification) ? (doctor.qualification.join(', ') || '-') : '-'} />
            <Info label="Clinic / Address" value={me?.address || doctor.location || '-'} />
            <Info label="City" value={me?.city || '-'} />
            <Info label="State" value={me?.state || '-'} />
            <Info label="Country" value={me?.country || '-'} />
            <Info label="ZIP Code" value={me?.zipCode || '-'} />
            <Info label="Availability" value={doctor.availableSlots && doctor.availableSlots.length >= 2 ? `${doctor.availableSlots[0]} - ${doctor.availableSlots[1]}` : '—'} />
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="mt-0.5 text-sm">
                {doctor.isAvailable ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-green-50 text-green-700 border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> Present
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-red-50 text-red-700 border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Absent
                  </span>
                )}
              </div>
            </div>
            <Info label="Rating" value={typeof doctor.rating === 'number' ? `${doctor.rating.toFixed(1)} / 5` : '-'} />
            <Info label="Reviews" value={typeof doctor.reviewCount === 'number' ? doctor.reviewCount : '-'} />
            <Info label="Joined" value={doctor.createdAt ? new Date(doctor.createdAt).toLocaleString() : '-'} />
          </div>
        )}
      </section>
      {/* Edit Modal */}
      {editOpen && (
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="lg">
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={form.middleName}
                  onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <input
                  type="text"
                  value={form.gender}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            {saveError && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{saveError}</div>
            )}
          </form>
          <ModalFooter>
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              type="button"
            >Cancel</button>
            <button
              type="button"
              disabled={saving || !me?.id}
              onClick={async () => {
                if (!me?.id || !doctor?.id) return;
                try {
                  setSaving(true);
                  setSaveError(null);
                  // Build payload with fallback to previous values if inputs are blank
                  const t = (v?: string) => (v ?? '').trim();
                  const prev = {
                    firstName: me.firstName || '',
                    middleName: me.middleName || '',
                    lastName: me.lastName || '',
                    phoneNumber: me.phoneNumber || '',
                    email: me.email || '',
                    city: me.city || '',
                    state: me.state || '',
                    zipCode: me.zipCode || '',
                    address: me.address || '',
                    age: typeof me.age === 'number' ? me.age : undefined,
                  };
                  const firstName = t(form.firstName) || prev.firstName;
                  const middleName = t(form.middleName) || prev.middleName;
                  const lastName = t(form.lastName) || prev.lastName;
                  const phoneNumber = t(form.phone) || prev.phoneNumber;
                  const email = t(form.email) || prev.email;
                  const city = t(form.city) || prev.city;
                  const state = t(form.state) || prev.state;
                  const zipCode = t(form.zipCode) || prev.zipCode;
                  const address = t(form.address) || prev.address;
                  const ageParsed = Number(t(form.age));
                  const age = Number.isFinite(ageParsed) && ageParsed > 0 ? ageParsed : (typeof prev.age === 'number' && prev.age > 0 ? prev.age : 18);
                  const payload = { firstName, middleName, lastName, phoneNumber, email, age, city, state, zipCode, address };
                  await doctorAPI.selfUpdateDoctor(doctor.id, payload);
                  // Reflect changes locally
                  setMe(prev => prev ? {
                    ...prev,
                    firstName,
                    middleName,
                    lastName,
                    phoneNumber,
                    address,
                    city,
                    state,
                    zipCode,
                    age,
                    email,
                  } : prev);
                  setDoctor(prev => prev ? {
                    ...prev,
                    name: [firstName, middleName, lastName].filter(Boolean).join(' ').replace(/\s+/g,' ').trim() || prev.name,
                    email,
                    phone: phoneNumber,
                    location: address || prev.location,
                  } : prev);
                  setEditOpen(false);
                } catch (e) {
                  const err = e as { response?: { data?: { message?: string } }; message?: string };
                  setSaveError(err?.response?.data?.message || err?.message || 'Failed to save changes');
                } finally {
                  setSaving(false);
                }
              }}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >{saving ? 'Saving…' : 'Save Changes'}</button>
          </ModalFooter>
        </Modal>
      )}

      {/* Security */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Current password</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">New password</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Confirm password</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            />
          </div>
        </div>
        {pwError && (
          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 mt-3">{pwError}</p>
        )}
        <div className="mt-4">
          <button
            onClick={changePassword}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Change password
          </button>
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

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm text-gray-900 break-words">{(value ?? '') !== '' ? value : '-'}</div>
    </div>
  );
}
