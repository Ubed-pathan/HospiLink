/**
 * Departments Page
 * Shows all departments with descriptions and doctor counts
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import { mockDepartments } from '@/lib/mock-data';
import { doctorAPI } from '@/lib/api-services';
import type { Doctor } from '@/lib/types';

export default function DepartmentsPage() {
  const departments = mockDepartments;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await doctorAPI.getAllDoctors();
        if (!active) return;
        setDoctors(Array.isArray(list) ? list : []);
        setError(null);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Failed to load doctors';
        setError(msg);
      }
    })();
    return () => { active = false; };
  }, []);

  const countsByDept = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of departments) map.set(d.id, 0);
    const isAvailable = (doc: Doctor) => (Array.isArray(doc.availableSlots) && doc.availableSlots.length > 0) || doc.isAvailable === true;
    for (const doc of doctors) {
      if (!isAvailable(doc)) continue;
      const id = doc.departmentId ?? '';
      if (!id) continue;
      if (!map.has(id)) map.set(id, 0);
      map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [departments, doctors]);

  return (
    <div className="min-h-screen bg-white">
      <NavHeader />

      <section className="bg-white border-b border-gray-100 pt-16">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Departments</h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our medical departments and find the right care for your needs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {departments.map((dept, idx) => {
        const count = countsByDept.get(dept.id) ?? 0;
                const colorPool = ['#0E1F2F', '#24425D', '#8747D0', '#C18DB4', '#0E1B4B', '#10B981'];
                const color = colorPool[idx % colorPool.length];
                const initials = dept.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={dept.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: color }}>
                          {initials}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">{dept.name}</h3>
                          <p className="text-gray-600 text-sm md:text-base mt-1">{dept.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{count}</span> doctor{count === 1 ? '' : 's'} available
                        </div>
                        <Link
                          href="/doctors"
                          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-md bg-blue-600 text-white text-sm md:text-base font-medium hover:bg-blue-700"
                        >
                          View doctors
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {error && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
