import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, CheckCircle2, Calendar, Wrench, Award } from 'lucide-react';

export default function Earnings() {
  const { user } = useAuth();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      // Fetch professional profile for totalEarnings field
      const proListRes = await api.get('/professional/list', { params: { verificationStatus: 'all' } });
      if (proListRes.data.success && user) {
        const myPro = proListRes.data.professionals.find((p) => p.user?._id === user.id);
        if (myPro) {
          setTotalEarnings(myPro.totalEarnings || 0);
        }
      }

      // Fetch bookings
      const bookingRes = await api.get('/booking/mine');
      if (bookingRes.data.success) {
        const completed = bookingRes.data.bookings.filter((b) => b.status === 'completed');
        setCompletedJobs(completed);
        // If totalEarnings is 0, calculate sum of completed jobs
        const calculatedSum = completed.reduce((sum, b) => sum + (b.price || 0), 0);
        setTotalEarnings((prev) => (prev > 0 ? prev : calculatedSum));
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-8 h-8 text-emerald-600" /> Earnings & Revenue
          </h1>
          <p className="text-xs text-slate-500 mt-1">Summary of completed service bookings and running total income.</p>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-4">
          <div>
            <span className="block text-[10px] uppercase font-bold text-emerald-100">Total Running Earnings</span>
            <span className="text-3xl font-extrabold">${totalEarnings}</span>
          </div>
          <Award className="w-8 h-8 text-emerald-200" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : completedJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Completed Jobs Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you complete assigned jobs, your earnings breakdown and payout history will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Completed Service History</h3>
          {completedJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{job.category?.name || 'Completed Job'}</h4>
                  <p className="text-xs text-slate-500">Customer: {job.customer?.name || 'Customer'}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Booking ID: {job._id}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xl font-extrabold text-emerald-600">+${job.price}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed & Paid
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
