import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Wrench,
  ArrowLeft,
  DollarSign,
  MessageSquare,
} from 'lucide-react';

export default function ProfessionalProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProfileAndReviews();
  }, [id]);

  const fetchProfileAndReviews = async () => {
    setLoading(true);
    try {
      const [proRes, reviewRes] = await Promise.all([
        api.get(`/professional/${id}`),
        api.get(`/review/professional/${id}`).catch(() => ({ data: { reviews: [] } })),
      ]);

      if (proRes.data.success) {
        setPro(proRes.data.professional);
        if (proRes.data.professional.categories?.length > 0) {
          const firstCat = proRes.data.professional.categories[0];
          setSelectedCategory(typeof firstCat === 'object' ? firstCat._id : firstCat);
        }
      }

      if (reviewRes.data.reviews) {
        setReviews(reviewRes.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching professional profile:', err);
      toast.error('Failed to load professional profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please log in as a customer to book appointments.');
      navigate('/login');
      return;
    }

    if (!date || !time || !line1 || !selectedCategory) {
      toast.error('Please fill in category, date, time, and address line 1.');
      return;
    }

    const scheduledTime = new Date(`${date}T${time}`).toISOString();

    setBookingLoading(true);
    try {
      const res = await api.post('/booking/create', {
        professionalId: pro._id,
        categoryId: selectedCategory,
        scheduledTime,
        address: { line1, line2 },
        notes,
        price: pro.hourlyRate || 50,
      });

      if (res.data.success) {
        toast.success('Booking requested successfully!');
        navigate('/bookings');
      } else {
        toast.error(res.data.message || 'Failed to create booking.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error processing booking request.';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Professional Not Found</h2>
        <button
          onClick={() => navigate('/categories')}
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          &larr; Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Professionals
      </button>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/20">
                  {pro.user?.name ? pro.user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-slate-900">{pro.user?.name}</h1>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{pro.user?.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Hourly Rate</span>
                <span className="text-2xl font-extrabold text-slate-900">${pro.hourlyRate} <span className="text-xs font-normal text-slate-500">/ hr</span></span>
              </div>
            </div>

            {/* Rating & Verification */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{pro.rating ? pro.rating.toFixed(1) : 'New Professional'} ({pro.ratingCount || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Status: {pro.verificationStatus}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">About Professional</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {pro.bio || 'Experienced home service specialist committed to high-quality craftsmanship, timeliness, and customer satisfaction.'}
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {pro.categories?.map((cat) => (
                  <span
                    key={typeof cat === 'object' ? cat._id : cat}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-brand-500" />
                    {typeof cat === 'object' ? cat.name : 'Category'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" /> Standard Availability Schedule
            </h3>
            {pro.availability && Object.keys(pro.availability).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(pro.availability).map(([day, slots]) => (
                  <div key={day} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-xs font-bold uppercase text-slate-700">{day}</span>
                    <span className="text-xs text-slate-500">
                      {Array.isArray(slots) ? slots.join(', ') : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Flexible daily availability. Pick your preferred appointment date & time.</p>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Customer Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No customer reviews yet for this professional.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{rev.customer?.name || 'Verified Customer'}</span>
                      <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rev.rating} / 5
                      </div>
                    </div>
                    {rev.comment && <p className="text-slate-600 italic">"{rev.comment}"</p>}
                    <span className="block text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "Book Now" Form */}
        <div>
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Book Appointment</h2>
              <p className="text-xs text-slate-500 mt-1">Select date, time, and service location to request booking.</p>
            </div>

            <form onSubmit={handleBookNow} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-brand-500"
                >
                  {pro.categories?.map((cat) => {
                    const cId = typeof cat === 'object' ? cat._id : cat;
                    const cName = typeof cat === 'object' ? cat.name : 'Service Category';
                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Address Line 1</label>
                <input
                  type="text"
                  placeholder="Street Address, Apt / Suite"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="City, State, ZIP"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Service Details</label>
                <textarea
                  rows="2"
                  placeholder="Describe the issue or service requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Estimated Total:</span>
                  <span className="text-lg font-extrabold text-slate-900">${pro.hourlyRate || 50}</span>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Requesting Appointment...' : 'Confirm Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
