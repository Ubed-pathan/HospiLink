import React from 'react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Contact · HospiLink',
  description: 'Get in touch with the HospiLink team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavHeader />

      <main className="flex-1 pt-16">
        <section className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Contact <span className="text-blue-600">Us</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Questions, feedback, or partnership inquiries—drop us a message and we’ll get back soon.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-5 md:p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                    placeholder="Your full name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-0 focus:border-blue-300">
                      <option>General</option>
                      <option>Support</option>
                      <option>Partnership</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-300"
                    placeholder="How can we help?"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button type="button" className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-blue-700">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
