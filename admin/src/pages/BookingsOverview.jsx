import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, Filter, Clock, CheckCircle2, RotateCw, XCircle } from 'lucide-react';

const statusBadgeMap = {
  requested: { label: 'Requested', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Progress', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200' },
};

export default function BookingsOverview() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/booking/mine');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-purple-600" /> Platform Bookings Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">Read-only overview of all customer & professional booking requests across the platform.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold gap-1">
          {['all', 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st === 'in_progress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6">Booking ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Professional</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Scheduled Date</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading platform bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No bookings match the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge = statusBadgeMap[b.status] || statusBadgeMap.requested;
                  const customerUser = b.customer;
                  const proUser = b.professional?.user;

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono text-slate-500 text-[11px]">{b._id}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{customerUser?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400">{customerUser?.email || ''}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{proUser?.name || 'Assigned Pro'}</div>
                        <div className="text-[11px] text-slate-400">{proUser?.email || ''}</div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-purple-700">{b.category?.name || 'Service'}</td>
                      <td className="py-4 px-6 text-slate-700">
                        {b.scheduledTime
                          ? new Date(b.scheduledTime).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900">${b.price}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
