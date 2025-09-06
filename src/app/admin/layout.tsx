import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import AdminNav from './_components/AdminNav';
import RequireRole from '@/components/providers/RequireRole';
import LogoMark from '@/components/LogoMark';

export const metadata: Metadata = {
  title: 'Admin • HospiLink',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
  <div className="min-h-screen bg-white">
  <RequireRole role="admin" fallbackHref="/">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-lg font-semibold text-gray-900">Admin Dashboard</Link>
            <div className="hidden sm:flex items-center gap-2 text-gray-600">
              <LogoMark className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-base md:text-[1.05rem] leading-tight">HospiLink</span>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      </RequireRole>
    </div>
  );
}
