import React, { useState } from 'react';
import { 
  Search, 
  Tag, 
  Sparkles, 
  Store, 
  ShoppingBag, 
  Filter, 
  Flame, 
  ArrowUpDown, 
  Check, 
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  MapPin
} from 'lucide-react';
import { FlyerDeal, KWStore, DealCategory, FlyerWeekInfo } from '../types';
import { STORE_METADATA } from '../data/flyersData';

interface FlyerBrowserProps {
  deals: FlyerDeal[];
  flyerWeek: FlyerWeekInfo;
  onAddDealToShoppingList: (deal: FlyerDeal) => void;
  onRefreshFlyersAI: () => void;
  isRefreshing: boolean;
}

export const FlyerBrowser: React.FC<FlyerBrowserProps> = ({
  deals,
  flyerWeek,
  onAddDealToShoppingList,
  onRefreshFlyersAI,
  isRefreshing,
}) => {
  const [selectedStore, setSelectedStore] = useState<KWStore | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyLossLeaders, setOnlyLossLeaders] = useState<boolean>(false);
  const [addedDealIds, setAddedDealIds] = useState<Record<string, boolean>>({});
  const [isBannerCollapsed, setIsBannerCollapsed] = useState<boolean>(false);

  const stores: KWStore[] = ['Food Basics', 'Real Canadian Superstore', 'Zehrs', 'Sobeys'];
  const categories: DealCategory[] = [
    'Meat & Poultry',
    'Seafood',
    'Fresh Produce',
    'Grains & Pasta',
    'Dairy & Eggs',
    'Pantry & Canned',
  ];

  const handleAdd = (deal: FlyerDeal) => {
    onAddDealToShoppingList(deal);
    setAddedDealIds((prev) => ({ ...prev, [deal.id]: true }));
    setTimeout(() => {
      setAddedDealIds((prev) => ({ ...prev, [deal.id]: false }));
    }, 2000);
  };

  const filteredDeals = deals.filter((deal) => {
    if (selectedStore !== 'All' && deal.store !== selectedStore) return false;
    if (selectedCategory !== 'All' && deal.category !== selectedCategory) return false;
    if (onlyLossLeaders && !deal.isLossLeader) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        deal.name.toLowerCase().includes(q) ||
        deal.store.toLowerCase().includes(q) ||
        deal.category.toLowerCase().includes(q) ||
        (deal.discountLabel && deal.discountLabel.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Flyer Header Banner (Collapsible) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Waterloo Flyers
            </span>
            <span className="text-xs text-stone-300 font-normal hidden sm:inline">
              Cycle: {flyerWeek.validFrom} – {flyerWeek.validTo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-flyers-ai"
              onClick={onRefreshFlyersAI}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'AI Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium border border-stone-700 cursor-pointer"
            >
              {isBannerCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isBannerCollapsed ? 'Show Details' : 'Collapse'}</span>
            </button>
          </div>
        </div>

        {!isBannerCollapsed && (
          <div className="p-5 sm:p-6 space-y-4 animate-fadeIn">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Waterloo Grocery Flyer Specials & Front-Page Loss Leaders
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-normal max-w-2xl mt-1">
                Verified specials across Sobeys (Columbia), Food Basics (University/Laurelwood), Zehrs (Conestoga Mall/Erb), and Superstore (Erbsville). Flyers refresh every Thursday!
              </p>
            </div>

            {/* Store Tabs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-stone-100">
              <button
                onClick={() => setSelectedStore('All')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedStore === 'All'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm">ALL STORES</div>
                <div className="text-[11px] font-normal opacity-80 mt-0.5">{deals.length} active deals</div>
              </button>

              {stores.map((store) => {
                const count = deals.filter((d) => d.store === store).length;
                const isSelected = selectedStore === store;
                const meta = STORE_METADATA[store];

                return (
                  <button
                    key={store}
                    onClick={() => setSelectedStore(store)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm truncate">
                      {store === 'Real Canadian Superstore' ? 'SUPERSTORE' : store.toUpperCase()}
                    </div>
                    <div className="text-[10px] font-medium opacity-80 mt-0.5 truncate">{meta?.neighborhood || 'Waterloo'} • {count} deals</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-flyers"
              type="text"
              placeholder="Search chicken breast, beef, salmon, berries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl font-normal focus:outline-hidden focus:border-stone-400"
            />
          </div>

          {/* Hot Deals Only Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setOnlyLossLeaders((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                onlyLossLeaders
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>Front-Page Specials Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === 'All'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredDeals.map((deal) => {
          const discountPercent = Math.round(
            ((deal.regularPrice - deal.salePrice) / deal.regularPrice) * 100
          );
          const isAdded = addedDealIds[deal.id];

          return (
            <div
              key={deal.id}
              className={`bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-stone-300 hover:shadow-sm transition-all ${
                deal.isLossLeader ? 'bg-amber-50/20 border-amber-200/80' : ''
              }`}
            >
              <div>
                {/* Store and Tag Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                      deal.store === 'Food Basics'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : deal.store === 'Real Canadian Superstore'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : deal.store === 'Zehrs'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}
                  >
                    {deal.store}
                  </span>

                  {deal.isLossLeader && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                      Front Page Deal
                    </span>
                  )}
                </div>

                {/* Deal Title */}
                <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 mt-1">
                  {deal.name}
                </h3>
                <p className="text-xs font-normal text-stone-500 mt-0.5">{deal.category}</p>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-bold text-stone-900">
                    ${deal.salePrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 font-normal">{deal.unit}</span>
                  <span className="text-xs text-stone-400 font-normal line-through ml-auto">
                    ${deal.regularPrice.toFixed(2)}
                  </span>
                </div>

                {/* Savings Pill */}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {deal.discountLabel || `Save ${discountPercent}%`}
                  </span>
                  <span className="text-[10px] font-normal text-stone-400">
                    Valid thru {deal.validUntil}
                  </span>
                </div>

                {/* Suggested Meal Pairing */}
                {(deal.suggestedProtein || deal.suggestedVeg || deal.suggestedStarch) && (
                  <div className="mt-3 p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/70 text-[11px] text-stone-700">
                    <span className="font-semibold text-stone-900">Recommended for: </span>
                    <span className="font-normal text-stone-600">
                      {[deal.suggestedProtein, deal.suggestedVeg, deal.suggestedStarch]
                        .filter(Boolean)
                        .join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
                <button
                  id={`btn-add-flyer-deal-${deal.id}`}
                  onClick={() => handleAdd(deal)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Grocery List</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-stone-300" />
                      <span>Add to Grocery List</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/90 shadow-xs p-6 space-y-2">
          <Info className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-stone-900 text-base">No deals found</h3>
          <p className="text-xs text-stone-500 font-normal">
            Try adjusting your search term or store filter above.
          </p>
        </div>
      )}
    </div>
  );
};

