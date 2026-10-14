import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';
import { orderApi } from '../../services/orderApi';
import StarRating from '../../components/StarRating';
import { notify } from '../../context/NotificationContext';

export default function WriteReview() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [item, setItem] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (orderId && productId) {
      fetchOrderAndProduct();
    } else {
      setError('Invalid order or product information.');
      setLoading(false);
    }
  }, [orderId, productId]);

  const fetchOrderAndProduct = async () => {
    setLoading(true);
    try {
      const [ord, revs] = await Promise.all([
        orderApi.getBuyerOrderById(orderId),
        reviewApi.getOrderReviews(orderId).catch(() => []),
      ]);
      setOrder(ord);
      const targetItem = ord.items?.find((i) => i.productId === productId || i.id === productId);
      const selItem = targetItem || ord.items?.[0] || null;
      setItem(selItem);

      if (selItem && Array.isArray(revs)) {
        const found = revs.find(
          (r) => r.productId === selItem.productId || r.productId === selItem.id
        );
        if (found) {
          setExistingReview(found);
          setRating(Number(found.rating) || 5);
          setTitle(found.title || '');
          setComment(found.body || found.comment || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch order details for review:', err);
      setError('Could not load product details for review.');
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = Boolean(existingReview && existingReview.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      notify.warning('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await reviewApi.updateReview(existingReview.id, {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        notify.success('Review updated successfully!', 'Review Updated');
      } else {
        await reviewApi.createReview({
          orderId,
          productId: item?.productId || productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        notify.success('Thank you for rating this produce!', 'Review Submitted');
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit review:', err);
      notify.error(
        err.response?.data?.message ||
          (isEditMode ? 'Failed to update review.' : 'Failed to submit review.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview?.id) return;
    if (!window.confirm('Are you sure you want to remove your review?')) return;
    setDeleting(true);
    try {
      await reviewApi.deleteReview(existingReview.id);
      notify.success('Review removed successfully.', 'Review Deleted');
      navigate(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err) {
      console.error('Failed to delete review:', err);
      notify.error(err.response?.data?.message || 'Failed to remove review.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto py-16 text-center text-slate-500">Loading produce details...</div>;
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 font-serif">
          {isEditMode ? 'Review Updated Successfully!' : 'Thank You for Your Review!'}
        </h2>
        <p className="text-xs text-slate-600">
          Your feedback helps farmers improve quality and assists other buyers in making informed choices.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate(orderId ? `/orders/${orderId}` : '/orders')}
            className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-full shadow-sm hover:bg-emerald-900 transition-colors"
          >
            Back to Order Details
          </button>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-slate-800 font-serif mb-2">Review Not Available</h2>
        <p className="text-slate-600 text-xs mb-6">{error || 'Item not found in order.'}</p>
        <Link to="/orders" className="px-6 py-2.5 bg-emerald-800 text-white font-semibold text-xs rounded-full inline-block">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans space-y-6">
      <button
        onClick={() => navigate(orderId ? `/orders/${orderId}` : -1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Back
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              {isEditMode ? 'Edit Your Review' : 'Rate & Review Product'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order #{order?.orderNumber} • Delivered
            </p>
          </div>
          {isEditMode && (
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px] rounded-md">
              Edit Mode
            </span>
          )}
        </div>

        {/* Target Item Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
              🌾
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{item.productName}</div>
              <div className="text-xs text-slate-500">
                Grade: {item.grade || 'A'} • Qty: {item.quantityQuintal} Quintals
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-900">
            ₹{Number(item.lineTotal || item.totalPrice).toLocaleString()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-3 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
              <StarRating rating={rating} onRatingChange={(val) => setRating(val)} size="lg" />
              <span className="text-xs font-bold text-amber-700">
                {rating === 5
                  ? '5/5 Excellent'
                  : rating === 4
                  ? '4/5 Very Good'
                  : rating === 3
                  ? '3/5 Average'
                  : rating === 2
                  ? '2/5 Poor'
                  : '1/5 Terribly Bad'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Review Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Excellent Grains & Fresh Packaging!"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Your Feedback & Experience (Optional)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other buyers about grain quality, moisture, packaging, and seller service..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Removing...' : 'Delete Review'}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(orderId ? `/orders/${orderId}` : -1)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-full shadow-sm hover:bg-emerald-900 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {submitting
                  ? isEditMode
                    ? 'Updating...'
                    : 'Submitting...'
                  : isEditMode
                  ? 'Update Review'
                  : 'Submit Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
