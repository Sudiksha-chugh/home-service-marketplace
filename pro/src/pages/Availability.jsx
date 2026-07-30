import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, Save, Clock, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Availability() {
  const [availability, setAvailability] = useState({
    mon: ['09:00-12:00', '13:00-17:00'],
    tue: ['09:00-12:00', '13:00-17:00'],
    wed: ['09:00-12:00', '13:00-17:00'],
    thu: ['09:00-12:00', '13:00-17:00'],
    fri: ['09:00-12:00', '13:00-17:00'],
    sat: ['10:00-14:00'],
    sun: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileAvailability();
  }, []);

  const fetchProfileAvailability = async () => {
    try {
      const res = await api.get('/professional/list', { params: { verificationStatus: 'all' } });
      if (res.data.success) {
        // find profile
        const myPro = res.data.professionals.find((p) => p.user?._id === JSON.parse(localStorage.getItem('pro_user'))?.id);
        if (myPro && myPro.availability && Object.keys(myPro.availability).length > 0) {
          setAvailability(myPro.availability);
        }
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  const handleAddSlot = (dayKey) => {
    const current = availability[dayKey] || [];
    setAvailability({
      ...availability,
      [dayKey]: [...current, '09:00-17:00'],
    });
  };

  const handleRemoveSlot = (dayKey, index) => {
    const current = availability[dayKey] || [];
    const updated = current.filter((_, i) => i !== index);
    setAvailability({
      ...availability,
      [dayKey]: updated,
    });
  };

  const handleSlotChange = (dayKey, index, value) => {
    const current = [...(availability[dayKey] || [])];
    current[index] = value;
    setAvailability({
      ...availability,
      [dayKey]: current,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/professional/availability', { availability });
      if (res.data.success) {
        toast.success('Weekly availability schedule saved successfully!');
      } else {
        toast.error(res.data.message || 'Failed to save availability.');
      }
    } catch (err) {
      toast.error('Error saving availability.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-emerald-600" /> Weekly Availability Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">Set recurring daily time slots when you are available for service calls.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const dayKey = day.toLowerCase();
          const slots = availability[dayKey] || [];

          return (
            <div key={day} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-24">
                <span className="font-extrabold text-slate-900 text-base uppercase">{day}</span>
                <span className="block text-[10px] text-slate-400 font-bold">{slots.length} Slots</span>
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-3">
                {slots.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No available slots (Off day)</span>
                ) : (
                  slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => handleSlotChange(dayKey, index, e.target.value)}
                        placeholder="09:00-17:00"
                        className="bg-transparent text-xs font-mono font-bold text-slate-800 w-28 focus:outline-none"
                      />
                      <button
                        onClick={() => handleRemoveSlot(dayKey, index)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => handleAddSlot(dayKey)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
