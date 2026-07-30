import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Star, MapPin, Filter, ArrowRight, ShieldCheck, User, Wrench } from 'lucide-react';

export default function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get('category') || '';
  const initialMinRating = searchParams.get('minRating') || '';
  const initialRadius = searchParams.get('radiusKm') || '25';

  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [minRating, setMinRating] = useState(initialMinRating);
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [userLat, setUserLat] = useState('37.7749');
  const [userLng, setUserLng] = useState('-122.4194');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [selectedCategory, minRating, radiusKm]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/category/list');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (minRating) params.minRating = minRating;
      if (radiusKm) {
        params.radiusKm = radiusKm;
        params.lat = userLat;
        params.lng = userLng;
      }

      const res = await api.get('/professional/list', { params });
      if (res.data.success) {
        setProfessionals(res.data.professionals);
      }
    } catch (err) {
      console.error('Error fetching professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCategoryObj = categories.find((c) => c._id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {activeCategoryObj ? activeCategoryObj.name : 'All Service Professionals'}
        </h1>
        <p className="text-slate-300 text-sm mt-2 max-w-xl">
          {activeCategoryObj
            ? activeCategoryObj.description || `Verified ${activeCategoryObj.name} specialists ready for booking.`
            : 'Find and book top-rated, background-checked service professionals in your area.'}
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Select */}
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSearchParams({ category: e.target.value, minRating, radiusKm })}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500"
            >
              <option value="">Any Rating</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Radius Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500"
            >
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium self-end md:self-auto">
          Showing <span className="font-bold text-slate-900">{professionals.length}</span> verified pros
        </div>
      </div>

      {/* Professionals List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Professionals Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your category filter, rating threshold, or location radius to find active professionals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <div
              key={pro._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Pro Avatar & Basic Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
                      {pro.user?.name ? pro.user.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base">{pro.user?.name || 'Professional'}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{pro.user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Rating & Hourly Rate */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{pro.rating ? pro.rating.toFixed(1) : 'New'}</span>
                    {pro.ratingCount > 0 && <span className="text-slate-400 font-normal">({pro.ratingCount})</span>}
                  </div>
                  <div className="text-slate-900 font-extrabold text-sm">
                    ${pro.hourlyRate} <span className="text-xs font-normal text-slate-500">/ hr</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5">
                  {pro.categories?.map((cat) => (
                    <span
                      key={typeof cat === 'object' ? cat._id : cat}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-100"
                    >
                      {typeof cat === 'object' ? cat.name : 'Service'}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {pro.bio || 'Experienced and background-checked service professional.'}
                </p>
              </div>

              {/* View Profile / Book CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/professional/${pro._id}`)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  View Profile & Book <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
