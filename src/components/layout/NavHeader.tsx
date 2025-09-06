/**
 * Navigation Header Component
 * Main navigation header with logo, menu items, and CTA buttons
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-services';
import { Stethoscope, Menu, X, LogOut } from 'lucide-react';

export default function NavHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (loggingOut) return;
      setLoggingOut(true);
      await authAPI.logout();
    } finally {
      try {
        // Clear in-memory auth and broadcast unauthenticated before navigating
        (window as unknown as { __HOSPILINK_AUTH__?: { isAuthenticated: boolean; user?: unknown } }).__HOSPILINK_AUTH__ = {
          isAuthenticated: false,
          user: null as unknown as undefined,
        } as unknown as { isAuthenticated: boolean; user?: unknown };
        window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: false, user: null } }));
      } catch {}
      router.replace('/');
      setLoggingOut(false);
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Departments', href: '/departments' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <nav className="bg-white/60 backdrop-blur-md fixed top-0 left-0 right-0 z-50 transform-gpu will-change-transform">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900 truncate max-w-[45vw] md:max-w-none">HospiLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Tablet Navigation - Compact */}
      <div className="hidden md:flex lg:hidden items-center space-x-3">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
        className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/portal"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Patient Portal
            </Link>
            <Link
              href="/appointment"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 py-2 rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 font-medium transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>

          {/* Tablet CTA Button - Compact */}
          <div className="hidden md:flex lg:hidden items-center">
            <Link
              href="/appointment"
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 bg-white border-t border-gray-200 shadow-sm">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 py-3 space-y-2.5">
              <Link
                href="/portal"
                className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Patient Portal
              </Link>
              <Link
                href="/appointment"
                className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Appointment
              </Link>
              <button
                onClick={() => { if (!loggingOut) { setMobileMenuOpen(false); handleLogout(); } }}
                disabled={loggingOut}
                className="w-full text-center border border-red-300 text-red-700 py-2 px-4 rounded-md font-medium bg-white hover:bg-red-50 transition-colors text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
