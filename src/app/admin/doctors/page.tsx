'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { doctorAPI } from '@/lib/api-services';
import { Doctor } from '@/lib/types';
import { z } from 'zod';
import { doctorRegisterSchema, type DoctorRegisterFormData } from '@/lib/validations';
import { Plus, Search, User as UserIcon, Mail, Phone, IdCard, MapPin, Clock as ClockIcon, Lock, Hash } from 'lucide-react';

type FormMode = 'create' | 'edit';

function extractErrorMessage(e: unknown): string | undefined {
  if (!e) return undefined;
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  const maybeAxios = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
  return maybeAxios?.response?.data?.message || maybeAxios?.message;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm: DoctorRegisterFormData = useMemo(() => ({
    firstName: '', middleName: '', lastName: '', username: '', email: '', phoneNumber: '', gender: '', age: 0, specialization: '', experienceYears: 0, qualification: '', licenseNumber: '', doctorAddress: '', availableTimeFrom: '', availableTimeTo: '', city: '', state: '', country: '', zipCode: '', password: '', isPresent: true,
  }), []);
  const [form, setForm] = useState<DoctorRegisterFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [presence, setPresence] = useState<'all' | 'present' | 'absent'>('all');

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await doctorAPI.getAllDoctors();
      setDoctors(list);
    } catch (e: unknown) {
      const msg = extractErrorMessage(e) || 'Failed to load doctors';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setMode('edit');
    setEditingId(doc.id);
    // Map Doctor -> DoctorRegisterFormData best-effort
    const [firstName, middleName, lastName] = (doc.name || '').split(' ');
    setForm({
      firstName: firstName || '',
      middleName: middleName || '',
      lastName: lastName || '',
      username: (doc.email || '').split('@')[0] || '',
      email: doc.email || '',
      phoneNumber: doc.phone || '',
      gender: 'male',
      age: 0,
      specialization: doc.specialization || doc.specialty || '',
      experienceYears: doc.experience || 0,
      qualification: (doc.qualification || []).join(', '),
      licenseNumber: '',
      doctorAddress: doc.location || '',
      availableTimeFrom: doc.availableSlots?.[0] || '',
      availableTimeTo: doc.availableSlots?.[1] || '',
      city: '', state: '', country: '', zipCode: '',
      password: '',
      isPresent: !!doc.isAvailable,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = (data: DoctorRegisterFormData) => {
    try {
      doctorRegisterSchema.parse(data);
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((i) => {
          const path = i.path.join('.') || '_';
          errors[path] = i.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const submit = async () => {
    if (!validate(form)) return;
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await doctorAPI.registerDoctor(form);
      } else if (editingId) {
        await doctorAPI.adminUpdateDoctor(editingId, form);
      }
      setIsModalOpen(false);
      await fetchDoctors();
    } catch (e: unknown) {
      setError(extractErrorMessage(e) || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Prefill the form with valid dummy data
  const fillWithDummy = () => {
    const dummy: DoctorRegisterFormData = {
      firstName: 'Arjun',
      middleName: '',
      lastName: 'Sethi',
      username: 'arjun.sethi',
      email: 'arjun.sethi@example.com',
      phoneNumber: '9123456780',
      gender: 'male',
      age: 36,
      specialization: 'Cardiologist',
      experienceYears: 10,
      qualification: 'MBBS, MD (Cardiology), DM (Cardiology)',
      licenseNumber: 'MCI/MH/789012',
      doctorAddress: 'Sethi Heart Clinic, 3rd Floor, Linking Rd',
      availableTimeFrom: '10:00',
      availableTimeTo: '16:00',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      password: 'StrongP@ss1',
      isPresent: true,
    };
    setForm(dummy);
    setFormErrors({});
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    setIsLoading(true);
    try {
      await doctorAPI.adminDeleteDoctor(id);
      await fetchDoctors();
    } catch (e: unknown) {
      setError(extractErrorMessage(e) || 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return doctors.filter((d) => {
    const matchesQuery = !q || (d.name || '').toLowerCase().includes(q) || (d.specialization || d.specialty || '').toLowerCase().includes(q) || (d.email || '').toLowerCase().includes(q);
      const matchesPresence = presence === 'all' || (presence === 'present' ? !!d.isAvailable : !d.isAvailable);
    return matchesQuery && matchesPresence;
    });
  }, [doctors, search, presence]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctors</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your medical staff, availability, and details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={openCreate} className="inline-flex gap-2 !bg-blue-600 !text-white hover:!bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Filters */}
  <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Search className="w-4 h-4" /></span>
              <Input tone="blue" forceLight className="pl-9" placeholder="Search by name, specialization, or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="md:ml-auto">
            <label className="block text-xs text-gray-500 mb-1">Presence</label>
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                aria-pressed={presence === 'all'}
                onClick={() => setPresence('all')}
                className={`px-3 py-1.5 text-sm border-r focus:outline-none ${presence === 'all' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                All
              </button>
              <button
                type="button"
                aria-pressed={presence === 'present'}
                onClick={() => setPresence('present')}
                className={`px-3 py-1.5 text-sm border-r focus:outline-none ${presence === 'present' ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Present
                </span>
              </button>
              <button
                type="button"
                aria-pressed={presence === 'absent'}
                onClick={() => setPresence('absent')}
                className={`px-3 py-1.5 text-sm focus:outline-none ${presence === 'absent' ? 'bg-red-50 text-red-700 border-red-200' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Absent
                </span>
              </button>
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
                <th className="py-2.5 px-3 w-[220px]">Name</th>
                <th className="py-2.5 px-3 w-[180px]">Specialization</th>
                <th className="py-2.5 px-3 w-[90px]">Experience</th>
                <th className="py-2.5 px-3 w-[260px]">Email</th>
                <th className="py-2.5 px-3 w-[150px]">Phone</th>
                <th className="py-2.5 px-3 w-[90px]">Rating</th>
                <th className="py-2.5 px-3 w-[110px]">Status</th>
                <th className="py-2.5 px-3 w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((d) => (
        <tr key={d.id} className="hover:bg-hospital-accent/5">
                  <td className="py-2.5 px-3 text-gray-900 w-[220px]">
                    <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-hospital-secondary text-white flex items-center justify-center text-xs font-semibold">
                        {(d.name || 'DR').split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-gray-500">ID: {d.id.slice(0,6)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 w-[180px] truncate text-gray-900" title={d.specialization || d.specialty || '-' }>
                    {d.specialization || d.specialty || '-'}
                  </td>
                  <td className="py-2 px-3 w-[90px] whitespace-nowrap text-gray-900">{d.experience ?? 0} yrs</td>
                  <td className="py-2 px-3 w-[260px] truncate text-gray-900" title={d.email || '-' }>
                    {d.email || '-'}
                  </td>
                  <td className="py-2 px-3 w-[150px] whitespace-nowrap text-gray-900" title={d.phone || '-' }>
                    {d.phone || '-'}
                  </td>
                  <td className="py-2 px-3 w-[90px] text-gray-900">⭐ {typeof d.rating === 'number' ? d.rating.toFixed(1) : (d.rating ?? '-')}</td>
                  <td className="py-2 px-3 w-[110px]">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${d.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{d.isAvailable ? 'Present' : 'Absent'}</span>
                  </td>
          <td className="py-2 px-3 w-[160px] whitespace-nowrap">
                    <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="!text-gray-900 hover:bg-gray-100" onClick={() => openEdit(d)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(d.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? 'Add Doctor' : 'Edit Doctor'} size="xl">
        {/* Personal Info Card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="bg-blue-100/60 px-4 py-2">
            <h3 className="text-sm font-semibold text-blue-700">Personal Information</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input tone="blue" forceLight brandError label="First Name" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<UserIcon />} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} error={formErrors.firstName} />
            <Input tone="blue" forceLight brandError label="Middle Name" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<UserIcon />} value={form.middleName || ''} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
            <Input tone="blue" forceLight brandError label="Last Name" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<UserIcon />} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} error={formErrors.lastName} />
            <Input tone="blue" forceLight brandError label="Username" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<IdCard />} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={formErrors.username} />
            <Input tone="blue" forceLight brandError type="email" label="Email" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Mail />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} />
            <Input tone="blue" forceLight brandError label="Phone (10 digits)" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Phone />} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} error={formErrors.phoneNumber} />
            <Input tone="blue" forceLight brandError type="number" label="Age" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<IdCard />} value={String(form.age)} onChange={(e) => setForm({ ...form, age: Number(e.target.value || 0) })} error={formErrors.age} />
            <div>
              <label className="block text-sm font-medium text-gray-900">Gender</label>
              <select className="mt-2 block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {formErrors.gender && <p className="text-sm text-blue-600 mt-1">{formErrors.gender}</p>}
            </div>
          </div>
        </div>

        {/* Professional Info Card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="bg-blue-100/60 px-4 py-2">
            <h3 className="text-sm font-semibold text-blue-700">Professional Information</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input tone="blue" forceLight brandError label="Specialization" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Hash />} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} error={formErrors.specialization} />
            <Input tone="blue" forceLight brandError type="number" label="Experience (years)" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Hash />} value={String(form.experienceYears)} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value || 0) })} error={formErrors['experienceYears']} />
            <Input tone="blue" forceLight brandError label="Qualification (comma separated)" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<IdCard />} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} error={formErrors.qualification} />
            <Input tone="blue" forceLight brandError label="License Number" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<IdCard />} value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} error={formErrors.licenseNumber} />
          </div>
        </div>

    {/* Address & Schedule Card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-100/60 px-4 py-2">
      <h3 className="text-sm font-semibold text-blue-700">Address & Schedule</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input tone="blue" forceLight brandError label="Doctor Address" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<MapPin />} value={form.doctorAddress} onChange={(e) => setForm({ ...form, doctorAddress: e.target.value })} error={formErrors.doctorAddress} />
            <Input tone="blue" forceLight brandError type="time" label="Available From" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<ClockIcon />} helperText="Clinic start time" value={form.availableTimeFrom} onChange={(e) => setForm({ ...form, availableTimeFrom: e.target.value })} error={formErrors.availableTimeFrom} />
            <Input tone="blue" forceLight brandError type="time" label="Available To" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<ClockIcon />} helperText="Clinic end time" value={form.availableTimeTo} onChange={(e) => setForm({ ...form, availableTimeTo: e.target.value })} error={formErrors.availableTimeTo} />
            <Input tone="blue" forceLight brandError label="City" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<MapPin />} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} error={formErrors.city} />
            <Input tone="blue" forceLight brandError label="State" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<MapPin />} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} error={formErrors.state} />
            <Input tone="blue" forceLight brandError label="Country" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<MapPin />} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} error={formErrors.country} />
            <Input tone="blue" forceLight brandError label="Zip Code" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Hash />} value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} error={formErrors.zipCode} />
            <Input tone="blue" forceLight brandError type="password" label="Password" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Lock />} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={formErrors.password} />
            <div className="flex items-center gap-2 mt-2">
              <input id="present" type="checkbox" className="custom-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2" checked={form.isPresent} onChange={(e) => setForm({ ...form, isPresent: e.target.checked })} />
              <label htmlFor="present" className="text-sm font-medium select-none">
                <span className={form.isPresent ? 'text-green-600' : 'text-red-600'}>
                  {form.isPresent ? 'Present' : 'Absent'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <ModalFooter className="sticky bottom-0 bg-white">
          <Button variant="ghost" onClick={fillWithDummy} className="text-blue-600 hover:bg-blue-100">Fill dummy</Button>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-blue-600 hover:bg-blue-100">Cancel</Button>
          <Button variant="primary" onClick={submit} isLoading={isLoading} className="!bg-blue-600 !text-white hover:!bg-blue-700">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
