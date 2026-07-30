import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Grid,
  Calendar,
  BarChart3,
  LogOut,
  LogIn,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-950 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Home<span className="text-purple-400">Services</span>
            </span>
            <span className="block text-[10px] uppercase font-extrabold tracking-widest text-purple-400 -mt-1">
              Admin Control Panel
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                isActive('/') ? 'bg-slate-800 text-purple-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Verification Queue
            </Link>
            <Link
              to="/categories"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                isActive('/categories') ? 'bg-slate-800 text-purple-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              Categories
            </Link>
            <Link
              to="/bookings"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                isActive('/bookings') ? 'bg-slate-800 text-purple-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              All Bookings
            </Link>
            <Link
              to="/analytics"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                isActive('/analytics') ? 'bg-slate-800 text-purple-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          </nav>
        )}

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <span className="text-xs font-medium text-slate-300">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-red-400 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-purple-400 px-3.5 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
