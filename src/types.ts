export type KWStore = 'Food Basics' | 'Real Canadian Superstore' | 'Zehrs' | 'Sobeys';

export type FlyerSourceType = 'direct_store' | 'flipp' | 'hybrid';

export type DealCategory = 
  | 'Meat & Poultry'
  | 'Seafood'
  | 'Fresh Produce'
  | 'Grains & Pasta'
  | 'Dairy & Eggs'
  | 'Pantry & Canned';

export interface FlyerDeal {
  id: string;
  store: KWStore;
  name: string;
  category: DealCategory;
  salePrice: number;
  regularPrice: number;
  unit: string; // e.g. "per lb ($5.49/kg)", "ea", "for 2", "3 lb bag"
  discountLabel?: string; // e.g. "Save $3.00", "50% OFF", "PC Optimum Deal"
  validUntil: string;
  isLossLeader?: boolean; // Hot front-page deal
  packageSize?: string;
  suggestedProtein?: string;
  suggestedVeg?: string;
  suggestedStarch?: string;
  sourceType?: FlyerSourceType; // Direct store official website vs Flipp vs Hybrid
  directStoreVerified?: boolean; // Verified directly on grocery store's official flyer website
  directStoreUrl?: string; // Direct link to store's official online weekly flyer (foodbasics.ca, zehrs.ca, etc.)
  flippVerified?: boolean; // Verified against Flipp Waterloo flyers
  flippUrl?: string; // Direct link or search query URL to Flipp digital flyer
  reebeeVerified?: boolean; // Backwards compatible alias
  reebeeUrl?: string;
  postalCode?: string; // Waterloo postal code e.g. "N2L 3E4"
}

export type CookingStyle = 'one_pot' | 'sheet_pan' | 'skillet' | 'slow_cooker' | 'casserole' | 'standard';

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface SeasonalInfo {
  month: string; // e.g. "August"
  season: Season;
  vibeTitle: string; // e.g. "Late Summer Grill & Sweet Corn Bounty"
  keySeasonalProduce: string[]; // e.g. ["Ontario Sweet Corn", "Field Tomatoes", "Zucchini", "Peaches"]
  cookingVibe: string; // e.g. "Quick sheet pans, BBQ skewers, fresh crisp sides, no-heavy-oven meals"
}

export interface BalancedMealComponent {
  protein: {
    name: string;
    amount: string;
    dealSource?: string;
    onSaleStore?: KWStore;
  };
  vegetables: {
    name: string;
    amount: string;
    dealSource?: string;
    onSaleStore?: KWStore;
  }[];
  starchOrGrain: {
    name: string;
    amount: string;
    dealSource?: string;
    onSaleStore?: KWStore;
  };
}

export interface RecipeRating {
  recipeId: string;
  recipeTitle: string;
  rating: number; // 0 to 5 stars
  ratedAt: string; // ISO date string
  isStaple?: boolean; // 4-5 stars
  isExcluded?: boolean; // 0-1 stars
  notes?: string;
}

export interface MealRecipe {
  id: string;
  title: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  theme: string; // e.g. "20-Min Weeknight Saver", "Sheet Pan Roast", "Family Taco Night", "Slow Cooker Batch"
  servings: number; // default 4 (Young family: 2 adults + 2 kids / 4 portions)
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  estimatedCostTotal: number;
  costPerServing: number;
  isOnePotOrPan?: boolean;
  cookingStyle?: CookingStyle;
  vesselUsed?: string; // e.g. "1 Rimmed Sheet Pan", "1 Large Dutch Oven / Skillet", "Slow Cooker"
  seasonalNote?: string; // e.g. "Uses peak August Ontario sweet corn & zucchini"
  components: BalancedMealComponent;
  ingredients: {
    name: string;
    amount: string;
    isPantryStaple: boolean;
    store?: KWStore;
    estimatedPrice?: number;
    notes?: string;
  }[];
  instructions: string[];
  kidFriendlyTip?: string;
  makeAheadTip?: string;
  dealsUsed: string[]; // List of deal names or store promos leveraged
  isLeftoverOrCustom?: boolean;
  userRating?: number; // 0 to 5 stars rating
  cookForLeftovers?: boolean; // Checkbox to scale recipe size for extra leftover lunch portions
  ratingNotes?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: DealCategory | 'Pantry Staples' | 'Other';
  quantity: string;
  store: KWStore | 'Pantry (On Hand)';
  salePrice?: number;
  regularPrice?: number;
  checked: boolean;
  forMeals: string[]; // e.g. ["Monday Dinner", "Wednesday Dinner"]
  notes?: string;
  isCustom?: boolean;
}

export interface FamilySettings {
  adultsCount: number;
  kidsCount: number;
  primaryStore: KWStore | 'Multi-Store Optimizer';
  enabledStores: KWStore[];
  maxCookTimeMinutes: number;
  budgetWeeklyTarget: number;
  kidPickyLevel: 'Standard' | 'Picky Toddler Friendly' | 'Adventurous';
  dietaryPreferences: string[]; // e.g. "Low Sodium", "Nut-Free", "High Protein", "Gluten-Friendly"
  includeLeftoverDay: boolean;
  preferOnePotPan?: boolean; // Toggle for 1-pot / 1-pan / sheet-pan recipes
  selectedMonth: string; // e.g. "August"
  recipeRatings?: Record<string, RecipeRating>; // Ratings database for recipe intelligence
  flyerSourcePreference?: FlyerSourceType; // 'direct_store' | 'flipp' | 'hybrid'
}

export interface PantryItem {
  id: string;
  name: string;
  category: 'Oils & Vinegars' | 'Spices & Seasonings' | 'Condiments & Sauces' | 'Baking & Dry' | 'Canned & Broths';
  inStock: boolean;
}

export interface FlyerWeekInfo {
  cycleName: string;
  validFrom: string; // e.g., "Thursday, Aug 20, 2026"
  validTo: string;   // e.g., "Wednesday, Aug 26, 2026"
  shortRange?: string; // e.g., "Aug 20 – Aug 26"
  location: string;  // "Waterloo, ON"
  lastUpdated: string;
  activeSource: FlyerSourceType; // 'direct_store' | 'flipp' | 'hybrid'
  directStoreSyncSource?: string; // e.g. "Official Store Portals (FoodBasics.ca, Zehrs.ca, RealCanadianSuperstore.ca, Sobeys.com)"
  flippSyncSource?: string; // e.g. "Flipp Digital Circulars (Waterloo, ON)"
  flippPostalCode?: string; // e.g. "N2L 3E4"
  reebeeSyncSource?: string; // Backwards compatible alias
  reebeePostalCode?: string;
  totalDealsTracked?: number;
  isCurrentCycleVerified?: boolean;
}
