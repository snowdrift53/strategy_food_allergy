// Recipe data
const recipes = [
    {
        id: 1,
        title: "Classic Spaghetti Carbonara",
        description: "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
        photo: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop",
        imageType: "photo", // "photo" or "illustration"
        time: "30 min",
        servings: 4,
        difficulty: "Medium",
        fullDescription: "Spaghetti Carbonara is a classic Roman pasta dish that's creamy, rich, and incredibly satisfying. This authentic recipe uses eggs, Pecorino Romano cheese, guanciale (or pancetta), and black pepper to create a silky sauce that clings to every strand of pasta.",
        ingredients: [
            "400g spaghetti",
            "200g guanciale or pancetta, diced",
            "4 large eggs",
            "100g Pecorino Romano cheese, grated",
            "Black pepper, freshly ground",
            "Salt"
        ],
        steps: [
            "Bring a large pot of salted water to a boil and cook the spaghetti according to package instructions until al dente.",
            "While the pasta cooks, heat a large pan over medium heat and cook the guanciale until crispy and golden, about 5-7 minutes.",
            "In a bowl, whisk together the eggs, grated Pecorino Romano, and a generous amount of black pepper.",
            "Drain the pasta, reserving about 1 cup of pasta water. Add the hot pasta to the pan with guanciale.",
            "Remove the pan from heat and quickly toss the pasta with the egg mixture, using the residual heat to cook the eggs without scrambling them.",
            "Add a splash of reserved pasta water if needed to create a creamy sauce. Serve immediately with extra cheese and pepper."
        ]
    },
    {
        id: 2,
        title: "Chicken Tikka Masala",
        description: "Creamy and flavorful Indian curry with tender chicken pieces in a rich tomato-based sauce.",
        photo: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
        imageType: "illustration",
        time: "45 min",
        servings: 4,
        difficulty: "Medium",
        fullDescription: "Chicken Tikka Masala is a beloved dish that combines marinated chicken pieces with a creamy, spiced tomato sauce. This recipe brings together the best of Indian flavors with a touch of creaminess that makes it irresistible.",
        ingredients: [
            "500g chicken breast, cut into chunks",
            "200ml heavy cream",
            "400g canned tomatoes",
            "1 large onion, diced",
            "3 cloves garlic, minced",
            "1 inch ginger, grated",
            "2 tbsp garam masala",
            "1 tbsp paprika",
            "1 tsp turmeric",
            "1 tsp cumin",
            "1 tsp coriander",
            "Salt and pepper",
            "Fresh cilantro for garnish"
        ],
        steps: [
            "Marinate the chicken with yogurt, garam masala, paprika, and salt for at least 30 minutes.",
            "Heat oil in a large pan and cook the marinated chicken until golden, then set aside.",
            "In the same pan, sauté onions until soft, then add garlic and ginger, cooking for 2 minutes.",
            "Add all the spices and cook for 1 minute until fragrant.",
            "Add the canned tomatoes and simmer for 10 minutes until the sauce thickens.",
            "Blend the sauce until smooth, then return to the pan.",
            "Add the cooked chicken and cream, simmer for 5 minutes. Garnish with cilantro and serve with rice or naan."
        ]
    },
    {
        id: 3,
        title: "Chocolate Chip Cookies",
        description: "Soft, chewy cookies loaded with chocolate chips - the perfect homemade treat.",
        photo: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop",
        imageType: "photo",
        time: "25 min",
        servings: 24,
        difficulty: "Easy",
        fullDescription: "These classic chocolate chip cookies are soft, chewy, and loaded with chocolate chips. They're the perfect comfort food and a favorite for all ages. The secret is in the brown sugar and slightly underbaking them for that perfect chewy texture.",
        ingredients: [
            "225g butter, softened",
            "150g brown sugar",
            "100g white sugar",
            "2 large eggs",
            "1 tsp vanilla extract",
            "280g all-purpose flour",
            "1 tsp baking soda",
            "1 tsp salt",
            "300g chocolate chips"
        ],
        steps: [
            "Preheat oven to 375°F (190°C) and line baking sheets with parchment paper.",
            "In a large bowl, cream together the butter and both sugars until light and fluffy.",
            "Beat in the eggs one at a time, then stir in the vanilla extract.",
            "In a separate bowl, combine flour, baking soda, and salt. Gradually mix into the butter mixture.",
            "Fold in the chocolate chips until evenly distributed.",
            "Drop rounded tablespoons of dough onto the prepared baking sheets, spacing them 2 inches apart.",
            "Bake for 9-11 minutes until edges are golden but centers are still soft. Cool on baking sheet for 5 minutes before transferring to wire rack."
        ]
    },
    {
        id: 4,
        title: "Beef Stir-Fry",
        description: "Quick and healthy stir-fry with tender beef, fresh vegetables, and a savory sauce.",
        photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
        imageType: "illustration",
        time: "20 min",
        servings: 4,
        difficulty: "Easy",
        fullDescription: "This beef stir-fry is a quick and healthy meal that's perfect for busy weeknights. Tender strips of beef are cooked with colorful vegetables in a savory sauce that's both flavorful and satisfying.",
        ingredients: [
            "500g beef sirloin, sliced thin",
            "2 bell peppers, sliced",
            "1 large onion, sliced",
            "2 carrots, julienned",
            "200g broccoli florets",
            "3 cloves garlic, minced",
            "2 tbsp soy sauce",
            "1 tbsp oyster sauce",
            "1 tsp sesame oil",
            "1 tbsp cornstarch",
            "2 tbsp vegetable oil"
        ],
        steps: [
            "Slice the beef into thin strips and marinate with soy sauce and cornstarch for 10 minutes.",
            "Heat a large wok or pan over high heat and add 1 tablespoon of oil.",
            "Cook the beef in batches until browned, about 2-3 minutes per batch. Remove and set aside.",
            "Add remaining oil to the pan and stir-fry the vegetables, starting with onions and carrots, then adding peppers and broccoli.",
            "Add garlic and cook for 30 seconds until fragrant.",
            "Return the beef to the pan and add soy sauce, oyster sauce, and sesame oil.",
            "Toss everything together and cook for 2 more minutes. Serve hot over rice."
        ]
    },
    {
        id: 5,
        title: "Caesar Salad",
        description: "Crisp romaine lettuce with homemade Caesar dressing, croutons, and parmesan cheese.",
        photo: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
        imageType: "photo",
        time: "15 min",
        servings: 4,
        difficulty: "Easy",
        fullDescription: "A classic Caesar salad with crisp romaine lettuce, homemade creamy dressing, crunchy croutons, and shaved parmesan. This timeless recipe never goes out of style and makes a perfect side dish or light meal.",
        ingredients: [
            "2 heads romaine lettuce, chopped",
            "1/2 cup parmesan cheese, grated",
            "1 cup croutons",
            "2 cloves garlic, minced",
            "2 anchovy fillets, minced",
            "1/4 cup lemon juice",
            "1/2 cup olive oil",
            "1 egg yolk",
            "1 tsp Dijon mustard",
            "Salt and pepper"
        ],
        steps: [
            "Wash and dry the romaine lettuce, then chop into bite-sized pieces.",
            "To make the dressing, whisk together the egg yolk, lemon juice, Dijon mustard, and minced garlic in a bowl.",
            "Slowly drizzle in the olive oil while whisking continuously until the dressing is emulsified.",
            "Add the minced anchovies and grated parmesan to the dressing. Season with salt and pepper.",
            "In a large bowl, toss the lettuce with the dressing until well coated.",
            "Add the croutons and additional parmesan cheese on top. Serve immediately."
        ]
    },
    {
        id: 6,
        title: "Beef Tacos",
        description: "Flavorful ground beef tacos with fresh toppings and warm tortillas.",
        photo: "https://images.unsplash.com/photo-1565299585323-38174c0b0b0a?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
        imageType: "illustration",
        time: "30 min",
        servings: 6,
        difficulty: "Easy",
        fullDescription: "These delicious beef tacos are packed with flavor and perfect for a family dinner or gathering. Seasoned ground beef is served in warm tortillas with fresh toppings like lettuce, tomatoes, cheese, and sour cream.",
        ingredients: [
            "500g ground beef",
            "12 taco shells or soft tortillas",
            "1 packet taco seasoning",
            "1 cup shredded lettuce",
            "2 tomatoes, diced",
            "1 cup shredded cheese",
            "1/2 cup sour cream",
            "1/2 cup salsa",
            "1 onion, diced",
            "2 cloves garlic, minced"
        ],
        steps: [
            "Heat a large skillet over medium-high heat and cook the ground beef until browned, breaking it up as it cooks.",
            "Add the diced onion and garlic, cooking until softened, about 3-4 minutes.",
            "Drain excess fat, then add the taco seasoning and a splash of water. Simmer for 5 minutes.",
            "Warm the taco shells or tortillas according to package instructions.",
            "Fill each taco shell with the seasoned beef mixture.",
            "Top with shredded lettuce, diced tomatoes, cheese, sour cream, and salsa. Serve immediately."
        ]
    }
];

// Shopping list data (stored in localStorage)
let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

// Allergy replacement database
const allergyReplacements = {
    'milk': ['Almond milk', 'Soy milk', 'Oat milk', 'Coconut milk', 'Rice milk'],
    'dairy': ['Almond milk', 'Soy milk', 'Oat milk', 'Coconut milk', 'Cashew milk'],
    'eggs': ['Flaxseed eggs (1 tbsp ground flaxseed + 3 tbsp water)', 'Chia eggs (1 tbsp chia seeds + 3 tbsp water)', 'Applesauce (1/4 cup per egg)', 'Banana (1/2 mashed banana per egg)', 'Commercial egg replacer'],
    'wheat': ['Almond flour', 'Coconut flour', 'Rice flour', 'Oat flour', 'Gluten-free flour blend'],
    'gluten': ['Almond flour', 'Coconut flour', 'Rice flour', 'Oat flour (certified GF)', 'Quinoa flour'],
    'nuts': ['Sunflower seeds', 'Pumpkin seeds', 'Roasted chickpeas', 'Soy nuts', 'Pretzels (for texture)'],
    'peanuts': ['Sunflower seed butter', 'Soy nut butter', 'Almond butter (if not allergic to tree nuts)', 'Tahini'],
    'soy': ['Coconut aminos (instead of soy sauce)', 'Tempeh alternatives', 'Lentils (for protein)', 'Chickpeas'],
    'fish': ['Tofu', 'Tempeh', 'Mushrooms', 'Eggplant', 'Plant-based alternatives'],
    'shellfish': ['Tofu', 'Tempeh', 'Mushrooms', 'Chicken', 'Turkey'],
    'sesame': ['Sunflower seeds', 'Pumpkin seeds', 'Hemp seeds', 'Poppy seeds'],
    'tomatoes': ['Red bell peppers', 'Beets', 'Carrots', 'Pumpkin puree'],
    'garlic': ['Asafoetida (hing)', 'Garlic-infused oil (if not allergic to garlic)', 'Chives', 'Shallots'],
    'onions': ['Fennel', 'Celery', 'Leeks (if tolerated)', 'Asafoetida'],
    'corn': ['Rice', 'Potatoes', 'Quinoa', 'Millet'],
    'chicken': ['Turkey', 'Tofu', 'Tempeh', 'Lentils', 'Chickpeas']
};

// Common allergies information
const commonAllergies = [
    {
        name: 'Milk/Dairy',
        symptoms: 'Nausea, vomiting, diarrhea, stomach cramps, skin rashes, hives, wheezing, anaphylaxis',
        commonFoods: 'Milk, cheese, butter, yogurt, cream, ice cream, whey, casein',
        severity: 'Can range from mild to severe'
    },
    {
        name: 'Eggs',
        symptoms: 'Skin reactions, digestive problems, respiratory issues, anaphylaxis',
        commonFoods: 'Eggs, mayonnaise, baked goods, pasta, some vaccines',
        severity: 'Often outgrown in childhood, but can persist'
    },
    {
        name: 'Peanuts',
        symptoms: 'Hives, swelling, difficulty breathing, anaphylaxis',
        commonFoods: 'Peanuts, peanut butter, peanut oil, some sauces and baked goods',
        severity: 'Usually lifelong, can be severe'
    },
    {
        name: 'Tree Nuts',
        symptoms: 'Hives, swelling, difficulty breathing, anaphylaxis',
        commonFoods: 'Almonds, walnuts, cashews, pistachios, hazelnuts, Brazil nuts',
        severity: 'Usually lifelong, can be severe'
    },
    {
        name: 'Wheat/Gluten',
        symptoms: 'Digestive issues, skin rashes, fatigue, joint pain, headaches',
        commonFoods: 'Bread, pasta, cereals, beer, soy sauce, many processed foods',
        severity: 'Can cause celiac disease or non-celiac gluten sensitivity'
    },
    {
        name: 'Soy',
        symptoms: 'Hives, itching, digestive problems, difficulty breathing',
        commonFoods: 'Soybeans, tofu, tempeh, soy sauce, many processed foods',
        severity: 'Often outgrown, but can persist'
    },
    {
        name: 'Fish',
        symptoms: 'Hives, swelling, digestive problems, anaphylaxis',
        commonFoods: 'All types of fish, fish sauce, some salad dressings',
        severity: 'Usually lifelong, can be severe'
    },
    {
        name: 'Shellfish',
        symptoms: 'Hives, swelling, difficulty breathing, anaphylaxis',
        commonFoods: 'Shrimp, crab, lobster, clams, mussels, scallops',
        severity: 'Usually lifelong, can be severe'
    },
    {
        name: 'Sesame',
        symptoms: 'Hives, swelling, digestive problems, anaphylaxis',
        commonFoods: 'Sesame seeds, tahini, sesame oil, some breads and crackers',
        severity: 'Can be severe, becoming more common'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    displayRecipes();
    setupEventListeners();
    setupNavigation();
    loadShoppingList();
    displayAllergyList();
});

// Display all recipes
function displayRecipes() {
    const recipeList = document.getElementById('recipe-list');
    const recipeDetail = document.getElementById('recipe-detail');
    
    recipeList.innerHTML = '';
    recipeList.classList.remove('hidden');
    recipeDetail.classList.add('hidden');
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeList.appendChild(recipeCard);
    });
}

// Create a recipe card element
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => showRecipeDetail(recipe.id);
    
    // Determine which image to show based on imageType
    const imageUrl = recipe.imageType === 'illustration' ? recipe.illustration : recipe.photo;
    const imageClass = recipe.imageType === 'illustration' ? 'recipe-image illustration' : 'recipe-image photo';
    
    card.innerHTML = `
        <div class="${imageClass}">
            <img src="${imageUrl}" alt="${recipe.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='${recipe.imageType === 'illustration' ? '🎨' : '📷'}';">
        </div>
        <div class="recipe-info">
            <h2 class="recipe-title">${recipe.title}</h2>
            <p class="recipe-description">${recipe.description}</p>
            <div class="recipe-meta">
                <span>⏱️ ${recipe.time}</span>
                <span>👥 ${recipe.servings} servings</span>
                <span>⭐ ${recipe.difficulty}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Show recipe detail
function showRecipeDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const recipeList = document.getElementById('recipe-list');
    const recipeDetail = document.getElementById('recipe-detail');
    const detailContent = document.getElementById('detail-content');
    
    recipeList.classList.add('hidden');
    recipeDetail.classList.remove('hidden');
    
    // Get both images for detail view
    const mainImageUrl = recipe.imageType === 'illustration' ? recipe.illustration : recipe.photo;
    const secondaryImageUrl = recipe.imageType === 'illustration' ? recipe.photo : recipe.illustration;
    const mainImageClass = recipe.imageType === 'illustration' ? 'detail-image illustration' : 'detail-image photo';
    const secondaryImageClass = recipe.imageType === 'illustration' ? 'detail-image photo' : 'detail-image illustration';
    
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-images">
                <div class="${mainImageClass}">
                    <img src="${mainImageUrl}" alt="${recipe.title}" onerror="this.style.display='none';">
                </div>
                <div class="${secondaryImageClass}">
                    <img src="${secondaryImageUrl}" alt="${recipe.title}" onerror="this.style.display='none';">
                </div>
            </div>
            <h1 class="detail-title">${recipe.title}</h1>
            <div class="detail-meta">
                <div class="detail-meta-item">
                    <span>⏱️</span>
                    <span>${recipe.time}</span>
                </div>
                <div class="detail-meta-item">
                    <span>👥</span>
                    <span>${recipe.servings} servings</span>
                </div>
                <div class="detail-meta-item">
                    <span>⭐</span>
                    <span>${recipe.difficulty}</span>
                </div>
            </div>
            <p class="detail-description">${recipe.fullDescription}</p>
        </div>
        
        <div class="detail-section">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
        
        <div class="detail-section">
            <h3>Instructions</h3>
            <ol class="steps-list">
                ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup event listeners
function setupEventListeners() {
    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', displayRecipes);
    
    // Shopping list event listeners
    const addGroceryBtn = document.getElementById('add-grocery-btn');
    const groceryInput = document.getElementById('grocery-input');
    const clearListBtn = document.getElementById('clear-list-btn');
    
    addGroceryBtn.addEventListener('click', addGroceryItem);
    groceryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addGroceryItem();
        }
    });
    clearListBtn.addEventListener('click', clearShoppingList);
    
    // Allergy search event listeners
    const searchAllergyBtn = document.getElementById('search-allergy-btn');
    const allergySearchInput = document.getElementById('allergy-search-input');
    
    searchAllergyBtn.addEventListener('click', searchAllergyReplacement);
    allergySearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAllergyReplacement();
        }
    });
}

// Navigation functionality
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
            
            // Update active button
            navButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    // Generate forecast when forecast view is opened
    if (viewName === 'forecast') {
        generateForecast();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Shopping List functionality
function addGroceryItem() {
    const input = document.getElementById('grocery-input');
    const item = input.value.trim();
    
    if (item) {
        groceryList.push({ id: Date.now(), text: item, checked: false });
        input.value = '';
        saveShoppingList();
        loadShoppingList();
    }
}

function removeGroceryItem(id) {
    groceryList = groceryList.filter(item => item.id !== id);
    saveShoppingList();
    loadShoppingList();
}

function toggleGroceryItem(id) {
    const item = groceryList.find(i => i.id === id);
    if (item) {
        item.checked = !item.checked;
        saveShoppingList();
        loadShoppingList();
    }
}

function clearShoppingList() {
    if (confirm('Are you sure you want to clear all items?')) {
        groceryList = [];
        saveShoppingList();
        loadShoppingList();
    }
}

function saveShoppingList() {
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
}

function loadShoppingList() {
    const listContainer = document.getElementById('grocery-list');
    listContainer.innerHTML = '';
    
    if (groceryList.length === 0) {
        listContainer.innerHTML = '<li class="empty-message">Your shopping list is empty. Add items to get started!</li>';
        return;
    }
    
    groceryList.forEach(item => {
        const li = document.createElement('li');
        li.className = `grocery-item ${item.checked ? 'checked' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked;
        checkbox.addEventListener('change', () => toggleGroceryItem(item.id));
        
        const textSpan = document.createElement('span');
        textSpan.className = 'grocery-text';
        textSpan.textContent = item.text;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => removeGroceryItem(item.id));
        
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(removeBtn);
        listContainer.appendChild(li);
    });
}

// Allergy Information functionality
function searchAllergyReplacement() {
    const input = document.getElementById('allergy-search-input');
    const searchTerm = input.value.trim().toLowerCase();
    const resultDiv = document.getElementById('replacement-result');
    
    if (!searchTerm) {
        resultDiv.classList.add('hidden');
        return;
    }
    
    // Find matching allergy
    let replacements = null;
    for (const [allergy, replacementList] of Object.entries(allergyReplacements)) {
        if (allergy.includes(searchTerm) || searchTerm.includes(allergy)) {
            replacements = replacementList;
            break;
        }
    }
    
    // Also check for partial matches
    if (!replacements) {
        for (const [allergy, replacementList] of Object.entries(allergyReplacements)) {
            if (allergy.includes(searchTerm) || searchTerm.split(' ').some(word => allergy.includes(word))) {
                replacements = replacementList;
                break;
            }
        }
    }
    
    if (replacements) {
        resultDiv.innerHTML = `
            <h4>Replacements for "${input.value}":</h4>
            <ul class="replacement-list">
                ${replacements.map(rep => `<li>${rep}</li>`).join('')}
            </ul>
        `;
        resultDiv.classList.remove('hidden');
    } else {
        resultDiv.innerHTML = `
            <p class="no-result">No specific replacements found for "${input.value}". 
            Please consult with a healthcare professional or nutritionist for personalized advice.</p>
        `;
        resultDiv.classList.remove('hidden');
    }
}

function displayAllergyList() {
    const listContainer = document.getElementById('allergy-list');
    listContainer.innerHTML = '';
    
    commonAllergies.forEach(allergy => {
        const card = document.createElement('div');
        card.className = 'allergy-card';
        card.innerHTML = `
            <h4 class="allergy-name">${allergy.name}</h4>
            <div class="allergy-info">
                <p><strong>Symptoms:</strong> ${allergy.symptoms}</p>
                <p><strong>Common Foods:</strong> ${allergy.commonFoods}</p>
                <p><strong>Severity:</strong> ${allergy.severity}</p>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Forecast functionality
function normalizeIngredient(ingredient) {
    // Remove quantities, measurements, and common words to get the base ingredient
    return ingredient
        .toLowerCase()
        .replace(/\d+[gml]?\s*/g, '') // Remove numbers and units like "400g", "200ml"
        .replace(/\d+\s*/g, '') // Remove standalone numbers
        .replace(/\b(cut|diced|grated|minced|chopped|sliced|softened|fresh|dried|canned|for|and|or|with|the|a|an)\b/g, '') // Remove common words
        .replace(/[,\s]+/g, ' ') // Normalize spaces
        .trim();
}

function extractKeyWords(ingredient) {
    // Extract key words from ingredient string
    const normalized = normalizeIngredient(ingredient);
    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    return words;
}

function checkIngredientMatch(shoppingItem, recipeIngredient) {
    const shoppingNormalized = normalizeIngredient(shoppingItem);
    const recipeNormalized = normalizeIngredient(recipeIngredient);
    const shoppingWords = extractKeyWords(shoppingItem);
    const recipeWords = extractKeyWords(recipeIngredient);
    
    // Exact match after normalization
    if (shoppingNormalized === recipeNormalized) return true;
    
    // Check if any key words match
    for (const word of shoppingWords) {
        if (recipeWords.some(rw => rw.includes(word) || word.includes(rw))) {
            return true;
        }
    }
    
    // Check if shopping item contains recipe ingredient or vice versa
    if (shoppingNormalized.includes(recipeNormalized) || recipeNormalized.includes(shoppingNormalized)) {
        return true;
    }
    
    return false;
}

function analyzeRecipe(recipe, shoppingItems) {
    const availableItems = shoppingItems.map(item => item.text.toLowerCase());
    const matchedIngredients = [];
    const missingIngredients = [];
    
    recipe.ingredients.forEach(ingredient => {
        let found = false;
        for (const shoppingItem of availableItems) {
            if (checkIngredientMatch(shoppingItem, ingredient)) {
                matchedIngredients.push(ingredient);
                found = true;
                break;
            }
        }
        if (!found) {
            missingIngredients.push(ingredient);
        }
    });
    
    const matchPercentage = (matchedIngredients.length / recipe.ingredients.length) * 100;
    
    return {
        recipe: recipe,
        matchedIngredients: matchedIngredients,
        missingIngredients: missingIngredients,
        matchPercentage: matchPercentage,
        canCook: missingIngredients.length === 0
    };
}

function generateForecast() {
    const forecastContent = document.getElementById('forecast-content');
    
    if (groceryList.length === 0) {
        forecastContent.innerHTML = `
            <div class="forecast-empty">
                <p>Your shopping list is empty. Add items to your shopping list to see recommended recipes!</p>
                <button class="nav-btn" onclick="switchView('shopping')">Go to Shopping List</button>
            </div>
        `;
        return;
    }
    
    const shoppingItems = groceryList.filter(item => !item.checked).map(item => item.text);
    const recipeAnalyses = recipes.map(recipe => analyzeRecipe(recipe, shoppingItems));
    
    // Sort all recipes by match percentage (best matches first), then filter out recipes with 0% match
    const recommendedRecipes = recipeAnalyses
        .filter(analysis => analysis.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    if (recommendedRecipes.length === 0) {
        forecastContent.innerHTML = `
            <div class="forecast-empty">
                <p>No recipes match your current shopping list. Try adding more ingredients or check out our recipe collection!</p>
            </div>
        `;
        return;
    }
    
    // Separate into categories for better organization
    const canCookRecipes = recommendedRecipes.filter(analysis => analysis.canCook);
    const partialRecipes = recommendedRecipes.filter(analysis => !analysis.canCook);
    
    // Collect all missing ingredients from recommended recipes
    const allMissingIngredients = new Set();
    recommendedRecipes.forEach(analysis => {
        analysis.missingIngredients.forEach(ing => allMissingIngredients.add(ing));
    });
    
    let html = `
        <div class="forecast-intro">
            <p class="forecast-intro-text">Based on your shopping list, here are recommended recipes you can cook. Missing ingredients are highlighted for each recipe.</p>
        </div>
    `;
    
    // Recipes you can cook now (100% match)
    if (canCookRecipes.length > 0) {
        html += `
            <div class="forecast-section">
                <h3 class="forecast-section-title success">✅ Recommended: Ready to Cook</h3>
                <p class="section-description">These recipes match your shopping list perfectly!</p>
                <div class="recipe-forecast-grid">
                    ${canCookRecipes.map(analysis => `
                        <div class="recipe-forecast-card ready-card" data-recipe-id="${analysis.recipe.id}">
                            <div class="forecast-recipe-image">
                                <img src="${analysis.recipe.imageType === 'illustration' ? analysis.recipe.illustration : analysis.recipe.photo}" alt="${analysis.recipe.title}">
                            </div>
                            <h4>${analysis.recipe.title}</h4>
                            <p class="forecast-meta">⏱️ ${analysis.recipe.time} | 👥 ${analysis.recipe.servings} servings</p>
                            <div class="forecast-status success-status">✓ All ingredients available!</div>
                            <div class="ingredient-match-info">
                                <span class="match-badge">${analysis.matchedIngredients.length}/${analysis.recipe.ingredients.length} ingredients</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Recommended recipes with missing ingredients
    if (partialRecipes.length > 0) {
        html += `
            <div class="forecast-section">
                <h3 class="forecast-section-title partial">⭐ Recommended: Almost Ready</h3>
                <p class="section-description">These recipes are close to completion. Check what's missing below:</p>
                <div class="recipe-forecast-grid">
                    ${partialRecipes.map(analysis => `
                        <div class="recipe-forecast-card partial-card">
                            <div class="forecast-recipe-image">
                                <img src="${analysis.recipe.imageType === 'illustration' ? analysis.recipe.illustration : analysis.recipe.photo}" alt="${analysis.recipe.title}">
                            </div>
                            <h4>${analysis.recipe.title}</h4>
                            <p class="forecast-meta">⏱️ ${analysis.recipe.time} | 👥 ${analysis.recipe.servings} servings</p>
                            <div class="forecast-status partial-status">${Math.round(analysis.matchPercentage)}% complete</div>
                            <div class="ingredient-match-info">
                                <span class="match-badge">${analysis.matchedIngredients.length}/${analysis.recipe.ingredients.length} ingredients</span>
                            </div>
                            <div class="missing-ingredients-box">
                                <div class="missing-header">
                                    <strong>⚠️ Missing Ingredients (${analysis.missingIngredients.length}):</strong>
                                </div>
                                <ul class="missing-ingredients-list">
                                    ${analysis.missingIngredients.map(ing => `
                                        <li>
                                            <span>${ing}</span>
                                            <button class="add-missing-btn" data-ingredient="${ing.replace(/"/g, '&quot;')}" title="Add to shopping list">+</button>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Summary of all missing ingredients
    if (allMissingIngredients.size > 0) {
        html += `
            <div class="forecast-section">
                <h3 class="forecast-section-title shopping">🛒 Complete Your Shopping List</h3>
                <p class="section-description">Add these missing ingredients to cook more recipes:</p>
                <div class="shopping-suggestions">
                    <ul class="suggested-items-list">
                        ${Array.from(allMissingIngredients).map((ingredient, index) => `
                            <li>
                                <span>${ingredient}</span>
                                <button class="add-suggestion-btn" data-ingredient="${ingredient.replace(/"/g, '&quot;')}">+ Add to List</button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    forecastContent.innerHTML = html;
    
    // Add event listeners to all add buttons
    const suggestionButtons = document.querySelectorAll('.add-suggestion-btn, .add-missing-btn');
    suggestionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click if clicking button
            const ingredient = this.getAttribute('data-ingredient');
            addSuggestedItem(ingredient);
        });
    });
    
    // Make recipe cards clickable
    const readyCards = document.querySelectorAll('.ready-card');
    readyCards.forEach(card => {
        card.addEventListener('click', function() {
            const recipeId = parseInt(this.getAttribute('data-recipe-id'));
            if (recipeId) {
                showRecipeDetail(recipeId);
                switchView('recipes');
            }
        });
    });
}

function addSuggestedItem(ingredient) {
    // Add ingredient to shopping list
    groceryList.push({ id: Date.now(), text: ingredient, checked: false });
    saveShoppingList();
    loadShoppingList();
    
    // Show feedback
    const buttons = document.querySelectorAll('.add-suggestion-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-ingredient') === ingredient) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Added!';
            btn.style.background = '#6B8E23';
            btn.disabled = true;
            setTimeout(() => {
                // Regenerate forecast after a short delay
                generateForecast();
            }, 1500);
        }
    });
}
