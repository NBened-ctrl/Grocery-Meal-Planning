import React, { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  Utensils, 
  Sparkles, 
  RotateCw, 
  ChefHat, 
  HeartHandshake, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  Wheat, 
  Leaf, 
  Drumstick, 
  ShoppingBag, 
  CookingPot, 
  Sun, 
  CloudSun, 
  Snowflake, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ChevronsDown, 
  ChevronsUp, 
  Sparkle,
  Star,
  Users,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Ban,
  Package
} from 'lucide-react';
import { MealRecipe, KWStore, FamilySettings, RecipeRating } from '../types';
import { getSeasonalInfo } from '../data/seasonalData';
import { StarRating } from './StarRating';
import { computeEffectiveServings } from '../utils/rankingAndScaling';

interface MealPlanViewProps {
  meals: MealRecipe[];
  familySettings: FamilySettings;
  onSelectMeal: (meal: MealRecipe) => void;
  onSwapMeal: (meal: MealRecipe) => void;
  onRegenerateDay: (meal: MealRecipe) => void;
  onToggleLeftoverDay: (dayId: string) => void;
  openAIModal: () => void;
  onGoToGroceryList: () => void;
  onUpdateMonth?: (month: string) => void;
  onRateRecipe: (meal: MealRecipe, rating: number) => void;
  onToggleCookForLeftovers: (mealId: string) => void;
  onUpdateFamilyMembers?: (adults: number, kids: number) => void;
}

export const MealPlanView: React.FC<MealPlanViewProps> = ({
  meals,
  familySettings,
  onSelectMeal,
  onSwapMeal,
  onRegenerateDay,
  onToggleLeftoverDay,
  openAIModal,
  onGoToGroceryList,
  onRateRecipe,
  onToggleCookForLeftovers,
  onUpdateFamilyMembers,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyOnePot, setOnlyOnePot] = useState<boolean>(Boolean(familySettings.preferOnePotPan));
  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState<boolean>(false);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  const toggleCardCollapse = (mealId: string) => {
    setCollapsedCards((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };

  const expandAllCards = () => {
    setCollapsedCards({});
  };

  const collapseAllCards = () => {
    const newCollapsed: Record<string, boolean> = {};
    meals.forEach((m) => (newCollapsed[m.id] = true));
    setCollapsedCards(newCollapsed);
  };

  const currentMonth = familySettings.selectedMonth || 'August';
  const seasonalInfo = getSeasonalInfo(currentMonth);

  const adults = familySettings.adultsCount || 2;
  const kids = familySettings.kidsCount || 2;
  const totalPeople = adults + kids;

  const handleUpdateAdults = (delta: number) => {
    if (!onUpdateFamilyMembers) return;
    const next = Math.max(1, Math.min(8, adults + delta));
    onUpdateFamilyMembers(next, kids);
  };

  const handleUpdateKids = (delta: number) => {
    if (!onUpdateFamilyMembers) return;
    const next = Math.max(0, Math.min(8, kids + delta));
    onUpdateFamilyMembers(adults, next);
  };

  const totalCost = meals.reduce((sum, m) => {
    if (m.isLeftoverOrCustom) return sum;
    const multiplier = m.cookForLeftovers ? 1.5 : 1;
    return sum + (m.estimatedCostTotal * multiplier);
  }, 0);

  const totalMealsCount = meals.filter(m => !m.isLeftoverOrCustom).length || 1;
  const avgCostPerPerson = totalCost / (totalMealsCount * totalPeople);

  const filteredMeals = meals.filter((meal) => {
    if (onlyOnePot) {
      if (!meal.isOnePotOrPan && meal.cookingStyle === 'standard') return false;
    }

    const rating = meal.userRating ?? 0;

    if (selectedFilter === '🥘 One-Pot / Pan') {
      if (!meal.isOnePotOrPan) return false;
    } else if (selectedFilter === '🌟 Staples (4-5★)') {
      if (rating < 4) return false;
    } else if (selectedFilter === '🍱 Leftover Mode') {
      if (!meal.cookForLeftovers) return false;
    } else if (selectedFilter === 'Quick (<25m)') {
      if ((meal.prepTimeMinutes + meal.cookTimeMinutes) > 25) return false;
    } else if (selectedFilter === 'Chicken & Poultry') {
      if (!meal.components.protein.name.toLowerCase().includes('chicken') && !meal.components.protein.name.toLowerCase().includes('turkey')) return false;
    } else if (selectedFilter === 'Beef & Pork') {
      if (!meal.components.protein.name.toLowerCase().includes('beef') && !meal.components.protein.name.toLowerCase().includes('pork') && !meal.components.protein.name.toLowerCase().includes('steak')) return false;
    } else if (selectedFilter === 'Seafood') {
      if (!meal.components.protein.name.toLowerCase().includes('salmon') && !meal.components.protein.name.toLowerCase().includes('fish') && !meal.components.protein.name.toLowerCase().includes('shrimp') && !meal.components.protein.name.toLowerCase().includes('cod')) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        meal.title.toLowerCase().includes(q) ||
        meal.dayOfWeek.toLowerCase().includes(q) ||
        meal.theme.toLowerCase().includes(q) ||
        (meal.seasonalNote && meal.seasonalNote.toLowerCase().includes(q)) ||
        (meal.vesselUsed && meal.vesselUsed.toLowerCase().includes(q)) ||
        meal.components.protein.name.toLowerCase().includes(q) ||
        meal.components.vegetables.some(v => v.name.toLowerCase().includes(q)) ||
        meal.components.starchOrGrain.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCookingStyleBadge = (style?: string, vessel?: string) => {
    switch (style) {
      case 'sheet_pan':
        return {
          label: 'Sheet-Pan',
          vessel: vessel || '1 Rimmed Baking Sheet',
          bg: 'bg-amber-50 text-amber-900 border-amber-200/70',
        };
      case 'one_pot':
        return {
          label: 'One-Pot',
          vessel: vessel || '1 Large Dutch Oven',
          bg: 'bg-orange-50 text-orange-900 border-orange-200/70',
        };
      case 'skillet':
        return {
          label: 'One Skillet',
          vessel: vessel || '1 Cast-Iron Skillet',
          bg: 'bg-rose-50 text-rose-900 border-rose-200/70',
        };
      case 'slow_cooker':
        return {
          label: 'Slow-Cooker',
          vessel: vessel || '1 Slow Cooker Crock',
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200/70',
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Card (Collapsible) */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden transition-all text-stone-100">
        {/* Header bar of Overview */}
        <div className="p-3.5 sm:p-5 bg-stone-950/80 border-b border-stone-800 text-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="font-serif text-sm sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <span>7-Day Waterloo Family Dinner Menu</span>
              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 bg-stone-800 text-amber-300 rounded-md border border-stone-700 hidden sm:inline">
                {currentMonth} Cycle
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOverviewCollapsed(!isOverviewCollapsed)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold border border-stone-750 cursor-pointer transition-colors"
            >
              {isOverviewCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  <span>Plan Details</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Overview Content */}
        {!isOverviewCollapsed ? (
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 animate-fadeIn">
            {/* Left Column: Weekly Strategy Overview */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-stone-800 text-stone-200 border border-stone-700 rounded-lg">
                    {currentMonth} Seasonal Harvest
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-lg">
                    Nutritional 3-Pillar Balanced
                  </span>
                </div>

                <p className="text-stone-300 text-xs sm:text-sm font-normal leading-relaxed">
                  Tailored for a <strong className="text-stone-100 font-semibold">Young Family of {totalPeople}</strong> with <strong className="text-stone-100 font-semibold">1 Protein + 1-2 Veggies + 1 Starch/Grain</strong> per evening. 
                  Leverages weekly loss-leaders across Waterloo banners (Food Basics Erb St, Superstore Boardwalk, Zehrs Conestoga, and Sobeys Columbia).
                </p>

                {/* Seasonal Highlights Strip */}
                <div className="p-3.5 bg-stone-850 rounded-xl border border-stone-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-stone-200">🌿 In-Season Harvest:</span>
                    <span className="text-stone-300">
                      {seasonalInfo.keySeasonalProduce.slice(0, 4).join(', ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-semibold bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800 self-start sm:self-auto">
                    {seasonalInfo.vibeTitle}
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons Bar */}
              <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-stone-400">Shopping Mode:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-200 font-semibold text-xs border border-stone-700">
                    {familySettings.primaryStore}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    id="btn-plan-view-grocery"
                    onClick={onGoToGroceryList}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-white rounded-xl text-xs font-semibold border border-stone-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    <span>Shopping List</span>
                  </button>
                  <button
                    id="btn-plan-ai-regenerate"
                    onClick={openAIModal}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Re-Optimize</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Financial & Family Sizer Stats */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3.5">
              {/* Financial Box */}
              <div className="flex-1 bg-stone-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between border border-stone-800 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Estimated 7-Dinner Grocery Cost
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-850 text-emerald-300 font-semibold text-xs border border-stone-750">
                    CAD Total
                  </span>
                </div>
                <div className="my-2.5">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-400 tracking-tight">
                    ${totalCost.toFixed(2)}
                  </span>
                  <p className="text-xs text-stone-400 font-normal mt-0.5">
                    ${avgCostPerPerson.toFixed(2)} per person / serving
                  </p>
                </div>
                <div className="pt-2.5 border-t border-stone-850 flex items-center justify-between text-xs font-medium text-stone-400">
                  <span>{totalMealsCount * totalPeople} dinner portions</span>
                  <span className="text-emerald-400 font-semibold">Save ~$48.20 vs retail</span>
                </div>
              </div>

              {/* Family Members Sizer Box */}
              <div className="bg-stone-850 rounded-2xl border border-stone-800 p-3.5 text-stone-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-stone-200">Family Members</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800">
                    {totalPeople} People Total
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Adults */}
                  <div className="p-2 bg-stone-900 rounded-xl border border-stone-750 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-200 block">Adults</span>
                      <span className="text-[10px] text-stone-400">Regular</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateAdults(-1)}
                        className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold cursor-pointer border border-stone-700 active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-stone-100 w-3 text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateAdults(1)}
                        className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold cursor-pointer border border-stone-700 active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Kids */}
                  <div className="p-2 bg-stone-900 rounded-xl border border-stone-750 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-200 block">Kids</span>
                      <span className="text-[10px] text-stone-400">Toddlers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateKids(-1)}
                        className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold cursor-pointer border border-stone-700 active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-stone-100 w-3 text-center">{kids}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateKids(1)}
                        className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold cursor-pointer border border-stone-700 active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* One-Pot Quick Switch Box */}
              <div className="bg-stone-850 rounded-2xl border border-stone-800 p-3.5 text-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/80 flex items-center justify-center font-semibold shrink-0">
                    <CookingPot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-200">
                      One-Pot & Sheet-Pan Filter
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {onlyOnePot ? 'Showing 1-vessel dinners only' : 'Showing all cooking vessels'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOnlyOnePot(!onlyOnePot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    onlyOnePot
                      ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                  }`}
                >
                  {onlyOnePot ? 'Active ✓' : 'Filter'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Summary */
          <div className="p-3.5 px-4 sm:px-6 bg-stone-900 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
            <div className="flex items-center gap-3">
              <span className="font-medium text-stone-300">
                7 Meals for Family of {totalPeople}
              </span>
              <span className="text-stone-600">•</span>
              <span className="font-semibold text-emerald-400 text-sm">
                Total: ${totalCost.toFixed(2)} CAD (${avgCostPerPerson.toFixed(2)} / serving)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToGroceryList}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-white text-xs font-semibold rounded-lg border border-stone-700 cursor-pointer"
              >
                Shopping List
              </button>
              <button
                onClick={openAIModal}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                AI Re-Optimize
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter, Search & Compact Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800 shadow-md">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-meals"
            type="text"
            placeholder="Search ingredients, recipes, produce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-stone-850 border border-stone-750 text-stone-100 placeholder-stone-400 rounded-xl font-normal focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Pills & Expand/Collapse All Cards */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 max-w-full">
            {['All', '🥘 One-Pot / Pan', '🌟 Staples (4-5★)', '🍱 Leftover Mode', 'Quick (<25m)', 'Chicken & Poultry', 'Beef & Pork', 'Seafood'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
                  selectedFilter === filter
                    ? 'bg-stone-100 text-stone-900 border-stone-100 shadow-sm font-bold'
                    : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border-stone-750'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0 border-l border-stone-800 pl-2">
            <button
              type="button"
              onClick={expandAllCards}
              title="Expand all cards"
              className="p-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-semibold border border-stone-750 cursor-pointer"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={collapseAllCards}
              title="Compact all cards"
              className="p-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-semibold border border-stone-750 cursor-pointer"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Dinner Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMeals.map((meal) => {
          const isLeftover = meal.isLeftoverOrCustom;
          const styleBadge = getCookingStyleBadge(meal.cookingStyle, meal.vesselUsed);
          const isCardCollapsed = Boolean(collapsedCards[meal.id]);
          const effectiveServings = computeEffectiveServings(familySettings, meal.cookForLeftovers);
          const costMultiplier = meal.cookForLeftovers ? 1.5 : 1;
          const currentTotalCost = meal.estimatedCostTotal * costMultiplier;
          const currentCostPerServing = currentTotalCost / effectiveServings;

          return (
            <div
              key={meal.id}
              className={`bg-stone-900 rounded-2xl border shadow-md flex flex-col justify-between overflow-hidden hover:border-stone-700 transition-all duration-200 text-stone-100 ${
                meal.userRating && meal.userRating <= 1
                  ? 'border-rose-900/80 bg-stone-900/90'
                  : meal.userRating && meal.userRating >= 4
                  ? 'border-emerald-700/80 ring-1 ring-emerald-500/30'
                  : 'border-stone-800'
              } ${isLeftover ? 'opacity-85' : ''}`}
            >
              {/* Card Header & Content */}
              <div className="p-4 sm:p-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-900">
                      {meal.dayOfWeek}
                    </span>
                    {styleBadge && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border bg-amber-950/80 text-amber-300 border-amber-800/80">
                        {styleBadge.label}
                      </span>
                    )}
                    {meal.cookForLeftovers && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                        🍱 Leftovers Batch
                      </span>
                    )}
                  </div>

                  {/* Price Tag & Card Collapse Toggle */}
                  <div className="flex items-center gap-2">
                    {!isLeftover && (
                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-bold text-amber-400">
                          ${currentTotalCost.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">
                          ${currentCostPerServing.toFixed(2)} / serving
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleCardCollapse(meal.id)}
                      title={isCardCollapsed ? "Expand card details" : "Collapse card details"}
                      className="p-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 cursor-pointer border border-stone-750"
                    >
                      {isCardCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectMeal(meal)}
                  className="font-serif text-base sm:text-lg font-bold text-stone-100 leading-snug hover:text-emerald-400 cursor-pointer line-clamp-2 mt-1"
                >
                  {meal.title}
                </h3>

                {/* Time, Servings & Vessel */}
                <div className="flex items-center gap-2 text-xs font-normal text-stone-400 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{meal.prepTimeMinutes + meal.cookTimeMinutes} mins total</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-stone-400" />
                    <span className={meal.cookForLeftovers ? 'font-semibold text-amber-300' : ''}>
                      {effectiveServings} portions {meal.cookForLeftovers ? '(with lunch)' : ''}
                    </span>
                  </div>
                  {meal.vesselUsed && (
                    <>
                      <span>•</span>
                      <span className="text-stone-300 font-medium text-[11px] truncate max-w-[130px]" title={meal.vesselUsed}>
                        🥘 {meal.vesselUsed}
                      </span>
                    </>
                  )}
                </div>

                {/* Star Rating Section on Card */}
                {!isLeftover && (
                  <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-stone-400">Rate Meal:</span>
                    <StarRating
                      rating={meal.userRating ?? 0}
                      onRate={(rating) => onRateRecipe(meal, rating)}
                      size="sm"
                      showBadge={true}
                    />
                  </div>
                )}

                {/* Seasonal Note Pill */}
                {meal.seasonalNote && (
                  <div className="mt-2 text-[11px] font-medium text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800/80 line-clamp-1">
                    🌱 {meal.seasonalNote}
                  </div>
                )}

                {/* Cook for Leftovers Checkbox */}
                {!isLeftover && (
                  <label 
                    htmlFor={`checkbox-leftovers-${meal.id}`}
                    className={`flex items-start gap-2.5 mt-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      meal.cookForLeftovers 
                        ? 'bg-amber-950/70 border-amber-700 ring-1 ring-amber-600/40' 
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-750'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`checkbox-leftovers-${meal.id}`}
                      checked={Boolean(meal.cookForLeftovers)}
                      onChange={() => onToggleCookForLeftovers(meal.id)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-stone-700 bg-stone-900 mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-xs font-semibold text-stone-200 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Cook for Leftovers</span>
                        </span>
                        {meal.cookForLeftovers ? (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-900/80 px-1.5 py-0.2 rounded border border-amber-700">
                            🍱 +{Math.max(1, Math.round(totalPeople * 0.5))} Lunch Portions
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">
                            Batch for lunch
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                        {meal.cookForLeftovers
                          ? 'Scaled +50% ingredients for extra lunch portions (reflected in grocery list & costs).'
                          : 'Increases batch size for leftover lunches; adjusts ingredient shopping quantities.'}
                      </p>
                    </div>
                  </label>
                )}

                {/* The 3 Nutritional Pillars Box (Collapsible) */}
                {!isLeftover && !isCardCollapsed && (
                  <div className="mt-3 p-3 rounded-xl bg-stone-850 border border-stone-750 space-y-2 text-xs animate-fadeIn">
                    {/* Protein */}
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800 mt-0.5 shrink-0">
                        <Drumstick className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-stone-200">Protein: </span>
                        <span className="text-stone-300 font-normal">{meal.components.protein.name}</span>
                        {meal.components.protein.onSaleStore && (
                          <span className="ml-1.5 inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                            {meal.components.protein.onSaleStore} Deal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vegetables */}
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 mt-0.5 shrink-0">
                        <Leaf className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-stone-200">Veggies: </span>
                        <span className="text-stone-300 font-normal">
                          {meal.components.vegetables.map((v) => v.name).join(' & ')}
                        </span>
                      </div>
                    </div>

                    {/* Starch / Grain */}
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800 mt-0.5 shrink-0">
                        <Wheat className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-stone-200">Starch/Grain: </span>
                        <span className="text-stone-300 font-normal">{meal.components.starchOrGrain.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kid Friendly Tip preview */}
                {meal.kidFriendlyTip && !isLeftover && !isCardCollapsed && (
                  <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-stone-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-900/60 animate-fadeIn">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      <strong className="text-stone-200 font-semibold">Toddler Tip:</strong> {meal.kidFriendlyTip}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 px-4 sm:px-5 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  id={`btn-view-recipe-${meal.id}`}
                  onClick={() => onSelectMeal(meal)}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-white rounded-xl text-xs font-semibold border border-stone-700 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <ChefHat className="w-3.5 h-3.5 text-amber-300" />
                  <span>Recipe Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-swap-meal-${meal.id}`}
                    onClick={() => onSwapMeal(meal)}
                    title="Swap this recipe"
                    className="px-3 py-2 text-stone-300 bg-stone-850 hover:bg-stone-800 rounded-xl border border-stone-750 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                    <span>Swap</span>
                  </button>

                  <button
                    id={`btn-regenerate-day-${meal.id}`}
                    onClick={() => onRegenerateDay(meal)}
                    title="AI Regenerate Day with Waterloo Flyer Deals"
                    className="p-2 text-amber-300 bg-amber-950/80 hover:bg-amber-900 rounded-xl border border-amber-800 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

