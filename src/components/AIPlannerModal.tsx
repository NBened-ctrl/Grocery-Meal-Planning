import React, { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, CheckCircle2, DollarSign, Clock, Store, CookingPot, Calendar, Sun, CloudSun, Leaf, Snowflake, Check, Star } from 'lucide-react';
import { FamilySettings, FlyerDeal, MealRecipe } from '../types';
import { MONTHS_LIST, ONTARIO_SEASONAL_METADATA, getSeasonalInfo } from '../data/seasonalData';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  familySettings: FamilySettings;
  currentDeals: FlyerDeal[];
  onApplyGeneratedPlan: (newMeals: MealRecipe[], summary: string, estCost: number) => void;
}

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  familySettings,
  currentDeals,
  onApplyGeneratedPlan,
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(familySettings.selectedMonth || 'August');
  const [preferOnePot, setPreferOnePot] = useState<boolean>(Boolean(familySettings.preferOnePotPan));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const seasonalInfo = getSeasonalInfo(selectedMonth);

  const samplePresets = [
    '🥘 100% Sheet Pan & One-Pot Dinners for minimal weekday cleanup',
    '🌽 Ontario Harvest: Fresh sweet corn, field tomatoes & BBQ drumsticks',
    '🍗 Cheap chicken drumstick & lean ground beef deals (keep under $85 CAD)',
    '⚡ Ultra fast 20-minute weeknight dinners (minimal chopping for toddlers)',
    '🏪 1-Stop Food Basics run optimized for maximum flyer savings',
    '🍂 Cozy comfort dinner warmers with roasted root vegetables & potatoes',
  ];

  const handleGenerate = async (customText?: string) => {
    const textToUse = customText || prompt;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familySettings: {
            ...familySettings,
            selectedMonth,
            preferOnePotPan: preferOnePot,
          },
          currentDeals,
          customPrompt: textToUse,
          selectedMonth,
          seasonalVibe: seasonalInfo.vibeTitle,
          preferOnePotPan: preferOnePot,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.warn('Non-JSON response from /api/generate-plan:', text.slice(0, 100));
      }

      if (data && data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
        onApplyGeneratedPlan(
          data.meals, 
          data.weeklySummary || `Optimized 7-Day Waterloo Dinner Plan for ${selectedMonth}`, 
          data.estimatedWeeklyCostCAD || 85.0
        );
        onClose();
      } else if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to generate meal plan from server');
      } else {
        throw new Error('Could not parse meal plan structure.');
      }
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setErrorMsg(err.message || 'Error communicating with AI service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-stone-800 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Gemini 3.7 Flash
              </span>
              <span className="text-xs text-stone-300 font-normal">
                Waterloo Flyer Optimizer
              </span>
              <span className="text-xs text-emerald-300 font-medium bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                {selectedMonth} ({seasonalInfo.season})
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Weekly Dinner & Grocery Planner
            </h2>
            <p className="text-xs text-stone-300 font-normal max-w-lg">
              Optimizes Sobeys, Food Basics, Zehrs & Superstore Waterloo deals for your family with balanced nutrition and seasonal recipes.
            </p>
          </div>

          <button
            id="btn-close-ai-modal"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer border border-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 text-xs font-medium">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {/* Month & One-Pot Interactive Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Month & Season Selector */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                Seasonal Month
              </label>
              <select
                value={selectedMonth}
                disabled={isLoading}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 bg-white text-xs font-medium border border-stone-300 rounded-lg text-stone-800 focus:outline-hidden focus:border-stone-500"
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m} ({ONTARIO_SEASONAL_METADATA[m]?.season} - {ONTARIO_SEASONAL_METADATA[m]?.vibeTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* One-Pot Preference Toggle */}
            <div
              onClick={() => !isLoading && setPreferOnePot(!preferOnePot)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                preferOnePot ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                  <CookingPot className="w-4 h-4 text-orange-600" />
                  <span>One-Pot / Sheet-Pan Only</span>
                </div>
                <p className="text-[11px] text-stone-500 font-normal">
                  {preferOnePot ? 'Dishes minimized (1 vessel)' : 'Standard mix of pans'}
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center font-semibold text-[10px] border shrink-0 ${
                  preferOnePot ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-stone-300 text-transparent'
                }`}
              >
                ✓
              </div>
            </div>
          </div>

          {/* Prompt Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-800 uppercase tracking-wide">
              Quick One-Click Inspirations
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setPrompt(preset);
                    handleGenerate(preset);
                  }}
                  className="text-left p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 text-xs text-stone-800 font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-800 uppercase tracking-wide">
              Or Customize with Your Own Instructions
            </label>
            <textarea
              rows={2}
              disabled={isLoading}
              placeholder="e.g., We want 3 sheet-pan dinners for low clean up, my toddler loves crispy potatoes, and optimize chicken thigh sales at Food Basics on University..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl font-normal text-stone-800 focus:outline-hidden focus:bg-white focus:border-stone-400 disabled:opacity-50"
            />
          </div>

          {/* Active Family Constraints Summary */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 font-normal space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <strong className="font-semibold text-stone-900">Family:</strong> {familySettings.adultsCount} Adults + {familySettings.kidsCount} Kids
              </span>
              <span className="text-stone-300">•</span>
              <span>
                <strong className="font-semibold text-stone-900">Store Mode:</strong> {familySettings.primaryStore}
              </span>
              <span className="text-stone-300">•</span>
              <span>
                <strong className="font-semibold text-stone-900">Max Cook Time:</strong> {familySettings.maxCookTimeMinutes}m
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-800 font-medium">
                1 Protein + 1-2 Veggies + 1 Starch
              </span>
            </div>

            {familySettings.recipeRatings && familySettings.recipeRatings.length > 0 && (
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Recipe Ratings Memory:
                </span>
                <span className="text-stone-600">
                  {familySettings.recipeRatings.filter(r => r.rating >= 4).length} Staples prioritized • {familySettings.recipeRatings.filter(r => r.rating <= 1).length} Excluded (0-1★)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-submit-ai-generate"
            type="button"
            disabled={isLoading}
            onClick={() => handleGenerate()}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Optimizing Deals, Season & Recipes...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>Generate Weekly Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

