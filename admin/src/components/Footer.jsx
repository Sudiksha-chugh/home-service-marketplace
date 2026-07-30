import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-20 border-t border-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white">HomeServices <span className="text-purple-400">Admin Control</span></span>
        </div>
        <p className="text-slate-500">© 2026 HomeServices Marketplace. Restricted Admin Portal.</p>
      </div>
    </footer>
  );
}
