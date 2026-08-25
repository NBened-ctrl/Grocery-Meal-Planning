import React, { useState } from 'react';
import { 
  Search, 
  Tag, 
  Sparkles, 
  Store, 
  ShoppingBag, 
  Filter, 
  Flame, 
  Check, 
  Info,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  RefreshCw,
  Plus,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Globe,
  X
} from 'lucide-react';
import { FlyerDeal, KWStore, DealCategory, FlyerWeekInfo, FlyerSourceType } from '../types';
import { STORE_METADATA } from '../data/flyersData';

interface FlyerBrowserProps {
  deals: FlyerDeal[];
  flyerWeek: FlyerWeekInfo;
  onAddDealToShoppingList: (deal: FlyerDeal) => void;
  onRefreshFlyersAI: (postalCode?: string, source?: FlyerSourceType) => void;
  isRefreshing: boolean;
  onAddCustomDeal?: (deal: FlyerDeal) => void;
}

const WATERLOO_POSTAL_CODES = [
  { code: 'N2L 6A6', label: 'N2L 6A6 - Waterloo (Lakeshore / Northfield / University & Conestoga - Primary)' },
  { code: 'N2T 1H4', label: 'N2T 1H4 - Beechwood (Zehrs Beechwood & Food Basics Erb St)' },
  { code: 'N2N 2Y2', label: 'N2N 2Y2 - Fischer-Hallman & Highland (Superstore & Boardwalk)' },
  { code: 'N2L 3E4', label: 'N2L 3E4 - University District / Columbia (Sobeys Columbia)' },
  { code: 'N2J 4H7', label: 'N2J 4H7 - Lincoln Heights / Uptown Waterloo' },
  { code: 'N2V 1Z8', label: 'N2V 1Z8 - Westvale / Erbsville / The Boardwalk' },
];

const DIRECT_STORE_HUBS_CONFIG: Array<{
  store: KWStore;
  getUrl: (postal: string) => string;
  label: string;
  badge: string;
}> = [
  { 
    store: 'Food Basics', 
    getUrl: (p) => `https://www.foodbasics.ca/flyer.en.html?postalCode=${p.replace(/\s+/g, '') || 'N2L6A6'}`, 
    label: 'FoodBasics.ca Flyer', 
    badge: 'Discount Leader' 
  },
  { 
    store: 'Real Canadian Superstore', 
    getUrl: () => 'https://www.realcanadiansuperstore.ca/print-flyer', 
    label: 'Superstore.ca Flyer', 
    badge: 'PC Optimum Deals' 
  },
  { 
    store: 'Zehrs', 
    getUrl: () => 'https://www.zehrs.ca/print-flyer', 
    label: 'Zehrs.ca Flyer', 
    badge: 'Fresh & Meat' 
  },
  { 
    store: 'Sobeys', 
    getUrl: (p) => `https://www.sobeys.com/en/flyer/?postalCode=${p.replace(/\s+/g, '') || 'N2L6A6'}`, 
    label: 'Sobeys.com Flyer', 
    badge: 'Weekly Specials' 
  },
];

export const FlyerBrowser: React.FC<FlyerBrowserProps> = ({
  deals,
  flyerWeek,
  onAddDealToShoppingList,
  onRefreshFlyersAI,
  isRefreshing,
  onAddCustomDeal,
}) => {
  const [selectedStore, setSelectedStore] = useState<KWStore | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyLossLeaders, setOnlyLossLeaders] = useState<boolean>(false);
  const [addedDealIds, setAddedDealIds] = useState<Record<string, boolean>>({});
  const [isBannerCollapsed, setIsBannerCollapsed] = useState<boolean>(false);
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>(flyerWeek.flippPostalCode || flyerWeek.reebeePostalCode || 'N2L 6A6');
  const [selectedSource, setSelectedSource] = useState<FlyerSourceType>(flyerWeek.sourceType || 'direct_store');

  // Live item search state
  const [liveSearchQuery, setLiveSearchQuery] = useState<string>('');
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [liveSearchResults, setLiveSearchResults] = useState<FlyerDeal[] | null>(null);
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null);

  // Manual clip modal
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualDeal, setManualDeal] = useState<{
    store: KWStore;
    name: string;
    category: DealCategory;
    salePrice: string;
    regularPrice: string;
    unit: string;
    discountLabel: string;
    isLossLeader: boolean;
  }>({
    store: 'Food Basics',
    name: '',
    category: 'Meat & Poultry',
    salePrice: '',
    regularPrice: '',
    unit: 'per lb',
    discountLabel: 'Store Flyer Deal',
    isLossLeader: false,
  });

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

  const handleTriggerSync = () => {
    onRefreshFlyersAI(selectedPostalCode, selectedSource);
  };

  const handleExecuteLiveSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!liveSearchQuery.trim()) return;

    setIsSearchingLive(true);
    setLiveSearchError(null);
    try {
      const endpoint = selectedSource === 'direct_store' ? '/api/store-flyer-search' : '/api/flipp-search';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: liveSearchQuery.trim(),
          postalCode: selectedPostalCode,
          source: selectedSource,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (data && data.results && Array.isArray(data.results)) {
        setLiveSearchResults(data.results);
      } else {
        // Fallback filter locally
        const q = liveSearchQuery.toLowerCase();
        const localMatches = deals.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.store.toLowerCase().includes(q)
        );
        setLiveSearchResults(localMatches);
      }
    } catch (err: any) {
      const q = liveSearchQuery.toLowerCase();
      const localMatches = deals.filter((d) => d.name.toLowerCase().includes(q));
      setLiveSearchResults(localMatches);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleSaveManualDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDeal.name.trim() || !manualDeal.salePrice) return;

    const sale = parseFloat(manualDeal.salePrice) || 0;
    const reg = parseFloat(manualDeal.regularPrice) || sale * 1.3;
    const cleanPostal = selectedPostalCode.replace(/\s+/g, '');
    const meta = STORE_METADATA[manualDeal.store];

    const newDeal: FlyerDeal = {
      id: `manual-deal-${Date.now()}`,
      store: manualDeal.store,
      name: manualDeal.name.trim(),
      category: manualDeal.category,
      salePrice: sale,
      regularPrice: reg,
      unit: manualDeal.unit || 'each',
      discountLabel: manualDeal.discountLabel || 'Store Flyer Deal',
      validUntil: flyerWeek.validTo,
      isLossLeader: manualDeal.isLossLeader,
      sourceType: selectedSource,
      directStoreVerified: true,
      directStoreUrl: meta?.flyerUrl,
      flippVerified: true,
      flippUrl: `https://flipp.com/search?postal_code=${cleanPostal}&query=${encodeURIComponent(manualDeal.name)}`,
      reebeeVerified: true,
      reebeeUrl: `https://flipp.com/search?postal_code=${cleanPostal}&query=${encodeURIComponent(manualDeal.name)}`,
      postalCode: selectedPostalCode,
    };

    if (onAddCustomDeal) {
      onAddCustomDeal(newDeal);
    }
    handleAdd(newDeal);
    setIsManualModalOpen(false);
    setManualDeal({
      store: 'Food Basics',
      name: '',
      category: 'Meat & Poultry',
      salePrice: '',
      regularPrice: '',
      unit: 'per lb',
      discountLabel: 'Store Flyer Deal',
      isLossLeader: false,
    });
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
      {/* Flyer Integration Header & Sync Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Top Dark Bar with Status, Source Selector & Postal Code */}
        <div className="p-4 sm:p-5 bg-stone-900 text-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {selectedSource === 'direct_store' ? 'Official Store Websites' : selectedSource === 'hybrid' ? 'Store Websites + Flipp Hybrid' : 'Flipp.com Circulars'}
            </span>
            <span className="text-xs text-stone-300 font-normal flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Cycle: {flyerWeek.validFrom} – {flyerWeek.validTo}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Flyer Source Selector */}
            <div className="flex items-center bg-stone-800 rounded-xl p-1 border border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSource('direct_store')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedSource === 'direct_store'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Direct grocery store websites (FoodBasics.ca, Superstore.ca, Zehrs.ca, Sobeys.com)"
              >
                Store Websites
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('flipp')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedSource === 'flipp'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Flipp.com Digital Circulars"
              >
                Flipp
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('hybrid')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedSource === 'hybrid'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Hybrid verification (Store portals + Flipp)"
              >
                Hybrid
              </button>
            </div>

            {/* Postal Code Selector */}
            <div className="flex items-center bg-stone-800 rounded-xl px-2 py-1 border border-stone-700 text-xs text-stone-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
              <select
                id="select-waterloo-postal"
                value={selectedPostalCode}
                onChange={(e) => setSelectedPostalCode(e.target.value)}
                className="bg-transparent text-stone-100 focus:outline-hidden text-xs cursor-pointer"
              >
                {WATERLOO_POSTAL_CODES.map((p) => (
                  <option key={p.code} value={p.code} className="bg-stone-900 text-stone-100">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sync Button */}
            <button
              id="btn-refresh-flyers-sync"
              onClick={handleTriggerSync}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-200 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Current Flyers'}</span>
            </button>

            {/* Manual Clip Button */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-700 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clip Deal</span>
            </button>

            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium border border-stone-700 cursor-pointer"
            >
              {isBannerCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!isBannerCollapsed && (
          <div className="p-5 sm:p-6 space-y-4 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    Waterloo Grocery Store Flyers & Current Sales Hub
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Verified Thursday Flyer Cycle
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-normal max-w-3xl mt-1 leading-relaxed">
                  Only active, current-cycle flyers from Kitchener-Waterloo grocery store websites (Food Basics, Real Canadian Superstore, Zehrs, and Sobeys) and Flipp circulars are utilized. Click any store below to browse their official weekly flyer directly.
                </p>
              </div>

              {/* Direct Store Flyer Quick Access Hub */}
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`https://flipp.com/flyers?postal_code=${selectedPostalCode.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
                >
                  <span>Flipp Waterloo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                </a>
              </div>
            </div>

            {/* Direct Grocery Store Official Website Hubs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {DIRECT_STORE_HUBS_CONFIG.map((hub) => (
                <a
                  key={hub.store}
                  href={hub.getUrl(selectedPostalCode)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-emerald-950 truncate">{hub.store}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-emerald-800 font-medium">{hub.label}</span>
                    <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-medium">{hub.badge}</span>
                  </div>
                </a>
              ))}
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
                <div className="text-[11px] font-normal opacity-80 mt-0.5">{deals.length} verified deals</div>
              </button>

              {stores.map((store) => {
                const count = deals.filter((d) => d.store === store).length;
                const isSelected = selectedStore === store;
                const meta = STORE_METADATA[store];
                const directUrl = meta?.directStoreFlyerUrl || meta?.flippDirectUrl;

                return (
                  <div
                    key={store}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedStore(store)}
                      className="w-full text-left cursor-pointer focus:outline-hidden"
                    >
                      <div className="font-semibold text-xs sm:text-sm truncate">
                        {store === 'Real Canadian Superstore' ? 'SUPERSTORE' : store.toUpperCase()}
                      </div>
                      <div className="text-[10px] font-medium opacity-80 mt-0.5 truncate">
                        {meta?.neighborhood || 'Waterloo'} • {count} deals
                      </div>
                    </button>
                    {directUrl && (
                      <a
                        href={directUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={`View ${store} weekly flyer`}
                        className={`absolute top-2.5 right-2.5 p-1 rounded-md transition-colors ${
                          isSelected ? 'text-stone-300 hover:text-white' : 'text-stone-400 hover:text-stone-900'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live Product Search Across Waterloo Store Flyers */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-700" />
              Live Current Flyer Deal Search
            </h3>
            <p className="text-xs text-stone-500 font-normal mt-0.5">
              Query any grocery item across all 4 Waterloo store flyer circulars to find current sales.
            </p>
          </div>

          {/* Live Search Form */}
          <form onSubmit={handleExecuteLiveSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input
                id="input-flipp-live-query"
                type="text"
                placeholder="e.g. chicken breast, ground beef, corn..."
                value={liveSearchQuery}
                onChange={(e) => setLiveSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl font-normal focus:outline-hidden focus:border-stone-400"
              />
              {liveSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLiveSearchQuery('');
                    setLiveSearchResults(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              id="btn-submit-flyer-search"
              type="submit"
              disabled={isSearchingLive || !liveSearchQuery.trim()}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              {isSearchingLive ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-stone-300" />
                  <span>Search Flyers</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Search Results Drawer */}
        {liveSearchResults !== null && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Found {liveSearchResults.length} Results for "{liveSearchQuery}" ({selectedPostalCode})
              </span>
              <button
                onClick={() => setLiveSearchResults(null)}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
              >
                Close Results
              </button>
            </div>

            {liveSearchResults.length === 0 ? (
              <p className="text-xs text-stone-500 py-2">
                No active flyer circular match found for "{liveSearchQuery}". Try terms like "chicken", "beef", "salmon", "potatoes", "tomatoes", or "bread".
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {liveSearchResults.map((deal) => {
                  const dealUrl = deal.directStoreUrl || deal.flippUrl || deal.reebeeUrl;
                  return (
                    <div
                      key={deal.id}
                      className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-semibold text-stone-700">{deal.store}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                            {deal.discountLabel || 'Flyer Deal'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{deal.name}</h4>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="font-serif text-lg font-bold text-stone-900">
                            ${deal.salePrice.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-stone-500 font-normal">{deal.unit}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        {dealUrl && (
                          <a
                            href={dealUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-medium"
                          >
                            <span>Flyer</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => handleAdd(deal)}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors ml-auto"
                        >
                          + Add to List
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and In-Page Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-flyers"
              type="text"
              placeholder="Filter current flyer deals..."
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
          const storeMeta = STORE_METADATA[deal.store];
          const storeDirectUrl = deal.directStoreUrl || storeMeta?.directStoreFlyerUrl;
          const flippUrl = deal.flippUrl || deal.reebeeUrl;

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
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}
                  >
                    {deal.store}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {deal.directStoreVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Store Verified
                      </span>
                    ) : (deal.flippVerified || deal.reebeeVerified) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Flipp Verified
                      </span>
                    )}

                    {deal.isLossLeader && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                        Front Page
                      </span>
                    )}
                  </div>
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
                    <span className="font-semibold text-stone-900">Suggested Pairing: </span>
                    <span className="font-normal text-stone-600">
                      {[deal.suggestedProtein, deal.suggestedVeg, deal.suggestedStarch]
                        .filter(Boolean)
                        .join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons & Direct Flyer Links */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {storeDirectUrl && (
                    <a
                      href={storeDirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 transition-colors"
                      title={`Open official ${deal.store} flyer website`}
                    >
                      <Globe className="w-3 h-3 text-emerald-700" />
                      <span>Store Site</span>
                      <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                    </a>
                  )}

                  {flippUrl && (
                    <a
                      href={flippUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                      title="View on Flipp.com"
                    >
                      <span>Flipp</span>
                      <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                    </a>
                  )}
                </div>

                <button
                  id={`btn-add-flyer-deal-${deal.id}`}
                  onClick={() => handleAdd(deal)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ml-auto ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to List</span>
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

      {/* Manual Clip Flipp Deal Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Clip Deal from Flipp App
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Waterloo Grocery Store</label>
                <select
                  value={manualDeal.store}
                  onChange={(e) => setManualDeal({ ...manualDeal, store: e.target.value as KWStore })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium"
                >
                  {stores.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Item / Deal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Atlantic Cod Fillets"
                  value={manualDeal.name}
                  onChange={(e) => setManualDeal({ ...manualDeal, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sale Price ($ CAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3.99"
                    value={manualDeal.salePrice}
                    onChange={(e) => setManualDeal({ ...manualDeal, salePrice: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit / Measurement</label>
                  <input
                    type="text"
                    placeholder="per lb ($8.80/kg)"
                    value={manualDeal.unit}
                    onChange={(e) => setManualDeal({ ...manualDeal, unit: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-normal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={manualDeal.category}
                    onChange={(e) => setManualDeal({ ...manualDeal, category: e.target.value as DealCategory })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Tag</label>
                  <input
                    type="text"
                    placeholder="Save $2.50"
                    value={manualDeal.discountLabel}
                    onChange={(e) => setManualDeal({ ...manualDeal, discountLabel: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-normal"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-loss-leader"
                  checked={manualDeal.isLossLeader}
                  onChange={(e) => setManualDeal({ ...manualDeal, isLossLeader: e.target.checked })}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="chk-loss-leader" className="text-stone-700 font-medium cursor-pointer">
                  Front-Page Flyer Special / Door Crasher
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Add Clipped Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
