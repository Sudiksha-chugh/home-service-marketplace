import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ChatModal from '../components/ChatModal';
import ReviewModal from '../components/ReviewModal';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  X,
  CreditCard,
  Check,
  MessageSquare,
  Star,
} from 'lucide-react';

const statusBadgeMap = {
  requested: { label: 'Requested', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  accepted: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: RotateCw },
  completed: { label: 'Completed', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);

  useEffect(() => {
    fetchMyBookings();
    const interval = setInterval(() => {
      fetchMyBookings(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/booking/mine');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      if (!silent) {
        console.error('Error fetching bookings:', err);
        toast.error('Failed to load bookings.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handlePayNow = async (booking) => {
    try {
      const orderRes = await api.post('/payment/create-order', { bookingId: booking._id });
      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || 'Failed to create payment order.');
        return;
      }

      const { order, keyId } = orderRes.data;

      if (window.Razorpay && !keyId.includes('placeholder')) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'HomeServices Marketplace',
          description: `Payment for ${booking.category?.name || 'Home Service'}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payment/verify', {
                bookingId: booking._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                toast.success('Payment completed successfully!');
                fetchMyBookings();
              } else {
                toast.error(verifyRes.data.message || 'Payment verification failed.');
              }
            } catch (vErr) {
              toast.error('Error verifying payment signature.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#2563eb',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.info('Test Mode: Simulating Razorpay payment checkout...');
        const mockPayId = `pay_test_${Date.now()}`;
        const mockSig = 'mock_signature_test';

        const verifyRes = await api.post('/payment/verify', {
          bookingId: booking._id,
          razorpayOrderId: order.id,
          razorpayPaymentId: mockPayId,
          razorpaySignature: mockSig,
        });

        if (verifyRes.data.success) {
          toast.success('Test payment verified! Booking paymentStatus updated to Paid.');
          fetchMyBookings();
        } else {
          toast.error(verifyRes.data.message || 'Payment verification failed.');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error processing payment.';
      toast.error(msg);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking) return;
    if (!cancellationReason.trim()) {
      toast.error('Please enter a reason for cancellation.');
      return;
    }

    setCancelling(true);
    try {
      const res = await api.put('/booking/cancel', {
        bookingId: cancelModalBooking._id,
        cancellationReason,
      });

      if (res.data.success) {
        toast.success('Booking cancelled successfully.');
        setCancelModalBooking(null);
        setCancellationReason('');
        fetchMyBookings();
      } else {
        toast.error(res.data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error cancelling booking.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">Track live status of your service requests & appointments.</p>
        </div>
        <button
          onClick={() => fetchMyBookings()}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3.5 py-2 rounded-xl transition-colors"
        >
          <RotateCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Bookings Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't requested any home service appointments. Browse categories and book a verified technician!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const badge = statusBadgeMap[booking.status] || statusBadgeMap.requested;
            const BadgeIcon = badge.icon;
            const proUser = booking.professional?.user;
            const isAccepted = booking.status === 'accepted';
            const isCompleted = booking.status === 'completed';
            const isPendingPayment = booking.paymentStatus === 'pending';
            const isPaid = booking.paymentStatus === 'paid';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {booking.category?.name || 'Service Booking'}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">ID: {booking._id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-900">${booking.price}</span>
                      <span
                        className={`block text-[10px] font-bold uppercase ${
                          isPaid ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        Payment: {booking.paymentStatus || 'pending'}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Professional</span>
                    <p className="font-bold text-slate-800">{proUser?.name || 'Assigned Technician'}</p>
                    <p className="text-slate-500">{proUser?.phone || proUser?.email || ''}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Appointment</span>
                    <p className="font-bold text-slate-800">
                      {booking.scheduledTime
                        ? new Date(booking.scheduledTime).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Date Not Specified'}
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
                  <p className="text-xs text-slate-600 italic bg-slate-50/50 p-2.5 rounded-lg">
                    "<span className="font-semibold text-slate-700">Notes:</span> {booking.notes}"
                  </p>
                )}

                {booking.status === 'cancelled' && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 text-xs space-y-1">
                    <span className="font-bold">Cancelled by: {booking.cancelledBy || 'User'}</span>
                    {booking.cancellationReason && (
                      <p>Reason: {booking.cancellationReason}</p>
                    )}
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveChatBooking(booking)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3.5 py-1.5 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Live Chat
                  </button>

                  {isCompleted && (
                    <button
                      onClick={() => setReviewModalBooking(booking)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-1.5 rounded-xl transition-colors"
                    >
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Leave Review
                    </button>
                  )}

                  {isPendingPayment && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                    <button
                      onClick={() => handlePayNow(booking)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 px-4 py-1.5 rounded-xl transition-all"
                    >
                      <CreditCard className="w-4 h-4" /> Pay Now (${booking.price})
                    </button>
                  )}

                  {isPaid && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-600" /> Payment Complete
                    </span>
                  )}

                  {(booking.status === 'requested' || booking.status === 'accepted') && (
                    <button
                      onClick={() => setCancelModalBooking(booking)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Cancel Booking
              </h3>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this booking? Please provide a reason for cancellation.
            </p>

            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Plans changed, booked wrong date..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {activeChatBooking && (
        <ChatModal
          bookingId={activeChatBooking._id}
          currentUser={user}
          role="customer"
          onClose={() => setActiveChatBooking(null)}
          onStatusUpdate={() => fetchMyBookings(true)}
        />
      )}

      {/* Review Modal */}
      {reviewModalBooking && (
        <ReviewModal
          bookingId={reviewModalBooking._id}
          proName={reviewModalBooking.professional?.user?.name}
          onClose={() => setReviewModalBooking(null)}
          onSuccess={() => fetchMyBookings(true)}
        />
      )}
    </div>
  );
}
