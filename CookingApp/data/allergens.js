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
    'gluten': ['gluten', 'wheat', 'flour', 'semolina', 'durum', 'pasta', 'spaghetti', 'noodles', 'breadcrumbs', 'bread', 'croutons', 'couscous', 'bulgur', 'barley', 'rye'],
    'wheat': ['wheat', 'flour', 'semolina', 'durum', 'pasta', 'spaghetti', 'noodles', 'breadcrumbs', 'bread', 'croutons', 'couscous', 'bulgur'],
    'eggs': ['egg', 'eggs', 'yolk', 'albumen', 'mayonnaise', 'mayo'],
    'milk': ['milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'yogurt', 'parmesan', 'pecorino'],
    'dairy': ['milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'yogurt', 'parmesan', 'pecorino'],
    'cheese': ['cheese', 'parmesan', 'pecorino', 'cheddar', 'mozzarella']
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
