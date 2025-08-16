/**
 * Navigation Header Component
 * Main navigation header with logo, menu items, and CTA buttons
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, Menu, X } from 'lucide-react';

interface NavHeaderProps {
  variant?: 'light' | 'dark';
}

export default function NavHeader({ variant = 'dark' }: NavHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Departments', href: '/departments' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const textColor = variant === 'light' ? 'text-gray-900' : 'text-white';
  const bgColor = variant === 'light' ? 'bg-white/95 backdrop-blur-sm' : 'bg-black/20 backdrop-blur-md';
  const hoverColor = variant === 'light' ? 'hover:text-blue-600' : 'hover:text-cyan-400';

  return (
    <header className={`${bgColor} shadow-lg relative z-50 border-b border-white/10`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${textColor} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all`}>
              HospiLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${textColor} ${hoverColor} transition-all font-medium text-lg relative group`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className={`${textColor} ${hoverColor} transition-all font-medium text-lg`}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden ${textColor} ${hoverColor} transition-colors p-2 rounded-lg hover:bg-white/10`}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-200 rounded-b-2xl">
            <nav className="py-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-6 py-3 text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 transition-all font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 mt-4 pt-4 px-6 space-y-3">
                <Link
                  href="/auth/signin"
                  className="block text-gray-900 hover:text-blue-600 transition-colors font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-bold text-center shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
