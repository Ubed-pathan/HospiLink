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
  Activity,
  Heart,
  Pill,
  Download
} from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';
import { mockAppointments, mockNotifications, getDoctorById } from '@/lib/mockData';
import { useRecoilValue } from 'recoil';
import { authState } from '@/lib/atoms';
import { useRouter } from 'next/navigation';

export default function PatientPortalPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, user } = useRecoilValue(authState);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.name?.split(' ').map((n: string) => n[0]).join('') || 'U',
  };

  const upcomingAppointments = mockAppointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status === 'scheduled'
  );

  const recentAppointments = mockAppointments.filter(apt => 
    apt.status === 'completed'
  ).slice(0, 3);

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

  const renderDashboard = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-lg p-4 md:p-6 text-white">
        <h1 className="text-xl md:text-2xl font-bold mb-2">Welcome back, {currentUser.name}!</h1>
        <p className="opacity-90 text-sm md:text-base">Here&apos;s your health summary and upcoming appointments.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
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
              {upcomingAppointments.map(appointment => {
                const doctor = getDoctorById(appointment.doctorId);
                return (
                  <div key={appointment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm md:text-base">
                        {doctor?.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-sm md:text-base">Dr. {doctor?.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600">{doctor?.specialization}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {appointment.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {appointment.status}
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
                {recentAppointments.map(appointment => {
                  const doctor = getDoctorById(appointment.doctorId);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctor?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.date}</p>
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
        <div className="space-y-4">
          {mockAppointments.map(appointment => {
            const doctor = getDoctorById(appointment.doctorId);
            return (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {doctor?.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Dr. {doctor?.name}</h3>
                      <p className="text-sm text-gray-600">{doctor?.specialization}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{appointment.date} at {appointment.time}</span>
                        <span className="capitalize">{appointment.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-semibold">
                {currentUser.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {currentUser.name.split(' ')[0]}
                </h1>
                <p className="text-gray-600 text-lg">Manage your healthcare journey</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              <button className="p-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition-colors ${
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
                <p className="text-gray-600">Profile management coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
