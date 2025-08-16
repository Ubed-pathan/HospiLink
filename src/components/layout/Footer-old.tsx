/**
 * Footer Component
 * Site footer with links, contact info, and social media
 */

import React from 'react';
import Link from 'next/link';
import { Stethoscope, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Book Appointment', href: '/appointment' },
    { name: 'Find a Doctor', href: '/doctors' },
    { name: 'Departments', href: '/departments' },
    { name: 'Patient Portal', href: '/portal' },
    { name: 'Emergency', href: '/emergency' },
  ];

  const services = [
    { name: 'Cardiology', href: '/departments/cardiology' },
    { name: 'Neurology', href: '/departments/neurology' },
    { name: 'Orthopedics', href: '/departments/orthopedics' },
    { name: 'Pediatrics', href: '/departments/pediatrics' },
    { name: 'Radiology', href: '/departments/radiology' },
  ];

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'News & Media', href: '/news' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                HospiLink
              </span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Connecting patients with quality healthcare providers. 
              Your health, our innovation, your future.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg">info@hospilink.com</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg">123 Healthcare Ave, Medical City, MC 12345</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-cyan-400 transition-all text-lg group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-gray-300 hover:text-emerald-400 transition-all text-lg group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Company
            </h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-purple-400 transition-all text-lg group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-700/50 mt-16 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all transform hover:scale-110 hover:shadow-lg ${social.color} group`}
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-lg">
                © {new Date().getFullYear()} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">HospiLink</span>. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Crafted with ❤️ for better healthcare
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
