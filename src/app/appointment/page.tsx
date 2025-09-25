/**
 * Appointment Booking Page
 * Book appointments with selected doctors
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, CheckCircle, ArrowLeft } from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import { Doctor } from '@/lib/types';
import { getDepartmentById } from '@/lib/mockData';
import { doctorAPI, authAPI, appointmentAPI } from '@/lib/api-services';

type BookingStep = 'doctor-selection' | 'date-time' | 'confirmation';
type BookingForm = {
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  reasonPreset: string; // consultation | follow-up | routine-checkup | emergency | other
  reasonOther: string;
};

function AppointmentPageInner() {
  const searchParams = useSearchParams();
  // Local ISO date for today (YYYY-MM-DD) in user's locale
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [currentStep, setCurrentStep] = useState<BookingStep>('doctor-selection');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingForm>({
    doctorId: '',
    departmentId: '',
    date: todayStr,
    time: '',
    reasonPreset: '',
    reasonOther: '',
  });
  type UserWithFullName = {
    id?: string;
    name?: string;
    fullName?: string;
    username?: string;
    email?: string;
  };
  const [me, setMe] = useState<UserWithFullName | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [emailOverride, setEmailOverride] = useState('');
  const [bookedWindows, setBookedWindows] = useState<import('@/lib/types').ScheduledAppointmentDto[]>([]);
  const [loadingBooked, setLoadingBooked] = useState(false);
  const [bookedError, setBookedError] = useState<string | null>(null);

  useEffect(() => {
    // Load current user quickly from loadOnRefresh
    let active = true;
    (async () => {
      try {
        const r = await authAPI.loadOnRefresh();
        if (!active) return;
        const u = (r?.user || r) as {
          id?: string;
          email?: string;
          username?: string;
          firstName?: string;
          middleName?: string;
          lastName?: string;
        } | null;
        const fn = [u?.firstName, u?.middleName, u?.lastName].filter(Boolean).join(' ').trim();
        setMe({
          id: u?.id,
          name: fn || u?.username || (u?.email ? String(u.email).split('@')[0] : ''),
          fullName: fn || undefined,
          username: u?.username,
          email: u?.email,
        });
      } catch {
        if (!active) return;
        setMe(null);
      }
    })();
    return () => { active = false; };
  }, []);

  // Keep emailOverride in sync when we learn the user's email
  useEffect(() => {
    const em = me?.email || '';
    // Only set if empty to avoid clobbering user edits
    if (!emailOverride && em) setEmailOverride(em);
  }, [me, emailOverride]);

  // Load doctors from backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingDoctors(true);
        const data = await doctorAPI.getAllDoctors();
        if (!active) return;
        setDoctors(data);
        setDoctorsError(null);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Failed to load doctors';
        setDoctorsError(msg);
      } finally {
        if (active) setLoadingDoctors(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Pre-select doctor if coming from doctor page, once doctors are loaded
  useEffect(() => {
    const doctorId = searchParams.get('doctor');
    if (!doctorId || doctors.length === 0) return;
    const doc = doctors.find(d => d.id === doctorId);
    if (doc) {
      setSelectedDoctorId(doctorId);
      setFormData(prev => ({
        ...prev,
        doctorId,
        departmentId: doc.departmentId ?? '',
      }));
      setCurrentStep('date-time');
    }
  }, [searchParams, doctors]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const selectedDepartment = selectedDoctor ? getDepartmentById(selectedDoctor.departmentId ?? '') : null;

  // Fetch booked windows whenever doctor or date changes
  useEffect(() => {
    let active = true;
    (async () => {
      if (!selectedDoctorId || !formData.date) {
        setBookedWindows([]);
        return;
      }
      try {
        setLoadingBooked(true);
        setBookedError(null);
        // Prefer actual username; if not present attempt to fetch via doctorAPI.getByUsername using a heuristic (skip if obviously an id)
        let doctorUsername = selectedDoctor?.username;
        if (!doctorUsername) {
          // If we lack username, try fetching by treating selectedDoctorId as username first
          try {
            const maybe = await doctorAPI.getByUsername(selectedDoctorId);
            doctorUsername = maybe?.username || maybe?.['username'];
          } catch {
            // silently ignore; fallback to id (backend likely needs username though)
          }
        }
        if (!doctorUsername) {
          // Fallback: some backends may not expose username in getAllDoctors response.
          // Use doctorId as a last resort so at least one attempt is made.
          doctorUsername = selectedDoctorId;
        }
        const data = await appointmentAPI.getDoctorsBookedAppointments(formData.date, doctorUsername);
        if (!active) return;
        setBookedWindows(data);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : 'Failed to load booked slots';
        setBookedError(msg);
      } finally {
        if (active) setLoadingBooked(false);
      }
    })();
    return () => { active = false; };
  }, [selectedDoctorId, formData.date, selectedDoctor]);

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    setSelectedDoctorId(doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId: doctorId,
      departmentId: doctor.departmentId ?? '',
      // Restrict to today only
      date: todayStr,
    }));
    setCurrentStep('date-time');
  };

  // Helpers for time calculations
  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const toHHMM = (mins: number): string => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // Format HH:mm to h:mm AM/PM
  const formatTime12h = (hhmm?: string): string => {
    if (!hhmm) return '';
    const [hhStr, mm] = hhmm.split(':');
    let hh = Number(hhStr);
    if (Number.isNaN(hh)) return hhmm;
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return `${hh}:${mm} ${ampm}`;
  };

  // Generate generic 15-min slots from 09:00 to end-of-day (ignore doctor-specific times)
  const generateScheduledSlots = React.useCallback((): string[] => {
    const START = '09:00';
    const END = '24:00'; // we'll append 23:59 specifically below
    const STEP = 15; // minutes

    const startM = toMinutes(START);
    const endM = toMinutes(END);

    const slots: string[] = [];
    for (let t = startM; t < endM; t += STEP) {
      slots.push(toHHMM(t));
    }
    // Ensure we include a final 23:59 option
    if (slots[slots.length - 1] !== '23:59') slots.push('23:59');
    return slots;
  }, []);

  // Sanitize backend error messages: remove URLs, hosts, ports, obvious API paths & trim whitespace
  const sanitizeErrorMessage = (msg: string): string => {
    if (!msg) return '';
    let s = msg;
    // Remove full URLs
    s = s.replace(/https?:\/\/[^\s)]+/gi, '');
    // Remove host:port patterns (localhost:1115, 127.0.0.1:3000, etc.)
    s = s.replace(/\b(?:localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d{2,5})?\b/gi, '');
    // Remove standalone :port (avoid times by requiring 3-5 digits and preceding space or start)
    s = s.replace(/(?<=\s|^):\d{3,5}\b/g, '');
    // Remove API style path fragments like /appointment/book or /api/v1/whatever
    s = s.replace(/\/[a-z0-9_\-]+(?:\/[a-z0-9_\-]+)+/gi, '');
    // Collapse multiple spaces
    s = s.replace(/\s{2,}/g, ' ');
    // Common noisy prefixes
    s = s.replace(/^(error:|request failed with status code \d+\s*)/i, '');
    return s.trim();
  };

  // Build today's slots, filter to future times, and mark booked ones
  const todaysSlots = React.useMemo(() => {
    // Show the full schedule for today regardless of current time
    return generateScheduledSlots();
  }, [generateScheduledSlots]);

  // Determine if a slot falls within any booked window (inclusive of start, exclusive of end)
  const isSlotBooked = (slot: string): boolean => {
    if (!bookedWindows.length) return false;
    return bookedWindows.some(w => {
      if (!w.appointmentStartTime) return false;
      const startHM = w.appointmentStartTime.split('T')[1]?.slice(0,5);
      return startHM === slot;
    });
  };

  const renderDoctorSelection = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
          Select Your Doctor
        </h2>
        <p className="text-base md:text-lg text-gray-600">Choose from our experienced healthcare professionals</p>
      </div>
      
      <div className="grid gap-3 sm:gap-4 md:gap-6">
        {loadingDoctors && (
          <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-6" aria-live="polite">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        )}
        {doctorsError && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm" role="alert">
            {doctorsError}
          </div>
        )}
        {doctors.map(doctor => {
          const department = getDepartmentById(doctor.departmentId ?? '');
          const synth = (() => {
            let hash = 0;
            for (let i = 0; i < doctor.id.length; i++) hash = ((hash << 5) - hash) + doctor.id.charCodeAt(i);
            const rand = Math.abs(Math.sin(hash));
            const rating = 4.2 + (rand * 0.7);
            const reviews = 100 + Math.floor(rand * 150);
            return { rating, reviews };
          })();
          return (
            <div
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor.id)}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm sm:text-base md:text-lg font-semibold">
                    {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2 text-sm md:text-base">
                    {doctor.specialization}
                  </p>
                  <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">
                    {department?.name}
                  </p>
                  {doctor.qualification && doctor.qualification.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 md:gap-2 mb-2">
                      {doctor.qualification.slice(0, 3).map((q) => (
                        <span
                          key={q}
                          className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-gray-50 text-gray-700 text-[10px] sm:text-xs font-medium border border-gray-200"
                        >
                          {q}
                        </span>
                      ))}
                      {doctor.qualification.length > 3 && (
                        <span className="text-[10px] sm:text-xs text-gray-500">+{doctor.qualification.length - 3} more</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      {(doctor.rating === 0 && (doctor.reviewCount ?? 0) === 0) ? (
                        <>
                          <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">{synth.rating.toFixed(1)}+</span>
                          <span className="text-[11px] sm:text-xs md:text-sm text-gray-500">({synth.reviews}+ reviews)</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base">{doctor.rating?.toFixed ? doctor.rating.toFixed(1) : doctor.rating}</span>
                          <span className="text-[11px] sm:text-xs md:text-sm text-gray-500">({doctor.reviewCount ?? 0} reviews)</span>
                        </>
                      )}
                    </div>
                    {typeof doctor.consultationFee === 'number' && (
                      <div className="text-green-600 font-semibold text-xs sm:text-sm md:text-base">
                        ${doctor.consultationFee} consultation
                      </div>
                    )}
                    <div className="text-gray-600 text-[11px] sm:text-xs md:text-sm">
                      {doctor.experience} yrs experience
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600 mx-auto sm:mx-0">
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transform rotate-180" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <button
          onClick={() => setCurrentStep('doctor-selection')}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Select Date & Time</h2>
      </div>

      {selectedDoctor && (
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">Selected Doctor</h3>
          <p className="text-sm md:text-base text-gray-900">Dr. {selectedDoctor.name} - {selectedDoctor.specialization}</p>
          <p className="text-xs md:text-sm text-gray-600">{selectedDepartment?.name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-1 md:mb-2">
            Appointment Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            min={todayStr}
            max={todayStr}
            className="w-full px-2 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-800 mb-1 md:mb-2">
            Appointment Time
          </label>
          {todaysSlots.length === 0 ? (
            <p className="text-sm text-gray-500">No time slots configured for today.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {todaysSlots.map((time) => {
                const nowHM = new Date().toTimeString().slice(0, 5);
                const isPast = time < nowHM;
                // Mark booked regardless of past/future so historical (past) booked slots show purple.
                const booked = isSlotBooked(time);
                const isSelected = formData.time === time && !isPast && !booked;
                const base = 'px-2 py-1.5 rounded-md text-xs sm:text-sm border transition-colors text-center';
                // Priority: booked (purple) overrides past gray.
                let classes: string;
                if (booked) {
                  classes = 'bg-purple-100 text-purple-600 border-purple-300 cursor-not-allowed';
                } else if (isPast) {
                  classes = 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
                } else if (isSelected) {
                  classes = 'bg-blue-600 text-white border-blue-600';
                } else {
                  classes = 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50';
                }
                return (
                  <button
                    type="button"
                    key={time}
                    disabled={isPast || booked}
                    className={`${base} ${classes}`}
                    onClick={() => setFormData((prev) => ({ ...prev, time }))}
                    aria-pressed={isSelected}
                    aria-label={`Time ${time}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
          {todaysSlots.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                <span className="text-gray-600">Past</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-blue-600" />
                <span className="text-gray-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-white border border-gray-300" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-purple-200 border border-purple-300" />
                <span className="text-gray-600">Booked</span>
              </div>
              {loadingBooked && <span className="text-gray-500">Loading booked…</span>}
              {bookedError && <span className="text-red-600">{bookedError}</span>}
              <div className="text-gray-500">Bookable until 11:59 PM today</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Reason
        </label>
        <select
          value={formData.reasonPreset}
          onChange={(e) => setFormData(prev => ({ ...prev, reasonPreset: e.target.value }))}
          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white text-gray-900"
        >
          <option value="">Select a reason</option>
          <option value="Consultation">Consultation</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Routine Checkup">Routine Checkup</option>
          <option value="Emergency">Emergency</option>
          <option value="other">Other</option>
        </select>
      </div>
      {formData.reasonPreset === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Other Reason</label>
          <input
            type="text"
            value={formData.reasonOther}
            onChange={(e) => setFormData(prev => ({ ...prev, reasonOther: e.target.value }))}
            placeholder="Type your reason"
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white text-gray-900"
          />
        </div>
      )}

      {/* Ask for email if we don't have it from auth */}
      {!(me?.email) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Email (required)
          </label>
          <input
            type="email"
            value={emailOverride}
            onChange={(e) => setEmailOverride(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white text-gray-900"
          />
        </div>
      )}



      <button
        onClick={async () => {
          if (!selectedDoctor || !formData.date || !formData.time) return;
          const preset = formData.reasonPreset;
          const hasOther = preset === 'other';
          const reasonRaw = hasOther ? formData.reasonOther.trim() : preset;
          if (!reasonRaw) return;
          try {
            setBookError(null);
            setBooking(true);
            let user = me;
            if (!user) {
              try {
                const r = await authAPI.loadOnRefresh();
                const u = (r?.user || r) as { id?: string; email?: string; username?: string; firstName?: string; middleName?: string; lastName?: string } | null;
                const fn = [u?.firstName, u?.middleName, u?.lastName].filter(Boolean).join(' ').trim();
                user = {
                  id: u?.id,
                  name: fn || u?.username || (u?.email ? String(u.email).split('@')[0] : ''),
                  fullName: fn || undefined,
                  username: u?.username,
                  email: u?.email,
                };
                setMe(user);
              } catch {
                user = null;
              }
            }
            if (!user?.id) {
              setBookError('You must be signed in to book an appointment.');
              setBooking(false);
              return;
            }
            // Ensure email is present; use override if needed
            const userEmail = (emailOverride || '').trim() || user.email || '';
            if (!userEmail || !userEmail.includes('@')) {
              setBookError('Please enter a valid email to continue.');
              setBooking(false);
              return;
            }
            // Build start/end (assume fixed 30 minute duration for now) using local date math without UTC shift
            const start = `${formData.date}T${formData.time}:00`;
            const [hStr, mStr] = formData.time.split(':');
            const h = Number(hStr); const m = Number(mStr);
            const base = new Date(formData.date + 'T00:00:00');
            base.setHours(h, m, 0, 0);
            const endLocal = new Date(base.getTime() + 30 * 60000);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const end = `${formData.date}T${pad(endLocal.getHours())}:${pad(endLocal.getMinutes())}:00`;
            // Validate locally before sending
            if (end <= start) {
              setBookError('Calculated end time is not after start time. Please pick a different slot.');
              setBooking(false);
              return;
            }
            const reason = reasonRaw.slice(0, 250);
            const usersFullName = (
              (user.fullName && user.fullName.trim()) ||
              (user.name && user.name.trim()) ||
              (user.username && user.username.trim()) ||
              (userEmail.split('@')[0]) ||
              'Patient'
            );
            const payload = {
              appointmentStartTime: start,
              appointmentEndTime: end,
              userId: String(user.id),
              usersFullName,
              usersEmail: userEmail,
              doctorId: selectedDoctor.id,
              reason,
            };
            console.log('Booking appointment payload:', payload);
            await appointmentAPI.unifiedBookAppointment(payload);
            setCurrentStep('confirmation');
          } catch (e: unknown) {
            const raw = e instanceof Error ? e.message : 'Failed to book appointment';
            let display = raw;
            const isOverlap = /overlaps/i.test(raw);
            const isDuplicateDay = /already has an appointment/i.test(raw);
            const isEndBefore = /must be after start/i.test(raw);
            if (isDuplicateDay) display = 'You already have an appointment with this doctor today.';
            if (isEndBefore) display = 'End time must be after start time.';
            if (isOverlap && !/pick another slot/i.test(display)) display = raw + ' Please pick another slot.';
            display = sanitizeErrorMessage(display);
            setBookError(display);
            try { document.getElementById('booking-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
          } finally {
            setBooking(false);
          }
        }}
        disabled={!formData.date || !formData.time || !((formData.reasonPreset && formData.reasonPreset !== 'other') || (formData.reasonPreset === 'other' && formData.reasonOther.trim())) || booking || (!me?.email && !emailOverride)}
        className="w-full bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
      >
        {booking ? 'Booking…' : 'Confirm Appointment'}
      </button>
    </div>
  );

  // Details step removed

  // Payment step removed

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      {bookError ? (
        <div id="booking-error" className="rounded-md px-4 py-2 text-sm font-semibold max-w-md mx-auto flex items-start gap-2 border border-red-200 bg-red-50 text-red-700" role="alert">
          <span aria-hidden="true">❌</span>
          <span className="flex-1">{bookError}</span>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Appointment Confirmed!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold text-gray-700">Doctor:</span> <span className="text-gray-900">Dr. {selectedDoctor?.name}</span></div>
              <div><span className="font-semibold text-gray-700">Date:</span> <span className="text-gray-900">{formData.date}</span></div>
              <div><span className="font-semibold text-gray-700">Time:</span> <span className="text-gray-900">{formatTime12h(formData.time)}</span></div>
              <div><span className="font-semibold text-gray-700">Reason:</span> <span className="text-gray-900">{formData.reasonPreset === 'other' ? (formData.reasonOther || '—') : (formData.reasonPreset || '—')}</span></div>
              {/* Type removed */}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portal"
              className="bg-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Patient Portal
            </Link>
            <button
              type="button"
              onClick={() => {
                // Reset booking flow to start a new appointment
                setFormData({
                  doctorId: '',
                  departmentId: '',
                  date: todayStr,
                  time: '',
                  reasonPreset: '',
                  reasonOther: '',
                });
                setSelectedDoctorId('');
                setBookError(null);
                setBooking(false);
                // Reset email field to known email (if any)
                setEmailOverride(me?.email || '');
                setCurrentStep('doctor-selection');
                // Optional UX: scroll back to top of card
                try { window?.scrollTo?.({ top: 0, behavior: 'smooth' }); } catch {}
              }}
              className="border-2 border-blue-600 text-blue-600 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
            >
              Book Another Appointment
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <NavHeader />
      
  {/* Header */}
      <section className="bg-white shadow-sm pt-16">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">Book Your Appointment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Schedule Your Visit
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with our expert doctors and take the first step towards better health
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
  <section className={`py-6${currentStep !== 'confirmation' ? ' border-b' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto overscroll-x-contain">
              <div className="flex items-center justify-center gap-3 md:gap-6 flex-nowrap min-w-max pr-2 mx-auto">
              {(
                [
                  { key: 'doctor-selection', label: 'Select Doctor', icon: User },
                  { key: 'date-time', label: 'Date & Time', icon: Calendar },
                  { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
                ] as const
              ).map((step, index, steps) => {
                const isActive = currentStep === step.key;
                const order = steps.findIndex(s => s.key === step.key);
                const currentOrder = steps.findIndex(s => s.key === currentStep);
                const isCompleted = currentOrder > order;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center font-medium transition-colors ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <span className={`hidden md:block mt-2 text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                      <span className="sr-only">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-6 md:w-12 h-0.5 mx-1.5 md:mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
    <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-4 sm:p-6 md:p-8">
            {currentStep === 'doctor-selection' && renderDoctorSelection()}
            {currentStep === 'date-time' && renderDateTimeSelection()}
            {currentStep === 'confirmation' && renderConfirmation()}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center text-gray-600">Loading…</div>}>
      <AppointmentPageInner />
    </Suspense>
  );
}
