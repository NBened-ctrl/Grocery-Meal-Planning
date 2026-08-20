import { PantryItem } from '../types';

export const DEFAULT_PANTRY_STAPLES: PantryItem[] = [
  // Oils & Vinegars
  { id: 'p-1', name: 'Olive Oil / Cooking Oil', category: 'Oils & Vinegars', inStock: true },
  { id: 'p-2', name: 'Butter / Margarine', category: 'Oils & Vinegars', inStock: true },
  { id: 'p-3', name: 'Soy Sauce / Tamari', category: 'Condiments & Sauces', inStock: true },
  { id: 'p-4', name: 'Balsamic / Apple Cider Vinegar', category: 'Oils & Vinegars', inStock: true },

  // Spices & Seasonings
  { id: 'p-5', name: 'Kosher Salt & Black Pepper', category: 'Spices & Seasonings', inStock: true },
  { id: 'p-6', name: 'Garlic Powder & Onion Powder', category: 'Spices & Seasonings', inStock: true },
  { id: 'p-7', name: 'Italian Herb Seasoning / Oregano', category: 'Spices & Seasonings', inStock: true },
  { id: 'p-8', name: 'Smoked Paprika & Cumin', category: 'Spices & Seasonings', inStock: true },
  { id: 'p-9', name: 'Ground Cinnamon / Nutmeg', category: 'Spices & Seasonings', inStock: true },

  // Condiments & Sauces
  { id: 'p-10', name: 'Dijon or Yellow Mustard', category: 'Condiments & Sauces', inStock: true },
  { id: 'p-11', name: 'Honey or Pure Maple Syrup', category: 'Condiments & Sauces', inStock: true },
  { id: 'p-12', name: 'Ketchup & Mayonnaise', category: 'Condiments & Sauces', inStock: true },
  { id: 'p-13', name: 'Salsa / Hot Sauce', category: 'Condiments & Sauces', inStock: true },
  { id: 'p-14', name: 'Minced Garlic (Jar or Fresh cloves)', category: 'Condiments & Sauces', inStock: true },

  // Baking & Dry Goods
  { id: 'p-15', name: 'All-Purpose Flour / Cornstarch', category: 'Baking & Dry', inStock: true },
  { id: 'p-16', name: 'Brown Sugar / White Sugar', category: 'Baking & Dry', inStock: true },
  { id: 'p-17', name: 'Rolled Oats / Breadcrumbs', category: 'Baking & Dry', inStock: true },

  // Canned & Broths
  { id: 'p-18', name: 'Chicken or Vegetable Broth', category: 'Canned & Broths', inStock: true },
  { id: 'p-19', name: 'Canned Diced Tomatoes / Tomato Paste', category: 'Canned & Broths', inStock: true },
  { id: 'p-20', name: 'Canned Black Beans / Chickpeas', category: 'Canned & Broths', inStock: true },
];
