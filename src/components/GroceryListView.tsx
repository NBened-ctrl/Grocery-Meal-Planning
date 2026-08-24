import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Copy, 
  Printer, 
  Store, 
  CheckCircle2, 
  Sparkles, 
  Info,
  DollarSign,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  MapPin
} from 'lucide-react';
import { GroceryItem, KWStore, DealCategory } from '../types';
import { STORE_METADATA } from '../data/flyersData';

interface GroceryListViewProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
}

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  groceryItems,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearChecked,
}) => {
  const [groupBy, setGroupBy] = useState<'store' | 'category'>('store');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<string>('1');
  const [newItemStore, setNewItemStore] = useState<KWStore | 'Food Basics'>('Food Basics');
  const [newItemCategory, setNewItemCategory] = useState<DealCategory>('Fresh Produce');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isTopSummaryCollapsed, setIsTopSummaryCollapsed] = useState<boolean>(false);
  const [collapsedStores, setCollapsedStores] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [pantryCollapsed, setPantryCollapsed] = useState<boolean>(false);

  const toggleStoreCollapse = (storeName: string) => {
    setCollapsedStores((prev) => ({
      ...prev,
      [storeName]: !prev[storeName],
    }));
  };

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const expandAll = () => {
    setCollapsedStores({});
    setCollapsedCategories({});
    setPantryCollapsed(false);
  };

  const collapseAll = () => {
    const allStoresCollapsed: Record<string, boolean> = {};
    stores.forEach((s) => (allStoresCollapsed[s] = true));
    setCollapsedStores(allStoresCollapsed);

    const allCatsCollapsed: Record<string, boolean> = {};
    categories.forEach((c) => (allCatsCollapsed[c] = true));
    setCollapsedCategories(allCatsCollapsed);
    setPantryCollapsed(true);
  };

  const activeItems = groceryItems.filter((i) => i.store !== 'Pantry (On Hand)');
  const pantryItems = groceryItems.filter((i) => i.store === 'Pantry (On Hand)');

  const totalCost = activeItems.reduce((sum, item) => sum + (item.salePrice || 0), 0);
  const totalRegularCost = activeItems.reduce((sum, item) => sum + (item.regularPrice || (item.salePrice || 0) * 1.3), 0);
  const totalSavings = Math.max(0, totalRegularCost - totalCost);
  const checkedCount = activeItems.filter((i) => i.checked).length;

  const stores: KWStore[] = ['Food Basics', 'Real Canadian Superstore', 'Zehrs', 'Sobeys'];
  const categories: DealCategory[] = [
    'Meat & Poultry',
    'Seafood',
    'Fresh Produce',
    'Grains & Pasta',
    'Dairy & Eggs',
    'Pantry & Canned',
  ];

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      quantity: newItemQty.trim() || '1 item',
      store: newItemStore,
      category: newItemCategory,
      salePrice: newItemPrice ? parseFloat(newItemPrice) : undefined,
      forMeals: ['Custom Item'],
      isCustom: true,
    });

    setNewItemName('');
    setNewItemQty('1');
    setNewItemPrice('');
    setShowAddForm(false);
  };

  const handleCopyClipboard = () => {
    let text = `🛒 WATERLOO WEEKLY GROCERY LIST (Family Plan)\n`;
    text += `Est. Total: $${totalCost.toFixed(2)} CAD (Saved ~$${totalSavings.toFixed(2)})\n\n`;

    stores.forEach((store) => {
      const itemsInStore = activeItems.filter((i) => i.store === store);
      if (itemsInStore.length > 0) {
        text += `🏪 ${store.toUpperCase()} (${STORE_METADATA[store]?.primaryLocation || 'Waterloo'}):\n`;
        itemsInStore.forEach((item) => {
          text += `  ${item.checked ? '[X]' : '[ ]'} ${item.name} (${item.quantity})${
            item.salePrice ? ` - $${item.salePrice.toFixed(2)}` : ''
          }\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Header Card (Collapsible) */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden transition-all text-stone-100">
        {/* Header Title Bar */}
        <div className="p-3.5 sm:p-5 bg-stone-950/80 border-b border-stone-800 text-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-sm sm:text-lg font-bold tracking-tight">
                Consolidated Grocery & Ingredient List
              </h2>
              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 bg-stone-800 text-emerald-300 rounded-md border border-stone-700">
                {activeItems.length} items ({checkedCount} checked)
              </span>
              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 bg-stone-800 text-amber-300 rounded-md border border-stone-700 hidden sm:inline">
                Est. ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-grocery-summary"
              onClick={() => setIsTopSummaryCollapsed(!isTopSummaryCollapsed)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold border border-stone-750 cursor-pointer transition-colors"
            >
              {isTopSummaryCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">Summary</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Detailed Summary Content */}
        {!isTopSummaryCollapsed && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-800">
                    Waterloo Shopping Run
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    {activeItems.length} items to buy • {checkedCount} checked
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 font-normal max-w-2xl">
                  Organized by Waterloo store banners and aisle categories. Scaled specifically for family dinner portions.
                </p>
              </div>

              {/* Pricing Sub-blocks */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="bg-stone-850 p-3.5 sm:p-4 rounded-xl border border-stone-750 text-center">
                  <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Est. Cart Total</p>
                  <p className="font-serif text-lg sm:text-2xl font-bold text-amber-400">${totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-emerald-950/70 p-3.5 sm:p-4 rounded-xl border border-emerald-800 text-center">
                  <p className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider">Flyer Savings</p>
                  <p className="font-serif text-lg sm:text-2xl font-bold text-emerald-400">~${totalSavings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Action Controls & Grouping */}
            <div className="pt-3 sm:pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              {/* Group toggle & Expand/Collapse All */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between">
                <div className="flex items-center gap-1 bg-stone-850 p-1 rounded-xl border border-stone-750">
                  <button
                    onClick={() => setGroupBy('store')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      groupBy === 'store'
                        ? 'bg-stone-100 text-stone-900 shadow-sm font-bold'
                        : 'text-stone-300 hover:text-stone-100'
                    }`}
                  >
                    Group by Store
                  </button>
                  <button
                    onClick={() => setGroupBy('category')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      groupBy === 'category'
                        ? 'bg-stone-100 text-stone-900 shadow-sm font-bold'
                        : 'text-stone-300 hover:text-stone-100'
                    }`}
                  >
                    Group by Aisle
                  </button>
                </div>

                {/* Expand / Collapse All Quick Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={expandAll}
                    title="Expand all sections"
                    className="px-2.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl border border-stone-750 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronsDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Expand All</span>
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    title="Collapse all sections"
                    className="px-2.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl border border-stone-750 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronsUp className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Collapse All</span>
                  </button>
                </div>
              </div>

              {/* Buttons: Add, Clear, Copy, Print */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                <button
                  id="btn-add-custom-grocery-item"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>

                <button
                  id="btn-copy-grocery-list"
                  onClick={handleCopyClipboard}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-300" />}
                  <span>{copied ? 'Copied!' : 'Copy List'}</span>
                </button>

                <button
                  id="btn-print-grocery-list"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-300" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {checkedCount > 0 && (
                  <button
                    id="btn-clear-checked-items"
                    onClick={onClearChecked}
                    className="inline-flex items-center justify-center gap-1 px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear ({checkedCount})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Item Drawer / Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddNew}
          className="bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-md space-y-4 animate-fadeIn text-stone-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-100 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Custom Family Grocery Item</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-medium text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-300 mb-1">
                Item Name (e.g. Organic Milk 4L, Toddler Berries)
              </label>
              <input
                type="text"
                required
                placeholder="Item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-850 border border-stone-750 text-stone-100 placeholder-stone-400 rounded-xl font-normal focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-300 mb-1">Quantity / Size</label>
              <input
                type="text"
                placeholder="e.g. 1 bag, 2 lbs, 1 box"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-850 border border-stone-750 text-stone-100 placeholder-stone-400 rounded-xl font-normal focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-300 mb-1">Waterloo Store Banner</label>
              <select
                value={newItemStore}
                onChange={(e) => setNewItemStore(e.target.value as KWStore)}
                className="w-full px-3 py-2 text-xs bg-stone-850 border border-stone-750 text-stone-100 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500"
              >
                {stores.map((s) => (
                  <option key={s} value={s}>
                    {s} ({STORE_METADATA[s]?.neighborhood || 'Waterloo'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-300 mb-1">Estimated Price ($CAD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 4.99"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-850 border border-stone-750 text-stone-100 placeholder-stone-400 rounded-xl font-normal focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer active:scale-95"
            >
              Add to Grocery List
            </button>
          </div>
        </form>
      )}

      {/* Main Grocery Items Grouped View */}
      {groupBy === 'store' ? (
        <div className="space-y-4 sm:space-y-6">
          {stores.map((store) => {
            const items = activeItems.filter((i) => i.store === store);
            if (items.length === 0) return null;

            const storeSubtotal = items.reduce((sum, item) => sum + (item.salePrice || 0), 0);
            const storeMeta = STORE_METADATA[store];
            const isCollapsed = Boolean(collapsedStores[store]);

            return (
              <div
                key={store}
                className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden text-stone-100"
              >
                {/* Store Subheader with Interactive Collapse */}
                <button
                  type="button"
                  onClick={() => toggleStoreCollapse(store)}
                  className="w-full p-3.5 sm:p-4 bg-stone-950/70 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-stone-850/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-stone-850 border border-stone-750 text-stone-300">
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        store === 'Food Basics'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : store === 'Real Canadian Superstore'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                          : store === 'Zehrs'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-teal-950/80 text-teal-300 border-teal-800'
                      }`}
                    >
                      {store}
                    </span>
                    <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                      <MapPin className="w-3 h-3 inline text-stone-400 mr-0.5" />
                      {storeMeta?.primaryLocation}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium text-stone-400">
                    <span className="bg-stone-850 px-2 py-0.5 rounded-md border border-stone-750 text-stone-200">
                      {items.length} items
                    </span>
                    <span>
                      Subtotal:{' '}
                      <span className="text-amber-400 font-semibold text-sm">${storeSubtotal.toFixed(2)}</span>
                    </span>
                  </div>
                </button>

                {/* Items List (Collapsible) */}
                {!isCollapsed && (
                  <div className="divide-y divide-stone-800 animate-fadeIn">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleItem(item.id)}
                        className={`p-3 px-4 sm:px-5 flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-stone-850/60 ${
                          item.checked ? 'bg-stone-950/60 opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button className="text-stone-400 hover:text-emerald-400 cursor-pointer">
                            {item.checked ? (
                              <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-stone-500" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold text-xs sm:text-sm text-stone-100 block truncate ${
                                  item.checked ? 'line-through text-stone-400' : ''
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.notes && item.notes.includes('Active Flyer') && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 text-[10px] font-semibold border border-emerald-800 shrink-0">
                                  <Tag className="w-2.5 h-2.5" />
                                  Flyer Sale
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 font-normal flex items-center gap-2 flex-wrap mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span className="text-stone-400">{item.category}</span>
                              {item.forMeals && item.forMeals.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-medium truncate max-w-[180px]">
                                    {item.forMeals.join(', ')}
                                  </span>
                                </>
                              )}
                              {item.notes && !item.notes.includes('Active Flyer') && (
                                <>
                                  <span>•</span>
                                  <span className="text-stone-400 italic text-[10px]">{item.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.salePrice !== undefined && (
                            <div className="text-right">
                              <span className="font-semibold text-xs sm:text-sm text-stone-100">
                                ${item.salePrice.toFixed(2)}
                              </span>
                              {item.regularPrice && (
                                <span className="block text-[10px] text-stone-400 line-through">
                                  ${item.regularPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg cursor-pointer hover:bg-rose-950/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Group by Category (Collapsible) */
        <div className="space-y-4 sm:space-y-6">
          {categories.map((cat) => {
            const items = activeItems.filter((i) => i.category === cat);
            if (items.length === 0) return null;

            const catSubtotal = items.reduce((sum, item) => sum + (item.salePrice || 0), 0);
            const isCollapsed = Boolean(collapsedCategories[cat]);

            return (
              <div
                key={cat}
                className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden text-stone-100"
              >
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(cat)}
                  className="w-full p-3.5 sm:p-4 bg-stone-950/70 border-b border-stone-800 flex items-center justify-between text-left hover:bg-stone-850/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-stone-850 border border-stone-750 text-stone-300">
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </div>
                    <h3 className="font-semibold text-stone-200 text-xs sm:text-sm uppercase tracking-wider">{cat}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-stone-400">
                    <span className="bg-stone-850 px-2 py-0.5 rounded-md border border-stone-750 text-stone-200">
                      {items.length} items
                    </span>
                    <span>
                      Aisle Subtotal:{' '}
                      <span className="text-amber-400 font-semibold text-sm">${catSubtotal.toFixed(2)}</span>
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-stone-800 animate-fadeIn">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleItem(item.id)}
                        className={`p-3 px-4 sm:px-5 flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-stone-850/60 ${
                          item.checked ? 'bg-stone-950/60 opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button className="text-stone-400 hover:text-emerald-400 cursor-pointer">
                            {item.checked ? (
                              <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-stone-500" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold text-xs sm:text-sm text-stone-100 block truncate ${
                                  item.checked ? 'line-through text-stone-400' : ''
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.notes && item.notes.includes('Active Flyer') && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 text-[10px] font-semibold border border-emerald-800 shrink-0">
                                  <Tag className="w-2.5 h-2.5" />
                                  Flyer Sale
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 font-normal flex items-center gap-2 flex-wrap mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">Buy at {item.store}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.salePrice !== undefined && (
                            <span className="font-semibold text-xs sm:text-sm text-stone-100">
                              ${item.salePrice.toFixed(2)}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg cursor-pointer hover:bg-rose-950/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pantry Staples Section (On-Hand in Kitchen, Collapsible) */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 space-y-2 text-stone-100">
        <button
          type="button"
          onClick={() => setPantryCollapsed(!pantryCollapsed)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-stone-850 border border-stone-750 text-stone-300">
              {pantryCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-400" />
              <h3 className="font-semibold text-stone-200 text-sm">
                Pantry Staples Assumed On Hand
              </h3>
            </div>
          </div>
          <span className="text-xs text-amber-300 font-medium bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
            {pantryItems.length > 0 ? `${pantryItems.length} items saved` : 'Assumed in Stock'}
          </span>
        </button>

        {!pantryCollapsed && (
          <p className="text-xs text-stone-400 font-normal animate-fadeIn pt-1">
            Our recipe planner assumes you already have staple cooking oils, kosher salt, black pepper, soy sauce, garlic, Italian herbs, and condiments in your home pantry.
          </p>
        )}
      </div>
    </div>
  );
};

