import React from 'react';
import { Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white">HomeServices <span className="text-emerald-400">Pro Portal</span></span>
        </div>
        <p className="text-slate-500">© 2026 HomeServices Marketplace. Verified Professional Network.</p>
      </div>
    </footer>
  );
}
