'use client';

import React from 'react';
import { mockDoctors, mockReviews } from '@/lib/mock-data';

type Review = {
  id: string;
  doctorId: string;
  patientId: string;
  patientName?: string;
  rating: number;
  comment: string;
  appointmentId: string;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string | null>(mockDoctors[0]?.id ?? null);

  const doctors = mockDoctors;
  const reviews = mockReviews as Review[];

  const listForDoctor = React.useMemo(() => {
    if (!selectedDoctorId) return [] as Review[];
    return reviews.filter(r => r.doctorId === selectedDoctorId);
  }, [selectedDoctorId, reviews]);

  const selectedDoctor = React.useMemo(() => doctors.find(d => d.id === selectedDoctorId) || null, [doctors, selectedDoctorId]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Doctors list */}
        <aside className="md:col-span-4 lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700">Doctors</div>
          </div>
          <ul className="max-h-[70vh] overflow-auto">
            {doctors.map((doc) => {
              const active = selectedDoctorId === doc.id;
              return (
                <li key={doc.id}>
                  <button
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-gray-50 ${active ? 'bg-gray-50' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                      {doc.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-500 truncate">{doc.specialty || doc.specialization || 'Doctor'}</div>
                    </div>
                    <div className="text-xs text-gray-500">⭐ {typeof doc.rating === 'number' ? doc.rating.toFixed(1) : (doc.rating ?? '-')}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Reviews list */}
        <section className="md:col-span-8 lg:col-span-9">
          {!selectedDoctor ? (
            <div className="h-full min-h-[40vh] flex items-center justify-center border border-gray-200 rounded-lg"> 
              <div className="text-gray-500">Select a doctor to view reviews</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Selected Doctor</div>
                    <div className="text-base md:text-lg font-semibold text-gray-900">{selectedDoctor.name}</div>
                    <div className="text-xs text-gray-500">{selectedDoctor.specialty || selectedDoctor.specialization}</div>
                  </div>
                  <div className="text-sm text-gray-600">⭐ {typeof selectedDoctor.rating === 'number' ? selectedDoctor.rating.toFixed(1) : (selectedDoctor.rating ?? '-')} · {(selectedDoctor.reviewCount ?? 0)} reviews</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Reviews ({listForDoctor.length})</div>
                </div>
                {listForDoctor.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500">No reviews yet for this doctor.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {listForDoctor.map((rev) => (
                      <li key={rev.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rev.patientName || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-gray-700">⭐ {rev.rating}</div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{rev.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
