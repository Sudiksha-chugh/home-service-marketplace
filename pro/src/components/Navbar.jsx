import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  LayoutDashboard,
  Calendar,
  Inbox,
  Briefcase,
  DollarSign,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Home<span className="text-emerald-400">Services</span>
            </span>
            <span className="block text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 -mt-1">
              Pro Dashboard
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-5">
            <Link
              to="/"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/availability"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/availability') ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Availability
            </Link>
            <Link
              to="/requests"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/requests') ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Incoming Requests
            </Link>
            <Link
              to="/jobs"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/jobs') ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Active Jobs
            </Link>
            <Link
              to="/earnings"
              className={`font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/earnings') ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Earnings
            </Link>
          </nav>
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-200">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 px-3.5 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Register as Pro
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
