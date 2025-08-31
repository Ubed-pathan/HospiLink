import React from 'react';
import Link from 'next/link';
import DoctorNav from '@/components/layout/DoctorNav';
import RequireRole from '@/components/providers/RequireRole';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <RequireRole role="doctor" fallbackHref="/auth/signin">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/doctor" className="text-lg font-semibold text-gray-900">Doctor Panel</Link>
              <div className="hidden sm:block text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</div>
            </div>
            <DoctorNav />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </RequireRole>
    </div>
  );
}
