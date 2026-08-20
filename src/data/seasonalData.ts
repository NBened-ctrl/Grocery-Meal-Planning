import { SeasonalInfo } from '../types';

export const MONTHS_LIST = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const SEASONAL_METADATA: Record<string, SeasonalInfo> = {
  January: {
    month: 'January',
    season: 'Winter',
    vibeTitle: 'Cozy Winter Hearth & Hearty Stews',
    keySeasonalProduce: ['Ontario Root Veggies (Carrots, Parsnips)', 'Potatoes', 'Cabbage', 'Squash', 'Onions'],
    cookingVibe: 'Warm dutch oven stews, slow-cooker braises, baked pasta casseroles, and hearty root roasts.',
  },
  February: {
    month: 'February',
    season: 'Winter',
    vibeTitle: 'Deep Winter Comfort & Slow-Cooker Warmers',
    keySeasonalProduce: ['Stored Beets & Carrots', 'Sweet Potatoes', 'Leeks', 'Cranberries', 'Kale'],
    cookingVibe: 'Rich chilis, one-pot curries, braised pork chops, and warming potato-topped skillet pies.',
  },
  March: {
    month: 'March',
    season: 'Spring',
    vibeTitle: 'Early Spring Thaw & Maple Syrup Season',
    keySeasonalProduce: ['Ontario Maple Syrup', 'Greenhouse Greens', 'Mushrooms', 'Stored Apples', 'Leeks'],
    cookingVibe: 'Maple-glazed salmon & chicken, skillet mushroom stir-fries, and light creamy pasta nights.',
  },
  April: {
    month: 'April',
    season: 'Spring',
    vibeTitle: 'Spring Awakening & Fresh Herb Vibrance',
    keySeasonalProduce: ['Greenhouse Cucumbers & Peppers', 'Spinach', 'Radishes', 'Chives & Herbs', 'Green Onions'],
    cookingVibe: 'Bright lemon-garlic sheet pans, tender pork stir-fries, crisp salads, and 20-min skillet fish.',
  },
  May: {
    month: 'May',
    season: 'Spring',
    vibeTitle: 'Peak Ontario Asparagus & Garden Freshness',
    keySeasonalProduce: ['Fresh Ontario Asparagus', 'Spring Peas', 'Rhubarb', 'Tender Lettuce', 'New Baby Potatoes'],
    cookingVibe: 'Sheet-pan chicken & roasted asparagus, sweet pea pasta ribbons, and honey-dijon pork.',
  },
  June: {
    month: 'June',
    season: 'Summer',
    vibeTitle: 'Early Summer Kickoff & Fresh Ontario Berries',
    keySeasonalProduce: ['Ontario Strawberries', 'Snap Peas', 'Zucchini', 'Radishes', 'Greenhouse Bell Peppers'],
    cookingVibe: 'Backyard grill style, light one-skillet chicken breasts, fresh berry sides, and crisp taco night.',
  },
  July: {
    month: 'July',
    season: 'Summer',
    vibeTitle: 'High Summer Bounty & Grill Sessions',
    keySeasonalProduce: ['Ontario Green Beans', 'Zucchini & Summer Squash', 'Field Cucumbers', 'Sweet Peppers', 'Cherries'],
    cookingVibe: 'Low-heat kitchen prep, BBQ glaze skillet meals, charred corn, and fast 15-minute stir-fries.',
  },
  August: {
    month: 'August',
    season: 'Summer',
    vibeTitle: 'Late Summer Harvest & Peak Ontario Sweet Corn',
    keySeasonalProduce: ['Ontario Sweet Corn (KW Farm Fresh)', 'Field Tomatoes', 'Peaches', 'Green Beans', 'Zucchini'],
    cookingVibe: 'Charred sweet corn tacos, juicy maple-dijon salmon, crispy chicken thighs with fresh beans, and one-pan roasts.',
  },
  September: {
    month: 'September',
    season: 'Fall',
    vibeTitle: 'Back-to-School Routine & Early Apple Harvest',
    keySeasonalProduce: ['Ontario Mac & Gala Apples', 'Acorn & Butternut Squash', 'Broccoli Crowns', 'Sweet Corn', 'Cauliflower'],
    cookingVibe: 'Speedy 25-min weeknight sheet pans, one-pot tuscan pastas, apple cider glazed pork, and meal prep.',
  },
  October: {
    month: 'October',
    season: 'Fall',
    vibeTitle: 'Autumn Harvest Bounty & Roasted Squash Vibe',
    keySeasonalProduce: ['Butternut & Kabocha Squash', 'Brussels Sprouts', 'Pumpkins', 'Sweet Potatoes', 'Fresh Pears'],
    cookingVibe: 'Crispy sheet-pan sausage & squash roasts, creamy roasted pumpkin soups, and skillet steak dinners.',
  },
  November: {
    month: 'November',
    season: 'Fall',
    vibeTitle: 'Late Fall Hearth, Savory Herbs & Roasts',
    keySeasonalProduce: ['Brussels Sprouts', 'Carrots & Parsnips', 'Cranberries', 'Russet Potatoes', 'Beets'],
    cookingVibe: 'Slow-simmered beef roasts, one-pot savory rice bakes, rosemary chicken skillet, and cozy comfort.',
  },
  December: {
    month: 'December',
    season: 'Winter',
    vibeTitle: 'Festive Holiday Comfort & Family Feasts',
    keySeasonalProduce: ['Winter Squash', 'Cranberries', 'Sweet Potatoes', 'Red Cabbage', 'Root Vegetables'],
    cookingVibe: 'One-pot braised roasts, festive herb chicken, rich gravies, garlic mashed potato tops, and slow-cooker feasts.',
  },
};

export const ONTARIO_SEASONAL_METADATA = SEASONAL_METADATA;

export function getSeasonalInfo(monthName: string): SeasonalInfo {
  return SEASONAL_METADATA[monthName] || SEASONAL_METADATA['August'];
}
