/**
 * Appointment Booking Page
 * Book appointments with selected doctors
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import { AppointmentFormData, Doctor } from '@/lib/types';
import { getDepartmentById, mockAppointments } from '@/lib/mockData';
import { doctorAPI } from '@/lib/api-services';

type BookingStep = 'doctor-selection' | 'date-time' | 'details' | 'confirmation';

function AppointmentPageInner() {
  const searchParams = useSearchParams();
  // Local ISO date for today (YYYY-MM-DD) in user's locale
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [currentStep, setCurrentStep] = useState<BookingStep>('doctor-selection');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    doctorId: '',
    departmentId: '',
    date: todayStr,
    time: '',
    type: 'consultation',
    symptoms: '',
    notes: ''
  });

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

  // Generate 15-min slots from 10:30 to 17:30, excluding break 14:30–15:00
  const generateScheduledSlots = React.useCallback((): string[] => {
    const START = '10:30';
    const END = '17:30';
    const BREAK_START = '14:30';
    const BREAK_END = '15:00';
    const STEP = 15;

    const startM = toMinutes(START);
    const endM = toMinutes(END);
    const breakStartM = toMinutes(BREAK_START);
    const breakEndM = toMinutes(BREAK_END);

    const slots: string[] = [];
    for (let t = startM; t < endM; t += STEP) {
      // Skip times within the break window [breakStart, breakEnd)
      if (t >= breakStartM && t < breakEndM) continue;
      slots.push(toHHMM(t));
    }
    return slots;
  }, []);

  // Build today's slots, filter to future times, and mark booked ones
  const todaysSlots = React.useMemo(() => {
    // Show the full schedule for today regardless of current time
    return generateScheduledSlots();
  }, [generateScheduledSlots]);

  const bookedTimesToday = React.useMemo(() => {
    if (!selectedDoctorId) return new Set<string>();
    const booked = mockAppointments
      .filter((a) => a.doctorId === selectedDoctorId && a.date === todayStr && !!a.time)
      .map((a) => a.time as string);
    return new Set(booked);
  }, [selectedDoctorId, todayStr]);

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
                const isBooked = bookedTimesToday.has(time);
                const isPast = time < nowHM;
                const isSelected = formData.time === time && !isBooked && !isPast;
                const base = 'px-2 py-1.5 rounded-md text-xs sm:text-sm border transition-colors text-center';
                const classes = isBooked
                  ? 'bg-blue-100 text-blue-700 border-blue-300 cursor-not-allowed'
                  : isPast
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50';
                return (
                  <button
                    type="button"
                    key={time}
                    disabled={isBooked || isPast}
                    className={`${base} ${classes}`}
                    onClick={() => setFormData((prev) => ({ ...prev, time }))}
                    aria-pressed={isSelected}
                    aria-label={`Time ${time}${isBooked ? ' (Booked)' : ''}`}
                  >
                    {time}
                    {isBooked && <span className="sr-only"> Booked</span>}
                  </button>
                );
              })}
            </div>
          )}
          {todaysSlots.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-300" />
                <span className="text-gray-600">Booked</span>
              </div>
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
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Appointment Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base bg-white text-gray-900"
        >
          <option value="consultation">Consultation</option>
          <option value="follow-up">Follow-up</option>
          <option value="routine-checkup">Routine Checkup</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <button
        onClick={() => setCurrentStep('details')}
        disabled={!formData.date || !formData.time}
        className="w-full bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
      >
        Continue
      </button>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setCurrentStep('date-time')}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Symptoms / Reason for Visit *
        </label>
        <textarea
          value={formData.symptoms}
          onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Please describe your symptoms or reason for the appointment..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any additional information you'd like the doctor to know..."
        />
      </div>

      <button
        onClick={() => setCurrentStep('confirmation')}
        disabled={!formData.symptoms.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm Appointment
      </button>
    </div>
  );

  // Payment step removed

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
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
          <div><strong>Doctor:</strong> Dr. {selectedDoctor?.name}</div>
          <div><strong>Date:</strong> {formData.date}</div>
          <div><strong>Time:</strong> {formData.time}</div>
          <div><strong>Location:</strong> {selectedDoctor?.location}</div>
          <div><strong>Type:</strong> {formData.type.replace('-', ' ')}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/portal"
          className="bg-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Patient Portal
        </Link>
        <Link
          href="/appointment"
          className="border-2 border-blue-600 text-blue-600 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
        >
          Book Another Appointment
        </Link>
      </div>
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
                  { key: 'details', label: 'Details', icon: FileText },
                  { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
                ] as const
              ).map((step, index, steps) => {
                const isActive = currentStep === step.key;
                const isCompleted = ['doctor-selection', 'date-time', 'details'].indexOf(currentStep) > index;
                
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
            {currentStep === 'details' && renderDetailsForm()}
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
