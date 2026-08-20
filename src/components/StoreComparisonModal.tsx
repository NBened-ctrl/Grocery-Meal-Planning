import React from 'react';
import { 
  X, 
  ArrowLeftRight, 
  CheckCircle2, 
  TrendingDown, 
  Store, 
  Clock, 
  DollarSign,
  Sparkles,
  Check,
  MapPin
} from 'lucide-react';
import { KWStore, FamilySettings } from '../types';
import { STORE_METADATA } from '../data/flyersData';

interface StoreComparisonModalProps {
  currentWeeklyCost: number;
  familySettings: FamilySettings;
  onSelectPrimaryStore: (store: KWStore | 'Multi-Store Optimizer') => void;
  onClose: () => void;
}

export const StoreComparisonModal: React.FC<StoreComparisonModalProps> = ({
  currentWeeklyCost,
  familySettings,
  onSelectPrimaryStore,
  onClose,
}) => {
  const storeComparisonData = [
    {
      name: 'Multi-Store Optimizer' as const,
      tagline: 'Maximum Savings Strategy',
      description: 'Splits items across the best flyer loss-leaders at Food Basics, Superstore, Zehrs, and Sobeys in Waterloo.',
      estWeeklyCost: currentWeeklyCost,
      savingsVsSobeys: 25.60,
      stopsCount: '2-3 quick stops in Waterloo',
      timeTradeoff: '~1.5 hrs total shopping',
      color: 'border-emerald-500 bg-emerald-950/40',
    },
    {
      name: 'Food Basics' as KWStore,
      tagline: 'Best Single-Stop Budget Run',
      description: 'Lowest everyday produce & poultry prices; convenient locations on University Ave W and Laurelwood Drive.',
      estWeeklyCost: currentWeeklyCost + 6.10,
      savingsVsSobeys: 19.50,
      stopsCount: '1 single store stop',
      timeTradeoff: '~40 mins shopping',
      color: 'border-stone-750 bg-stone-850',
    },
    {
      name: 'Real Canadian Superstore' as KWStore,
      tagline: 'Best One-Stop Club Size & Points',
      description: 'Massive selection at Erbsville & Fischer-Hallman. Earn PC Optimum points on bulk family packs.',
      estWeeklyCost: currentWeeklyCost + 10.80,
      savingsVsSobeys: 14.80,
      stopsCount: '1 single store stop',
      timeTradeoff: '~50 mins shopping',
      color: 'border-stone-750 bg-stone-850',
    },
    {
      name: 'Zehrs' as KWStore,
      tagline: 'Fresh Quality & Seafood Focus',
      description: 'Premium meat cuts, fresh bakery, local Ontario seasonal produce at Conestoga Mall or Erb St W.',
      estWeeklyCost: currentWeeklyCost + 19.20,
      savingsVsSobeys: 6.40,
      stopsCount: '1 single store stop',
      timeTradeoff: '~40 mins shopping',
      color: 'border-stone-750 bg-stone-850',
    },
    {
      name: 'Sobeys' as KWStore,
      tagline: 'Artisan & Sterling Silver Premium',
      description: 'AAA beef, Compliments organics, and specialty family deli items at Columbia St W or Bridgeport.',
      estWeeklyCost: currentWeeklyCost + 25.60,
      savingsVsSobeys: 0,
      stopsCount: '1 single store stop',
      timeTradeoff: '~35 mins shopping',
      color: 'border-stone-750 bg-stone-850',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-6 border border-stone-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                Waterloo Price Benchmark
              </span>
              <span className="text-xs text-stone-400 font-medium">
                Family of {familySettings.adultsCount + familySettings.kidsCount}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
              Store Price Comparison & Strategy
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-normal max-w-2xl">
              Compare weekly estimated costs for 7 dinners bought at a single Waterloo store vs. splitting flyer loss-leaders across local banners.
            </p>
          </div>

          <div className="bg-stone-850 p-3.5 sm:p-4 rounded-xl border border-stone-750 shrink-0">
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Active Shopping Mode</p>
            <p className="font-serif text-base font-bold text-amber-400 mt-0.5">
              {familySettings.primaryStore}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {storeComparisonData.map((option) => {
          const isCurrent = familySettings.primaryStore === option.name;

          return (
            <div
              key={option.name}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 ${
                isCurrent 
                  ? 'bg-emerald-950/40 border-emerald-600 shadow-md ring-1 ring-emerald-500/40' 
                  : 'bg-stone-900 border-stone-800 shadow-sm hover:border-stone-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-100">{option.name}</h3>
                    <p className="text-xs font-medium text-emerald-400">{option.tagline}</p>
                  </div>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-400 font-normal leading-relaxed">
                  {option.description}
                </p>

                {/* Pricing Box */}
                <div className="p-3.5 bg-stone-850 rounded-xl border border-stone-750 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-400 font-normal">Est. 7 Dinners:</span>
                    <span className="font-serif text-lg font-bold text-amber-400">
                      ${option.estWeeklyCost.toFixed(2)} CAD
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 font-normal">Stops:</span>
                    <span className="font-medium text-stone-200">{option.stopsCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 font-normal">Est. Time:</span>
                    <span className="font-medium text-stone-200">{option.timeTradeoff}</span>
                  </div>
                </div>
              </div>

              {/* Select Action Button */}
              <div className="mt-4 pt-3 border-t border-stone-800">
                <button
                  id={`btn-select-store-mode-${option.name.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => onSelectPrimaryStore(option.name)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-750'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Current Mode Active</span>
                    </>
                  ) : (
                    <span>Switch to {option.name === 'Multi-Store Optimizer' ? 'Multi-Store' : option.name}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Budget Projections */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-sm space-y-2.5">
        <h3 className="font-serif font-bold text-base text-amber-300 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-amber-400" />
          <span>Annual Waterloo Grocery Savings Potential for Family of 4</span>
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal max-w-3xl">
          By utilizing Thursday flyer loss leaders across Waterloo grocery banners instead of shopping without flyer sales, a family of 4 saves an average of <strong className="text-emerald-400 font-semibold">$25 - $48 CAD per week</strong> ($100 - $190/month, or <strong className="text-amber-300 font-semibold">$1,200 - $2,300 per year</strong>).
        </p>
      </div>
    </div>
  );
};

