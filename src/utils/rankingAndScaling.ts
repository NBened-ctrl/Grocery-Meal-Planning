import { RecipeRating, FamilySettings, MealRecipe } from '../types';

export function normalizeMealKey(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
}

export function isMealExcluded(title: string, ratings?: Record<string, RecipeRating>): boolean {
  if (!ratings) return false;
  const key = normalizeMealKey(title);
  const found = ratings[key] || Object.values(ratings).find(
    (r) => normalizeMealKey(r.recipeTitle) === key || r.recipeTitle.toLowerCase().includes(title.toLowerCase())
  );
  return Boolean(found && found.rating <= 1);
}

export function isMealStaple(title: string, ratings?: Record<string, RecipeRating>): boolean {
  if (!ratings) return false;
  const key = normalizeMealKey(title);
  const found = ratings[key] || Object.values(ratings).find(
    (r) => normalizeMealKey(r.recipeTitle) === key || r.recipeTitle.toLowerCase().includes(title.toLowerCase())
  );
  return Boolean(found && found.rating >= 4);
}

export function getMealRating(title: string, ratings?: Record<string, RecipeRating>): number | undefined {
  if (!ratings) return undefined;
  const key = normalizeMealKey(title);
  const found = ratings[key] || Object.values(ratings).find(
    (r) => normalizeMealKey(r.recipeTitle) === key || r.recipeTitle.toLowerCase().includes(title.toLowerCase())
  );
  return found?.rating;
}

/**
 * Scale ingredient quantity string smoothly (e.g., "1.5 lbs" * 1.5 => "2.25 lbs", "2 cups" * 2 => "4 cups")
 */
export function scaleQuantityString(quantityStr: string, multiplier: number): string {
  if (multiplier === 1 || !quantityStr) return quantityStr;

  // Match numbers or fractions like 1.5, 2, 1/2, 3/4
  return quantityStr.replace(/(\d+(\.\d+)?|\d+\/\d+)/g, (match) => {
    if (match.includes('/')) {
      const [num, den] = match.split('/').map(Number);
      if (den > 0) {
        const val = (num / den) * multiplier;
        return val % 1 === 0 ? val.toString() : val.toFixed(1).replace(/\.0$/, '');
      }
    }
    const val = parseFloat(match) * multiplier;
    if (isNaN(val)) return match;
    // Format nicely without excessive decimals
    return val % 1 === 0 ? val.toString() : val.toFixed(1).replace(/\.0$/, '');
  });
}

/**
 * Computes effective meal servings based on family size (adults + kids) and leftover setting
 */
export function computeEffectiveServings(
  familySettings: FamilySettings,
  cookForLeftovers?: boolean
): number {
  const basePortions = (familySettings.adultsCount || 2) + (familySettings.kidsCount || 2);
  if (cookForLeftovers) {
    // Cook for leftovers adds extra portions for lunch (1.5x base, rounded up)
    return Math.round(basePortions * 1.5);
  }
  return basePortions;
}
