/**
 * Appointment Booking Page
 * Book appointments with selected doctors
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, User, FileText, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import { Doctor, Department, AppointmentFormData } from '@/lib/types';
import { mockDoctors, mockDepartments, getDoctorById, getDepartmentById } from '@/lib/mockData';

type BookingStep = 'doctor-selection' | 'date-time' | 'details' | 'payment' | 'confirmation';

export default function AppointmentPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<BookingStep>('doctor-selection');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [formData, setFormData] = useState<AppointmentFormData>({
    doctorId: '',
    departmentId: '',
    date: '',
    time: '',
    type: 'consultation',
    symptoms: '',
    notes: ''
  });

  // Pre-select doctor if coming from doctor page
  useEffect(() => {
    const doctorId = searchParams.get('doctor');
    if (doctorId) {
      setSelectedDoctorId(doctorId);
      const doctor = getDoctorById(doctorId);
      if (doctor) {
        setFormData(prev => ({
          ...prev,
          doctorId: doctorId,
          departmentId: doctor.departmentId
        }));
        setCurrentStep('date-time');
      }
    }
  }, [searchParams]);

  const selectedDoctor = getDoctorById(selectedDoctorId);
  const selectedDepartment = selectedDoctor ? getDepartmentById(selectedDoctor.departmentId) : null;

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    if (doctor) {
      setSelectedDoctorId(doctorId);
      setFormData(prev => ({
        ...prev,
        doctorId: doctorId,
        departmentId: doctor.departmentId
      }));
      setCurrentStep('date-time');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const renderDoctorSelection = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
          Select Your Doctor
        </h2>
        <p className="text-base md:text-lg text-gray-600">Choose from our experienced healthcare professionals</p>
      </div>
      
      <div className="grid gap-4 md:gap-6">
        {mockDoctors.map(doctor => {
          const department = getDepartmentById(doctor.departmentId);
          return (
            <div
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor.id)}
              className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                <div className="relative mx-auto sm:mx-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-base md:text-lg font-semibold">
                    {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2 text-sm md:text-base">
                    {doctor.specialization}
                  </p>
                  <p className="text-gray-600 mb-3 text-sm md:text-base">
                    {department?.name} • {doctor.location}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium text-gray-900 text-sm md:text-base">{doctor.rating}</span>
                      <span className="text-xs md:text-sm text-gray-500">({doctor.reviewCount} reviews)</span>
                    </div>
                    
                    <div className="text-green-600 font-semibold text-sm md:text-base">
                      ${doctor.consultationFee} consultation
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto sm:mx-0">
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 transform rotate-180" />
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
          <p className="text-sm md:text-base">Dr. {selectedDoctor.name} - {selectedDoctor.specialization}</p>
          <p className="text-xs md:text-sm text-gray-600">{selectedDepartment?.name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Time
          </label>
          <select
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
          >
            <option value="">Select time</option>
            {generateTimeSlots().map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Appointment Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
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
        onClick={() => setCurrentStep('payment')}
        disabled={!formData.symptoms.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Payment
      </button>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setCurrentStep('details')}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
      </div>

      {/* Appointment Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Doctor:</span>
            <span>Dr. {selectedDoctor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formData.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{formData.time}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="capitalize">{formData.type.replace('-', ' ')}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${selectedDoctor?.consultationFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form (Mock) */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Payment Method</h4>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" value="card" defaultChecked />
            <CreditCard className="w-5 h-5 text-gray-600" />
            <span>Credit/Debit Card</span>
          </label>
          
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" value="insurance" />
            <FileText className="w-5 h-5 text-gray-600" />
            <span>Insurance</span>
          </label>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Demo Mode:</strong> No actual payment will be processed. This is a demonstration of the booking flow.
          </p>
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('confirmation')}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Confirm & Book Appointment
      </button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-white" />
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
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Patient Portal
        </Link>
        <Link
          href="/appointment"
          className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
        >
          Book Another Appointment
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg mb-6">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Book Your Appointment</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Schedule Your Visit
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with our expert doctors and take the first step towards better health
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {[
                { key: 'doctor-selection', label: 'Select Doctor', icon: User },
                { key: 'date-time', label: 'Date & Time', icon: Calendar },
                { key: 'details', label: 'Details', icon: FileText },
                { key: 'payment', label: 'Payment', icon: CreditCard },
                { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
              ].map((step, index) => {
                const isActive = currentStep === step.key;
                const isCompleted = ['doctor-selection', 'date-time', 'details', 'payment'].indexOf(currentStep) > index;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-colors ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < 4 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-8">
            {currentStep === 'doctor-selection' && renderDoctorSelection()}
            {currentStep === 'date-time' && renderDateTimeSelection()}
            {currentStep === 'details' && renderDetailsForm()}
            {currentStep === 'payment' && renderPayment()}
            {currentStep === 'confirmation' && renderConfirmation()}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
