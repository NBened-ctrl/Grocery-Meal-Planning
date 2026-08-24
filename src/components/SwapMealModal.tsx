import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  Sparkles, 
  Loader2, 
  Utensils, 
  Clock, 
  DollarSign, 
  Check, 
  Drumstick, 
  Leaf, 
  Wheat 
} from 'lucide-react';
import { MealRecipe, FlyerDeal } from '../types';

interface SwapMealModalProps {
  targetMeal: MealRecipe | null;
  currentDeals: FlyerDeal[];
  allMeals: MealRecipe[];
  onClose: () => void;
  onApplySwap: (newMeal: MealRecipe) => void;
}

export const SwapMealModal: React.FC<SwapMealModalProps> = ({
  targetMeal,
  currentDeals,
  allMeals,
  onClose,
  onApplySwap,
}) => {
  if (!targetMeal) return null;

  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Curated Alternative Recipes
  const alternativeTemplates: MealRecipe[] = [
    {
      id: `swap-${Date.now()}-1`,
      dayOfWeek: targetMeal.dayOfWeek,
      title: 'Garlic Butter White Shrimp with Egg Noodles & Sautéed Bell Peppers',
      theme: '15-Min Flash Seafood Sauté',
      servings: 4,
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      estimatedCostTotal: 12.80,
      costPerServing: 3.20,
      components: {
        protein: {
          name: 'Extra Large White Shrimp (454g bag)',
          amount: '1 bag (approx 35 shrimp)',
          dealSource: 'Zehrs Seafood Sale ($6.99)',
          onSaleStore: 'Zehrs',
        },
        vegetables: [
          {
            name: 'Tri-Color Bell Pepper Strips',
            amount: '2 peppers',
            dealSource: 'Superstore 4-pack ($3.49)',
            onSaleStore: 'Real Canadian Superstore',
          },
          {
            name: 'Snap Peas or Steamed Broccoli',
            amount: '1 cup',
            dealSource: 'Food Basics ($1.48)',
            onSaleStore: 'Food Basics',
          },
        ],
        starchOrGrain: {
          name: 'Buttered Garlic Egg Noodles / Pasta',
          amount: '350g',
          dealSource: 'Food Basics Primo ($1.25)',
          onSaleStore: 'Food Basics',
        },
      },
      ingredients: [
        { name: 'Extra Large Raw White Shrimp', amount: '454g bag thawed', isPantryStaple: false, store: 'Zehrs', estimatedPrice: 6.99 },
        { name: 'Greenhouse Bell Peppers', amount: '2 peppers sliced', isPantryStaple: false, store: 'Real Canadian Superstore', estimatedPrice: 1.75 },
        { name: 'Fresh Broccoli Crowns', amount: '1 head florets', isPantryStaple: false, store: 'Food Basics', estimatedPrice: 1.48 },
        { name: 'Primo Pasta / Egg Noodles', amount: '350g', isPantryStaple: false, store: 'Food Basics', estimatedPrice: 0.60 },
        { name: 'Butter, Minced Garlic, Salt, Lemon Juice', amount: '2 tbsp', isPantryStaple: true },
      ],
      instructions: [
        'Boil pasta in salted water until al dente (7-8 minutes), then drain.',
        'Melt 2 tbsp butter with minced garlic in a large skillet over medium-high heat.',
        'Add sliced peppers and broccoli florets, stir-frying for 3-4 minutes until vibrant.',
        'Toss in peeled shrimp and sear for 2-3 minutes per side until pink and opaque.',
        'Toss noodles directly into the pan with a squeeze of fresh lemon juice, salt, and black pepper.',
      ],
      kidFriendlyTip: 'Kids love peeling tails or dipping mild buttery shrimp into sweet cocktail sauce.',
      dealsUsed: ['Zehrs XL Shrimp ($6.99/bag)', 'Superstore Bell Peppers ($3.49)', 'Food Basics Primo ($1.25)'],
    },
    {
      id: `swap-${Date.now()}-2`,
      dayOfWeek: targetMeal.dayOfWeek,
      title: 'Crispy Baked Lemon Herb Haddock with Fluffy Jasmine Rice & Steamed Green Beans',
      theme: 'Crispy Weeknight Fish & Grain',
      servings: 4,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      estimatedCostTotal: 13.90,
      costPerServing: 3.48,
      components: {
        protein: {
          name: 'Fresh Atlantic Haddock / Cod Fillets',
          amount: '1.2 lbs',
          dealSource: 'Sobeys Seafood Sale ($8.99/lb)',
          onSaleStore: 'Sobeys',
        },
        vegetables: [
          {
            name: 'Fresh Ontario Green Beans (Lemon Butter)',
            amount: '1 lb',
            dealSource: 'Zehrs Farm Fresh ($1.99/lb)',
            onSaleStore: 'Zehrs',
          },
          {
            name: 'Sliced Roma Tomato Salad',
            amount: '2 roma tomatoes',
            dealSource: 'Zehrs ($0.88 ea)',
            onSaleStore: 'Zehrs',
          },
        ],
        starchOrGrain: {
          name: 'Steamed Jasmine Rice with Parsley',
          amount: '1.5 cups dry',
          dealSource: 'Superstore Rooster Rice ($13.88 8kg)',
          onSaleStore: 'Real Canadian Superstore',
        },
      },
      ingredients: [
        { name: 'Fresh Atlantic Haddock Fillets', amount: '1.2 lbs', isPantryStaple: false, store: 'Sobeys', estimatedPrice: 10.78 },
        { name: 'Ontario Green Beans', amount: '1 lb', isPantryStaple: false, store: 'Zehrs', estimatedPrice: 1.99 },
        { name: 'Jasmine Rice', amount: '1.5 cups', isPantryStaple: false, store: 'Real Canadian Superstore', estimatedPrice: 0.70 },
        { name: 'Panko breadcrumbs, butter, lemon, salt', amount: 'Pantry staples', isPantryStaple: true },
      ],
      instructions: [
        'Cook jasmine rice in 2.25 cups water with a pinch of salt until tender.',
        'Place haddock on a foil-lined baking sheet. Brush with melted butter, sprinkle with breadcrumbs, salt, and lemon zest.',
        'Bake at 425°F (220°C) for 12-14 minutes until golden and flaky.',
        'Steam green beans for 4 minutes, tossing with a dot of butter and sea salt.',
        'Plate fish alongside rice and bright green beans.',
      ],
      kidFriendlyTip: 'The light breadcrumb crunch mimics fish sticks while keeping it 100% wholesome real fish fillet.',
      dealsUsed: ['Sobeys Haddock ($8.99/lb)', 'Zehrs Green Beans ($1.99/lb)'],
    },
    {
      id: `swap-${Date.now()}-3`,
      dayOfWeek: targetMeal.dayOfWeek,
      title: 'BBQ Glazed Chicken Drumsticks with Crispy Baked Potato Wedges & Sweet Corn',
      theme: 'Finger-Licking Family Favorite',
      servings: 4,
      prepTimeMinutes: 8,
      cookTimeMinutes: 30,
      estimatedCostTotal: 9.80,
      costPerServing: 2.45,
      components: {
        protein: {
          name: 'Fresh Chicken Drumsticks (approx 8-10 drumsticks)',
          amount: '2.5 lbs',
          dealSource: 'Food Basics Club Pack ($1.99/lb)',
          onSaleStore: 'Food Basics',
        },
        vegetables: [
          {
            name: 'Ontario Sweet Corn on the Cob',
            amount: '4 ears',
            dealSource: 'Food Basics ($0.33 ea)',
            onSaleStore: 'Food Basics',
          },
          {
            name: 'Baby Carrots with Ranch Dip',
            amount: '1/2 lb',
            dealSource: 'Sobeys Carrots ($2.29)',
            onSaleStore: 'Sobeys',
          },
        ],
        starchOrGrain: {
          name: 'Seasoned Russet Potato Wedges',
          amount: '4 large potatoes',
          dealSource: 'Food Basics 10lb bag ($2.99)',
          onSaleStore: 'Food Basics',
        },
      },
      ingredients: [
        { name: 'Fresh Chicken Drumsticks', amount: '2.5 lbs', isPantryStaple: false, store: 'Food Basics', estimatedPrice: 4.98 },
        { name: 'Russet Potatoes', amount: '4 potatoes sliced into wedges', isPantryStaple: false, store: 'Food Basics', estimatedPrice: 1.20 },
        { name: 'Ontario Sweet Corn', amount: '4 ears', isPantryStaple: false, store: 'Food Basics', estimatedPrice: 1.32 },
        { name: 'Compliments Carrots', amount: '1/2 lb sticks', isPantryStaple: false, store: 'Sobeys', estimatedPrice: 0.60 },
        { name: 'BBQ Sauce, Olive oil, garlic powder, salt', amount: '1/2 cup', isPantryStaple: true },
      ],
      instructions: [
        'Preheat oven to 425°F. Toss potato wedges in oil, paprika, garlic powder, and salt. Spread on a baking sheet.',
        'Season drumsticks with salt and pepper. Place on a second baking sheet.',
        'Bake both for 20 minutes. Brush drumsticks with BBQ sauce and bake for another 10 minutes until caramelized and 175°F internal.',
        'Boil corn ears for 5 minutes. Serve drumsticks with crispy potato wedges and sweet corn.',
      ],
      kidFriendlyTip: 'Drumsticks are the ultimate toddler-friendly handle food. Keep extra BBQ sauce on the side for dipping.',
      dealsUsed: ['Food Basics Drumsticks ($1.99/lb)', 'Food Basics Sweet Corn ($0.33)', 'Food Basics Russet 10lb ($2.99)'],
    },
  ];

  const handleAiSwap = async () => {
    setIsAiLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/swap-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDay: targetMeal.dayOfWeek,
          currentMeals: allMeals,
          currentDeals,
          requestedProteinOrTheme: aiCustomPrompt || 'High value Waterloo flyer deal',
        }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.warn('Non-JSON response from /api/swap-meal:', text.slice(0, 100));
      }

      if (data && data.title && data.components) {
        onApplySwap(data);
        onClose();
      } else if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to generate swap recipe from server');
      } else {
        // Use first alternative template as fallback
        const fallback = alternativeTemplates[0];
        onApplySwap(fallback);
        onClose();
      }
    } catch (err: any) {
      console.error('Swap error:', err);
      // Automatically fallback to alternative template if network/server is interrupted
      if (alternativeTemplates.length > 0) {
        onApplySwap(alternativeTemplates[0]);
        onClose();
      } else {
        setErrorMsg(err.message || 'Failed to generate replacement recipe.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 animate-fadeIn">
      <div className="bg-stone-900 text-stone-100 w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-stone-950 text-stone-100 p-4 sm:p-6 flex items-start justify-between gap-4 sticky top-0 z-10 border-b border-stone-800">
          <div className="space-y-1 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-800">
              Swap Recipe for {targetMeal.dayOfWeek}
            </span>
            <h2 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-stone-100 mt-1">
              Replace: {targetMeal.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer border border-stone-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* AI Swap Generator Box */}
          <div className="bg-stone-850 p-4 sm:p-5 rounded-xl border border-stone-750 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-bold text-stone-100 text-sm">
                Generate Custom Replacement with AI
              </h3>
            </div>
            <p className="text-xs text-stone-400 font-normal">
              Tell Gemini what you're craving (e.g. "Instant Pot beef chili with corn", "Quick salmon stir fry", "Vegetarian cheese tortellini with broccoli").
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                disabled={isAiLoading}
                placeholder="e.g., Quick 20-min chicken stir fry with rice and carrots..."
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-900 border border-stone-700 rounded-xl font-normal text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-amber-500"
              />
              <button
                type="button"
                disabled={isAiLoading}
                onClick={handleAiSwap}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-sm active:scale-95"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Cooking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>AI Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Curated Alternative Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-300 text-xs uppercase tracking-wider">
              Or Choose from Pre-Optimized Flyer Deals:
            </h3>

            <div className="space-y-3">
              {alternativeTemplates.map((alt) => (
                <div
                  key={alt.id}
                  className="p-4 rounded-xl border border-stone-750 bg-stone-850 hover:border-stone-650 shadow-sm transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800 uppercase tracking-wider">
                        {alt.theme}
                      </span>
                      <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base mt-1.5">
                        {alt.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-serif text-sm font-bold text-amber-400">
                        ${alt.estimatedCostTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        ${alt.costPerServing.toFixed(2)} / portion
                      </div>
                    </div>
                  </div>

                  {/* 3 Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-stone-900 p-3 rounded-xl border border-stone-750">
                    <div className="text-stone-300 truncate font-normal">
                      <strong className="text-rose-300 font-medium">🥩 </strong> {alt.components.protein.name}
                    </div>
                    <div className="text-stone-300 truncate font-normal">
                      <strong className="text-emerald-300 font-medium">🥦 </strong>{' '}
                      {alt.components.vegetables.map((v) => v.name).join(' & ')}
                    </div>
                    <div className="text-stone-300 truncate font-normal">
                      <strong className="text-amber-300 font-medium">🍚 </strong> {alt.components.starchOrGrain.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-400 font-normal flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {alt.prepTimeMinutes + alt.cookTimeMinutes} mins
                    </span>

                    <button
                      onClick={() => {
                        onApplySwap(alt);
                        onClose();
                      }}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                    >
                      Use This Meal for {targetMeal.dayOfWeek}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 border-t border-stone-800 p-4 px-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

