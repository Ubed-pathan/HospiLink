import React from 'react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'About · HospiLink',
  description: 'Learn about HospiLink — a modern hospital appointment booking system.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavHeader />

      <main className="flex-1 pt-16">
        <section className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                About <span className="text-blue-600">HospiLink</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                HospiLink is a modern, user-friendly platform that connects patients with qualified
                doctors and streamlines the entire appointment journey—from discovery to booking and follow-ups.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Make healthcare access simple and transparent by reducing friction in appointment booking
                  and enabling effective communication between patients and providers.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What We Offer</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Real-time doctor availability, secure authentication, ratings & reviews, and a responsive UI
                  built with best-in-class web technologies.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Technology</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Powered by Next.js, Tailwind CSS, and a robust API layer—crafted for performance,
                  accessibility, and reliability.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mt-8 md:mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Why choose us?</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Fast, intuitive booking flow optimized for mobile and desktop</li>
                <li>Trusted doctor profiles with transparent ratings and experience</li>
                <li>Secure authentication and privacy-first design</li>
                <li>Constantly improving with feedback from clinicians and patients</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
