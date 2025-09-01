'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { adminUserAPI } from '@/lib/api-services';
import type { User } from '@/lib/types';
import { z } from 'zod';
import { adminUserSchema, type AdminUserFormData } from '@/lib/validations';
import { User as UserIcon, Mail, Phone, IdCard, Lock, Search as SearchIcon } from 'lucide-react';

type Mode = 'create' | 'edit';

function extractErrorMessage(e: unknown): string | undefined {
  if (!e) return undefined;
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  const maybeAxios = e as { response?: { data?: { message?: string } } ; message?: string };
  return maybeAxios?.response?.data?.message || maybeAxios?.message;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const empty: AdminUserFormData = { name: '', username: '', email: '', phoneNumber: '', role: 'patient', password: '' };
  const [form, setForm] = useState<AdminUserFormData>(empty);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminUserAPI.list();
      setUsers(data);
    } catch (e: unknown) {
      setError(extractErrorMessage(e) || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q));
  }, [users, search]);

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    setForm(empty);
    setFormErrors({});
    setIsOpen(true);
  };
  const openEdit = (u: User) => {
    setMode('edit');
    setEditingId(u.id);
    setForm({ name: u.name, username: (u.email || '').split('@')[0] || '', email: u.email, phoneNumber: u.phone || u.contactNumber || '', role: u.role, password: '' });
    setFormErrors({});
    setIsOpen(true);
  };

  const validate = (data: AdminUserFormData) => {
    try {
      adminUserSchema.parse(data);
      setFormErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errs: Record<string, string> = {};
        e.issues.forEach((i) => { errs[i.path.join('.')] = i.message; });
        setFormErrors(errs);
      }
      return false;
    }
  };

  const submit = async () => {
    if (!validate(form)) return;
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await adminUserAPI.create(form);
      } else if (editingId) {
        await adminUserAPI.update(editingId, form);
      }
      setIsOpen(false);
      await load();
    } catch (e: unknown) {
      setError(extractErrorMessage(e) || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setIsLoading(true);
    try {
      await adminUserAPI.remove(id);
      await load();
    } catch (e: unknown) {
      setError(extractErrorMessage(e) || 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon className="w-4 h-4" /></span>
            <Input tone="blue" forceLight className="pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="primary" className="!bg-blue-600 !text-white hover:!bg-blue-700" onClick={openCreate}>Add User</Button>
        </div>
      </div>

      {error && <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
        <tr key={u.id} className="border-b last:border-0 hover:bg-blue-50/40">
                  <td className="py-2 px-3 text-gray-900">{u.name}</td>
                  <td className="py-2 px-3 text-gray-900">{u.email}</td>
                  <td className="py-2 px-3 text-gray-900">{u.phone || u.contactNumber || '-'}</td>
                  <td className="py-2 px-3 text-gray-900">{u.role}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-50" onClick={() => openEdit(u)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(u.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={mode === 'create' ? 'Add User' : 'Edit User'} size="lg">
        {/* Account Information */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="bg-blue-100/60 px-4 py-2">
            <h3 className="text-sm font-semibold text-blue-700">Account Information</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input tone="blue" forceLight brandError label="Name" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<UserIcon />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} />
            <Input tone="blue" forceLight brandError label="Username" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<IdCard />} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={formErrors.username} />
            <Input tone="blue" forceLight brandError type="email" label="Email" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Mail />} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} />
            <Input tone="blue" forceLight brandError label="Phone (10 digits)" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Phone />} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} error={formErrors.phoneNumber} />
          </div>
        </div>

        {/* Role & Security */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-blue-100/60 px-4 py-2">
            <h3 className="text-sm font-semibold text-blue-700">Role & Security</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Role</label>
              <select className="mt-2 block w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminUserFormData['role'] })}>
                <option value="patient">patient</option>
                <option value="doctor">doctor</option>
                <option value="admin">admin</option>
              </select>
              {formErrors.role && <p className="text-sm text-blue-600 mt-1">{formErrors.role}</p>}
            </div>
            <Input tone="blue" forceLight brandError type="password" label="Password" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Lock />} value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} error={formErrors.password} />
          </div>
        </div>

        <ModalFooter className="sticky bottom-0 bg-white">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-blue-600 hover:bg-blue-100">Cancel</Button>
          <Button variant="primary" onClick={submit} isLoading={isLoading} className="!bg-blue-600 !text-white hover:!bg-blue-700">{mode === 'create' ? 'Create' : 'Save'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
