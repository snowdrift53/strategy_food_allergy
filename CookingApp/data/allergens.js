const ALLERGEN_KEYWORDS = {
    'gluten': ['pasta', 'spaghetti', 'noodles', 'semolina', 'flour', 'bread', 'couscous', 'bulgur', 'wheat'],
    'dairy': ['cheese', 'parmesan', 'pecorino', 'butter', 'cream', 'milk', 'yogurt', 'whey', 'casein'],
    'eggs': ['egg', 'eggs', 'yolk', 'mayo', 'mayonnaise']
};

const SUBSTITUTION_RULES = [
    {
        allergen: 'gluten',
        ingredientPattern: /(spaghetti|pasta|noodle|penne|macaroni|fettuccine|linguine)/i,
        substitutions: ['rice pasta', 'corn pasta', 'lentil pasta', 'chickpea pasta', 'quinoa pasta', 'buckwheat 100% soba']
    },
    {
        allergen: 'gluten',
        ingredientPattern: /(bread|bun|roll|crouton|toast)/i,
        substitutions: ['gluten-free bread', 'gluten-free croutons', 'corn tortillas', 'rice cakes']
    },
    {
        allergen: 'gluten',
        ingredientPattern: /(flour|wheat|semolina)/i,
        substitutions: ['GF blend', 'rice flour', 'oat flour certified GF', 'buckwheat flour']
    },
    {
        allergen: 'dairy',
        ingredientPattern: /(cheese|parmesan|pecorino)/i,
        substitutions: ['dairy-free hard cheese alternatives', 'nutritional yeast']
    },
    {
        allergen: 'dairy',
        ingredientPattern: /(milk|cream|butter)/i,
        substitutions: ['Almond milk', 'Soy milk', 'Oat milk', 'Coconut milk', 'Cashew milk', 'Coconut cream', 'Vegan butter']
    }
];
