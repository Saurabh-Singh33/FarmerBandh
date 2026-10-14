import React, { useState, useEffect } from 'react';
import { Star, X, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import { reviewApi } from '../services/reviewApi';
import { notify } from '../context/NotificationContext';

export default function ReviewModal({
  isOpen,
  onClose,
  order,
  item,
  existingReview = null,
  onSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = Boolean(existingReview && existingReview.id);

  // Sync form state when modal opens or item/existingReview changes
  useEffect(() => {
    if (!isOpen) return;

    if (existingReview) {
      setRating(Number(existingReview.rating) || 5);
      setTitle(existingReview.title || '');
      setComment(existingReview.body || existingReview.comment || '');
    } else {
      setRating(5);
      setTitle('');
      setComment('');
    }
    setSubmitting(false);
    setDeleting(false);
    setShowDeleteConfirm(false);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, existingReview, item]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting && !deleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, deleting, onClose]);

  if (!isOpen || !item) return null;

  const getRatingDescription = (r) => {
    switch (r) {
      case 5:
        return '5/5 Excellent';
      case 4:
        return '4/5 Very Good';
      case 3:
        return '3/5 Average';
      case 2:
        return '2/5 Poor';
      case 1:
        return '1/5 Terribly Bad';
      default:
        return `${r}/5 Rating`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1) {
      notify.warning('Please select a star rating (1 to 5).');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditMode) {
        res = await reviewApi.updateReview(existingReview.id, {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        notify.success('Review updated successfully!', 'Review Updated');
      } else {
        res = await reviewApi.createReview({
          orderId: order?.id,
          productId: item.productId || item.id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        notify.success('Thank you for rating this produce!', 'Review Submitted');
      }

      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
      const errMsg =
        err.response?.data?.message ||
        (isEditMode
          ? 'Failed to update review. Please try again.'
          : 'Failed to submit review. You may have already reviewed this item.');
      notify.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview?.id) return;
    setDeleting(true);
    try {
      await reviewApi.deleteReview(existingReview.id);
      notify.success('Your review has been removed.', 'Review Deleted');
      if (onSuccess) {
        onSuccess({ deleted: true, reviewId: existingReview.id });
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete review:', err);
      notify.error(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const orderNumber = order?.orderNumber || 'Delivered Order';
  const unitPrice = item.unitPricePerQuintal || item.unitPrice || 0;
  const lineTotal = item.lineTotal || item.totalPrice || (unitPrice * (item.quantityQuintal || 1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting && !deleting) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h2
              id="review-modal-title"
              className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2"
            >
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              {isEditMode ? 'Edit Your Review' : 'Rate & Review Product'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Order #{orderNumber} • Delivered
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || deleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Card Summary */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                🌾
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {item.productName || item.productNameSnapshot || 'Produce Item'}
                </div>
                <div className="text-xs text-slate-500">
                  Grade: {item.grade || item.gradeSnapshot || 'A'} • Qty: {item.quantityQuintal || 1} Quintals
                  {item.quantityQuintal ? ` (${(item.quantityQuintal * 100).toFixed(0)} kg)` : ''}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-900">
                ₹{Number(lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-slate-400">
                ₹{Number(unitPrice).toLocaleString('en-IN')}/qtl
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Overall Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <StarRating
                  rating={rating}
                  onRatingChange={(val) => setRating(val)}
                  size="lg"
                />
                <span className="text-xs font-bold text-amber-700">
                  {getRatingDescription(rating)}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Title <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g. Excellent Grains & Fresh Packaging!"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
              <div className="text-[10px] text-slate-400 text-right mt-1">
                {title.length}/120 characters
              </div>
            </div>

            {/* Feedback & Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Feedback & Experience <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Tell other buyers about grain quality, moisture, packaging, and seller service..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all resize-y"
              />
              <div className="text-[10px] text-slate-400 text-right mt-1">
                {comment.length}/1000 characters
              </div>
            </div>

            {/* Delete Confirmation Warning (if edit mode) */}
            {isEditMode && showDeleteConfirm && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between animate-in fade-in">
                <span>Are you sure you want to delete this review?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 text-slate-600 bg-white border border-slate-200 rounded-md font-medium text-[11px] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-2.5 py-1 text-white bg-rose-600 rounded-md font-bold text-[11px] hover:bg-rose-700 flex items-center gap-1"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {isEditMode && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1 p-1 hover:underline transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove review
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting || deleting}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || deleting}
                  className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-full shadow-sm hover:bg-emerald-900 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting
                    ? isEditMode
                      ? 'Updating Review...'
                      : 'Submitting Review...'
                    : isEditMode
                    ? 'Update Review'
                    : 'Submit Review'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
