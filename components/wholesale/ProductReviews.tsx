import { Star } from "lucide-react";
import type { ProductReview } from "@/types/wholesale";

type ProductReviewsProps = {
  reviews?: ProductReview[];
  averageRating?: number;
  totalReviews?: number;
};

export default function ProductReviews({ reviews, averageRating, totalReviews }: ProductReviewsProps) {
  const hasReviews = reviews && reviews.length > 0;

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Customer Reviews</h2>
        {averageRating && totalReviews && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-5 ${star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-600">
              {averageRating.toFixed(1)} ({totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!hasReviews && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No reviews yet. Be the first to review this product.</p>
          <button className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700">
            Write a review
          </button>
        </div>
      )}

      {/* Reviews List */}
      {hasReviews && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                  {review.userAvatar ? (
                    <img src={review.userAvatar} alt={review.userName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-slate-600">{review.userName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{review.userName}</span>
                      {review.verified && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Verified</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">{review.date}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-slate-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}