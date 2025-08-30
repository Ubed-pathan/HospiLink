import React from 'react';
import Link from 'next/link';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/doctor" className="text-lg font-semibold text-gray-900">Doctor Panel</Link>
            <div className="hidden sm:block text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</div>
          </div>
          <nav className="mt-3 -mb-2 overflow-x-auto">
            <ul className="flex items-center gap-2 text-sm">
              {[
                { href: '/doctor', label: 'Overview' },
                { href: '/doctor/appointments', label: 'Appointments' },
                { href: '/doctor/schedule', label: 'Schedule' },
                { href: '/doctor/patients', label: 'Patients' },
                { href: '/doctor/reviews', label: 'Reviews' },
                { href: '/doctor/settings', label: 'Settings' },
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
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
