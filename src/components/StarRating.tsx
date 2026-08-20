import React, { useState } from 'react';
import { Star, ShieldAlert, Sparkles, Ban, RotateCcw } from 'lucide-react';

interface StarRatingProps {
  rating?: number; // 0 to 5
  onRate: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRate,
  size = 'sm',
  showBadge = true,
  allowClear = true,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizeClass = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const activeVal = hoverRating !== null ? hoverRating : rating;

  const getRatingFeedback = (val: number) => {
    if (val === 0) return { label: 'Unrated', color: 'text-stone-400', badgeClass: 'bg-stone-800 text-stone-300' };
    if (val === 1) return { label: '1★ Disliked (Do Not Use Again)', color: 'text-rose-400', badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800' };
    if (val === 2) return { label: '2★ Below Average', color: 'text-amber-400', badgeClass: 'bg-stone-800 text-stone-300 border-stone-700' };
    if (val === 3) return { label: '3★ Good Solid Meal', color: 'text-amber-400', badgeClass: 'bg-stone-800 text-stone-300 border-stone-700' };
    if (val === 4) return { label: '4★ Family Favorite (Repeat)', color: 'text-amber-400', badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' };
    if (val === 5) return { label: '5★ Premier Staple (Frequent)', color: 'text-amber-400', badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800 font-bold' };
    return { label: '', color: 'text-stone-400', badgeClass: '' };
  };

  const feedback = getRatingFeedback(activeVal);

  const handleStarClick = (starIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (rating === starIndex && allowClear) {
      onRate(0); // Clicking same rating clears to 0
    } else {
      onRate(starIndex);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5" onMouseLeave={() => !disabled && setHoverRating(null)}>
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled = activeVal >= starIndex;
            const isExcluded = activeVal === 1 && isFilled;
            const isStaple = activeVal >= 4 && isFilled;

            return (
              <button
                key={starIndex}
                type="button"
                disabled={disabled}
                onClick={(e) => handleStarClick(starIndex, e)}
                onMouseEnter={() => !disabled && setHoverRating(starIndex)}
                title={`Rate ${starIndex} out of 5 stars`}
                className={`p-0.5 rounded transition-transform cursor-pointer hover:scale-115 focus:outline-hidden ${
                  disabled ? 'cursor-default opacity-90' : ''
                }`}
              >
                <Star
                  className={`${starSizeClass} transition-colors ${
                    isFilled
                      ? isExcluded
                        ? 'fill-rose-500 text-rose-500'
                        : isStaple
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-amber-400 text-amber-400'
                      : 'fill-stone-800 text-stone-700 hover:text-stone-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Clear rating button if rated */}
        {rating > 0 && allowClear && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRate(0);
            }}
            title="Reset rating to 0 (Unrated)"
            className="text-[10px] text-stone-400 hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dynamic Badge Feedback */}
      {showBadge && rating > 0 && (
        <div className="flex items-center gap-1">
          {rating <= 1 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800 animate-fadeIn">
              <Ban className="w-3 h-3 text-rose-400" />
              <span>Do Not Use Again</span>
            </span>
          ) : rating >= 4 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 animate-fadeIn">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Family Staple ({rating}★)</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-stone-800 text-stone-300 border border-stone-700">
              {rating}/5 Stars
            </span>
          )}
        </div>
      )}
    </div>
  );
};
