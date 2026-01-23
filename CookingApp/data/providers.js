/**
 * Mapping from cuisine to family (broader category)
 * Kept for backwards compatibility with mapMealToRecipe
 */
const CUISINE_TO_FAMILY = {
    italian: 'mediterranean',
    spanish: 'mediterranean',
    mexican: 'latin',
    indian: 'asian',
    chinese: 'asian',
    japanese: 'asian',
    korean: 'asian',
    thai: 'asian'
};

/**
 * Detect if query matches a known area or group (case-insensitive)
 * Uses centralized cuisine taxonomy for stable, expandable mappings
 * @param {string} query - Search query
 * @returns {string|string[]|null} TheMealDB area name(s) if match found, null otherwise
 */
function detectAreaFromQuery(query) {
    if (!query || !query.trim()) return null;
    
    // Use centralized taxonomy if available
    if (typeof window !== 'undefined' && typeof window.detectTheMealDbAreasFromQuery === 'function') {
        return window.detectTheMealDbAreasFromQuery(query);
    }
    
    // Fallback to null if taxonomy not loaded
    return null;
}

/**
 * Fetch full meal details by ID
 * @param {string} mealId - TheMealDB meal ID
 * @returns {Promise<Object>} Full meal object
 */
async function fetchMealDetails(mealId) {
    try {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(mealId)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.meals || data.meals.length === 0) {
            return null;
        }
        
        return data.meals[0];
    } catch (error) {
        console.warn(`Failed to fetch meal details for ID ${mealId}:`, error);
        return null;
    }
}

/**
 * Convert TheMealDB meal object to app recipe format
 * @param {Object} meal - TheMealDB meal object
 * @returns {Object} App recipe object
 */
function mapMealToRecipe(meal) {
    // Parse ingredients from strIngredient1-20 and strMeasure1-20
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            const measureText = measure && measure.trim() ? measure.trim() + ' ' : '';
            ingredients.push(`${measureText}${ingredient.trim()}`);
        }
    }

    // Parse instructions into steps (split by newlines and filter empty)
    const steps = meal.strInstructions
        ? meal.strInstructions
            .split(/\r?\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0)
        : [];

    // If no steps after splitting, treat entire instructions as one step
    if (steps.length === 0 && meal.strInstructions) {
        steps.push(meal.strInstructions.trim());
    }

    // Determine family from area
    const areaLower = (meal.strArea || '').toLowerCase();
    let family = null;
    for (const [cuisine, fam] of Object.entries(CUISINE_TO_FAMILY)) {
        if (areaLower === cuisine || areaLower.includes(cuisine) || cuisine.includes(areaLower)) {
            family = fam;
            break;
        }
    }

    return {
        id: `online-${meal.idMeal}`,
        title: meal.strMeal || 'Untitled Recipe',
        description: meal.strCategory ? `${meal.strCategory} dish` : 'Recipe from TheMealDB',
        photo: meal.strMealThumb || '',
        illustration: meal.strMealThumb || '',
        imageType: 'photo',
        time: 'N/A',
        servings: 4,
        difficulty: 'Medium',
        fullDescription: meal.strInstructions ? meal.strInstructions.substring(0, 200) + '...' : 'Recipe from TheMealDB',
        ingredients: ingredients,
        steps: steps,
        // New fields for cuisine/country search
        area: meal.strArea || '',
        category: meal.strCategory || '',
        cuisine: meal.strArea || '', // Same as area
        family: family
    };
}

/**
 * Fetch meals by area (single area or array of areas)
 * @param {string|string[]} areaOrAreas - Single area name or array of area names
 * @returns {Promise<Array>} Array of full meal objects
 */
async function fetchMealsByArea(areaOrAreas) {
    const areas = Array.isArray(areaOrAreas) ? areaOrAreas : [areaOrAreas];
    const allMeals = [];
    
    // Fetch meals for each area
    for (const area of areas) {
        try {
            const url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.warn(`Failed to fetch area ${area}: HTTP ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            
            if (data.meals && data.meals.length > 0) {
                // filter.php returns basic info only (idMeal, strMeal, strMealThumb)
                // Need to fetch full details for each meal
                const mealPromises = data.meals.map(meal => fetchMealDetails(meal.idMeal));
                const mealDetails = await Promise.all(mealPromises);
                
                // Filter out null results
                const validMeals = mealDetails.filter(meal => meal !== null);
                allMeals.push(...validMeals);
            }
        } catch (error) {
            console.warn(`Failed to fetch area ${area}:`, error);
            continue;
        }
    }
    
    // Remove duplicates by idMeal
    const seen = new Set();
    return allMeals.filter(meal => {
        if (seen.has(meal.idMeal)) {
            return false;
        }
        seen.add(meal.idMeal);
        return true;
    });
}

async function searchRecipesOnline(query) {
    if (!query || !query.trim()) {
        return [];
    }

    try {
        const queryTrimmed = query.trim();
        const detectedArea = detectAreaFromQuery(queryTrimmed);
        
        let meals = [];
        
        if (detectedArea) {
            // Use area filter endpoint (handles single area or array of areas)
            meals = await fetchMealsByArea(detectedArea);
        } else {
            // Fall back to name-based search
            const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(queryTrimmed)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.meals && data.meals.length > 0) {
                meals = data.meals;
            }
        }
        
        if (meals.length === 0) {
            return [];
        }

        // Convert TheMealDB format to app format
        return meals.map(meal => mapMealToRecipe(meal));
    } catch (error) {
        console.warn('Failed to search recipes online:', error);
        return [];
    }
}
