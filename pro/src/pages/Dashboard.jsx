import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  ShieldCheck,
  Clock,
  XCircle,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Star,
  Inbox,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [pro, setPro] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const proListRes = await api.get('/professional/list', {
        params: { verificationStatus: 'all' },
      });
      // Find logged in pro by matching user ID
      if (proListRes.data.success && user) {
        const found = proListRes.data.professionals.find(
          (p) => (typeof p.user === 'object' ? p.user._id : p.user) === user.id
        );
        if (found) {
          setPro(found);
        }
      }

      // Fetch bookings for this pro
      const bookingRes = await api.get('/booking/mine');
      if (bookingRes.data.success) {
        setBookings(bookingRes.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!pro || pro.verificationStatus !== 'approved') {
      toast.warning('You cannot toggle active status until your profile is approved by Admin.');
      return;
    }

    setToggling(true);
    try {
      const res = await api.put('/professional/active');
      if (res.data.success) {
        setPro({ ...pro, isActive: res.data.isActive });
        toast.success(`Account status set to: ${res.data.isActive ? 'Active (Accepting Jobs)' : 'Inactive (Paused)'}`);
      } else {
        toast.error(res.data.message || 'Failed to toggle status.');
      }
    } catch (err) {
      toast.error('Error updating status.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  const requestedCount = bookings.filter((b) => b.status === 'requested').length;
  const activeCount = bookings.filter((b) => b.status === 'accepted' || b.status === 'in_progress').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const isApproved = pro?.verificationStatus === 'approved';
  const isPending = pro?.verificationStatus === 'pending' || !pro;
  const isRejected = pro?.verificationStatus === 'rejected';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Professional'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">Professional dashboard & job management overview.</p>
        </div>

        {/* Active Toggle Button */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Accepting New Jobs</span>
            <span className={`text-xs font-extrabold ${pro?.isActive && isApproved ? 'text-emerald-600' : 'text-slate-400'}`}>
              {pro?.isActive && isApproved ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <button
            onClick={handleToggleActive}
            disabled={!isApproved || toggling}
            title={!isApproved ? 'Account approval required to accept jobs' : 'Toggle active status'}
            className={`p-1 rounded-xl transition-all ${
              !isApproved
                ? 'opacity-40 cursor-not-allowed text-slate-300'
                : pro?.isActive
                ? 'text-emerald-600 hover:scale-105'
                : 'text-slate-400 hover:scale-105'
            }`}
          >
            {pro?.isActive && isApproved ? (
              <ToggleRight className="w-9 h-9" />
            ) : (
              <ToggleLeft className="w-9 h-9" />
            )}
          </button>
        </div>
      </div>

      {/* Prominent Verification Status Banner */}
      {isPending && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-900 text-base">Verification Status: AWAITING APPROVAL</span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800">
                Pending Admin Review
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your professional account and uploaded documents are currently under review by our admin team.
              You will be able to set your status to <strong>Active</strong> and receive job requests once approved.
            </p>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-900 text-base">Verification Status: APPROVED</span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                Verified Technician
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your application has been approved! Customers can view your profile and send job requests.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-red-900 text-base">Verification Status: REJECTED</span>
            <p className="text-xs text-red-800">Please contact support or re-upload valid verification documents.</p>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Rate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Hourly Rate</span>
          <div className="text-3xl font-extrabold text-slate-900">${pro?.hourlyRate || 75} <span className="text-xs text-slate-500 font-normal">/ hr</span></div>
        </div>

        {/* Incoming Requests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Incoming Requests</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{requestedCount}</div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{activeCount}</div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">${pro?.totalEarnings || 0}</div>
        </div>
      </div>
    </div>
  );
}
