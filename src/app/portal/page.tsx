/**
 * Patient Portal Dashboard
 * Main dashboard for patients to manage appointments and view information
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Bell,
  Settings,
  Plus,
  Pill,
  Download,
  Activity,
  Trash2,
} from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import { mockNotifications } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { authAPI, userAPI, appointmentAPI } from '@/lib/api-services';
import type { UsersAppointmentsDto } from '@/lib/types';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import RatingStars from '@/components/ui/RatingStars';

type WithPhoneVariants = { phone?: string | null; contactNumber?: string | null; phoneNumber?: string | null; address?: string | null };
const getPhone = (p?: WithPhoneVariants | null) => (p?.phone || p?.contactNumber || p?.phoneNumber || '')?.toString() || '';
const toGender = (g?: string | null) => (g === 'male' || g === 'female' || g === 'other' ? g : '') as '' | 'male' | 'female' | 'other';

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();
  const [authResolved, setAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authAddress, setAuthAddress] = useState<string>('');
  const [authCity, setAuthCity] = useState<string>('');
  const [authStateName, setAuthStateName] = useState<string>('');
  const [authCountry, setAuthCountry] = useState<string>('');
  const [authZip, setAuthZip] = useState<string>('');
  const [authAge, setAuthAge] = useState<number | null>(null);
  const [authGender, setAuthGender] = useState<string>('');
  const [profile, setProfile] = useState<import('@/lib/types').User | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    age: '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const changePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError('Fill all fields');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    try {
      setPwError(null);
      const username = authUsername || ((form.email || '').split('@')[0]);
      if (!username) {
        setPwError('Username not available. Please reload.');
        return;
      }
      const res = await userAPI.changePasswordByUsername(username, pwForm.current, pwForm.next);
      const msg = (typeof res === 'string') ? res : (res?.message || 'Password changed successfully.');
      setPwError(msg);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      const err = e as { response?: { data?: unknown } ; message?: string };
      const data = err?.response?.data as { message?: string } | string | undefined;
      const msg = (typeof data === 'string') ? data : (data?.message || err?.message || 'Failed to change password');
      setPwError(msg);
    }
  };

  // Appointments state from backend (must be before any early returns)
  const [myAppointments, setMyAppointments] = useState<UsersAppointmentsDto[] | null>(null);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(false);
  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState<{ appointmentId: string; doctorId: string; doctorName: string } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackReview, setFeedbackReview] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackSaving, setFeedbackSaving] = useState<boolean>(false);
  const parseDateTime = (dt: string | undefined): { date: string; time: string } => {
    if (!dt) return { date: '', time: '' };
    const normalized = dt.replace(' ', 'T');
    const [d, t] = normalized.split('T');
    const time = (t || '').slice(0,5);
    return { date: d, time };
  };

  // Guard: Redirect to signin when unauthenticated once loading completes
  useEffect(() => {
    const existing = window.__HOSPILINK_AUTH__;
    if (existing) {
      setIsAuthenticated(!!existing.isAuthenticated);
      setUser(existing.user ? { id: existing.user.id, name: existing.user.name, email: existing.user.email } : null);
      setAuthResolved(true);
    }

    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated: boolean; user?: { id: string; name: string; email: string } | null } | undefined;
      if (!detail) return;
      setIsAuthenticated(!!detail.isAuthenticated);
      setUser(detail.user ? { id: detail.user.id, name: detail.user.name, email: detail.user.email } : null);
      setAuthResolved(true);
    };
    if (!existing) {
      window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    }
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, []);

  useEffect(() => {
    if (!authResolved) return;
  if (!isAuthenticated) router.replace('/auth/signin');
  }, [authResolved, isAuthenticated, router]);

  // Load user data once authenticated (from loadOnRefresh only)
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!authResolved || !isAuthenticated) return;
      try {
        let refresh = {
          id: '',
          email: '',
          displayName: '',
          firstName: '',
          middleName: '',
          lastName: '',
          username: '',
          phoneNumber: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          age: null as number | null,
          gender: '' as string,
        };
        try {
          const r = await authAPI.loadOnRefresh();
          const u = (r?.user ?? r) as {
            id?: string;
            email?: string;
            username?: string;
            firstName?: string;
            middleName?: string;
            lastName?: string;
            phoneNumber?: string;
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            zipCode?: string;
            age?: number;
            gender?: string | null;
          } | null;
          const displayNameRaw = [u?.firstName, u?.middleName, u?.lastName].filter(Boolean).join(' ').trim();
          const displayName = displayNameRaw || u?.username || (u?.email ? String(u.email).split('@')[0] : '') || 'User';
          if (active && u?.id && (u?.email || u?.username)) {
            refresh = {
              id: String(u.id || ''),
              email: String(u.email || ''),
              displayName,
              firstName: u?.firstName || '',
              middleName: u?.middleName || '',
              lastName: u?.lastName || '',
              username: u?.username || '',
              phoneNumber: u?.phoneNumber || '',
              address: u?.address || '',
              city: u?.city || '',
              state: u?.state || '',
              country: u?.country || '',
              zipCode: u?.zipCode || '',
              age: typeof u?.age === 'number' ? (u!.age as number) : null,
              gender: (u?.gender || '') as string,
            };
            setUser({ id: refresh.id, name: refresh.displayName, email: refresh.email });
            setAuthUsername(refresh.username);
            setAuthPhone(refresh.phoneNumber);
            setAuthAddress(refresh.address);
            setAuthCity(refresh.city);
            setAuthStateName(refresh.state);
            setAuthCountry(refresh.country);
            setAuthZip(refresh.zipCode);
            setAuthAge(refresh.age);
            setAuthGender(refresh.gender);
          }
        } catch {}
        if (!active) return;
        // Synthesize a lightweight profile object from refresh data
        const synthesizedProfile: Partial<import('@/lib/types').User> = {
          name: refresh.displayName,
          email: refresh.email,
          address: refresh.address,
          gender: toGender(refresh.gender) || undefined,
          phone: refresh.phoneNumber || undefined,
          contactNumber: refresh.phoneNumber || undefined,
        };
        setProfile(synthesizedProfile as import('@/lib/types').User);
        setForm({
          firstName: refresh.firstName || '',
          middleName: refresh.middleName || '',
          lastName: refresh.lastName || '',
          email: refresh.email || '',
          phone: refresh.phoneNumber || '',
          gender: toGender(refresh.gender),
          address: refresh.address || '',
          city: refresh.city || '',
          state: refresh.state || '',
          country: refresh.country || '',
          zipCode: refresh.zipCode || '',
          age: typeof refresh.age === 'number' ? String(refresh.age) : '',
        });
      } catch {
        // ignore
      }
    };
    load();
    return () => { active = false; };
  }, [authResolved, isAuthenticated]);

  // Load user's appointments from backend (must be before any early returns)
  useEffect(() => {
    let active = true;
    (async () => {
      if (!authResolved || !isAuthenticated || !user?.id) return;
      try {
        setAppointmentsLoading(true);
        const list = await appointmentAPI.getAppointmentsForUser(user.id);
        if (!active) return;
        setMyAppointments(list);
        setAppointmentsError(null);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Failed to load appointments';
        setAppointmentsError(msg);
        setMyAppointments([]);
      } finally {
        if (active) setAppointmentsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [authResolved, isAuthenticated, user?.id]);

  if (!authResolved) return null;
  if (!isAuthenticated || !user) return null;

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.name?.split(' ').map((n: string) => n[0]).join('') || 'U',
  };


  const upcomingAppointments = (myAppointments || []).filter((a) => {
    const { date } = parseDateTime(a.appointmentTime);
    const when = date ? new Date(date) : null;
    const now = new Date();
    return !!when && when >= new Date(now.toISOString().slice(0,10)) && String(a.appointmentStatus).toLowerCase() === 'scheduled';
  });

  const recentAppointments = (myAppointments || []).filter((a) => String(a.appointmentStatus).toLowerCase() === 'completed').slice(0, 3);

  const unreadNotifications = mockNotifications.filter(notif => !notif.isRead);

  const quickStats = [
    {
      icon: Calendar,
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: FileText,
      label: 'Medical Records',
      value: '12',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Pill,
      label: 'Active Prescriptions',
      value: '3',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Activity,
      label: 'Health Score',
      value: '85%',
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  // Status chip color helper
  const statusClasses = (status?: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'cancelled') return 'bg-red-100 text-red-800';
    if (s === 'scheduled') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const renderDashboard = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-lg p-3 md:p-6 text-white">
        <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Welcome back, {currentUser.name}!</h1>
        <p className="opacity-90 text-xs md:text-base">Here&apos;s your health summary and upcoming appointments.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] md:text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-base md:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 md:w-6 md:h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link
              href="/appointment"
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              Book Appointment
            </Link>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
      {upcomingAppointments.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
        {upcomingAppointments.map(a => {
        const docName = a.doctorsFullName || 'Doctor';
        const { date, time } = parseDateTime(a.appointmentTime);
        return (
      <div key={a.appointmentId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs md:text-base">
            {docName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm md:text-base">Dr. {docName}</h3>
            <p className="text-xs md:text-sm text-gray-600">{a.doctorSpecialization || '—'}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
              {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
              {time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusClasses(a.appointmentStatus)}`}>
                        {a.appointmentStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">No Upcoming Appointments</h3>
              <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">Schedule your next appointment with our expert doctors.</p>
              <Link
                href="/appointment"
                className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
          </div>
          <div className="p-6">
            {recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {recentAppointments.map(a => {
                  const docName = a.doctorsFullName || 'Doctor';
                  const { date } = parseDateTime(a.appointmentTime);
                  return (
                    <div key={a.appointmentId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {docName}</p>
                        <p className="text-sm text-gray-600">{date}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent visits</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="p-6">
            {unreadNotifications.length > 0 ? (
              <div className="space-y-3">
                {unreadNotifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">{notification.title}</h4>
                    <p className="text-sm text-blue-700">{notification.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
          <Link
            href="/appointment"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book New
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {appointmentsLoading ? (
          <div className="text-sm text-gray-500">Loading appointments…</div>
        ) : appointmentsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{appointmentsError}</div>
        ) : (myAppointments && myAppointments.length > 0) ? (
          <div className="space-y-4">
            {myAppointments.map((a) => {
              const { date, time } = parseDateTime(a.appointmentTime);
              const docName = a.doctorsFullName || 'Doctor';
              const isCompleted = String(a.appointmentStatus).toLowerCase() === 'completed';
              const canGiveFeedback = isCompleted && (a.didUserGiveFeedback === false || a.didUserGiveFeedback === undefined);
              return (
                <div key={a.appointmentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {docName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Dr. {docName}</h3>
                        <p className="text-sm text-gray-600">{a.doctorSpecialization || '—'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{date} {time && `at ${time}`}</span>
                          {a.reason && (<span className="truncate max-w-[220px]" title={a.reason}>Reason: {a.reason}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusClasses(a.appointmentStatus)}`}>
                        {a.appointmentStatus}
                      </span>
                      {canGiveFeedback ? (
                        <button
                          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                          onClick={() => {
                            setFeedbackFor({ appointmentId: a.appointmentId, doctorId: a.doctorId, doctorName: docName });
                            setFeedbackRating(5);
                            setFeedbackReview('');
                            setFeedbackMsg(null);
                            setFeedbackOpen(true);
                          }}
                        >
                          Give Feedback
                        </button>
                      ) : isCompleted ? (
                        <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">Feedback sent</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No appointments yet.</div>
        )}
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Medical Records</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {[
            { date: '2024-01-15', type: 'Lab Results', doctor: 'Dr. Sarah Johnson', status: 'Ready' },
            { date: '2024-01-10', type: 'Prescription', doctor: 'Dr. Michael Chen', status: 'Active' },
            { date: '2024-01-05', type: 'X-Ray Report', doctor: 'Dr. Emily Rodriguez', status: 'Ready' }
          ].map((record, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{record.type}</h3>
                  <p className="text-sm text-gray-600">{record.doctor} • {record.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {record.status}
                </span>
                <button className="text-blue-600 hover:text-blue-700">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <NavHeader />
      
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-semibold">
                {currentUser.avatar}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Welcome back, {currentUser.name.split(' ')[0]}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage your healthcare journey</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <button className="relative p-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              <button
                className="p-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={() => setSettingsOpen(true)}
                aria-label="Edit profile settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex min-w-max space-x-4 sm:space-x-6 lg:space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium whitespace-nowrap text-sm sm:text-base transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'records' && renderMedicalRecords()}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsOpen(true)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                    <button
                      onClick={async () => {
                        if (!user?.id || deleting) return;
                        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
                        if (!confirmed) return;
                        try {
                          setDeleting(true);
                          await userAPI.deleteUserById(user.id);
                          try { await authAPI.logout(); } catch {}
                          window.location.href = '/auth/signin';
                        } catch (e) {
                          const err = e as { response?: { data?: { message?: string } }; message?: string };
                          alert(err?.response?.data?.message || err?.message || 'Failed to delete account');
                        } finally {
                          setDeleting(false);
                        }
                      }}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting…' : 'Delete Account'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Full Name</div>
                    <div className="text-gray-900 font-medium">{profile?.name || currentUser.name}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-gray-900 font-medium">{profile?.email || currentUser.email}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Username</div>
                    <div className="text-gray-900 font-medium">{authUsername || (profile?.email || currentUser.email || '').split('@')[0] || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-gray-900 font-medium">{getPhone(profile as unknown as WithPhoneVariants) || authPhone || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="text-gray-900 font-medium capitalize">{profile?.gender || authGender || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Age</div>
                    <div className="text-gray-900 font-medium">{typeof authAge === 'number' ? authAge : '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">City</div>
                    <div className="text-gray-900 font-medium">{authCity || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">State</div>
                    <div className="text-gray-900 font-medium">{authStateName || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Country</div>
                    <div className="text-gray-900 font-medium">{authCountry || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-xs text-gray-500">Zip Code</div>
                    <div className="text-gray-900 font-medium">{authZip || '—'}</div>
                  </div>
                  <div className="p-4 border rounded-lg md:col-span-2">
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-gray-900 font-medium">{profile?.address || authAddress || '—'}</div>
                  </div>
                </div>

                {/* Security */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Current password</label>
                      <input
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        value={pwForm.current}
                        onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">New password</label>
                      <input
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        value={pwForm.next}
                        onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Confirm password</label>
                      <input
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        value={pwForm.confirm}
                        onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      />
                    </div>
                  </div>
                  {pwError && (
                    <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 mt-3">{pwError}</p>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={changePassword}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                      Change password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      {/* Feedback Modal */}
      {feedbackOpen && feedbackFor && (
        <Modal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} title={`Feedback for Dr. ${feedbackFor.doctorName}`} size="md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Rating</label>
              <RatingStars value={feedbackRating} onChange={setFeedbackRating} size="md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Review (optional)</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Share your experience"
                value={feedbackReview}
                onChange={(e) => setFeedbackReview(e.target.value)}
              />
            </div>
            {feedbackMsg && (
              <p className="text-sm px-3 py-2 rounded border bg-blue-50 border-blue-200 text-blue-700">{feedbackMsg}</p>
            )}
          </div>
          <ModalFooter>
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setFeedbackOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={feedbackSaving}
              onClick={async () => {
                if (!feedbackFor) return;
                if (feedbackRating < 1 || feedbackRating > 5) {
                  setFeedbackMsg('Please select a rating between 1 and 5.');
                  return;
                }
                try {
                  setFeedbackSaving(true);
                  setFeedbackMsg(null);
                  const res = await appointmentAPI.userFeedback({
                    appointmentId: feedbackFor.appointmentId,
                    doctorId: feedbackFor.doctorId,
                    review: feedbackReview.trim(),
                    rating: feedbackRating,
                  });
                  const msg = typeof res === 'string' ? res : (res?.message || 'Feedback submitted successfully');
                  setFeedbackMsg(msg);
                  // Update local appointments to reflect feedback submitted
                  setMyAppointments((prev) => (prev || []).map((x) => (
                    x.appointmentId === feedbackFor.appointmentId ? { ...x, didUserGiveFeedback: true } : x
                  )));
                  // Close after short delay
                  setTimeout(() => setFeedbackOpen(false), 800);
                } catch (e) {
                  const err = e as { response?: { data?: { message?: string } }; message?: string };
                  setFeedbackMsg(err?.response?.data?.message || err?.message || 'Failed to submit feedback');
                } finally {
                  setFeedbackSaving(false);
                }
              }}
            >
              {feedbackSaving ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </ModalFooter>
        </Modal>
      )}
      {/* Settings Modal */}
  {settingsOpen && (
        <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Edit Profile" size="lg">
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={form.middleName}
                  onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="Middle name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={authUsername || (form.email || '').split('@')[0]}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="10-digit phone"
                />
              </div>
              {/* Date of Birth removed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: toGender(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-0 focus:border-blue-300"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="ZIP / Postal code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                  placeholder="Age"
                />
              </div>
            </div>
            {saveError && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{saveError}</div>
            )}
          </form>
          <ModalFooter>
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setSettingsOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={saving}
              onClick={async () => {
                try {
                  setSaving(true);
                  setSaveError(null);
                  const payload: Record<string, unknown> = {
                    firstName: form.firstName?.trim() || undefined,
                    middleName: form.middleName?.trim() || undefined,
                    lastName: form.lastName?.trim() || undefined,
                    phoneNumber: form.phone?.trim() || undefined,
                    gender: form.gender || undefined,
                    address: form.address?.trim() || undefined,
                    city: form.city?.trim() || undefined,
                    state: form.state?.trim() || undefined,
                    country: form.country?.trim() || undefined,
                    zipCode: form.zipCode?.trim() || undefined,
                    age: form.age?.trim() ? Number(form.age.trim()) : undefined,
                  };
                  type UpdateResp = {
                    id?: string;
                    email?: string;
                    username?: string;
                    firstName?: string;
                    middleName?: string;
                    lastName?: string;
                    phoneNumber?: string;
                    address?: string;
                    city?: string;
                    state?: string;
                    country?: string;
                    zipCode?: string;
                    age?: number;
                    gender?: string | null;
                  };
                  const updated = (await userAPI.updateUserById(user.id, payload)) as UpdateResp;
                  const updatedName = [updated.firstName, updated.middleName, updated.lastName]
                    .filter(Boolean)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                  // Update header/current user
                  setUser((prev) => (prev ? {
                    id: prev.id,
                    name: updatedName || prev.name,
                    email: updated.email ?? prev.email,
                  } : prev));
                  // Update auth details used for profile display fallbacks
                  if (updated.username) setAuthUsername(updated.username);
                  if (typeof updated.age === 'number') setAuthAge(updated.age);
                  if (updated.gender !== undefined && updated.gender !== null) setAuthGender(String(updated.gender));
                  if (updated.phoneNumber !== undefined) setAuthPhone(updated.phoneNumber || '');
                  if (updated.address !== undefined) setAuthAddress(updated.address || '');
                  if (updated.city !== undefined) setAuthCity(updated.city || '');
                  if (updated.state !== undefined) setAuthStateName(updated.state || '');
                  if (updated.country !== undefined) setAuthCountry(updated.country || '');
                  if (updated.zipCode !== undefined) setAuthZip(updated.zipCode || '');
                  // Update profile object
                  setProfile((prev) => ({
                    ...(prev || {}),
                    name: updatedName || prev?.name || '',
                    email: updated.email ?? user.email,
                    phone: updated.phoneNumber ?? prev?.phone,
                    contactNumber: updated.phoneNumber ?? prev?.contactNumber,
                    gender: toGender(updated.gender) || prev?.gender,
                    address: updated.address ?? prev?.address ?? '',
                  } as import('@/lib/types').User));
                  // Sync form with returned values
                  const newGender = toGender(updated.gender) || form.gender;
                  setForm({
                    firstName: updated.firstName ?? form.firstName,
                    middleName: updated.middleName ?? form.middleName,
                    lastName: updated.lastName ?? form.lastName,
                    email: updated.email ?? form.email,
                    phone: updated.phoneNumber ?? form.phone,
                    gender: newGender,
                    address: updated.address ?? form.address,
                    city: updated.city ?? form.city,
                    state: updated.state ?? form.state,
                    country: updated.country ?? form.country,
                    zipCode: updated.zipCode ?? form.zipCode,
                    age: typeof updated.age === 'number' ? String(updated.age) : form.age,
                  });
                  setSettingsOpen(false);
                } catch (e) {
                  const err = e as { response?: { data?: { message?: string } }; message?: string };
                  const msg = err?.response?.data?.message || err?.message || 'Failed to save changes';
                  setSaveError(msg);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
