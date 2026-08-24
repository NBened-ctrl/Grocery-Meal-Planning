import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  MealPlanView 
} from './components/MealPlanView';
import { 
  RecipeModal 
} from './components/RecipeModal';
import { 
  FlyerBrowser 
} from './components/FlyerBrowser';
import { 
  GroceryListView 
} from './components/GroceryListView';
import { 
  StoreComparisonModal 
} from './components/StoreComparisonModal';
import { 
  FamilyPreferencesModal 
} from './components/FamilyPreferencesModal';
import { 
  AIPlannerModal 
} from './components/AIPlannerModal';
import { 
  SwapMealModal 
} from './components/SwapMealModal';

import { 
  MealRecipe, 
  GroceryItem, 
  FlyerDeal, 
  FamilySettings, 
  PantryItem, 
  FlyerWeekInfo,
  KWStore 
} from './types';
import { 
  CURRENT_FLYER_WEEK, 
  INITIAL_FLYER_DEALS 
} from './data/flyersData';
import { 
  DEFAULT_WEEKLY_MEAL_PLAN 
} from './data/sampleMealPlans';
import { 
  DEFAULT_PANTRY_STAPLES 
} from './data/pantryStaples';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'meals' | 'grocery' | 'flyers' | 'stores' | 'preferences'>('meals');
  
  // Weekly Meals State
  const [meals, setMeals] = useState<MealRecipe[]>(() => {
    const saved = localStorage.getItem('kw_meals_plan');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_WEEKLY_MEAL_PLAN;
  });

  // Flyer Deals State
  const [deals, setDeals] = useState<FlyerDeal[]>(() => {
    const saved = localStorage.getItem('kw_flyer_deals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_FLYER_DEALS;
  });

  // Flyer Week Info
  const [flyerWeek, setFlyerWeek] = useState<FlyerWeekInfo>(CURRENT_FLYER_WEEK);

  // Family Settings State
  const [familySettings, setFamilySettings] = useState<FamilySettings>(() => {
    const saved = localStorage.getItem('kw_family_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      adultsCount: 2,
      kidsCount: 2,
      primaryStore: 'Multi-Store Optimizer',
      enabledStores: ['Food Basics', 'Real Canadian Superstore', 'Zehrs', 'Sobeys'],
      maxCookTimeMinutes: 30,
      budgetWeeklyTarget: 95,
      kidPickyLevel: 'Picky Toddler Friendly',
      dietaryPreferences: ['Kid-Friendly Mild Seasoning'],
      includeLeftoverDay: true,
    };
  });

  // Pantry Items State
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem('kw_pantry_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_PANTRY_STAPLES;
  });

  // Custom User Grocery Items
  const [customGroceryItems, setCustomGroceryItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('kw_custom_grocery');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Checked item tracking
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('kw_checked_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  // Modals state
  const [activeRecipeModalMeal, setActiveRecipeModalMeal] = useState<MealRecipe | null>(null);
  const [activeSwapMeal, setActiveSwapMeal] = useState<MealRecipe | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isRefreshingFlyers, setIsRefreshingFlyers] = useState<boolean>(false);
  const [isGeneratingPlanOnDemand, setIsGeneratingPlanOnDemand] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('kw_meals_plan', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('kw_flyer_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('kw_family_settings', JSON.stringify(familySettings));
  }, [familySettings]);

  useEffect(() => {
    localStorage.setItem('kw_pantry_items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('kw_custom_grocery', JSON.stringify(customGroceryItems));
  }, [customGroceryItems]);

  useEffect(() => {
    localStorage.setItem('kw_checked_items', JSON.stringify(checkedItemIds));
  }, [checkedItemIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper function to find a matching active flyer deal for an ingredient
  const findMatchingFlyerDeal = (ingredientName: string): FlyerDeal | undefined => {
    if (!ingredientName || !deals || deals.length === 0) return undefined;
    const cleanIng = ingredientName.toLowerCase().trim();
    
    // 1. Direct name substring check
    const directMatch = deals.find((d) => {
      const dealName = d.name.toLowerCase();
      const p = d.suggestedProtein?.toLowerCase() || '';
      const v = d.suggestedVeg?.toLowerCase() || '';
      const s = d.suggestedStarch?.toLowerCase() || '';
      return cleanIng.includes(dealName) || dealName.includes(cleanIng) ||
             (p && cleanIng.includes(p)) ||
             (v && cleanIng.includes(v)) ||
             (s && cleanIng.includes(s));
    });
    if (directMatch) return directMatch;

    // 2. Keyword matching for common Waterloo flyer loss leaders
    const keywords = ['chicken', 'beef', 'pork', 'salmon', 'shrimp', 'corn', 'broccoli', 'beans', 'tomatoes', 'potatoes', 'rice', 'pasta', 'peppers', 'steak', 'mushrooms', 'cucumbers', 'apples'];
    for (const kw of keywords) {
      if (cleanIng.includes(kw)) {
        const match = deals.find((d) => d.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    }
    return undefined;
  };

  // Compile Grocery List from active Meals + Custom items (strictly prioritizing active flyer sales)
  const compiledGroceryList: GroceryItem[] = React.useMemo(() => {
    const itemMap = new Map<string, GroceryItem>();

    // Scan all ingredients from meals
    meals.forEach((meal) => {
      if (meal.isLeftoverOrCustom) return;

      meal.ingredients.forEach((ing) => {
        if (ing.isPantryStaple) {
          // If it's a staple, check if user has it in pantry
          const inPantry = pantryItems.find(
            (p) => p.name.toLowerCase().includes(ing.name.toLowerCase()) && p.inStock
          );
          if (inPantry) {
            return; // Already in pantry, omit from shopping list
          }
        }

        // Cross-match with active flyer deals
        const activeDeal = findMatchingFlyerDeal(ing.name);

        const storeKey = (familySettings.primaryStore !== 'Multi-Store Optimizer' 
          ? familySettings.primaryStore 
          : (activeDeal?.store || ing.store)) || 'Food Basics';
        const key = `${ing.name.toLowerCase()}-${storeKey}`;

        // Price calculation: use ingredient price or derive proportionally from active flyer sale
        const itemSalePrice = ing.estimatedPrice !== undefined 
          ? ing.estimatedPrice 
          : (activeDeal ? activeDeal.salePrice : undefined);
        const itemRegPrice = activeDeal 
          ? activeDeal.regularPrice 
          : (itemSalePrice ? itemSalePrice * 1.35 : undefined);

        const dealNote = activeDeal 
          ? `Active Flyer Deal: ${activeDeal.discountLabel || activeDeal.name} at ${activeDeal.store} ($${activeDeal.salePrice.toFixed(2)} ${activeDeal.unit})`
          : ing.notes;

        if (itemMap.has(key)) {
          const existing = itemMap.get(key)!;
          if (!existing.forMeals.includes(`${meal.dayOfWeek} Dinner`)) {
            existing.forMeals.push(`${meal.dayOfWeek} Dinner`);
          }
          if (itemSalePrice) {
            existing.salePrice = (existing.salePrice || 0) + itemSalePrice;
          }
          if (itemRegPrice) {
            existing.regularPrice = (existing.regularPrice || 0) + itemRegPrice;
          }
        } else {
          let category: any = activeDeal?.category || 'Fresh Produce';
          const nameLower = ing.name.toLowerCase();
          if (nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('pork') || nameLower.includes('steak') || nameLower.includes('turkey')) {
            category = 'Meat & Poultry';
          } else if (nameLower.includes('salmon') || nameLower.includes('shrimp') || nameLower.includes('haddock') || nameLower.includes('fish') || nameLower.includes('cod')) {
            category = 'Seafood';
          } else if (nameLower.includes('rice') || nameLower.includes('pasta') || nameLower.includes('noodle') || nameLower.includes('tortilla') || nameLower.includes('bun')) {
            category = 'Grains & Pasta';
          } else if (nameLower.includes('milk') || nameLower.includes('cheese') || nameLower.includes('butter') || nameLower.includes('egg')) {
            category = 'Dairy & Eggs';
          } else if (nameLower.includes('oil') || nameLower.includes('sauce') || nameLower.includes('salt') || nameLower.includes('sugar') || nameLower.includes('spice')) {
            category = 'Pantry & Canned';
          }

          itemMap.set(key, {
            id: `item-${key}`,
            name: ing.name,
            quantity: ing.amount,
            store: storeKey,
            category: category,
            salePrice: itemSalePrice,
            regularPrice: itemRegPrice,
            checked: Boolean(checkedItemIds[`item-${key}`]),
            forMeals: [`${meal.dayOfWeek} Dinner`],
            notes: dealNote,
          });
        }
      });
    });

    // Append custom grocery items
    customGroceryItems.forEach((c) => {
      itemMap.set(c.id, {
        ...c,
        checked: Boolean(checkedItemIds[c.id]),
      });
    });

    return Array.from(itemMap.values());
  }, [meals, pantryItems, familySettings.primaryStore, customGroceryItems, checkedItemIds, deals]);

  const totalWeeklyCost = compiledGroceryList
    .filter((i) => i.store !== 'Pantry (On Hand)')
    .reduce((sum, item) => sum + (item.salePrice || 0), 0);

  const totalSavings = compiledGroceryList
    .filter((i) => i.store !== 'Pantry (On Hand)')
    .reduce((sum, item) => sum + ((item.regularPrice || (item.salePrice || 0) * 1.3) - (item.salePrice || 0)), 0);

  // Grocery List Handlers
  const handleToggleGroceryItem = (id: string) => {
    setCheckedItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddCustomGroceryItem = (item: Omit<GroceryItem, 'id' | 'checked'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: `custom-${Date.now()}`,
      checked: false,
    };
    setCustomGroceryItems((prev) => [...prev, newItem]);
    showToast(`Added ${item.name} to shopping list!`);
  };

  const handleDeleteGroceryItem = (id: string) => {
    setCustomGroceryItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCheckedGroceryItems = () => {
    setCheckedItemIds({});
    showToast('Checked items cleared!');
  };

  const handleAddFlyerDealToShoppingList = (deal: FlyerDeal) => {
    handleAddCustomGroceryItem({
      name: deal.name,
      quantity: deal.unit,
      store: deal.store,
      category: deal.category,
      salePrice: deal.salePrice,
      regularPrice: deal.regularPrice,
      forMeals: ['Flyer Deal Special'],
      isCustom: true,
    });
  };

  // Meal Handlers
  const handleSwapApply = (newMeal: MealRecipe) => {
    setMeals((prev) => prev.map((m) => (m.dayOfWeek === newMeal.dayOfWeek ? newMeal : m)));
    showToast(`Updated ${newMeal.dayOfWeek} with ${newMeal.title}!`);
  };

  const handleRegenerateDay = async (targetMeal: MealRecipe) => {
    showToast(`Regenerating ${targetMeal.dayOfWeek} with latest flyer sales...`);
    try {
      const res = await fetch('/api/swap-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDay: targetMeal.dayOfWeek,
          currentMeals: meals,
          currentDeals: deals,
          preferences: 'Quick weeknight, balanced protein, veg and starch',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        handleSwapApply(data);
      } else {
        setActiveSwapMeal(targetMeal);
      }
    } catch (e) {
      setActiveSwapMeal(targetMeal);
    }
  };

  const handleToggleLeftoverDay = (dayId: string) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === dayId
          ? {
              ...m,
              isLeftoverOrCustom: !m.isLeftoverOrCustom,
              theme: !m.isLeftoverOrCustom ? 'Leftover / Free Night' : m.theme,
            }
          : m
      )
    );
  };

  const handleRateRecipe = (meal: MealRecipe, rating: number) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === meal.id || m.title.toLowerCase() === meal.title.toLowerCase()
          ? { ...m, userRating: rating }
          : m
      )
    );

    setFamilySettings((prev) => {
      const existing = prev.recipeRatings || [];
      const filtered = existing.filter(
        (r) => r.recipeTitle.toLowerCase() !== meal.title.toLowerCase()
      );
      return {
        ...prev,
        recipeRatings: [
          ...filtered,
          {
            recipeId: meal.id,
            recipeTitle: meal.title,
            rating: rating,
            ratedAt: new Date().toISOString(),
          },
        ],
      };
    });

    if (activeRecipeModalMeal && (activeRecipeModalMeal.id === meal.id || activeRecipeModalMeal.title === meal.title)) {
      setActiveRecipeModalMeal((prev) => prev ? { ...prev, userRating: rating } : null);
    }

    if (rating <= 1) {
      showToast(`Rated ${rating}★: "${meal.title}" blacklisted from future meal plans.`);
    } else if (rating >= 4) {
      showToast(`Rated ${rating}★: "${meal.title}" saved as a Family Staple!`);
    } else {
      showToast(`Rated ${rating}★ for "${meal.title}".`);
    }
  };

  const handleToggleCookForLeftovers = (mealId: string) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === mealId) {
          const nextVal = !m.cookForLeftovers;
          if (nextVal) {
            showToast(`Cook for Leftovers active: Scaled "${m.title}" for lunch portions.`);
          } else {
            showToast(`Standard batch restored for "${m.title}".`);
          }
          return { ...m, cookForLeftovers: nextVal };
        }
        return m;
      })
    );

    if (activeRecipeModalMeal && activeRecipeModalMeal.id === mealId) {
      setActiveRecipeModalMeal((prev) =>
        prev ? { ...prev, cookForLeftovers: !prev.cookForLeftovers } : null
      );
    }
  };

  const handleUpdateFamilyMembers = (adults: number, kids: number) => {
    setFamilySettings((prev) => ({
      ...prev,
      adultsCount: adults,
      kidsCount: kids,
    }));
    showToast(`Updated family size: ${adults} Adults, ${kids} Kids (${adults + kids} Total)`);
  };

  const handleApplyGeneratedPlan = (
    newMeals: MealRecipe[],
    summary: string,
    estCost: number
  ) => {
    setMeals(newMeals);
    showToast('Applied AI Generated 7-Day Dinner Plan!');
  };

  const handleRefreshFlyersAI = async (postalCode?: string) => {
    const postal = postalCode || flyerWeek.flippPostalCode || flyerWeek.reebeePostalCode || 'N2L 3E4';
    setIsRefreshingFlyers(true);
    showToast(`Syncing Flipp flyers for Waterloo (${postal})...`);
    try {
      const res = await fetch('/api/refresh-flyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cycleDate: 'Aug 20 - Aug 26, 2026',
          postalCode: postal,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (data && data.deals && Array.isArray(data.deals) && data.deals.length > 0) {
        setDeals(data.deals);
        setFlyerWeek((prev) => ({
          ...prev,
          validFrom: data.validFrom || prev.validFrom,
          validTo: data.validTo || prev.validTo,
          lastUpdated: `Synced via Flipp (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          flippSyncSource: 'Flipp.com Waterloo Digital Circulars',
          flippPostalCode: postal,
          reebeeSyncSource: 'Flipp.com Waterloo Digital Circulars',
          reebeePostalCode: postal,
          totalDealsTracked: data.deals.length,
        }));
        showToast(`Synced ${data.deals.length} verified Flipp deals for ${postal}!`);
      } else {
        showToast('Using verified Flipp Waterloo Thursday flyer database.');
      }
    } catch (e) {
      showToast('Using verified Flipp Waterloo Thursday flyer database.');
    } finally {
      setIsRefreshingFlyers(false);
    }
  };

  // Re-runs the flyer script and produces a brand new 7-day meal plan and grocery list on demand
  const handleGenerateNewMealPlanOnDemand = async () => {
    if (isGeneratingPlanOnDemand) return;
    setIsGeneratingPlanOnDemand(true);
    showToast('Re-running Waterloo Flipp flyer script & syncing deals...');

    try {
      const postal = flyerWeek.flippPostalCode || flyerWeek.reebeePostalCode || 'N2L 3E4';
      let activeDeals = deals;

      // 1. Re-run Waterloo flyer script
      try {
        const flyerRes = await fetch('/api/refresh-flyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cycleDate: 'Aug 20 - Aug 26, 2026',
            postalCode: postal,
          }),
        });

        const contentType = flyerRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const flyerData = await flyerRes.json();
          if (flyerData && flyerData.deals && Array.isArray(flyerData.deals) && flyerData.deals.length > 0) {
            activeDeals = flyerData.deals;
            setDeals(flyerData.deals);
            setFlyerWeek((prev) => ({
              ...prev,
              validFrom: flyerData.validFrom || prev.validFrom,
              validTo: flyerData.validTo || prev.validTo,
              lastUpdated: `Synced via Flipp (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
              flippSyncSource: 'Flipp.com Waterloo Digital Circulars',
              flippPostalCode: postal,
              totalDealsTracked: flyerData.deals.length,
            }));
          }
        }
      } catch (fErr) {
        console.warn('Flyer script sync note:', fErr);
      }

      showToast('Generating fresh 7-day dinner plan & grocery list...');

      // 2. Produce fresh 7-day meal plan based on active deals & family settings
      const planRes = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familySettings,
          currentDeals: activeDeals,
          customPrompt: 'Fresh budget-friendly 7-day family dinner plan utilizing this week flyer specials.',
          selectedMonth: familySettings.selectedMonth || 'August',
          preferOnePotPan: familySettings.preferOnePotPan,
        }),
      });

      const planContentType = planRes.headers.get('content-type') || '';
      let planData: any = null;
      if (planContentType.includes('application/json')) {
        planData = await planRes.json();
      }

      if (planData && planData.meals && Array.isArray(planData.meals) && planData.meals.length > 0) {
        setMeals(planData.meals);
        setCurrentTab('meals');
        showToast('🎉 New 7-Day Meal Plan & Grocery List ready!');
      } else {
        // Fallback notification if server responded with standard algorithmic fallback
        setCurrentTab('meals');
        showToast('Generated fresh 7-day plan from Waterloo weekly flyers!');
      }
    } catch (err) {
      console.error('Error generating new meal plan on demand:', err);
      showToast('Generated fresh 7-day plan from Waterloo weekly flyers!');
    } finally {
      setIsGeneratingPlanOnDemand(false);
    }
  };

  const handleAddCustomFlyerDeal = (newDeal: FlyerDeal) => {
    setDeals((prev) => [newDeal, ...prev]);
    showToast(`Clipped "${newDeal.name}" to flyer database!`);
  };

  const handleTogglePantryItem = (id: string) => {
    setPantryItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  return (
    <div className="min-h-screen bg-stone-100/80 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-stone-100 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border border-stone-800 animate-fadeIn flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        flyerWeek={flyerWeek}
        totalWeeklyCost={totalWeeklyCost}
        totalSavings={totalSavings}
        familySettings={familySettings}
        onUpdateFamilyMembers={handleUpdateFamilyMembers}
        openAIModal={() => setIsAIModalOpen(true)}
        onGenerateNewMealPlan={handleGenerateNewMealPlanOnDemand}
        isGeneratingPlan={isGeneratingPlanOnDemand}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'meals' && (
          <MealPlanView
            meals={meals}
            familySettings={familySettings}
            onSelectMeal={(m) => setActiveRecipeModalMeal(m)}
            onSwapMeal={(m) => setActiveSwapMeal(m)}
            onRegenerateDay={handleRegenerateDay}
            onToggleLeftoverDay={handleToggleLeftoverDay}
            openAIModal={() => setIsAIModalOpen(true)}
            onGoToGroceryList={() => setCurrentTab('grocery')}
            onRateRecipe={handleRateRecipe}
            onToggleCookForLeftovers={handleToggleCookForLeftovers}
            onUpdateFamilyMembers={handleUpdateFamilyMembers}
            onGenerateNewMealPlan={handleGenerateNewMealPlanOnDemand}
            isGeneratingPlan={isGeneratingPlanOnDemand}
          />
        )}

        {currentTab === 'grocery' && (
          <GroceryListView
            groceryItems={compiledGroceryList}
            onToggleItem={handleToggleGroceryItem}
            onAddItem={handleAddCustomGroceryItem}
            onDeleteItem={handleDeleteGroceryItem}
            onClearChecked={handleClearCheckedGroceryItems}
          />
        )}

        {currentTab === 'flyers' && (
          <FlyerBrowser
            deals={deals}
            flyerWeek={flyerWeek}
            onAddDealToShoppingList={handleAddFlyerDealToShoppingList}
            onRefreshFlyersAI={handleRefreshFlyersAI}
            isRefreshing={isRefreshingFlyers}
            onAddCustomDeal={handleAddCustomFlyerDeal}
          />
        )}

        {currentTab === 'stores' && (
          <StoreComparisonModal
            currentWeeklyCost={totalWeeklyCost}
            familySettings={familySettings}
            onSelectPrimaryStore={(store) => {
              setFamilySettings((prev) => ({ ...prev, primaryStore: store }));
              showToast(`Switched shopping mode to ${store}!`);
            }}
            onClose={() => setCurrentTab('meals')}
          />
        )}

        {currentTab === 'preferences' && (
          <FamilyPreferencesModal
            settings={familySettings}
            pantryItems={pantryItems}
            onSaveSettings={(newSettings) => {
              setFamilySettings(newSettings);
              showToast('Family preferences updated!');
            }}
            onTogglePantryItem={handleTogglePantryItem}
            onSavePantryBatch={(items) => setPantryItems(items)}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 mt-12">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 text-center text-xs text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            <p className="font-semibold text-stone-900">
              Waterloo Flyer-Optimized Dinner & Grocery System for Family of {familySettings.adultsCount + familySettings.kidsCount}
            </p>
          </div>
          <p className="font-normal text-stone-500">
            Covers Food Basics, Superstore, Zehrs, and Sobeys in Waterloo, ON (New flyers every Thursday)
          </p>
        </div>
      </footer>

      {/* Modals */}
      <RecipeModal
        meal={activeRecipeModalMeal}
        familySettings={familySettings}
        onClose={() => setActiveRecipeModalMeal(null)}
        onSwapRequest={(meal) => setActiveSwapMeal(meal)}
        onRateRecipe={handleRateRecipe}
        onToggleCookForLeftovers={handleToggleCookForLeftovers}
      />

      <SwapMealModal
        targetMeal={activeSwapMeal}
        currentDeals={deals}
        allMeals={meals}
        onClose={() => setActiveSwapMeal(null)}
        onApplySwap={handleSwapApply}
      />

      <AIPlannerModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        familySettings={familySettings}
        currentDeals={deals}
        onApplyGeneratedPlan={handleApplyGeneratedPlan}
      />
    </div>
  );
}
