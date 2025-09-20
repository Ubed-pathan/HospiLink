'use client';

import React from 'react';
import { doctorAPI, adminReviewAPI } from '@/lib/api-services';
import type { Doctor, AdminFeedbackDto } from '@/lib/types';

export default function AdminReviewsPage() {
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [feedbacks, setFeedbacks] = React.useState<AdminFeedbackDto[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await doctorAPI.getAllDoctors();
        if (!active) return;
        setDoctors(list);
        if (list.length > 0) {
          setSelectedDoctorId(list[0].id);
        }
      } catch {
        // graceful fallback to empty
      }
    })();
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      const doctorId = doctor?.id;
      if (!doctorId) { setFeedbacks([]); return; }
      try {
        setLoading(true);
        setError(null);
        const list = await adminReviewAPI.getFeedbacksForAdmin(doctorId);
        if (!active) return;
        setFeedbacks(list);
      } catch (e) {
        if (!active) return;
        const err = e as { message?: string };
        setError(err?.message || 'Failed to load reviews');
        setFeedbacks([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedDoctorId, doctors]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.specialty || d.specialization || '').toLowerCase().includes(q)
    );
  }, [doctors, query]);

  const selectedDoctor = React.useMemo(() => doctors.find(d => d.id === selectedDoctorId) || null, [doctors, selectedDoctorId]);

  const doctorReviews = React.useMemo(() => {
    const list = feedbacks || [];
    return list.map((f) => ({
      id: f.feedbackId || f.appointmentId,
      userName: f.userFullName || 'User',
      userEmail: f.userEmail || '',
      rating: f.rating,
      comment: f.review,
      createdAt: f.appointmentTime,
      appointmentId: f.appointmentId,
      feedbackId: f.feedbackId,
    }));
  }, [feedbacks]);

  const derivedStats = React.useMemo(() => {
    const list = feedbacks || [];
    const count = list.length;
    if (count === 0) return { avg: 0, count: 0 };
    const sum = list.reduce((acc, f) => acc + (typeof f.rating === 'number' ? f.rating : 0), 0);
    return { avg: sum / count, count };
  }, [feedbacks]);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Doctors list */}
        <aside className="md:col-span-4 lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="text-sm font-medium text-gray-700">Doctors</div>
            <div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or specialty..."
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>
          <ul className="max-h-[70vh] overflow-auto">
            {filtered.map((doc) => {
              const active = selectedDoctorId === doc.id;
              return (
                <li key={doc.id}>
                  <button
                    onClick={() => { setSelectedDoctorId(doc.id); }}
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
                  <div className="text-sm text-gray-600">⭐ {derivedStats.count > 0 ? derivedStats.avg.toFixed(1) : '-'} · {derivedStats.count} {derivedStats.count === 1 ? 'review' : 'reviews'}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Reviews ({doctorReviews.length})</div>
                </div>
                {loading ? (
                  <div className="p-6 text-sm text-gray-500">Loading…</div>
                ) : error ? (
                  <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>
                ) : doctorReviews.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500">No reviews yet for this doctor.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {doctorReviews.map((rev) => (
                      <li key={rev.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rev.userName}</div>
                            <div className="text-xs text-gray-500">{rev.userEmail}</div>
                            <div className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-700">⭐ {rev.rating}</div>
                            {!!rev.feedbackId && (
                              confirmDeleteId === rev.feedbackId ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    className="text-xs px-2 py-1 rounded border border-red-500 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                    disabled={deletingId === rev.feedbackId}
                                    onClick={async () => {
                                      try {
                                        if (!rev.feedbackId) return;
                                        setDeletingId(rev.feedbackId);
                                        await adminReviewAPI.deleteFeedback(rev.feedbackId);
                                        setFeedbacks((prev) => (prev || []).filter((f) => f.feedbackId !== rev.feedbackId));
                                      } catch (e) {
                                        const err = e as { response?: { data?: { message?: string } }; message?: string };
                                        alert(err?.response?.data?.message || err?.message || 'Failed to delete review');
                                      } finally {
                                        setDeletingId(null);
                                        setConfirmDeleteId(null);
                                      }
                                    }}
                                  >
                                    {deletingId === rev.feedbackId ? 'Deleting…' : 'Confirm'}
                                  </button>
                                  <button
                                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                                    disabled={deletingId === rev.feedbackId}
                                    onClick={() => setConfirmDeleteId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                                  disabled={deletingId === rev.feedbackId}
                                  onClick={() => setConfirmDeleteId(rev.feedbackId || null)}
                                >
                                  Delete
                                </button>
                              )
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{rev.comment || '—'}</p>
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
