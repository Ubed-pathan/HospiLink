import React from 'react';
import Link from 'next/link';
import { Calendar, Shield, Users, CheckCircle, Star, Clock } from 'lucide-react';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export default function HomePage() {
  // Rendering is public by default; HomeGuard will redirect on client if unauthenticated
  const features: { icon: React.ElementType; title: string; description: string }[] = [
    {
      icon: Calendar,
      title: 'Streamlined Scheduling',
      description:
        'Book appointments with healthcare professionals efficiently and manage your healthcare schedule.',
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description:
        'HIPAA-compliant platform ensuring your medical information remains private and secure.',
    },
    {
      icon: Users,
      title: 'Expert Network',
      description:
        'Access to board-certified physicians and specialists across multiple medical disciplines.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description:
        'Round-the-clock patient support and emergency consultation services available.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Medical Professionals' },
    { number: '50,000+', label: 'Patient Appointments' },
    { number: '25+', label: 'Medical Specialties' },
    { number: '99.8%', label: 'Satisfaction Rate' },
  ];

  const testimonials: { name: string; role: string; comment: string; rating: number }[] = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      comment:
        'The platform has streamlined our appointment management and improved patient satisfaction significantly.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Patient',
      comment:
        'Booking an appointment took less than a minute and I found a great specialist near me.',
      rating: 5,
    },
    {
      name: 'Aisha Khan',
      role: 'Practice Manager',
      comment:
        'Our team relies on this system daily. It’s reliable, secure, and easy for patients and staff.',
      rating: 5,
    },
  ];

  return (
  <ConditionalLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
  <section className="bg-white">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 md:px-4 py-2 rounded-md mb-4 md:mb-6 font-medium text-sm">
                  <Shield className="w-4 h-4" />
                  Trusted Healthcare Platform
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                  Professional
                  <br />
                  <span className="text-blue-600">Healthcare</span>
                  <br />
                  Management
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  Connect with qualified medical professionals and streamline your healthcare experience through our comprehensive digital platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                  <Link
                    href="/appointment"
                    className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    Schedule Appointment
                  </Link>
                  <Link
                    href="/doctors"
                    className="border border-gray-300 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                    Find Specialists
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">Board-Certified Physicians</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">24/7 Emergency Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">Secure Digital Records</span>
                  </div>
                </div>
              </div>
              
              <div className="relative mt-8 lg:mt-0">
                <div className="bg-gray-50 rounded-lg p-6 md:p-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Instant Booking</h3>
                        <p className="text-gray-600 text-xs md:text-sm">Schedule appointments in minutes</p>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">Next available: Today 2:30 PM</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Secure Platform</h3>
                        <p className="text-gray-600 text-xs md:text-sm">Your data is protected and private</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Trusted by Healthcare Professionals</h2>
              <p className="text-base md:text-lg text-gray-600">Join thousands of medical professionals and patients who trust our platform</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Professional Healthcare Solutions</h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform provides comprehensive tools for healthcare management, designed for both medical professionals and patients.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">What Our Users Say</h2>
              <p className="text-base md:text-xl text-gray-600">Trusted by healthcare professionals and patients alike</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-center gap-1 mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">&ldquo;{testimonial.comment}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs md:text-sm">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">Ready to Get Started?</h2>
            <p className="text-base md:text-xl text-blue-100 mb-6 md:mb-8">
              Join our platform and experience professional healthcare management today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link
                href="/appointment"
                className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                Book Your First Appointment
              </Link>
              <Link
                href="/portal"
                className="border border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                Access Patient Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ConditionalLayout>
  );
}
