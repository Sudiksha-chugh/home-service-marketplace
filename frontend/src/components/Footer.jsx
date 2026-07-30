import React from 'react';
import { Wrench, ShieldCheck, Clock, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white">Home<span className="text-brand-500">Services</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting homeowners with verified, background-checked professionals for fast, high-quality home repairs and maintenance.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/categories" className="hover:text-white transition-colors">Browse Categories</a></li>
              <li><a href="/bookings" className="hover:text-white transition-colors">My Bookings</a></li>
            </ul>
          </div>

          {/* Value Props */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Why Choose Us</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Technicians</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-400" /> On-Demand Scheduling</li>
              <li className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Transparent Pricing</li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <p className="text-sm text-slate-400">Need help with your booking?</p>
            <p className="text-sm text-brand-400 font-medium mt-1">support@homeservices.com</p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 HomeServices Marketplace. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by verified home service professionals.</p>
        </div>
      </div>
    </footer>
  );
}
