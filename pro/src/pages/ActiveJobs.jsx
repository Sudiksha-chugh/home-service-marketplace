import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ChatModal from '../components/ChatModal';
import { Briefcase, Play, CheckCircle2, MapPin, Calendar, Clock, User, Wrench, RotateCw, MessageSquare } from 'lucide-react';

export default function ActiveJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/booking/mine');
      if (res.data.success) {
        const filtered = res.data.bookings.filter(
          (b) => b.status === 'accepted' || b.status === 'in_progress'
        );
        setJobs(filtered);
      }
    } catch (err) {
      console.error('Error fetching active jobs:', err);
      toast.error('Failed to load active jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (bookingId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'accepted') {
      nextStatus = 'in_progress';
    } else if (currentStatus === 'in_progress') {
      nextStatus = 'completed';
    } else {
      return;
    }

    try {
      const res = await api.put('/booking/status', {
        bookingId,
        status: nextStatus,
      });

      if (res.data.success) {
        toast.success(
          `Job status updated to: ${nextStatus === 'in_progress' ? 'In Progress' : 'Completed'}`
        );
        fetchActiveJobs();
      } else {
        toast.error(res.data.message || 'Failed to update status.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error advancing status.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-8 h-8 text-emerald-600" /> Active Jobs
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage ongoing accepted & in-progress jobs step-by-step.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Active Jobs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no accepted or in-progress jobs. Accept incoming requests to start work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isAccepted = job.status === 'accepted';
            const isInProgress = job.status === 'in_progress';
            const customer = job.customer;

            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {job.category?.name || 'Active Service Job'}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">Job ID: {job._id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xl font-extrabold text-slate-900">${job.price}</span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                        isAccepted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {isAccepted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                        </>
                      ) : (
                        <>
                          <RotateCw className="w-3.5 h-3.5" /> In Progress
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Customer Details</span>
                    <p className="font-bold text-slate-800">{customer?.name || 'Customer'}</p>
                    <p className="text-slate-500">{customer?.email || ''}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Time</span>
                    <p className="font-bold text-slate-800">
                      {job.scheduledTime
                        ? new Date(job.scheduledTime).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Scheduled Date'}
                    </p>
                    <p className="text-slate-500">
                      {job.scheduledTime ? new Date(job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Service Location</span>
                    <p className="font-bold text-slate-800 truncate">{job.address?.line1 || 'Address'}</p>
                    <p className="text-slate-500 truncate">{job.address?.line2 || ''}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveChatBooking(job)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Live Chat
                  </button>

                  {isAccepted && (
                    <button
                      onClick={() => handleAdvanceStatus(job._id, 'accepted')}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 px-5 py-2 rounded-xl transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Job (In Progress)
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      onClick={() => handleAdvanceStatus(job._id, 'in_progress')}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-5 py-2 rounded-xl transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete Job
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Chat Modal */}
      {activeChatBooking && (
        <ChatModal
          bookingId={activeChatBooking._id}
          currentUser={user}
          role="professional"
          onClose={() => setActiveChatBooking(null)}
          onStatusUpdate={() => fetchActiveJobs()}
        />
      )}
    </div>
  );
}
