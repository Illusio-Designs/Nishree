'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { StarIcon, Add01Icon, Cancel01Icon } from 'hugeicons-react';
import Rating from '@/components/ui/Rating';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ReviewCard from '@/components/store/ReviewCard';
import { getReviews, createReview } from '@/lib/api';

// Clickable star input for the review form.
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer p-0.5"
        >
          <StarIcon
            size={26}
            strokeWidth={2}
            className={i <= (hover || value) ? 'text-[#f5a623]' : 'text-line'}
            style={i <= (hover || value) ? { fill: '#f5a623' } : undefined}
          />
        </button>
      ))}
    </span>
  );
}

// Centered modal wrapper (portaled to body).
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-body hover:bg-surface-soft cursor-pointer"
          >
            <Cancel01Icon size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', rating: 0, comment: '' });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await getReviews(productId);
      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      setStats(data?.stats || { average: 0, total: 0 });
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please select a star rating.');
    if (!form.name || !form.email || !form.comment) return toast.error('Please fill in your name, email and review.');
    setBusy(true);
    try {
      await createReview({ productId, rating: form.rating, comment: form.comment, name: form.name, email: form.email, files });
      toast.success('Thanks! Your review is pending approval.');
      setForm({ name: '', email: '', rating: 0, comment: '' });
      setFiles([]);
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit your review.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border-t border-line bg-surface-soft">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-ink">Customer Reviews</h2>
            {stats.total > 0 && (
              <span className="inline-flex items-center gap-2">
                <Rating value={stats.average} />
                <span className="text-sm text-muted">
                  {Number(stats.average).toFixed(1)} · {stats.total} review{stats.total > 1 ? 's' : ''}
                </span>
              </span>
            )}
          </div>
          <Button icon={Add01Icon} onClick={() => setOpen(true)}>Add review</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner size={26} /></div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-body">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Write a review">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Your rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>
          <Input label="Name" name="name" value={form.name} onChange={onChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Review</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={onChange}
              rows={4}
              required
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus-ring"
              placeholder="Share your experience with this product…"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Photos (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
              className="block w-full text-sm text-body file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
            {files.length > 0 && <p className="mt-1 text-xs text-muted">{files.length} file(s) selected</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" fullWidth disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</Button>
          </div>
          <p className="text-center text-xs text-muted">Reviews are published after approval.</p>
        </form>
      </Modal>
    </section>
  );
}
