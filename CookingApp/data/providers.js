async function searchRecipesOnline(query) {
    if (!query || !query.trim()) {
        return [];
    }

    try {
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query.trim())}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.meals || data.meals.length === 0) {
            return [];
        }

        // Convert TheMealDB format to app format
        return data.meals.map(meal => {
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
                steps: steps
            };
        });
    } catch (error) {
        console.warn('Failed to search recipes online:', error);
        return [];
    }
}
