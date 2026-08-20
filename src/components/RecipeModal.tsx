import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Users, 
  DollarSign, 
  Utensils, 
  CheckCircle, 
  Sparkles, 
  HeartHandshake, 
  PackageCheck, 
  Tag, 
  Drumstick, 
  Leaf, 
  Wheat, 
  Plus, 
  Minus, 
  CookingPot, 
  Calendar, 
  Sun, 
  Flame, 
  Check,
  Package,
  Star,
  Info
} from 'lucide-react';
import { MealRecipe, FamilySettings } from '../types';
import { StarRating } from './StarRating';
import { scaleQuantityString, computeEffectiveServings } from '../utils/rankingAndScaling';

interface RecipeModalProps {
  meal: MealRecipe | null;
  familySettings?: FamilySettings;
  onClose: () => void;
  onSwapRequest: (meal: MealRecipe) => void;
  onRateRecipe?: (meal: MealRecipe, rating: number) => void;
  onToggleCookForLeftovers?: (mealId: string) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  meal,
  familySettings,
  onClose,
  onSwapRequest,
  onRateRecipe,
  onToggleCookForLeftovers,
}) => {
  if (!meal) return null;

  const defaultServings = computeEffectiveServings(familySettings, meal.cookForLeftovers);
  const [servingMultiplier, setServingMultiplier] = useState<number>(defaultServings);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const scaleRatio = servingMultiplier / meal.servings;
  const scaledTotalCost = meal.estimatedCostTotal * scaleRatio;
  const scaledCostPerServing = meal.costPerServing;

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const freshIngredients = meal.ingredients.filter((i) => !i.isPantryStaple);
  const pantryIngredients = meal.ingredients.filter((i) => i.isPantryStaple);

  const rating = meal.userRating ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 animate-fadeIn">
      <div className="bg-stone-900 text-stone-100 w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-stone-950 text-stone-100 p-4 sm:p-6 flex items-start justify-between gap-4 sticky top-0 z-10 border-b border-stone-800">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-800">
                {meal.dayOfWeek} Dinner
              </span>
              <span className="text-xs text-stone-300 font-normal">
                {meal.theme}
              </span>
              {meal.isOnePotOrPan && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange-950 text-orange-300 text-xs font-medium uppercase tracking-wider flex items-center gap-1 border border-orange-800">
                  <CookingPot className="w-3.5 h-3.5 text-orange-400" />
                  {meal.vesselUsed || 'One-Pot / Sheet-Pan'}
                </span>
              )}
              {meal.seasonalNote && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-medium flex items-center gap-1 border border-emerald-800">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  {meal.seasonalNote}
                </span>
              )}
              {meal.cookForLeftovers && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-800">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  Cook for Leftovers Active
                </span>
              )}
            </div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold leading-snug tracking-tight text-stone-100">
              {meal.title}
            </h2>
          </div>

          <button
            id="btn-close-recipe-modal"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer border border-stone-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Recipe Rating & AI Intelligence Banner */}
          <div className="bg-stone-850 p-3.5 sm:p-4 rounded-xl border border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Family Rating (0 - 5 Stars)</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {rating === 0 && 'Unrated. Rate this recipe to teach the AI planner your family taste.'}
                {rating === 1 && '🚫 0-1 Stars: Meal will be blacklisted and never suggested again.'}
                {(rating === 2 || rating === 3) && '👍 2-3 Stars: Standard meal rotation.'}
                {(rating === 4 || rating === 5) && '🌟 4-5 Stars: Family Staple! Prioritized in future plans and similar recipes.'}
              </p>
            </div>

            {onRateRecipe && (
              <StarRating
                rating={rating}
                onRate={(newRating) => onRateRecipe(meal, newRating)}
                size="md"
                showBadge={true}
              />
            )}
          </div>

          {/* Quick Stat Bar & Servings Adjuster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-stone-850 p-3.5 sm:p-4 rounded-xl border border-stone-750">
            {/* Servings Adjuster */}
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Portions</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setServingMultiplier((prev) => Math.max(1, prev - 1))}
                  className="p-1 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700 text-stone-200 cursor-pointer shadow-xs active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-stone-100 text-xs sm:text-sm">{servingMultiplier} portions</span>
                <button
                  onClick={() => setServingMultiplier((prev) => Math.min(12, prev + 1))}
                  className="p-1 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700 text-stone-200 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Time */}
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Cook Time</p>
              <p className="font-medium text-stone-200 text-xs sm:text-sm mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {meal.prepTimeMinutes}m prep + {meal.cookTimeMinutes}m cook
              </p>
            </div>

            {/* Total Cost */}
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Estimated Cost</p>
              <p className="font-serif font-bold text-amber-400 text-sm sm:text-base mt-0.5">
                ${scaledTotalCost.toFixed(2)} CAD
              </p>
            </div>

            {/* Per Portion Cost */}
            <div>
              <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Per Portion</p>
              <p className="font-serif font-bold text-stone-200 text-sm sm:text-base mt-0.5">
                ${scaledCostPerServing.toFixed(2)} / serving
              </p>
            </div>
          </div>

          {/* Leftovers Checkbox Option */}
          {onToggleCookForLeftovers && (
            <label 
              htmlFor="modal-leftover-toggle"
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                meal.cookForLeftovers 
                  ? 'bg-amber-950/70 border-amber-700 ring-1 ring-amber-600/40' 
                  : 'bg-stone-850 hover:bg-stone-800 border-stone-750'
              }`}
            >
              <input
                type="checkbox"
                id="modal-leftover-toggle"
                checked={Boolean(meal.cookForLeftovers)}
                onChange={() => {
                  onToggleCookForLeftovers(meal.id);
                  setServingMultiplier(computeEffectiveServings(familySettings, !meal.cookForLeftovers));
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-stone-700 bg-stone-900 mt-0.5 cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cook Extra for Leftovers (+Next-Day Lunches)</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700">
                    {meal.cookForLeftovers ? 'Scaling Active (+50% in Grocery List)' : 'Normal Portions'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                  When checked, this meal is scaled up to produce next-day adult lunches. Ingredients and quantities on your Waterloo grocery shopping list will be automatically adjusted.
                </p>
              </div>
            </label>
          )}

          {/* The 3-Pillar Nutrition Balance Breakdown */}
          <div className="bg-stone-850 p-4 sm:p-5 rounded-xl border border-stone-750 space-y-3">
            <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wide flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              Nutritional Formula (1 Protein + 1-2 Veggies + 1 Starch/Grain)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Protein */}
              <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-750 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  <Drumstick className="w-3.5 h-3.5" />
                  <span>Protein</span>
                </div>
                <p className="text-xs text-stone-100 font-medium mt-1">
                  {meal.components.protein.name}
                </p>
                {meal.components.protein.dealSource && (
                  <p className="text-[10px] text-emerald-300 font-medium mt-0.5">
                    🏷️ {meal.components.protein.dealSource}
                  </p>
                )}
              </div>

              {/* Vegetables */}
              <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-750 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>1-2 Vegetables</span>
                </div>
                <p className="text-xs text-stone-100 font-medium mt-1">
                  {meal.components.vegetables.map((v) => v.name).join(' & ')}
                </p>
              </div>

              {/* Starch/Grain */}
              <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-750 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Starch / Grain</span>
                </div>
                <p className="text-xs text-stone-100 font-medium mt-1">
                  {meal.components.starchOrGrain.name}
                </p>
              </div>
            </div>
          </div>

          {/* Flyer Deals Leveraged */}
          {meal.dealsUsed && meal.dealsUsed.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-stone-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Waterloo Deals Used:
              </span>
              {meal.dealsUsed.map((deal, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium text-[11px]"
                >
                  {deal}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients Breakdown: Fresh Store Items vs Pantry On-Hand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Fresh Store Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-stone-200 text-sm flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>Store Items to Buy ({servingMultiplier} portions)</span>
                </h4>
                <span className="text-[11px] text-stone-400 font-normal">
                  {freshIngredients.length} items
                </span>
              </div>

              <div className="bg-stone-850 rounded-xl border border-stone-750 divide-y divide-stone-800 overflow-hidden">
                {freshIngredients.map((item, idx) => (
                  <div key={idx} className="p-2.5 px-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-medium text-stone-100">{item.name}</span>
                      <div className="text-[11px] text-stone-400 font-normal">
                        {scaleQuantityString(item.amount, scaleRatio)} {item.store && `• at ${item.store}`}
                      </div>
                    </div>
                    {item.estimatedPrice && (
                      <span className="font-semibold text-stone-100 bg-stone-800 px-2 py-0.5 rounded-md border border-stone-700 text-[11px]">
                        ${(item.estimatedPrice * scaleRatio).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pantry Staples (On Hand) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-stone-200 text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Pantry Staples (On hand)</span>
                </h4>
                <span className="text-[11px] text-stone-400 font-normal">
                  {pantryIngredients.length} items
                </span>
              </div>

              <div className="bg-stone-850 rounded-xl border border-stone-750 divide-y divide-stone-800 overflow-hidden">
                {pantryIngredients.map((item, idx) => (
                  <div key={idx} className="p-2.5 px-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-stone-200 font-medium">{item.name}</span>
                    <span className="text-[11px] text-stone-400 italic">
                      {scaleQuantityString(item.amount, scaleRatio)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-200 text-sm flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Instructions</span>
            </h4>

            <div className="space-y-2">
              {meal.instructions.map((step, index) => {
                const isDone = completedSteps[index];
                return (
                  <div
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs sm:text-sm ${
                      isDone
                        ? 'bg-stone-950/70 opacity-50 text-stone-400 line-through border-stone-800'
                        : 'bg-stone-850 text-stone-200 border-stone-750 shadow-sm hover:border-stone-650'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-300 border border-stone-700'
                      }`}
                    >
                      {isDone ? '✓' : index + 1}
                    </div>
                    <p className="flex-1 leading-relaxed font-normal">{step}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Family & Toddler Tips and Make-Ahead Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {meal.kidFriendlyTip && (
              <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-900/60 text-xs text-stone-300 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                  <span>Young Family & Toddler Tip</span>
                </div>
                <p className="leading-relaxed font-normal text-stone-300">{meal.kidFriendlyTip}</p>
              </div>
            )}

            {meal.makeAheadTip && (
              <div className="bg-teal-950/40 p-4 rounded-xl border border-teal-900/60 text-xs text-stone-300 space-y-1">
                <div className="font-semibold text-teal-300 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Make-Ahead & Leftovers</span>
                </div>
                <p className="leading-relaxed font-normal text-stone-300">{meal.makeAheadTip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-950 border-t border-stone-800 p-4 px-6 flex items-center justify-between gap-3">
          <button
            id="btn-modal-swap-meal"
            onClick={() => {
              onClose();
              onSwapRequest(meal);
            }}
            className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer active:scale-95"
          >
            Swap This Recipe
          </button>

          <button
            id="btn-modal-done"
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};


