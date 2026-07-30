import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink, Clock, Wrench } from 'lucide-react';

export default function VerificationQueue() {
  const [professionals, setProfessionals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, [filterStatus]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/verification-queue');
      if (res.data.success) {
        setProfessionals(res.data.professionals);
      }
    } catch (err) {
      console.error('Error fetching verification queue:', err);
      toast.error('Failed to load professional verification queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (professionalId, status) => {
    try {
      const res = await api.put('/admin/verify-pro', {
        professionalId,
        status,
      });

      if (res.data.success) {
        toast.success(`Professional verification set to: ${status.toUpperCase()}`);
        fetchQueue();
      } else {
        toast.error(res.data.message || 'Failed to update verification status.');
      }
    } catch (err) {
      toast.error('Error updating verification status.');
    }
  };

  const filteredPros = professionals.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.verificationStatus === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-purple-600" /> Professional Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review uploaded identification and skill documents to approve or reject professional accounts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filterStatus === 'pending' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending Review ({professionals.filter((p) => p.verificationStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filterStatus === 'approved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Approved ({professionals.filter((p) => p.verificationStatus === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Pros ({professionals.length})
          </button>
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredPros.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Professionals in Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no professionals matching the selected filter status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPros.map((pro) => {
            const userObj = pro.user;
            const isPending = pro.verificationStatus === 'pending';

            return (
              <div
                key={pro._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                      {userObj?.name ? userObj.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{userObj?.name || 'Professional'}</h3>
                      <p className="text-xs text-slate-500">{userObj?.email} • {userObj?.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-900">${pro.hourlyRate} <span className="text-xs font-normal text-slate-500">/ hr</span></span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                        pro.verificationStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : pro.verificationStatus === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {pro.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Categories & Bio */}
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-700 mr-2">Categories:</span>
                    {pro.categories?.map((cat) => (
                      <span
                        key={typeof cat === 'object' ? cat._id : cat}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100"
                      >
                        {typeof cat === 'object' ? cat.name : 'Category'}
                      </span>
                    ))}
                  </div>

                  {pro.bio && (
                    <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{pro.bio}"
                    </p>
                  )}
                </div>

                {/* Uploaded Verification Documents */}
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Uploaded Verification Proof</span>
                  {pro.documents && pro.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pro.documents.map((docUrl, idx) => (
                        <a
                          key={idx}
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <FileText className="w-4 h-4 text-purple-600" />
                          Document #{idx + 1}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No verification document file attached.</span>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleVerify(pro._id, 'rejected')}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Professional
                  </button>

                  <button
                    onClick={() => handleVerify(pro._id, 'approved')}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 px-5 py-2 rounded-xl transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Professional
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
