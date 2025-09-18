'use client';

import React from 'react';
import { authAPI, appointmentAPI } from '@/lib/api-services';
import type { DoctorAppointmentDto } from '@/lib/types';
import RatingStars from '@/components/ui/RatingStars';

export default function DoctorReviewsPage() {
  const [username, setUsername] = React.useState<string>('');
  const [appointments, setAppointments] = React.useState<DoctorAppointmentDto[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await authAPI.loadOnRefresh();
        const u = (r?.user ?? r) as { username?: string } | null;
        const un = u?.username || '';
        if (!active) return;
        setUsername(un);
      } catch {
        // ignore; page may redirect elsewhere if unauthenticated
      }
    })();
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!username) return;
      try {
        setLoading(true);
        setError(null);
        const list = await appointmentAPI.getDoctorAppointments(username);
        if (!active) return;
        setAppointments(list);
      } catch (e) {
        if (!active) return;
        const err = e as { message?: string };
        setError(err?.message || 'Failed to load reviews');
        setAppointments([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [username]);

  const reviews = React.useMemo(() => {
    const list = appointments || [];
    const completedWithFeedback = list.filter(
      (a) => String(a.appointmentStatus).toLowerCase() === 'completed' && a.didUserGiveFeedback && Array.isArray(a.feedbacks) && a.feedbacks.length > 0
    );
    return completedWithFeedback.flatMap((a) => {
      const fb = a.feedbacks![0];
      return [{
        id: String(a.appointmentId),
        userName: a.usersFullName || 'User',
        userEmail: a.userEmail || '',
        rating: fb.rating || 0,
        comment: fb.review || '',
        createdAt: a.appointmentTime,
      }];
    });
  }, [appointments]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {reviews.map((rev) => (
            <li key={rev.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{rev.userName}</div>
                  <div className="text-xs text-gray-500">{rev.userEmail}</div>
                  <div className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars value={rev.rating} onChange={() => {}} disabled size="sm" label="Rating" />
                  <span className="text-sm text-gray-700">{rev.rating.toFixed(0)}/5</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{rev.comment || '—'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
