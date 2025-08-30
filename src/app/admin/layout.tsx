import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin • HospiLink',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-lg font-semibold text-gray-900">Admin Dashboard</Link>
            <div className="hidden sm:block text-sm text-gray-600">HospiLink</div>
          </div>
          <nav className="mt-3 -mb-2 overflow-x-auto">
            <ul className="flex items-center gap-2 text-sm">
              {[
                { href: '/admin', label: 'Overview' },
                { href: '/admin/appointments', label: 'Appointments' },
                { href: '/admin/doctors', label: 'Doctors' },
                { href: '/admin/patients', label: 'Patients' },
                { href: '/admin/departments', label: 'Departments' },
                { href: '/admin/reviews', label: 'Reviews' },
                { href: '/admin/settings', label: 'Settings' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block px-3 py-2 rounded-md border border-transparent text-gray-700 hover:text-blue-700 hover:border-blue-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
