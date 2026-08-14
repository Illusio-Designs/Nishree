'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { StarIcon } from 'hugeicons-react';
import Rating from '@/components/ui/Rating';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getReviews, createReview, mediaUrl } from '@/lib/api';
import { cn } from '@/lib/format';

const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

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
            size={24}
            strokeWidth={2}
            className={i <= (hover || value) ? 'text-[#f5a623]' : 'text-line'}
            style={i <= (hover || value) ? { fill: '#f5a623' } : undefined}
          />
        </button>
      ))}
    </span>
  );
}

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit your review.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border-t border-line bg-surface-soft">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Reviews list */}
          <div>
            <div className="mb-6 flex items-center gap-4">
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

            {loading ? (
              <div className="flex justify-center py-10"><Spinner size={26} /></div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-body">No reviews yet. Be the first to review this product!</p>
            ) : (
              <ul className="space-y-5">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                          {String(r.reviewerName || 'A').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink">{r.reviewerName || 'Anonymous'}</p>
                          <p className="text-xs text-muted">{fmtDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <Rating value={r.rating} />
                    </div>
                    {r.review && <p className="mt-3 text-sm text-body">{r.review}</p>}
                    {Array.isArray(r.ReviewImages) && r.ReviewImages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.ReviewImages.map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={img.id}
                            src={mediaUrl(`/uploads/reviews/${img.fileName}`)}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Write a review */}
          <div>
            <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-lg font-bold text-ink">Write a review</h3>
              <div className="mt-4 space-y-4">
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
                <Button type="submit" fullWidth disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit review'}
                </Button>
                <p className="text-center text-xs text-muted">Reviews are published after approval.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
