import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI client with telemetry
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured. Falling back to local generation algorithms.');
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Kitchener-Waterloo Flyer Meal Planner Backend',
    storesSupported: ['Food Basics', 'Real Canadian Superstore', 'Zehrs', 'Sobeys'],
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Generate 7-Day Meal Plan endpoint
app.post('/api/generate-plan', async (req, res) => {
  try {
    const {
      familySettings,
      currentDeals,
      pantryStaples,
      customPrompt,
      selectedMonth,
      seasonalVibe,
      preferOnePotPan,
      recipeRatings,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured. Using client-side planner algorithm.',
      });
    }

    const currentMonth = selectedMonth || familySettings?.selectedMonth || 'August';
    const isOnePotPrioritized = preferOnePotPan ?? familySettings?.preferOnePotPan ?? false;
    const adults = familySettings?.adultsCount ?? 2;
    const kids = familySettings?.kidsCount ?? 2;
    const totalPeople = adults + kids;

    // Process recipe ratings into Excluded (0-1 stars) and Staples (4-5 stars)
    const ratingsMap = recipeRatings || familySettings?.recipeRatings || {};
    const excludedMeals: string[] = [];
    const stapleMeals: { title: string; rating: number; notes?: string }[] = [];

    Object.values(ratingsMap).forEach((r: any) => {
      if (r && typeof r.rating === 'number') {
        if (r.rating <= 1) {
          excludedMeals.push(r.recipeTitle || r.recipeId);
        } else if (r.rating >= 4) {
          stapleMeals.push({
            title: r.recipeTitle || r.recipeId,
            rating: r.rating,
            notes: r.notes,
          });
        }
      }
    });

    const systemPrompt = `You are a premier culinary director, budget optimizer, and family meal planner specializing in the Kitchener-Waterloo (KW), Ontario region.
Your job is to generate an inspiring, realistic 7-day weekly dinner meal plan and shopping list for a family of ${totalPeople} (${adults} adults + ${kids} young children/toddlers).

Core Nutritional & Cooking Formula for EVERY dinner:
1. STRICT 3-PILLAR FORMULA:
   - Exactly 1 main protein (e.g. chicken thighs/breast, lean ground beef, pork chops/loin, Atlantic salmon, cod, shrimp, extra firm tofu, lentils/beans) scaled for ${totalPeople} family members.
   - 1 or 2 vegetables (e.g. roasted broccoli, sweet corn, green beans, carrots, zucchini, bell peppers, leafy greens)
   - Exactly 1 starch or grain (e.g. roasted baby potatoes, jasmine rice, penne/macaroni pasta, tortillas, cornbread, quinoa)

2. RECIPE RANKINGS & PREVIOUS RATINGS MEMORY:
   ${excludedMeals.length > 0
     ? `CRITICAL EXCLUSIONS (Rated 0-1 Stars): The family disliked and blacklisted these meals: [${excludedMeals.join(', ')}]. You are STRICTLY FORBIDDEN from including these recipes or exact replicas in the meal plan!`
     : 'No blacklisted meals currently.'}
   ${stapleMeals.length > 0
     ? `FAMILY STAPLES & FAVORITES (Rated 4-5 Stars): The family loves these staple recipes: [${stapleMeals.map(s => `"${s.title}" (${s.rating}★)`).join(', ')}]. Strongly consider featuring 1-2 of these staples directly, or creating inspired seasonal variations with similar flavor profiles/cooking styles leveraging current KW flyer deals!`
     : 'No specific favorites recorded yet.'}

3. ONE-POT / ONE-PAN / SHEET-PAN EMPHASIS:
   ${isOnePotPrioritized 
     ? 'CRITICAL PRIORITY: The family requested ONE-POT / ONE-PAN / SHEET-PAN / CASSEROLE / SKILLET meals to minimize dishes and cleanup. Design dinners where protein, vegetables, and starches are cooked together in 1 vessel (e.g. 1 rimmed sheet pan, 1 dutch oven, 1 deep cast-iron skillet, 1 slow cooker, or 1 baking casserole) wherever possible!' 
     : 'Include convenient sheet-pan and one-pot options throughout the week alongside traditional stovetop/oven favorites.'}

4. SEASONAL VIBE & ONTARIO HARVEST CONTEXT:
   - Target Month & Time of Year: ${currentMonth} in Ontario, Canada.
   - Seasonal Produce & Theme: ${seasonalVibe || 'Local Ontario in-season produce, fresh herbs, weather-appropriate comfort or grill vibes'}.
   - Feature vegetables and produce that make sense for ${currentMonth} in Kitchener-Waterloo (e.g. Sweet corn/tomatoes/zucchini in late summer; Squash/apples/root veggies in fall; Stews/curries/casseroles/potatoes in winter; Asparagus/greens/peas in spring).

5. COST OPTIMIZATION: Prioritize sales and loss-leaders from the 4 KW grocery banners: Food Basics, Real Canadian Superstore (RCSS), Zehrs, and Sobeys.
6. PANTRY STAPLES: Assume the family has basic spices, cooking oil, soy sauce, salt, pepper, garlic, flour, honey/maple syrup, and standard condiments.
7. KID & TODDLER FRIENDLY: Provide actionable toddler tips (deconstructing, mild seasoning, finger-food presentation).
8. REALISTIC COSTS: Calculate realistic Canadian dollar (CAD) estimates per dinner and portion for ${totalPeople} family members.

Input Settings:
- Family Members: ${totalPeople} (${adults} Adults, ${kids} Kids)
- Store Preference: ${familySettings?.primaryStore ?? 'Multi-Store Optimizer'}
- Max Cook Time: ${familySettings?.maxCookTimeMinutes ?? 35} minutes
- Picky Eater Setting: ${familySettings?.kidPickyLevel ?? 'Picky Toddler Friendly'}
- Dietary Preferences: ${(familySettings?.dietaryPreferences || []).join(', ') || 'Standard balanced family meals'}
- Prefer One-Pot / One-Pan: ${isOnePotPrioritized ? 'YES (High Priority)' : 'Standard variety'}
- Seasonal Month: ${currentMonth}
- Custom Instructions: ${customPrompt || 'None'}
`;

    const userPrompt = `Here is a sample of current Kitchener-Waterloo flyer deals to incorporate into dinners:
${JSON.stringify((currentDeals || []).slice(0, 20), null, 2)}

Generate a 7-day dinner plan (Monday to Sunday) structured as JSON adhering to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklySummary: { type: Type.STRING, description: 'Summary of the week, total estimated cost, seasonal vibe, and flyer deals leveraged' },
            estimatedWeeklyCostCAD: { type: Type.NUMBER },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  dayOfWeek: { type: Type.STRING },
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  servings: { type: Type.NUMBER },
                  prepTimeMinutes: { type: Type.NUMBER },
                  cookTimeMinutes: { type: Type.NUMBER },
                  estimatedCostTotal: { type: Type.NUMBER },
                  costPerServing: { type: Type.NUMBER },
                  isOnePotOrPan: { type: Type.BOOLEAN },
                  cookingStyle: { type: Type.STRING, description: 'one_pot | sheet_pan | skillet | slow_cooker | casserole | standard' },
                  vesselUsed: { type: Type.STRING, description: 'e.g. 1 Rimmed Sheet Pan, 1 Dutch Oven, 1 Large Skillet' },
                  seasonalNote: { type: Type.STRING, description: 'Note on in-season produce or monthly vibe' },
                  components: {
                    type: Type.OBJECT,
                    properties: {
                      protein: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          amount: { type: Type.STRING },
                          dealSource: { type: Type.STRING },
                          onSaleStore: { type: Type.STRING },
                        },
                        required: ['name', 'amount'],
                      },
                      vegetables: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            amount: { type: Type.STRING },
                            dealSource: { type: Type.STRING },
                            onSaleStore: { type: Type.STRING },
                          },
                          required: ['name', 'amount'],
                        },
                      },
                      starchOrGrain: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          amount: { type: Type.STRING },
                          dealSource: { type: Type.STRING },
                          onSaleStore: { type: Type.STRING },
                        },
                        required: ['name', 'amount'],
                      },
                    },
                    required: ['protein', 'vegetables', 'starchOrGrain'],
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        isPantryStaple: { type: Type.BOOLEAN },
                        store: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        notes: { type: Type.STRING },
                      },
                      required: ['name', 'amount', 'isPantryStaple'],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  kidFriendlyTip: { type: Type.STRING },
                  makeAheadTip: { type: Type.STRING },
                  dealsUsed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'id',
                  'dayOfWeek',
                  'title',
                  'theme',
                  'servings',
                  'prepTimeMinutes',
                  'cookTimeMinutes',
                  'estimatedCostTotal',
                  'costPerServing',
                  'components',
                  'ingredients',
                  'instructions',
                  'dealsUsed',
                ],
              },
            },
          },
          required: ['weeklySummary', 'estimatedWeeklyCostCAD', 'meals'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI meal plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate meal plan' });
  }
});

// AI Swap Single Meal endpoint
app.post('/api/swap-meal', async (req, res) => {
  try {
    const { 
      targetDay, 
      currentMeals, 
      currentDeals, 
      preferences, 
      requestedProteinOrTheme, 
      selectedMonth, 
      preferOnePotPan,
      recipeRatings,
      familySettings,
    } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const monthStr = selectedMonth || familySettings?.selectedMonth || 'August';
    const isOnePot = Boolean(preferOnePotPan ?? familySettings?.preferOnePotPan);
    const totalPeople = (familySettings?.adultsCount ?? 2) + (familySettings?.kidsCount ?? 2);

    // Process recipe ratings
    const ratingsMap = recipeRatings || familySettings?.recipeRatings || {};
    const excludedMeals: string[] = [];
    const stapleMeals: string[] = [];

    Object.values(ratingsMap).forEach((r: any) => {
      if (r && typeof r.rating === 'number') {
        if (r.rating <= 1) {
          excludedMeals.push(r.recipeTitle || r.recipeId);
        } else if (r.rating >= 4) {
          stapleMeals.push(r.recipeTitle || r.recipeId);
        }
      }
    });

    const prompt = `Create an enticing replacement dinner recipe for ${targetDay} for a family of ${totalPeople} in Kitchener-Waterloo, Ontario for the month of ${monthStr}.
Must adhere strictly to: 1 protein + 1 or 2 vegetables + 1 starch or grain.
${isOnePot ? 'Preference: ONE-POT or ONE-PAN or SHEET-PAN meal with fast clean-up.' : ''}
${excludedMeals.length > 0 ? `DO NOT USE ANY OF THESE 0-1 STAR BLACKLISTED DISHES: [${excludedMeals.join(', ')}].` : ''}
${stapleMeals.length > 0 ? `The family loves these 4-5 star staple ideas: [${stapleMeals.join(', ')}]. Feel free to adapt one or craft something similar.` : ''}
Seasonal Context: Incorporate fresh seasonal produce suitable for ${monthStr} in Ontario.
Preferences: ${preferences || 'Quick weeknight, kid-friendly'}.
Requested style/protein: ${requestedProteinOrTheme || 'Any high-value flyer deal'}.
Currently used meals this week: ${(currentMeals || []).map((m: any) => m.title).join('; ')}.
Available KW Deals:
${JSON.stringify((currentDeals || []).slice(0, 15), null, 2)}

Return a single JSON object conforming to a MealRecipe with isOnePotOrPan, cookingStyle, and vesselUsed populated.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            dayOfWeek: { type: Type.STRING },
            title: { type: Type.STRING },
            theme: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            prepTimeMinutes: { type: Type.NUMBER },
            cookTimeMinutes: { type: Type.NUMBER },
            estimatedCostTotal: { type: Type.NUMBER },
            costPerServing: { type: Type.NUMBER },
            isOnePotOrPan: { type: Type.BOOLEAN },
            cookingStyle: { type: Type.STRING },
            vesselUsed: { type: Type.STRING },
            seasonalNote: { type: Type.STRING },
            components: {
              type: Type.OBJECT,
              properties: {
                protein: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    dealSource: { type: Type.STRING },
                    onSaleStore: { type: Type.STRING },
                  },
                  required: ['name', 'amount'],
                },
                vegetables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.STRING },
                      dealSource: { type: Type.STRING },
                      onSaleStore: { type: Type.STRING },
                    },
                    required: ['name', 'amount'],
                  },
                },
                starchOrGrain: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    dealSource: { type: Type.STRING },
                    onSaleStore: { type: Type.STRING },
                  },
                  required: ['name', 'amount'],
                },
              },
              required: ['protein', 'vegetables', 'starchOrGrain'],
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  isPantryStaple: { type: Type.BOOLEAN },
                  store: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'amount', 'isPantryStaple'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            kidFriendlyTip: { type: Type.STRING },
            makeAheadTip: { type: Type.STRING },
            dealsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'id',
            'dayOfWeek',
            'title',
            'theme',
            'servings',
            'prepTimeMinutes',
            'cookTimeMinutes',
            'estimatedCostTotal',
            'costPerServing',
            'components',
            'ingredients',
            'instructions',
            'dealsUsed',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error swapping meal:', error);
    res.status(500).json({ error: error.message || 'Failed to swap meal' });
  }
});

// AI Refresh Flyers for Kitchener-Waterloo (Thursday cycle via Reebee Sync)
app.post('/api/refresh-flyers', async (req, res) => {
  try {
    const { cycleDate, postalCode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const postal = postalCode || 'N2L 3E4';
    const prompt = `You are the Reebee flyer sync engine for Kitchener-Waterloo, Ontario (Postal Code: ${postal}).
Generate an authentic, up-to-date set of 20-28 weekly grocery flyer deals for the Thursday cycle (${cycleDate || 'August 20 - August 26, 2026'}).
Include all 4 Waterloo banners:
1. Food Basics (Waterloo: 450 Erb St W / 130 University Ave W) - Budget produce, chicken leg quarters, pork tenderloin, pantry items.
2. Real Canadian Superstore (Waterloo: 824 Erb St W The Boardwalk) - Club size family meat packs, ground beef, salmon fillets, bulk rice, bakery bread.
3. Zehrs (Waterloo: Conestoga Mall / Beechwood / Lincoln Rd) - Boneless skinless chicken breasts, fresh seafood, Ontario harvest produce.
4. Sobeys (Waterloo: 450 Columbia St W / Parkside Dr / Bridgeport) - Sterling silver AAA Canadian beef, Compliments mushrooms, carrots, fish fillets.

Ensure prices are accurate Canadian market flyer pricing ($/lb and $/kg, each, multi-buys). For every deal include realistic salePrice, regularPrice, discountLabel, unit, and Reebee search URL.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            validFrom: { type: Type.STRING },
            validTo: { type: Type.STRING },
            syncSource: { type: Type.STRING },
            deals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  store: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  salePrice: { type: Type.NUMBER },
                  regularPrice: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  discountLabel: { type: Type.STRING },
                  validUntil: { type: Type.STRING },
                  isLossLeader: { type: Type.BOOLEAN },
                  suggestedProtein: { type: Type.STRING },
                  suggestedVeg: { type: Type.STRING },
                  suggestedStarch: { type: Type.STRING },
                  reebeeVerified: { type: Type.BOOLEAN },
                  reebeeUrl: { type: Type.STRING },
                  postalCode: { type: Type.STRING },
                },
                required: ['id', 'store', 'name', 'category', 'salePrice', 'regularPrice', 'unit'],
              },
            },
          },
          required: ['deals', 'validFrom', 'validTo'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error refreshing flyers:', error);
    res.status(500).json({ error: error.message || 'Failed to refresh flyers' });
  }
});

// Live Reebee Item Search across Waterloo flyers
app.post('/api/reebee-search', async (req, res) => {
  try {
    const { query, postalCode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured' });
    }

    const postal = postalCode || 'N2L 3E4';
    const prompt = `Search Reebee digital flyers in Kitchener-Waterloo, ON (Postal Code ${postal}) for: "${query}".
Return matching flyer deals found across Food Basics, Real Canadian Superstore, Zehrs, and Sobeys in Waterloo with accurate Canadian sale prices, regular prices, store location, unit, and savings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING },
            postalCode: { type: Type.STRING },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  store: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  salePrice: { type: Type.NUMBER },
                  regularPrice: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  discountLabel: { type: Type.STRING },
                  validUntil: { type: Type.STRING },
                  isLossLeader: { type: Type.BOOLEAN },
                  reebeeVerified: { type: Type.BOOLEAN },
                  reebeeUrl: { type: Type.STRING },
                },
                required: ['id', 'store', 'name', 'category', 'salePrice', 'regularPrice', 'unit'],
              },
            },
          },
          required: ['query', 'results'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error searching Reebee flyer deals:', error);
    res.status(500).json({ error: error.message || 'Failed to search Reebee deals' });
  }
});

// Vite Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kitchener-Waterloo Flyer Meal Planner running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
