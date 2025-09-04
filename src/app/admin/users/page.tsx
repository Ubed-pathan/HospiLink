'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import { adminUserAPI } from '@/lib/api-services';
import type { User } from '@/lib/types';
import { z } from 'zod';
import { adminUserSchema, type AdminUserFormData } from '@/lib/validations';
import { User as UserIcon, Mail, Phone, IdCard, Search as SearchIcon } from 'lucide-react';

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
  const empty: AdminUserFormData = { name: '', username: '', email: '', phoneNumber: '', role: 'doctor', password: '' };
  const [form, setForm] = useState<AdminUserFormData>(empty);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // We now always show only admins

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
    const matchesQuery = (u: User) => !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q);
    const matchesRole = (u: User) => {
      const roles = (u.roles && u.roles.length ? u.roles : [u.role]) as Array<'patient' | 'doctor' | 'admin'>;
      // Only show users that have admin role
      return roles.includes('admin');
    };
    return users.filter((u) => matchesQuery(u) && matchesRole(u));
  }, [users, search]);

  // Creation of users is disabled on this view
  const openEdit = (u: User) => {
    setMode('edit');
    setEditingId(u.id);
    setForm({ name: u.name, username: (u.email || '').split('@')[0] || '', email: u.email, phoneNumber: u.phone || u.contactNumber || '', role: u.role, password: '' });
    setFormErrors({});
    setIsOpen(true);
  };

  const validate = (data: AdminUserFormData) => {
    // For create, keep full validation; for edit, only require name
    if (mode === 'edit') {
      const nameOk = !!data.name && data.name.trim().length > 0;
      if (!nameOk) setFormErrors({ name: 'Name is required' }); else setFormErrors({});
      return nameOk;
    }
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
        // Creation disabled; skip
      } else if (editingId) {
        // Only allow updating the name
        await adminUserAPI.update(editingId, { name: form.name });
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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
  <div className="flex items-center gap-2 md:ml-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon className="w-4 h-4" /></span>
            <Input tone="blue" forceLight className="pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
  {/* Role filter removed: admins only */}
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
                <th className="py-2 px-3">Username</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
        <tr key={u.id} className="border-b last:border-0 hover:bg-blue-50/40">
                  <td className="py-2 px-3 text-gray-900">{u.name}</td>
                  <td className="py-2 px-3 text-gray-900">{u.email}</td>
                  <td className="py-2 px-3 text-gray-900">{u.phone || u.contactNumber || '-'}</td>
                  <td className="py-2 px-3 text-black">{(u.email || '').includes('@') ? (u.email || '').split('@')[0] : ''}</td>
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
      <Input tone="blue" forceLight brandError label="Username" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<IdCard />} value={form.username} disabled readOnly error={undefined} />
      <Input tone="blue" forceLight brandError type="email" label="Email" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Mail />} value={form.email} disabled readOnly error={undefined} />
      <Input tone="blue" forceLight brandError label="Phone" labelClassName="text-gray-900" iconClassName="text-gray-600" leftIcon={<Phone />} value={form.phoneNumber} disabled readOnly error={undefined} />
          </div>
        </div>

    {/* Role & Security removed in edit: only name can be changed */}

        <ModalFooter className="sticky bottom-0 bg-white">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-blue-600 hover:bg-blue-100">Cancel</Button>
          <Button variant="primary" onClick={submit} isLoading={isLoading} className="!bg-blue-600 !text-white hover:!bg-blue-700">Save</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
