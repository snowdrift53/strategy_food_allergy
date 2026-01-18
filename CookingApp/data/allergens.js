const ALLERGEN_CANONICAL = {
    milk: 'dairy',
    cheese: 'dairy',
    lactose: 'dairy',
    dairy: 'dairy',
    gluten: 'gluten',
    wheat: 'gluten',
    eggs: 'eggs',
    egg: 'eggs'
};

const ALLERGEN_KEYWORDS = {
    'dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'whey', 'casein'],
    'gluten': ['gluten', 'wheat', 'flour', 'bread', 'pasta', 'spaghetti', 'semolina'],
    'eggs': ['egg', 'eggs', 'yolk', 'white', 'mayonnaise']
};

const SUBSTITUTION_RULES = {
    gluten: {
        rules: [
            { match: ["spaghetti", "pasta", "noodle", "penne", "macaroni", "fettuccine", "linguine"], suggest: ["rice pasta", "corn pasta", "lentil pasta", "chickpea pasta", "quinoa pasta", "buckwheat 100% soba"] },
            { match: ["bread", "bun", "roll", "crouton", "toast"], suggest: ["Gluten-free bread", "Gluten-free croutons", "Corn tortillas", "Rice cakes"] },
            { match: ["flour", "wheat", "semolina"], suggest: ["GF blend", "rice flour", "oat flour certified GF", "buckwheat flour"] }
        ],
        fallback: ["Gluten-free alternative (certified)"]
    },
    eggs: {
        rules: [
            { match: ["egg", "eggs", "yolk", "white", "mayonnaise", "mayo"], suggest: ["Flax egg (1 tbsp flax + 3 tbsp water)", "Chia egg (1 tbsp chia + 3 tbsp water)", "Applesauce (1/4 cup per egg)", "Commercial egg replacer"] }
        ],
        fallback: ["Egg replacer"]
    },
    dairy: {
        rules: [
            { match: ["cheese", "parmesan", "pecorino"], suggest: ["Dairy-free hard cheese alternatives", "nutritional yeast"] },
            { match: ["milk", "cream"], suggest: ["Oat milk", "Soy milk", "Coconut milk", "Oat cream"] },
            { match: ["butter"], suggest: ["Plant-based butter", "Olive oil"] }
        ],
        fallback: ["Dairy-free alternative"]
    }
};

/************************************
 * SUBSTITUTION RULES MODULE
 * Simple dictionary for common allergen and ingredient substitutions
 ************************************/

const SUBSTITUTIONS = {
    // Allergen categories
    dairy: [
        "Oat milk",
        "Soy milk",
        "Coconut milk",
        "Almond milk",
        "Rice milk",
        "Plant-based butter",
        "Olive oil",
        "Dairy-free cheese",
        "Nutritional yeast",
        "Coconut cream"
    ],
    eggs: [
        "Flax egg (1 tbsp flax + 3 tbsp water)",
        "Chia egg (1 tbsp chia + 3 tbsp water)",
        "Applesauce (1/4 cup per egg)",
        "Commercial egg replacer",
        "Aquafaba (3 tbsp per egg white)",
        "Silken tofu (1/4 cup per egg)"
    ],
    nuts: [
        "Sunflower seeds",
        "Pumpkin seeds",
        "Sesame seeds",
        "Hemp seeds",
        "Roasted chickpeas",
        "Nut-free granola"
    ],
    gluten: [
        "Rice pasta",
        "Corn pasta",
        "Lentil pasta",
        "Chickpea pasta",
        "Quinoa pasta",
        "Gluten-free bread",
        "Corn tortillas",
        "Rice cakes",
        "Gluten-free flour blend"
    ],
    // Specific ingredients
    mayonnaise: [
        "Vegan mayonnaise",
        "Avocado",
        "Hummus",
        "Tahini",
        "Greek yogurt (if dairy OK)",
        "Cashew cream"
    ],
    butter: [
        "Plant-based butter",
        "Olive oil",
        "Coconut oil",
        "Avocado oil",
        "Vegan margarine"
    ],
    milk: [
        "Oat milk",
        "Soy milk",
        "Coconut milk",
        "Almond milk",
        "Rice milk",
        "Hemp milk"
    ],
    cheese: [
        "Dairy-free cheese",
        "Nutritional yeast",
        "Cashew cheese",
        "Vegan parmesan",
        "Tofu (for some recipes)"
    ],
    cream: [
        "Coconut cream",
        "Oat cream",
        "Cashew cream",
        "Silken tofu (blended)"
    ]
};

/**
 * Get substitutions for an ingredient or allergen category
 * @param {string} ingredientOrCategory - Ingredient name or allergen category (e.g., "dairy", "eggs", "mayonnaise")
 * @returns {Array<string>} Array of substitution suggestions, or empty array if not found
 */
function getSubstitutionsFor(ingredientOrCategory) {
    if (!ingredientOrCategory || typeof ingredientOrCategory !== 'string') {
        return [];
    }

    const key = ingredientOrCategory.toLowerCase().trim();
    
    // Direct lookup by key
    if (SUBSTITUTIONS.hasOwnProperty(key)) {
        return [...SUBSTITUTIONS[key]]; // Return copy to prevent mutation
    }

    // Check canonical allergen mapping
    const canonical = ALLERGEN_CANONICAL[key];
    if (canonical && SUBSTITUTIONS.hasOwnProperty(canonical)) {
        return [...SUBSTITUTIONS[canonical]];
    }

    // Check if key matches any allergen keyword
    for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
        if (keywords.some(kw => kw === key || key.includes(kw) || kw.includes(key))) {
            if (SUBSTITUTIONS.hasOwnProperty(allergen)) {
                return [...SUBSTITUTIONS[allergen]];
            }
        }
    }

    // No match found
    return [];
}
