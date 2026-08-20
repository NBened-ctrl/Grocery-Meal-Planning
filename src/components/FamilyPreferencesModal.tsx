import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  DollarSign, 
  HeartHandshake, 
  Utensils, 
  CheckCircle2, 
  Package, 
  Save, 
  SlidersHorizontal,
  Store,
  Sparkles,
  CookingPot,
  Calendar,
  Sun,
  CloudSun,
  Leaf,
  Snowflake,
  Check
} from 'lucide-react';
import { FamilySettings, PantryItem, KWStore } from '../types';
import { MONTHS_LIST, ONTARIO_SEASONAL_METADATA, getSeasonalInfo } from '../data/seasonalData';

interface FamilyPreferencesModalProps {
  settings: FamilySettings;
  pantryItems: PantryItem[];
  onSaveSettings: (newSettings: FamilySettings) => void;
  onTogglePantryItem: (id: string) => void;
  onSavePantryBatch: (items: PantryItem[]) => void;
}

export const FamilyPreferencesModal: React.FC<FamilyPreferencesModalProps> = ({
  settings,
  pantryItems,
  onSaveSettings,
  onTogglePantryItem,
}) => {
  const [localSettings, setLocalSettings] = useState<FamilySettings>(settings);
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const selectedMonth = localSettings.selectedMonth || 'August';
  const seasonalInfo = getSeasonalInfo(selectedMonth);

  const stores: KWStore[] = ['Food Basics', 'Real Canadian Superstore', 'Zehrs', 'Sobeys'];
  const dietaryOptions = [
    'Kid-Friendly Mild Seasoning',
    'High Protein Focus',
    'Nut-Free Safe',
    'Low Sodium for Toddlers',
    'Gluten-Friendly',
    'Dairy-Light',
  ];

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const toggleDietary = (opt: string) => {
    setLocalSettings((prev) => {
      const exists = prev.dietaryPreferences.includes(opt);
      return {
        ...prev,
        dietaryPreferences: exists
          ? prev.dietaryPreferences.filter((x) => x !== opt)
          : [...prev.dietaryPreferences, opt],
      };
    });
  };

  const categories = Array.from(new Set(pantryItems.map((p) => p.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              Settings & Inventory
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Family Profile, Seasonal Vibes & Pantry
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-normal max-w-2xl">
            Customize month seasonal vibes, one-pot cleanup rules, family portions, and pantry staples to keep Waterloo grocery bills low.
          </p>
        </div>

        <button
          id="btn-save-family-settings"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4 text-amber-300" />
          <span>{savedAlert ? 'Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Seasonal & One-Pot Optimization Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Month & Seasonal Produce Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>Month & Seasonal Produce Vibe</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-100/70 text-amber-900 rounded-full border border-amber-200">
              {seasonalInfo.season}
            </span>
          </div>

          <p className="text-xs text-stone-600 font-normal">
            Select the month to calibrate recipes with Ontario farm-fresh harvest specials and seasonal comfort preferences.
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Active Planning Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  selectedMonth: e.target.value,
                  seasonalVibe: ONTARIO_SEASONAL_METADATA[e.target.value]?.vibeTitle,
                })
              }
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:border-stone-500"
            >
              {MONTHS_LIST.map((m) => (
                <option key={m} value={m}>
                  {m} — {ONTARIO_SEASONAL_METADATA[m]?.vibeTitle} ({ONTARIO_SEASONAL_METADATA[m]?.season})
                </option>
              ))}
            </select>
          </div>

          {/* Ontario Seasonal Highlights Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-amber-950">
              <span>🌾 Peak Ontario Produce:</span>
              <span className="text-[11px] text-amber-800 italic font-normal">{seasonalInfo.cookingVibe}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {seasonalInfo.keySeasonalProduce.map((prod, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white border border-amber-200 text-amber-900 rounded-md font-medium text-[11px]"
                >
                  {prod}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* One-Pot / One-Pan Preference Toggle */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <CookingPot className="w-4 h-4 text-orange-700" />
                <span>One-Pot / One-Pan Priority</span>
              </h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                localSettings.preferOnePotPan ? 'bg-orange-100 text-orange-900 border-orange-200' : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {localSettings.preferOnePotPan ? 'PRIORITY ON' : 'OPTIONAL'}
              </span>
            </div>

            <p className="text-xs text-stone-600 font-normal leading-relaxed">
              Prioritizes sheet-pan roasts, cast-iron skillet sautés, Dutch oven stews, and slow cooker meals to minimize dirty dishes for busy young parents.
            </p>
          </div>

          <div
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                preferOnePotPan: !localSettings.preferOnePotPan,
              })
            }
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              localSettings.preferOnePotPan
                ? 'bg-orange-50/70 border-orange-200 text-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            <div className="space-y-0.5">
              <span className="font-medium text-xs sm:text-sm block text-stone-900">
                🥘 Emphasize 1-Vessel Cooking
              </span>
              <span className="text-[11px] text-stone-500 block font-normal">
                Sheet pan roasts, one-pot pastas, and skillet dinners
              </span>
            </div>

            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center font-semibold text-xs border shrink-0 ${
                localSettings.preferOnePotPan 
                  ? 'bg-orange-600 text-white border-orange-600' 
                  : 'bg-white border-stone-300 text-transparent'
              }`}
            >
              ✓
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Family & Meal Rules */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-6">
          <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Family Profile & Cooking Rules</span>
          </h3>

          {/* Family Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Adults (Full Portions)
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={localSettings.adultsCount}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, adultsCount: parseInt(e.target.value) || 2 })
                }
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Young Kids / Toddlers
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={localSettings.kidsCount}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, kidsCount: parseInt(e.target.value) || 2 })
                }
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:border-stone-500"
              />
            </div>
          </div>

          {/* Shopping Mode */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Default Shopping Optimization Mode
            </label>
            <select
              value={localSettings.primaryStore}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  primaryStore: e.target.value as KWStore | 'Multi-Store Optimizer',
                })
              }
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-hidden focus:border-stone-500"
            >
              <option value="Multi-Store Optimizer">
                Multi-Store Optimizer (Split best deals across Food Basics, Superstore, Zehrs, Sobeys)
              </option>
              {stores.map((s) => (
                <option key={s} value={s}>
                  {s} (Single 1-Stop Store Run)
                </option>
              ))}
            </select>
          </div>

          {/* Max Cook Time */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Max Weeknight Cook Time
              </label>
              <span className="text-xs font-semibold text-emerald-800">
                {localSettings.maxCookTimeMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={localSettings.maxCookTimeMinutes}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  maxCookTimeMinutes: parseInt(e.target.value),
                })
              }
              className="w-full accent-stone-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-normal text-stone-400 mt-0.5">
              <span>15m (Ultra fast)</span>
              <span>30m (Balanced)</span>
              <span>60m (Feasts)</span>
            </div>
          </div>

          {/* Weekly Dinner Budget Target */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Target 7-Day Dinner Budget ($CAD)
              </label>
              <span className="text-xs font-serif font-bold text-emerald-800">
                ${localSettings.budgetWeeklyTarget} CAD / week
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="150"
              step="5"
              value={localSettings.budgetWeeklyTarget}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  budgetWeeklyTarget: parseInt(e.target.value),
                })
              }
              className="w-full accent-stone-900 cursor-pointer"
            />
          </div>

          {/* Toddler & Picky Eater Setting */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Kids & Toddler Eating Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Picky Toddler Friendly', 'Adventurous'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, kidPickyLevel: lvl })}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    localSettings.kidPickyLevel === lvl
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Dietary & Health Filters
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dietaryOptions.map((opt) => {
                const active = localSettings.dietaryPreferences.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleDietary(opt)}
                    className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-semibold border ${
                        active ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-300'
                      }`}
                    >
                      {active ? '✓' : ''}
                    </div>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pantry Inventory Staples */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-700" />
              <span>Kitchen Pantry Inventory</span>
            </h3>
            <span className="text-xs text-stone-500 font-normal">
              {pantryItems.filter((p) => p.inStock).length} / {pantryItems.length} in stock
            </span>
          </div>

          <p className="text-xs text-stone-500 font-normal">
            Check off staples you have at home. The planner will skip these from your weekly grocery list cart to save you money.
          </p>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const items = pantryItems.filter((p) => p.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    {cat}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onTogglePantryItem(item.id)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          item.inStock
                            ? 'bg-amber-50/70 border-amber-300 text-stone-900 font-medium shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-400 line-through hover:border-stone-300'
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-semibold border shrink-0 ${
                            item.inStock ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-300'
                          }`}
                        >
                          {item.inStock ? '✓' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

