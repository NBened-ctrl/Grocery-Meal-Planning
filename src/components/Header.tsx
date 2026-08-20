import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowLeftRight, 
  Tag, 
  CookingPot, 
  Sun, 
  CloudSun, 
  Leaf, 
  Snowflake,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  Users,
  Plus,
  Minus
} from 'lucide-react';
import { FlyerWeekInfo, KWStore, FamilySettings } from '../types';
import { getSeasonalInfo } from '../data/seasonalData';
import { WATERLOO_STORE_LOCATIONS } from '../data/flyersData';

interface HeaderProps {
  currentTab: 'meals' | 'grocery' | 'flyers' | 'stores' | 'preferences';
  setCurrentTab: (tab: 'meals' | 'grocery' | 'flyers' | 'stores' | 'preferences') => void;
  flyerWeek: FlyerWeekInfo;
  totalWeeklyCost: number;
  totalSavings: number;
  openAIModal: () => void;
  familySettings?: FamilySettings;
  onMonthChange?: (month: string) => void;
  onUpdateFamilyMembers?: (adults: number, kids: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  flyerWeek,
  totalWeeklyCost,
  totalSavings,
  openAIModal,
  familySettings,
  onUpdateFamilyMembers,
}) => {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(false);
  const [showLocationMenu, setShowLocationMenu] = useState<boolean>(false);
  const [showFamilyMenu, setShowFamilyMenu] = useState<boolean>(false);
  const currentMonth = familySettings?.selectedMonth || 'August';
  const seasonal = getSeasonalInfo(currentMonth);

  const adults = familySettings?.adultsCount ?? 2;
  const kids = familySettings?.kidsCount ?? 2;
  const totalPeople = adults + kids;

  const handleUpdateAdults = (delta: number) => {
    if (!onUpdateFamilyMembers) return;
    const newAdults = Math.max(1, Math.min(8, adults + delta));
    onUpdateFamilyMembers(newAdults, kids);
  };

  const handleUpdateKids = (delta: number) => {
    if (!onUpdateFamilyMembers) return;
    const newKids = Math.max(0, Math.min(8, kids + delta));
    onUpdateFamilyMembers(adults, newKids);
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'Spring': return <Leaf className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Summer': return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'Fall': return <CloudSun className="w-3.5 h-3.5 text-amber-600" />;
      case 'Winter': return <Snowflake className="w-3.5 h-3.5 text-sky-500" />;
      default: return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const navItems = [
    { id: 'meals' as const, label: 'Meal Plan', icon: Calendar, badge: '7 Dinners' },
    { id: 'grocery' as const, label: 'Grocery List', icon: ShoppingBag, badge: `$${totalWeeklyCost.toFixed(0)}` },
    { id: 'flyers' as const, label: 'Flyer Deals', icon: Tag, badge: 'Waterloo' },
    { id: 'stores' as const, label: 'Price Compare', icon: ArrowLeftRight, badge: `Save $${totalSavings.toFixed(0)}` },
    { id: 'preferences' as const, label: 'Pantry & Profile', icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-30 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-4 pb-2 sm:pb-3">
      {/* Editorial Navbar Container */}
      <div className={`bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-800/90 shadow-lg text-stone-100 transition-all duration-200 ${
        isHeaderCollapsed ? 'p-2 sm:p-3' : 'p-3.5 sm:p-5'
      }`}>
        {/* If Collapsed: Compact Single-Row View */}
        {isHeaderCollapsed ? (
          <div className="flex items-center justify-between gap-2.5 animate-fadeIn">
            {/* Left Mini Brand */}
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setCurrentTab('meals')}
                className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 cursor-pointer hover:bg-emerald-600 transition-colors"
                title="Waterloo Grocery Planner"
              >
                KW
              </div>
              <div className="hidden md:block">
                <span className="font-serif text-sm font-bold text-stone-100">
                  Waterloo Planner
                </span>
                <span className="text-[11px] text-stone-400 font-normal ml-2">
                  Waterloo, ON
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Compact) */}
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`tab-compact-${item.id}`}
                    onClick={() => setCurrentTab(item.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-stone-100 text-stone-900 shadow-xs font-bold'
                        : 'bg-stone-800/90 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span className="hidden sm:inline">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-stone-200 text-stone-900'
                            : 'bg-stone-700 text-stone-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Tools & Expand Header Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={openAIModal}
                title="AI Meal & Budget Optimizer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden lg:inline">AI Optimizer</span>
              </button>

              <button
                id="btn-expand-header-container"
                onClick={() => setIsHeaderCollapsed(false)}
                title="Expand full top header container"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 text-stone-400" />
                <span className="hidden sm:inline text-[11px]">Expand</span>
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Full Header View */
          <div className="space-y-3.5 animate-fadeIn">
            {/* Top Tier: Brand, Location Context & Primary Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div 
                  onClick={() => setCurrentTab('meals')}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md shrink-0 cursor-pointer hover:bg-emerald-600 transition-colors"
                >
                  KW
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h1 
                      onClick={() => setCurrentTab('meals')}
                      className="font-serif text-base sm:text-xl font-bold text-stone-100 tracking-tight cursor-pointer"
                    >
                      Waterloo Family Meal Planner
                    </h1>
                    
                    {/* Location Tag with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLocationMenu(!showLocationMenu)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Waterloo, ON</span>
                        <ChevronDown className="w-3 h-3 text-stone-400" />
                      </button>

                      {/* Location Info Dropdown */}
                      {showLocationMenu && (
                        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-stone-900 rounded-xl shadow-2xl border border-stone-700 p-4 z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                            <span className="text-xs font-bold text-stone-100">Active Waterloo Store Locations</span>
                            <button 
                              onClick={() => setShowLocationMenu(false)}
                              className="text-[11px] text-stone-400 hover:text-stone-200"
                            >
                              Close
                            </button>
                          </div>
                          <div className="space-y-2 text-xs">
                            {Object.entries(WATERLOO_STORE_LOCATIONS).map(([storeName, info]) => (
                              <div key={storeName} className="p-2.5 rounded-lg bg-stone-850 border border-stone-800 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-stone-200">{storeName}</span>
                                  <span className="text-[10px] text-emerald-400 font-medium">Thursday Flyer</span>
                                </div>
                                <p className="text-[11px] text-stone-400">{info.primaryLocation}</p>
                                <p className="text-[10px] text-stone-500">{info.allWaterlooAddresses[0]}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Family Size Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        id="btn-header-family-size"
                        onClick={() => setShowFamilyMenu(!showFamilyMenu)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-[11px] font-semibold border border-emerald-800/80 transition-colors cursor-pointer"
                        title="Adjust Family Members (Adults & Kids)"
                      >
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span>Family of {totalPeople}</span>
                        <ChevronDown className="w-3 h-3 text-emerald-400" />
                      </button>

                      {/* Family Size Adjuster Dropdown */}
                      {showFamilyMenu && (
                        <div className="absolute left-0 mt-2 w-72 bg-stone-900 rounded-2xl shadow-2xl border border-stone-700 p-4 z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                            <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-emerald-400" />
                              Change Family Members
                            </span>
                            <button 
                              type="button"
                              onClick={() => setShowFamilyMenu(false)}
                              className="text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer"
                            >
                              Done
                            </button>
                          </div>

                          <div className="space-y-3 text-xs">
                            {/* Adults Stepper */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-850 border border-stone-750">
                              <div>
                                <span className="font-semibold text-stone-200 block">Adults</span>
                                <span className="text-[10px] text-stone-400">Full dinner portions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAdults(-1)}
                                  className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center font-bold hover:bg-stone-700 cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-bold text-stone-100 w-4 text-center">{adults}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAdults(1)}
                                  className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center font-bold hover:bg-stone-700 cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Kids Stepper */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-850 border border-stone-750">
                              <div>
                                <span className="font-semibold text-stone-200 block">Young Kids / Toddlers</span>
                                <span className="text-[10px] text-stone-400">Scaled toddler portions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateKids(-1)}
                                  className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center font-bold hover:bg-stone-700 cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-bold text-stone-100 w-4 text-center">{kids}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateKids(1)}
                                  className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center font-bold hover:bg-stone-700 cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="p-2.5 bg-emerald-950/70 rounded-xl border border-emerald-800/60 text-[11px] text-emerald-300 text-center font-medium">
                              Total Portions: <strong>{totalPeople} people</strong> (Grocery list & costs auto-scale)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {familySettings?.preferOnePotPan && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 text-[11px] font-semibold border border-amber-800/60">
                        <CookingPot className="w-3 h-3 text-amber-400" />
                        One-Pot Focus
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-400 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-stone-500" />
                      Flyer Cycle: {flyerWeek.validFrom} – {flyerWeek.validTo}
                    </span>
                    <span className="hidden sm:inline text-stone-600">•</span>
                    <span className="hidden sm:inline font-medium text-stone-300">
                      Loss-leader savings for {currentMonth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Tools */}
              <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                {/* Season Context Selector Button */}
                <button
                  onClick={() => setCurrentTab('preferences')}
                  title="Calibrate Season & Produce in Preferences"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                >
                  {getSeasonIcon(seasonal.season)}
                  <span>{currentMonth}</span>
                  <span className="text-[11px] text-stone-400 font-normal">({seasonal.season})</span>
                </button>

                {/* AI Optimizer Trigger Button */}
                <button
                  id="btn-open-ai-planner"
                  onClick={openAIModal}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Optimizer</span>
                </button>

                {/* Collapse Header Container Button */}
                <button
                  id="btn-collapse-header-container"
                  onClick={() => setIsHeaderCollapsed(true)}
                  title="Collapse top container into compact bar"
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                  <span className="hidden sm:inline text-[11px]">Collapse</span>
                </button>
              </div>
            </div>

            {/* Bottom Tier: Nav Segmented Tabs & Waterloo Store Pills */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 mt-1 border-t border-stone-800">
              <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`tab-${item.id}`}
                      onClick={() => setCurrentTab(item.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-stone-100 text-stone-900 shadow-md font-bold'
                          : 'bg-stone-800/90 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            isActive
                              ? 'bg-stone-200 text-stone-900'
                              : 'bg-stone-700 text-stone-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Waterloo Store Quick Indicators */}
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-stone-400 mr-1">
                  Waterloo Banners:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[11px] font-semibold">
                  Food Basics
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/80 text-[11px] font-semibold">
                  Superstore
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800/80 text-[11px] font-semibold">
                  Zehrs
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800/80 text-[11px] font-semibold">
                  Sobeys
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


