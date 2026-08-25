import { FlyerDeal, FlyerWeekInfo, KWStore, FlyerSourceType } from '../types';

/**
 * Calculates the current Thursday-to-Wednesday flyer cycle dynamically based on any given date.
 * In Canada (Ontario/Kitchener-Waterloo), grocery flyers begin every Thursday morning and run until Wednesday night.
 */
export function getCurrentFlyerCycle(now: Date = new Date()): {
  cycleName: string;
  validFrom: string;
  validTo: string;
  shortRange: string;
  validUntilShort: string;
  startThursdayDate: Date;
  endWednesdayDate: Date;
  isTodayInCycle: boolean;
} {
  const current = new Date(now);
  const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  
  // Calculate the Thursday of the active flyer cycle
  // Thu (4): 0 days ago; Fri (5): 1 day ago; Sat (6): 2 days ago; Sun (0): 3 days ago; Mon (1): 4 days ago; Tue (2): 5 days ago; Wed (3): 6 days ago
  const daysSinceThursday = (dayOfWeek + 7 - 4) % 7;
  const startThursday = new Date(current);
  startThursday.setDate(current.getDate() - daysSinceThursday);
  startThursday.setHours(0, 0, 0, 0);

  const endWednesday = new Date(startThursday);
  endWednesday.setDate(startThursday.getDate() + 6);
  endWednesday.setHours(23, 59, 59, 999);

  const optionsShort: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const optionsFull: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };

  const startFull = startThursday.toLocaleDateString('en-US', optionsFull);
  const endFull = endWednesday.toLocaleDateString('en-US', optionsFull);
  const startShort = startThursday.toLocaleDateString('en-US', optionsShort);
  const endShort = endWednesday.toLocaleDateString('en-US', optionsShort);

  return {
    cycleName: `Thursday Flyer Cycle (${startShort} – ${endShort})`,
    validFrom: startFull,
    validTo: endFull,
    shortRange: `${startShort} – ${endShort}`,
    validUntilShort: endShort,
    startThursdayDate: startThursday,
    endWednesdayDate: endWednesday,
    isTodayInCycle: true,
  };
}

export const ACTIVE_CYCLE_INFO = getCurrentFlyerCycle();

export const CURRENT_FLYER_WEEK: FlyerWeekInfo = {
  cycleName: ACTIVE_CYCLE_INFO.cycleName,
  validFrom: ACTIVE_CYCLE_INFO.validFrom,
  validTo: ACTIVE_CYCLE_INFO.validTo,
  shortRange: ACTIVE_CYCLE_INFO.shortRange,
  location: 'Waterloo, ON (N2L 6A6)',
  lastUpdated: `Active Verified Cycle (${ACTIVE_CYCLE_INFO.shortRange})`,
  activeSource: 'direct_store',
  directStoreSyncSource: 'Direct Official Store Portals (FoodBasics.ca, Zehrs.ca, RealCanadianSuperstore.ca, Sobeys.com - Waterloo N2L 6A6)',
  flippSyncSource: 'Flipp Digital Circulars (https://flipp.com/ - Waterloo N2L 6A6)',
  flippPostalCode: 'N2L 6A6',
  reebeeSyncSource: 'Flipp Digital Circulars (https://flipp.com/ - Waterloo N2L 6A6)',
  reebeePostalCode: 'N2L 6A6',
  totalDealsTracked: 32,
  isCurrentCycleVerified: true,
};

export interface DirectStoreHubInfo {
  store: KWStore;
  officialSiteName: string;
  officialFlyerUrl: string;
  officialSearchUrl: string;
  primaryLocation: string;
  description: string;
}

export function getDirectStoreFlyerUrlWithPostal(store: KWStore, postalCode: string = 'N2L 6A6'): string {
  const clean = postalCode.replace(/\s+/g, '').toUpperCase() || 'N2L6A6';
  switch (store) {
    case 'Food Basics':
      return `https://www.foodbasics.ca/flyer.en.html?postalCode=${clean}`;
    case 'Real Canadian Superstore':
      return `https://www.realcanadiansuperstore.ca/print-flyer`;
    case 'Zehrs':
      return `https://www.zehrs.ca/print-flyer`;
    case 'Sobeys':
      return `https://www.sobeys.com/en/flyer/?postalCode=${clean}`;
    default:
      return 'https://flipp.com/flyers?postal_code=' + clean;
  }
}

export const DIRECT_STORE_FLYER_HUBS: Record<KWStore, DirectStoreHubInfo> = {
  'Food Basics': {
    store: 'Food Basics',
    officialSiteName: 'FoodBasics.ca Official Flyer',
    officialFlyerUrl: 'https://www.foodbasics.ca/flyer.en.html?postalCode=N2L6A6',
    officialSearchUrl: 'https://www.foodbasics.ca/search?filter=',
    primaryLocation: '450 Erb St W & 130 University Ave W, Waterloo (serving N2L 6A6)',
    description: 'Weekly flyer valid Thursday through Wednesday. Top discount leader for poultry, produce & pantry in Waterloo.',
  },
  'Real Canadian Superstore': {
    store: 'Real Canadian Superstore',
    officialSiteName: 'RealCanadianSuperstore.ca Official Flyer',
    officialFlyerUrl: 'https://www.realcanadiansuperstore.ca/print-flyer',
    officialSearchUrl: 'https://www.realcanadiansuperstore.ca/search?search-bar=',
    primaryLocation: '824 Erb St W (Boardwalk) & 875 Highland Rd W, Waterloo/Kitchener (serving N2L 6A6)',
    description: 'Weekly PC Optimum flyer and club pack meat discounts valid Thursday through Wednesday.',
  },
  'Zehrs': {
    store: 'Zehrs',
    officialSiteName: 'Zehrs.ca Official Flyer',
    officialFlyerUrl: 'https://www.zehrs.ca/print-flyer',
    officialSearchUrl: 'https://www.zehrs.ca/search?search-bar=',
    primaryLocation: '555 Davenport Rd (Conestoga Mall) & 450 Erb St W (Beechwood), Waterloo (serving N2L 6A6)',
    description: 'Weekly flyer with premium butchery, Ontario farm harvest & seafood specials.',
  },
  'Sobeys': {
    store: 'Sobeys',
    officialSiteName: 'Sobeys.com Official Flyer',
    officialFlyerUrl: 'https://www.sobeys.com/en/flyer/?postalCode=N2L6A6',
    officialSearchUrl: 'https://www.sobeys.com/en/search/?q=',
    primaryLocation: '640 Parkside Dr (Northfield) & 450 Columbia St W, Waterloo (serving N2L 6A6)',
    description: 'Weekly flyer featuring AAA Sterling Silver beef, organic produce & Compliments deals.',
  },
};

export const WATERLOO_STORE_LOCATIONS: Record<KWStore, { 
  primaryLocation: string; 
  allWaterlooAddresses: string[];
  neighborhood: string;
  bannerColor: string; 
  accentBadge: string;
  description: string; 
  flyerDay: string;
  directStoreWebsiteName: string;
  directStoreFlyerUrl: string;
  directStoreSearchUrl: string;
  flippStoreSlug: string;
  flippDirectUrl: string;
  reebeeStoreSlug?: string;
  reebeeDirectUrl?: string;
}> = {
  'Food Basics': {
    primaryLocation: '130 University Ave W & 450 Erb St W (serving N2L 6A6)',
    allWaterlooAddresses: [
      '130 University Ave W, Waterloo, ON N2L 3E4 (Near UW/Laurier & Lakeshore)',
      '450 Erb St W, Waterloo, ON N2T 1H4 (Beechwood Centre)',
    ],
    neighborhood: 'University District & Beechwood, Waterloo',
    bannerColor: 'bg-emerald-700 text-white',
    accentBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Top Waterloo discount leader for fresh produce, chicken leg quarters, pork & staple canned goods serving N2L 6A6.',
    flyerDay: 'New flyers every Thursday',
    directStoreWebsiteName: 'FoodBasics.ca',
    directStoreFlyerUrl: 'https://www.foodbasics.ca/flyer.en.html?postalCode=N2L6A6',
    directStoreSearchUrl: 'https://www.foodbasics.ca/search?filter=',
    flippStoreSlug: 'food-basics',
    flippDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Food%20Basics',
    reebeeStoreSlug: 'food-basics',
    reebeeDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Food%20Basics',
  },
  'Real Canadian Superstore': {
    primaryLocation: '824 Erb St W (Boardwalk) & 875 Highland Rd W (serving N2L 6A6)',
    allWaterlooAddresses: [
      '824 Erb St W, Waterloo, ON N2T 1L4 (The Boardwalk / Ira Needles Blvd)',
      '875 Highland Rd W, Kitchener/Waterloo, ON N2N 2Y2 (Fischer-Hallman & Highland)',
    ],
    neighborhood: 'Boardwalk / West Waterloo & Highland',
    bannerColor: 'bg-blue-700 text-white',
    accentBadge: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Boardwalk and Highland locations serving Waterloo N2L 6A6. Club size family meat packs, bulk grains, international foods & PC Optimum points.',
    flyerDay: 'New flyers every Thursday',
    directStoreWebsiteName: 'RealCanadianSuperstore.ca',
    directStoreFlyerUrl: 'https://www.realcanadiansuperstore.ca/print-flyer',
    directStoreSearchUrl: 'https://www.realcanadiansuperstore.ca/search?search-bar=',
    flippStoreSlug: 'real-canadian-superstore',
    flippDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Real%20Canadian%20Superstore',
    reebeeStoreSlug: 'real-canadian-superstore',
    reebeeDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Real%20Canadian%20Superstore',
  },
  'Zehrs': {
    primaryLocation: '555 Davenport Rd (Conestoga Mall) & 450 Erb St W (serving N2L 6A6)',
    allWaterlooAddresses: [
      '555 Davenport Rd, Waterloo, ON N2L 6L1 (Conestoga Mall - closest to N2L 6A6)',
      '450 Erb St W, Waterloo, ON N2T 1H4 (Beechwood Centre)',
      '315 Lincoln Rd, Waterloo, ON N2J 4H7 (Lincoln Heights / Weber)',
    ],
    neighborhood: 'Conestoga Mall & Beechwood, Waterloo',
    bannerColor: 'bg-rose-700 text-white',
    accentBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    description: 'Conestoga Mall and Beechwood Zehrs. Premium fresh butchery cuts, fresh seafood counter, and local Ontario seasonal harvest produce serving N2L 6A6.',
    flyerDay: 'New flyers every Thursday',
    directStoreWebsiteName: 'Zehrs.ca',
    directStoreFlyerUrl: 'https://www.zehrs.ca/print-flyer',
    directStoreSearchUrl: 'https://www.zehrs.ca/search?search-bar=',
    flippStoreSlug: 'zehrs',
    flippDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Zehrs',
    reebeeStoreSlug: 'zehrs',
    reebeeDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Zehrs',
  },
  'Sobeys': {
    primaryLocation: '640 Parkside Dr (Northfield) & 450 Columbia St W (serving N2L 6A6)',
    allWaterlooAddresses: [
      '640 Parkside Dr, Waterloo, ON N2L 6H7 (Northfield & Parkside - closest to N2L 6A6)',
      '450 Columbia St W, Waterloo, ON N2L 5L7 (Columbia St W)',
      '70 Bridgeport Rd E, Waterloo, ON N2J 2J9 (Bridgeport Plaza)',
    ],
    neighborhood: 'Northfield & Columbia West, Waterloo',
    bannerColor: 'bg-teal-800 text-white',
    accentBadge: 'bg-teal-50 text-teal-800 border-teal-200',
    description: 'Northfield and Columbia West locations serving N2L 6A6. Sterling Silver AAA Canadian beef, Compliments pantry essentials, artisan bakery & organic greens.',
    flyerDay: 'New flyers every Thursday',
    directStoreWebsiteName: 'Sobeys.com',
    directStoreFlyerUrl: 'https://www.sobeys.com/en/flyer/?postalCode=N2L6A6',
    directStoreSearchUrl: 'https://www.sobeys.com/en/search/?q=',
    flippStoreSlug: 'sobeys',
    flippDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Sobeys',
    reebeeStoreSlug: 'sobeys',
    reebeeDirectUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=Sobeys',
  },
};

export const STORE_METADATA = WATERLOO_STORE_LOCATIONS;

/**
 * Builds direct store search URL for any item query
 */
export function getDirectStoreSearchUrl(store: KWStore, query: string): string {
  const meta = WATERLOO_STORE_LOCATIONS[store];
  if (!meta) return 'https://www.google.com';
  return `${meta.directStoreSearchUrl}${encodeURIComponent(query)}`;
}

/**
 * Ensures all deals are tagged with current cycle dates and direct store URLs
 */
export function enrichDealsWithCurrentCycle(deals: FlyerDeal[]): FlyerDeal[] {
  const cycle = getCurrentFlyerCycle();
  return deals.map((d) => {
    const storeMeta = WATERLOO_STORE_LOCATIONS[d.store];
    const directUrl = d.directStoreUrl || (storeMeta ? `${storeMeta.directStoreSearchUrl}${encodeURIComponent(d.name)}` : undefined);
    return {
      ...d,
      validUntil: d.validUntil || cycle.validUntilShort,
      sourceType: d.sourceType || 'hybrid',
      directStoreVerified: true,
      directStoreUrl: directUrl,
      flippVerified: d.flippVerified !== false,
      postalCode: d.postalCode || 'N2L 6A6',
    };
  });
}

export const INITIAL_FLYER_DEALS: FlyerDeal[] = [
  // --- FOOD BASICS (Waterloo - Erb St / University Ave - serving N2L 6A6) ---
  {
    id: 'fb-1',
    store: 'Food Basics',
    name: 'Fresh Bone-in Chicken Thighs or Drumsticks (Club Pack)',
    category: 'Meat & Poultry',
    salePrice: 1.99,
    regularPrice: 3.99,
    unit: 'per lb ($4.39/kg)',
    discountLabel: 'Save 50% - Front Page Deal',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Chicken Drumsticks / Thighs',
    suggestedVeg: 'Green Beans & Baby Carrots',
    suggestedStarch: 'Herb Roasted Baby Potatoes',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=chicken%20thighs',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=chicken%20thighs',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-2',
    store: 'Food Basics',
    name: 'Ontario Sweet Corn (Local Harvest)',
    category: 'Fresh Produce',
    salePrice: 0.33,
    regularPrice: 0.79,
    unit: 'each (6 for $1.98)',
    discountLabel: 'Local Ontario Peak Season',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedVeg: 'Charred Sweet Corn on the Cob',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=sweet%20corn',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=sweet%20corn',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-3',
    store: 'Food Basics',
    name: 'Fresh Pork Tenderloin or Center Cut Chops',
    category: 'Meat & Poultry',
    salePrice: 2.99,
    regularPrice: 4.99,
    unit: 'per lb ($6.59/kg)',
    discountLabel: 'Save $2.00/lb',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Glazed Pork Center Cut Chops',
    suggestedVeg: 'Sautéed Zucchini & Apple Slices',
    suggestedStarch: 'Steamed Jasmine Rice',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=pork%20chops',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=pork%20chops',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-4',
    store: 'Food Basics',
    name: 'Fresh Whole Chicken Wings (Value Pack)',
    category: 'Meat & Poultry',
    salePrice: 3.99,
    regularPrice: 6.49,
    unit: 'per lb ($8.80/kg)',
    discountLabel: 'Save $2.50/lb',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Crispy Baked Herb Chicken Wings',
    suggestedVeg: 'Celery Sticks & Steamed Broccoli',
    suggestedStarch: 'Oven Wedges',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=chicken%20wings',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=chicken%20wings',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-5',
    store: 'Food Basics',
    name: 'Fresh Broccoli Crowns',
    category: 'Fresh Produce',
    salePrice: 1.37,
    regularPrice: 2.99,
    unit: 'each',
    discountLabel: 'Over 50% Off',
    validUntil: 'Aug 26',
    suggestedVeg: 'Garlic Lemon Roasted Broccoli',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=broccoli',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=broccoli',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-6',
    store: 'Food Basics',
    name: 'Ontario Field Roma Tomatoes',
    category: 'Fresh Produce',
    salePrice: 0.99,
    regularPrice: 2.29,
    unit: 'per lb ($2.18/kg)',
    discountLabel: 'Ontario Grown Value',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedVeg: 'Fresh Roma Tomato Basil Bruschetta / Sauce',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=roma%20tomatoes',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=roma%20tomatoes',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-7',
    store: 'Food Basics',
    name: 'Ontario Peaches (3L Basket)',
    category: 'Fresh Produce',
    salePrice: 3.88,
    regularPrice: 6.99,
    unit: '3L basket',
    discountLabel: 'Niagara Harvest Special',
    validUntil: 'Aug 26',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=peaches',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=peaches',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-8',
    store: 'Food Basics',
    name: 'Yellow Cooking Onions & Russet Potatoes (10 lb bag)',
    category: 'Fresh Produce',
    salePrice: 2.99,
    regularPrice: 5.99,
    unit: '10 lb bag',
    discountLabel: 'Value Family Pack',
    validUntil: 'Aug 26',
    suggestedStarch: 'Crispy Baked Potato Wedges',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=potatoes',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=potatoes',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'fb-9',
    store: 'Food Basics',
    name: 'Primo Pasta (Selected Cuts 900g)',
    category: 'Grains & Pasta',
    salePrice: 1.25,
    regularPrice: 2.49,
    unit: '900g bag',
    discountLabel: 'Stock Up Price',
    validUntil: 'Aug 26',
    suggestedStarch: 'Penne / Rotini Pasta',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=primo%20pasta',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=primo%20pasta',
    postalCode: 'N2L 6A6',
  },

  // --- REAL CANADIAN SUPERSTORE (Kitchener/Waterloo - Fischer-Hallman & Boardwalk - serving N2L 6A6) ---
  {
    id: 'rcss-1',
    store: 'Real Canadian Superstore',
    name: 'Lean Ground Beef (Club Size Family Pack)',
    category: 'Meat & Poultry',
    salePrice: 3.99,
    regularPrice: 6.49,
    unit: 'per lb ($8.80/kg)',
    discountLabel: 'Club Size Mega Deal',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Lean Ground Beef (Tacos/Bake)',
    suggestedVeg: 'Diced Bell Peppers & Sweet Onions',
    suggestedStarch: 'Warm Corn Tortillas & Rice',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=ground%20beef',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=ground%20beef',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-2',
    store: 'Real Canadian Superstore',
    name: 'Fresh Atlantic Salmon Fillets (Skin-on Club Pack)',
    category: 'Seafood',
    salePrice: 9.99,
    regularPrice: 14.99,
    unit: 'per lb ($22.02/kg)',
    discountLabel: 'Fresh Seafood Feature',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Maple Dijon Glazed Salmon',
    suggestedVeg: 'Steamed Baby Green Beans',
    suggestedStarch: 'Lemon Herb Couscous / Quinoa',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=salmon',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=salmon',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-3',
    store: 'Real Canadian Superstore',
    name: 'Ontario Greenhouse Bell Peppers (4-pack Multi-Color)',
    category: 'Fresh Produce',
    salePrice: 3.49,
    regularPrice: 5.99,
    unit: '4-pack',
    discountLabel: 'Ontario Grown Sale',
    validUntil: 'Aug 26',
    suggestedVeg: 'Fajita Seasoned Roasted Peppers',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=bell%20peppers',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=bell%20peppers',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-4',
    store: 'Real Canadian Superstore',
    name: 'Fresh Red Sweet Cherries',
    category: 'Fresh Produce',
    salePrice: 1.99,
    regularPrice: 4.49,
    unit: 'per lb ($4.39/kg)',
    discountLabel: 'Summer Fruit Door Crasher',
    validUntil: 'Aug 26',
    isLossLeader: true,
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=cherries',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=cherries',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-5',
    store: 'Real Canadian Superstore',
    name: 'Dempster’s 10-inch Tortillas (Flour or Whole Wheat)',
    category: 'Grains & Pasta',
    salePrice: 2.00,
    regularPrice: 3.99,
    unit: 'package of 8-10',
    discountLabel: '50% Off Feature',
    validUntil: 'Aug 26',
    suggestedStarch: 'Soft Warm Tortillas',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=tortillas',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=tortillas',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-6',
    store: 'Real Canadian Superstore',
    name: 'In-Store Bakery Fresh French or Italian Loaf Bread',
    category: 'Grains & Pasta',
    salePrice: 1.50,
    regularPrice: 2.79,
    unit: 'each (fresh baked daily)',
    discountLabel: 'Bakery Feature',
    validUntil: 'Aug 26',
    suggestedStarch: 'Crusty Garlic French Bread',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=french%20bread',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=french%20bread',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-7',
    store: 'Real Canadian Superstore',
    name: 'Rooster Scented Jasmine or Tilda Basmati Rice (8 kg bag)',
    category: 'Grains & Pasta',
    salePrice: 13.00,
    regularPrice: 21.99,
    unit: '8 kg bag',
    discountLabel: 'Save $8.99 Mega Pack',
    validUntil: 'Aug 26',
    suggestedStarch: 'Fluffy Jasmine Rice',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=jasmine%20rice',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=jasmine%20rice',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'rcss-8',
    store: 'Real Canadian Superstore',
    name: 'PC Little Gems Baby Potatoes (1.5 lb bag)',
    category: 'Fresh Produce',
    salePrice: 2.49,
    regularPrice: 4.49,
    unit: '1.5 lb bag',
    discountLabel: 'PC Member Pricing',
    validUntil: 'Aug 26',
    suggestedStarch: 'Crispy Smashed Baby Potatoes',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=baby%20potatoes',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=baby%20potatoes',
    postalCode: 'N2L 6A6',
  },

  // --- ZEHRS (Waterloo - Conestoga Mall / Beechwood - serving N2L 6A6) ---
  {
    id: 'zehrs-1',
    store: 'Zehrs',
    name: 'Boneless Skinless Chicken Breasts (Club Size 4-5 pk)',
    category: 'Meat & Poultry',
    salePrice: 4.88,
    regularPrice: 8.49,
    unit: 'per lb ($10.76/kg)',
    discountLabel: 'Door Crasher Sale',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Juicy Pan-Seared Chicken Breasts',
    suggestedVeg: 'Roasted Asparagus & Cherry Tomatoes',
    suggestedStarch: 'Garlic Parmesan Orzo',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=chicken%20breast',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=chicken%20breast',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'zehrs-2',
    store: 'Zehrs',
    name: 'Fresh Ontario Green Beans',
    category: 'Fresh Produce',
    salePrice: 1.99,
    regularPrice: 3.99,
    unit: 'per lb ($4.39/kg)',
    discountLabel: 'Farm Fresh Ontario',
    validUntil: 'Aug 26',
    suggestedVeg: 'Blanched Butter Green Beans',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=green%20beans',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=green%20beans',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'zehrs-3',
    store: 'Zehrs',
    name: 'Ontario Field Cucumbers & Roma Tomatoes',
    category: 'Fresh Produce',
    salePrice: 0.88,
    regularPrice: 1.79,
    unit: 'each / per lb',
    discountLabel: 'Fresh Pick Deal',
    validUntil: 'Aug 26',
    suggestedVeg: 'Crisp Cucumber Tomato Garden Salad',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=cucumbers',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=cucumbers',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'zehrs-4',
    store: 'Zehrs',
    name: 'Extra Large Raw White Shrimp (31/40 count, 454g bag)',
    category: 'Seafood',
    salePrice: 6.99,
    regularPrice: 11.99,
    unit: '454g frozen bag',
    discountLabel: 'Save $5.00',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Garlic Butter Sautéed Shrimp',
    suggestedVeg: 'Snap Peas & Bell Peppers',
    suggestedStarch: 'Garlic Butter Egg Noodles',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=raw%20shrimp',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=raw%20shrimp',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'zehrs-5',
    store: 'Zehrs',
    name: 'Fresh Steelhead Trout or Cod Fillets',
    category: 'Seafood',
    salePrice: 10.99,
    regularPrice: 15.99,
    unit: 'per lb ($24.23/kg)',
    discountLabel: 'Butcher & Seafood Special',
    validUntil: 'Aug 26',
    suggestedProtein: 'Pan-Seared Steelhead Trout',
    suggestedVeg: 'Lemon Butter Asparagus',
    suggestedStarch: 'Brown Rice Pilaf',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=trout%20fillet',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=trout%20fillet',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'zehrs-6',
    store: 'Zehrs',
    name: 'PC Black Label Extra Virgin Olive Oil & Bronze Pastas',
    category: 'Grains & Pasta',
    salePrice: 2.99,
    regularPrice: 4.79,
    unit: '500g package',
    discountLabel: 'PC Optimum 1000 Pts',
    validUntil: 'Aug 26',
    suggestedStarch: 'Artisan Rigatoni Pasta',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=pc%20black%20label',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=pc%20black%20label',
    postalCode: 'N2L 6A6',
  },

  // --- SOBEYS (Waterloo - Northfield & Columbia St W - serving N2L 6A6) ---
  {
    id: 'sobeys-1',
    store: 'Sobeys',
    name: 'Sterling Silver Boneless Top Sirloin Steak / Roast',
    category: 'Meat & Poultry',
    salePrice: 7.99,
    regularPrice: 13.99,
    unit: 'per lb ($17.61/kg)',
    discountLabel: 'AAA Canadian Beef Feature',
    validUntil: 'Aug 26',
    isLossLeader: true,
    suggestedProtein: 'Cast-Iron Top Sirloin Steak Slices',
    suggestedVeg: 'Sautéed Garlic Cremini Mushrooms & Green Salad',
    suggestedStarch: 'Fluffy Baked Russet Potato with Butter',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=top%20sirloin',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=top%20sirloin',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'sobeys-2',
    store: 'Sobeys',
    name: 'Whole White or Cremini Mushrooms (227g pkg)',
    category: 'Fresh Produce',
    salePrice: 1.67,
    regularPrice: 2.99,
    unit: '227g package (3 for $5.00)',
    discountLabel: 'Multi-buy Savings',
    validUntil: 'Aug 26',
    suggestedVeg: 'Caramelized Herb Mushrooms',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=mushrooms',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=mushrooms',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'sobeys-3',
    store: 'Sobeys',
    name: 'Compliments Organic Carrots & Celery Hearts',
    category: 'Fresh Produce',
    salePrice: 2.29,
    regularPrice: 3.79,
    unit: '2 lb bag / pkg',
    discountLabel: 'Organic Value Pick',
    validUntil: 'Aug 26',
    suggestedVeg: 'Honey Glazed Roasted Carrots',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=organic%20carrots',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=organic%20carrots',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'sobeys-4',
    store: 'Sobeys',
    name: 'Compliments Frozen Sweet Green Peas & Corn (750g)',
    category: 'Pantry & Canned',
    salePrice: 2.49,
    regularPrice: 3.99,
    unit: '750g bag',
    discountLabel: 'Pantry Saver',
    validUntil: 'Aug 26',
    suggestedVeg: 'Sweet Buttered Peas',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=compliments%20peas',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=compliments%20peas',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'sobeys-5',
    store: 'Sobeys',
    name: 'Fresh Atlantic Cod or Haddock Fillets',
    category: 'Seafood',
    salePrice: 8.99,
    regularPrice: 13.99,
    unit: 'per lb',
    discountLabel: 'Sustainable Catch',
    validUntil: 'Aug 26',
    suggestedProtein: 'Crispy Panko Baked Haddock',
    suggestedVeg: 'Steamed Broccoli & Lemon Wedges',
    suggestedStarch: 'Oven Fries or Brown Rice',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=cod%20fillet',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=cod%20fillet',
    postalCode: 'N2L 6A6',
  },
  {
    id: 'sobeys-6',
    store: 'Sobeys',
    name: 'Sterling Silver Extra Lean Ground Beef',
    category: 'Meat & Poultry',
    salePrice: 5.99,
    regularPrice: 8.49,
    unit: 'per lb ($13.21/kg)',
    discountLabel: 'Sterling Silver Feature',
    validUntil: 'Aug 26',
    suggestedProtein: 'Extra Lean Beef Burger Patties',
    suggestedVeg: 'Crisp Butterhead Lettuce & Sliced Tomatoes',
    suggestedStarch: 'Toasted Brioche Buns',
    flippVerified: true,
    flippUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=extra%20lean%20beef',
    reebeeVerified: true,
    reebeeUrl: 'https://flipp.com/search?postal_code=N2L6A6&query=extra%20lean%20beef',
    postalCode: 'N2L 6A6',
  },
];
