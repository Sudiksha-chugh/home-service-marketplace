import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Wind,
  Palette,
  ShieldCheck,
  Star,
  Search,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const categoryIconMap = {
  Plumbing: Wrench,
  Electrical: Zap,
  Cleaning: Sparkles,
  Carpentry: Hammer,
  'AC Repair': Wind,
  Painting: Palette,
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/category/list');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-slate-900 to-slate-900 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent_50%)]"></div>
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            100% Background-Checked & Verified Pros
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Expert Home Services, <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
              Delivered Right to Your Door.
            </span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            From electrical fixes and plumbing leaks to deep cleaning and AC servicing — book top-rated professionals in seconds.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search category e.g. Plumbing, AC Repair..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-white placeholder-slate-400 px-4 py-2 focus:outline-none text-sm"
              />
              <button
                onClick={() => navigate(`/categories${searchTerm ? `?search=${searchTerm}` : ''}`)}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                Explore <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Services</h2>
            <p className="text-slate-500 text-sm mt-1">Select a category to view available professionals near you.</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-brand-600 font-semibold text-sm hover:text-brand-700 flex items-center gap-1"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const IconComponent = categoryIconMap[cat.name] || ShieldCheck;
              return (
                <div
                  key={cat._id}
                  onClick={() => navigate(`/categories?category=${cat._id}`)}
                  className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                        From ${cat.basePrice}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || 'Professional technicians available for on-demand booking.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                    <span>Book {cat.name}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Section */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Verified Credentials</h4>
                <p className="text-xs text-slate-500 mt-1">Every professional undergoes identity and skill document verification before approval.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Real Customer Reviews</h4>
                <p className="text-xs text-slate-500 mt-1">Authentic ratings from verified completed bookings ensure quality service.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Guaranteed Service</h4>
                <p className="text-xs text-slate-500 mt-1">Fair, transparent pricing with responsive customer support for peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
