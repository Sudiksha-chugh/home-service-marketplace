import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Inbox, CheckCircle2, XCircle, MapPin, Calendar, Clock, User, Wrench } from 'lucide-react';

export default function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/booking/mine');
      if (res.data.success) {
        // Filter requested status
        const filtered = res.data.bookings.filter((b) => b.status === 'requested');
        setRequests(filtered);
      }
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
      toast.error('Failed to load incoming requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await api.put('/booking/status', {
        bookingId,
        status: newStatus,
      });

      if (res.data.success) {
        toast.success(`Booking ${newStatus === 'accepted' ? 'accepted!' : 'rejected.'}`);
        fetchRequests();
      } else {
        toast.error(res.data.message || 'Failed to update booking status.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating status.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Inbox className="w-8 h-8 text-amber-500" /> Incoming Job Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review new service requests from customers and respond promptly.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Pending Requests</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no pending job requests at the moment. Ensure your profile is active to receive new bookings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((booking) => {
            const customer = booking.customer;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {booking.category?.name || 'Service Request'}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">Booking ID: {booking._id}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Price</span>
                    <span className="text-xl font-extrabold text-slate-900">${booking.price}</span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Customer Details</span>
                    <p className="font-bold text-slate-800">{customer?.name || 'Customer'}</p>
                    <p className="text-slate-500">{customer?.email || ''}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Requested Time</span>
                    <p className="font-bold text-slate-800">
                      {booking.scheduledTime
                        ? new Date(booking.scheduledTime).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Specified Date'}
                    </p>
                    <p className="text-slate-500">
                      {booking.scheduledTime ? new Date(booking.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Service Location</span>
                    <p className="font-bold text-slate-800 truncate">{booking.address?.line1 || 'Address'}</p>
                    <p className="text-slate-500 truncate">{booking.address?.line2 || ''}</p>
                  </div>
                </div>

                {booking.notes && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    "<span className="font-semibold text-slate-700">Customer Note:</span> {booking.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 px-5 py-2 rounded-xl transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Job
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
