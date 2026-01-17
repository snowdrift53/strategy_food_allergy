/************************************
 * 1) CONFIG + HELPERS
 ************************************/

const STORAGE_KEYS = {
    GROCERY: 'groceryList',
    PROFILES: 'userProfiles',
    ACTIVE_PROFILE_ID: 'activeProfileId',
    PROFILE_LOGS: 'profileLogs',
};

const Storage = {
    load(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.warn(`Storage.load failed for key "${key}"`, e);
            return fallback;
        }
    },
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Storage.save failed for key "${key}"`, e);
        }
    }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const Id = {
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

const Text = {
    splitList(text) {
        if (!text || !text.trim()) return [];
        return text
            .split(/[,;]/)
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 0);
    }
};


/************************************
 * 2) DATA (RECIPES + ALLERGIES)
 ************************************/

const recipes = [
    {
        id: 1,
        title: "Classic Spaghetti Carbonara",
        description: "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
        photo: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop",
        imageType: "photo",
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

const SUBSTITUTION_RULES = {
    gluten: {
        rules: [
            { match: ["spaghetti", "pasta", "noodle", "penne", "macaroni", "fettuccine", "linguine"], suggest: ["Gluten-free pasta (rice/corn)", "Lentil pasta", "Chickpea pasta", "Buckwheat/soba (100%)", "Quinoa pasta"] },
            { match: ["bread", "bun", "roll", "crouton", "toast"], suggest: ["Gluten-free bread", "Corn tortillas", "Rice cakes"] },
            { match: ["flour", "wheat", "semolina"], suggest: ["Gluten-free flour blend", "Rice flour", "Oat flour (certified GF)", "Buckwheat flour"] }
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
            { match: ["cheese", "parmesan", "pecorino"], suggest: ["Dairy-free hard cheese alternative", "Nutritional yeast (umami topping)"] },
            { match: ["milk", "cream"], suggest: ["Oat milk", "Soy milk", "Coconut milk", "Oat cream"] },
            { match: ["butter"], suggest: ["Plant-based butter", "Olive oil"] }
        ],
        fallback: ["Dairy-free alternative"]
    }
};

const ALLERGEN_KEYWORDS = {
    'gluten': ['gluten', 'wheat', 'flour', 'semolina', 'durum', 'pasta', 'spaghetti', 'noodles', 'breadcrumbs', 'bread', 'croutons', 'couscous', 'barley', 'rye'],
    'wheat': ['wheat', 'flour', 'semolina', 'durum', 'pasta', 'spaghetti', 'noodles', 'breadcrumbs', 'bread', 'croutons', 'couscous'],
    'eggs': ['egg', 'eggs', 'yolk', 'albumen', 'mayonnaise'],
    'milk': ['milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'yogurt'],
    'dairy': ['milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'yogurt'],
    'cheese': ['cheese', 'parmesan', 'pecorino', 'cheddar', 'mozzarella']
};

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
        name: 'Gluten',
        symptoms: 'Digestive issues, skin rashes, fatigue, joint pain, headaches, bloating',
        commonFoods: 'Wheat, barley, rye, bread, pasta, cereals, beer, soy sauce, many processed foods',
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


/************************************
 * 3) APP STATE
 ************************************/

const AppState = {
    groceryList: Storage.load(STORAGE_KEYS.GROCERY, []),
    profiles: Storage.load(STORAGE_KEYS.PROFILES, []),
    activeProfileId: Storage.load(STORAGE_KEYS.ACTIVE_PROFILE_ID, null),
    profileLogs: Storage.load(STORAGE_KEYS.PROFILE_LOGS, {}),
};


/************************************
 * 4) PROFILES MODULE
 ************************************/

function ensureDefaultProfile() {
    if (AppState.profiles.length === 0) {
        const defaultProfile = {
            id: Id.uid(),
            name: 'Default',
            allergies: []
        };
        AppState.profiles.push(defaultProfile);
        AppState.activeProfileId = defaultProfile.id;
        Storage.save(STORAGE_KEYS.PROFILES, AppState.profiles);
        Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, AppState.activeProfileId);
    } else if (!AppState.activeProfileId || !AppState.profiles.find(p => p.id === AppState.activeProfileId)) {
        AppState.activeProfileId = AppState.profiles[0].id;
        Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, AppState.activeProfileId);
    }
}

const Profiles = {
    init() {
        ensureDefaultProfile();
        this.createWidget();
        this.attachEvents();
        this.render();
    },

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'profile-widget';
        widget.innerHTML = `
            <div class="profile-widget-header">
                <h3>Profile</h3>
                <button class="profile-toggle-btn" id="profile-toggle-btn">−</button>
            </div>
            <div class="profile-widget-body" id="profile-widget-body">
                <div class="profile-section">
                    <label for="profile-select">Active profile</label>
                    <select id="profile-select" class="profile-select"></select>
                </div>
                <div class="profile-section">
                    <label for="profile-name-input">New profile</label>
                    <div class="profile-add-section">
                        <input type="text" id="profile-name-input" class="profile-input" placeholder="Enter name...">
                        <button id="profile-add-btn" class="profile-btn">Add</button>
                    </div>
                </div>
                <div class="profile-section">
                    <label for="profile-allergies-input">Allergies</label>
                    <input type="text" id="profile-allergies-input" class="profile-input" placeholder="e.g., milk, eggs, nuts">
                </div>
                <div class="profile-section">
                    <button id="profile-delete-btn" class="profile-delete-btn">Delete Active Profile</button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    },

    attachEvents() {
        $('#profile-toggle-btn').addEventListener('click', () => this.toggleWidget());
        $('#profile-select').addEventListener('change', (e) => this.switchProfile(e.target.value));
        $('#profile-add-btn').addEventListener('click', () => this.addProfile());
        $('#profile-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProfile();
        });
        $('#profile-allergies-input').addEventListener('blur', () => this.saveAllergies());
        $('#profile-delete-btn').addEventListener('click', () => this.deleteProfile());
    },

    toggleWidget() {
        const body = $('#profile-widget-body');
        const btn = $('#profile-toggle-btn');
        if (body.classList.contains('collapsed')) {
            body.classList.remove('collapsed');
            btn.textContent = '−';
        } else {
            body.classList.add('collapsed');
            btn.textContent = '+';
        }
    },

    switchProfile(profileId) {
        AppState.activeProfileId = profileId;
        Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, AppState.activeProfileId);
        this.render();
        if (typeof Log !== 'undefined' && Log.render) {
            Log.render();
        }
        if (typeof Recipes !== 'undefined' && Recipes.renderList) {
            Recipes.renderList();
        }
    },

    addProfile() {
        const input = $('#profile-name-input');
        const name = input.value.trim();
        if (!name) return;

        const newProfile = {
            id: Id.uid(),
            name: name,
            allergies: []
        };
        AppState.profiles.push(newProfile);
        AppState.activeProfileId = newProfile.id;
        Storage.save(STORAGE_KEYS.PROFILES, AppState.profiles);
        Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, AppState.activeProfileId);
        input.value = '';
        this.render();
    },

    saveAllergies() {
        const input = $('#profile-allergies-input');
        const allergiesText = input.value.trim();
        const allergies = Text.splitList(allergiesText);

        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        if (activeProfile) {
            activeProfile.allergies = allergies;
            Storage.save(STORAGE_KEYS.PROFILES, AppState.profiles);
            if (typeof Recipes !== 'undefined' && Recipes.renderList) {
                Recipes.renderList();
            }
        }
    },

    deleteProfile() {
        if (AppState.profiles.length <= 1) {
            alert('Cannot delete the last remaining profile.');
            return;
        }

        if (!confirm('Are you sure you want to delete this profile?')) return;

        AppState.profiles = AppState.profiles.filter(p => p.id !== AppState.activeProfileId);
        
        if (AppState.profiles.length > 0) {
            AppState.activeProfileId = AppState.profiles[0].id;
        } else {
            AppState.activeProfileId = null;
        }

        Storage.save(STORAGE_KEYS.PROFILES, AppState.profiles);
        Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, AppState.activeProfileId);
        this.render();
    },

    render() {
        const select = $('#profile-select');
        const allergiesInput = $('#profile-allergies-input');

        select.innerHTML = '';
        AppState.profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            if (profile.id === AppState.activeProfileId) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        if (activeProfile) {
            allergiesInput.value = activeProfile.allergies.join(', ');
        } else {
            allergiesInput.value = '';
        }

        const deleteBtn = $('#profile-delete-btn');
        if (AppState.profiles.length <= 1) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
        } else {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.style.cursor = 'pointer';
        }
    }
};


/************************************
 * 5) LOG MODULE
 ************************************/

const Log = {
    init() {
        this.createWidget();
        this.attachEvents();
        this.render();
    },

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'log-widget';
        widget.innerHTML = `
            <div class="log-widget-header">
                <h3>Log</h3>
                <button class="log-toggle-btn" id="log-toggle-btn">−</button>
            </div>
            <div class="log-widget-body" id="log-widget-body">
                <div class="log-entry-section">
                    <textarea id="log-textarea" class="log-textarea" placeholder="Write a note..."></textarea>
                    <button id="log-save-btn" class="log-btn">Save</button>
                </div>
                <div class="log-entries" id="log-entries">
                    <!-- Log entries will be rendered here -->
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    },

    attachEvents() {
        $('#log-toggle-btn').addEventListener('click', () => this.toggleWidget());
        $('#log-save-btn').addEventListener('click', () => this.saveEntry());
        $('#log-textarea').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.saveEntry();
            }
        });
    },

    toggleWidget() {
        const body = $('#log-widget-body');
        const btn = $('#log-toggle-btn');
        if (body.classList.contains('collapsed')) {
            body.classList.remove('collapsed');
            btn.textContent = '−';
        } else {
            body.classList.add('collapsed');
            btn.textContent = '+';
        }
    },

    getProfileLogs(profileId) {
        if (!profileId) return [];
        if (!AppState.profileLogs[profileId]) {
            AppState.profileLogs[profileId] = [];
        }
        return AppState.profileLogs[profileId];
    },

    saveEntry() {
        const textarea = $('#log-textarea');
        const text = textarea.value.trim();
        if (!text) return;

        const profileId = AppState.activeProfileId;
        if (!profileId) return;

        const logs = this.getProfileLogs(profileId);
        const entry = {
            id: Id.uid(),
            ts: Date.now(),
            text: text
        };
        logs.push(entry);
        AppState.profileLogs[profileId] = logs;
        Storage.save(STORAGE_KEYS.PROFILE_LOGS, AppState.profileLogs);

        textarea.value = '';
        this.render();
    },

    deleteEntry(entryId) {
        const profileId = AppState.activeProfileId;
        if (!profileId || !AppState.profileLogs[profileId]) return;

        AppState.profileLogs[profileId] = AppState.profileLogs[profileId].filter(entry => entry.id !== entryId);
        Storage.save(STORAGE_KEYS.PROFILE_LOGS, AppState.profileLogs);
        this.render();
    },

    formatTimestamp(ts) {
        const date = new Date(ts);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    render() {
        const entriesContainer = $('#log-entries');
        const profileId = AppState.activeProfileId;

        if (!profileId) {
            entriesContainer.innerHTML = '<div class="log-empty">No active profile</div>';
            return;
        }

        const logs = this.getProfileLogs(profileId);

        if (logs.length === 0) {
            entriesContainer.innerHTML = '<div class="log-empty">No entries yet</div>';
            return;
        }

        // Render newest-last (most recent at bottom)
        const sortedLogs = [...logs].sort((a, b) => a.ts - b.ts);
        
        entriesContainer.innerHTML = sortedLogs.map(entry => `
            <div class="log-entry">
                <div class="log-entry-content">
                    <div class="log-entry-text">${this.escapeHtml(entry.text)}</div>
                    <div class="log-entry-time">${this.formatTimestamp(entry.ts)}</div>
                </div>
                <button class="log-delete-btn" data-entry-id="${entry.id}">×</button>
            </div>
        `).join('');

        // Attach delete handlers
        $$('.log-delete-btn', entriesContainer).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = btn.getAttribute('data-entry-id');
                this.deleteEntry(entryId);
            });
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};


/************************************
 * 6) UI NAVIGATION MODULE
 ************************************/

const Navigation = {
    init() {
        const navButtons = $$('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchView(view);

                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },

    switchView(viewName) {
        $$('.view-section').forEach(view => view.classList.add('hidden'));

        const targetView = $(`#${viewName}-view`);
        if (targetView) targetView.classList.remove('hidden');

        if (viewName === 'forecast') {
            Forecast.render();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};


/************************************
 * 7) RECIPES MODULE
 ************************************/

const Recipes = {
    init() {
        const backBtn = $('#back-btn');
        backBtn.addEventListener('click', () => this.renderList());
        this.renderList();
    },

    normalizeIngredient(ingredient) {
        // Lowercase and remove quantities/units (e.g., "400g", "200ml", "1 cup", "2 tbsp")
        return ingredient
            .toLowerCase()
            .replace(/\d+[gml]?\s*/g, '')
            .replace(/\d+\s*(cup|cups|tbsp|tsp|oz|lb|kg|g|ml|l)\s*/gi, '')
            .replace(/^\s+|\s+$/g, '');
    },

    checkAllergenMatch(ingredient, allergy) {
        const normalized = this.normalizeIngredient(ingredient);
        const allergyLower = allergy.toLowerCase();
        
        // First check if allergen has keywords
        if (ALLERGEN_KEYWORDS.hasOwnProperty(allergyLower)) {
            const keywords = ALLERGEN_KEYWORDS[allergyLower];
            return keywords.some(keyword => normalized.includes(keyword));
        }
        
        // Fallback to simple substring match
        return normalized.includes(allergyLower) || allergyLower.includes(normalized);
    },

    checkRecipeSuitability(recipe) {
        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        if (!activeProfile || !activeProfile.allergies || activeProfile.allergies.length === 0) {
            return null;
        }

        const allergies = activeProfile.allergies;
        const matchedAllergies = new Set();

        // Check each ingredient individually against each allergy using keyword matching
        recipe.ingredients.forEach(ingredient => {
            allergies.forEach(allergy => {
                if (this.checkAllergenMatch(ingredient, allergy)) {
                    matchedAllergies.add(allergy.toLowerCase());
                }
            });
        });

        // If no matches found, recipe is SAFE
        if (matchedAllergies.size === 0) {
            return 'SAFE';
        }

        // Check if ALL individually matched allergies have replacement options
        const allHaveReplacements = Array.from(matchedAllergies).every(allergy => {
            return SUBSTITUTION_RULES.hasOwnProperty(allergy.toLowerCase());
        });

        if (allHaveReplacements) {
            return 'REPLACEABLE';
        }

        // If matches exist but not all have replacements, recipe is not suitable
        return 'UNSAFE';
    },

    getSubstitutionsForProblem(allergen, ingredientText) {
        const allergenLower = allergen.toLowerCase();
        if (!SUBSTITUTION_RULES.hasOwnProperty(allergenLower)) {
            return [];
        }

        const rules = SUBSTITUTION_RULES[allergenLower];
        const normalizedIngredient = this.normalizeIngredient(ingredientText);

        // Check each rule for matches
        for (const rule of rules.rules) {
            const hasMatch = rule.match.some(keyword => normalizedIngredient.includes(keyword.toLowerCase()));
            if (hasMatch) {
                return rule.suggest;
            }
        }

        // Return fallback if no rule matches
        return rules.fallback || [];
    },

    getUnsafeRecipeDetails(recipe) {
        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        if (!activeProfile || !activeProfile.allergies || activeProfile.allergies.length === 0) {
            return null;
        }

        const allergies = activeProfile.allergies;
        const triggeredAllergies = new Set();
        const problemIngredients = new Set();
        const ingredientToAllergens = {};
        const ingredientToSubstitutions = {};

        // Check each ingredient individually against each allergy using keyword matching
        recipe.ingredients.forEach(ingredient => {
            allergies.forEach(allergy => {
                const allergyLower = allergy.toLowerCase();
                if (this.checkAllergenMatch(ingredient, allergy)) {
                    triggeredAllergies.add(allergyLower);
                    problemIngredients.add(ingredient);
                    
                    if (!ingredientToAllergens[ingredient]) {
                        ingredientToAllergens[ingredient] = [];
                    }
                    if (!ingredientToAllergens[ingredient].includes(allergyLower)) {
                        ingredientToAllergens[ingredient].push(allergyLower);
                    }

                    // Get context-aware substitutions for this ingredient and allergen
                    const substitutions = this.getSubstitutionsForProblem(allergyLower, ingredient);
                    if (substitutions.length > 0) {
                        if (!ingredientToSubstitutions[ingredient]) {
                            ingredientToSubstitutions[ingredient] = [];
                        }
                        // Merge substitutions, avoiding duplicates
                        substitutions.forEach(sub => {
                            if (!ingredientToSubstitutions[ingredient].includes(sub)) {
                                ingredientToSubstitutions[ingredient].push(sub);
                            }
                        });
                    }
                }
            });
        });

        return {
            triggeredAllergies: Array.from(triggeredAllergies),
            problemIngredients: Array.from(problemIngredients),
            ingredientToSubstitutions: ingredientToSubstitutions
        };
    },

    renderList() {
        const recipeList = $('#recipe-list');
        const recipeDetail = $('#recipe-detail');

        recipeList.innerHTML = '';
        recipeList.classList.remove('hidden');
        recipeDetail.classList.add('hidden');

        recipes.forEach(recipe => {
            recipeList.appendChild(this.createCard(recipe));
        });
    },

    createCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.addEventListener('click', () => this.renderDetail(recipe.id));

        const imageUrl = recipe.imageType === 'illustration' ? recipe.illustration : recipe.photo;
        const imageClass = recipe.imageType === 'illustration' ? 'recipe-image illustration' : 'recipe-image photo';
        const fallbackEmoji = recipe.imageType === 'illustration' ? '🎨' : '📷';

        const suitability = this.checkRecipeSuitability(recipe);
        let badgeHtml = '';
        if (suitability === 'SAFE') {
            badgeHtml = '<div class="recipe-badge recipe-badge-safe">⭐</div>';
        } else if (suitability === 'REPLACEABLE') {
            badgeHtml = '<div class="recipe-badge recipe-badge-replaceable">⚠️</div>';
        } else if (suitability === 'UNSAFE') {
            badgeHtml = '<div class="recipe-badge recipe-badge-unsafe">−</div>';
        }

        card.innerHTML = `
            <div class="${imageClass}">
                <img src="${imageUrl}" alt="${recipe.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='${fallbackEmoji}';">
                ${badgeHtml}
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
    },

    renderDetail(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const recipeList = $('#recipe-list');
        const recipeDetail = $('#recipe-detail');
        const detailContent = $('#detail-content');

        recipeList.classList.add('hidden');
        recipeDetail.classList.remove('hidden');

        const mainImageUrl = recipe.imageType === 'illustration' ? recipe.illustration : recipe.photo;
        const secondaryImageUrl = recipe.imageType === 'illustration' ? recipe.photo : recipe.illustration;
        const mainImageClass = recipe.imageType === 'illustration' ? 'detail-image illustration' : 'detail-image photo';
        const secondaryImageClass = recipe.imageType === 'illustration' ? 'detail-image photo' : 'detail-image illustration';

        const suitability = this.checkRecipeSuitability(recipe);
        let suitabilityHtml = '';
        let unsafeGuidanceHtml = '';
        
        if (suitability === 'SAFE') {
            suitabilityHtml = `
                <div class="recipe-suitability recipe-suitability-safe">
                    <span class="recipe-suitability-icon">⭐</span>
                    <span class="recipe-suitability-text">Suitable for your profile</span>
                </div>
            `;
        } else if (suitability === 'REPLACEABLE') {
            suitabilityHtml = `
                <div class="recipe-suitability recipe-suitability-replaceable">
                    <span class="recipe-suitability-icon">⚠️</span>
                    <span class="recipe-suitability-text">Minor substitutions needed</span>
                </div>
            `;
        } else if (suitability === 'UNSAFE') {
            const unsafeDetails = this.getUnsafeRecipeDetails(recipe);
            suitabilityHtml = `
                <div class="recipe-suitability recipe-suitability-unsafe">
                    <span class="recipe-suitability-icon">−</span>
                    <span class="recipe-suitability-text">Not suitable for your profile</span>
                </div>
            `;
            
            if (unsafeDetails && unsafeDetails.problemIngredients.length > 0) {
                let guidanceHtml = `
                    <div class="unsafe-guidance">
                        <div class="guidance-section">
                            <strong>Problem ingredients:</strong>
                            <ul class="guidance-list">
                                ${unsafeDetails.problemIngredients.map(ing => `<li>${this.escapeHtml(ing)}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="guidance-section">
                            <strong>If you still want to try it, omit:</strong>
                            <ul class="guidance-list">
                                ${unsafeDetails.problemIngredients.map(ing => `<li>${this.escapeHtml(ing)}</li>`).join('')}
                            </ul>
                        </div>
                `;
                
                if (Object.keys(unsafeDetails.ingredientToSubstitutions).length > 0) {
                    guidanceHtml += `
                        <div class="guidance-section">
                            <strong>Possible substitutions:</strong>
                            <ul class="guidance-list">
                                ${unsafeDetails.problemIngredients.map(ing => {
                                    const substitutions = unsafeDetails.ingredientToSubstitutions[ing];
                                    if (substitutions && substitutions.length > 0) {
                                        return `<li><strong>${this.escapeHtml(ing)}</strong>: ${substitutions.map(s => this.escapeHtml(s)).join(', ')}</li>`;
                                    }
                                    return '';
                                }).filter(html => html.length > 0).join('')}
                            </ul>
                        </div>
                    `;
                }
                
                guidanceHtml += '</div>';
                unsafeGuidanceHtml = guidanceHtml;
            }
        }

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
                    <div class="detail-meta-item"><span>⏱️</span><span>${recipe.time}</span></div>
                    <div class="detail-meta-item"><span>👥</span><span>${recipe.servings} servings</span></div>
                    <div class="detail-meta-item"><span>⭐</span><span>${recipe.difficulty}</span></div>
                </div>
                ${suitabilityHtml}
                ${unsafeGuidanceHtml}
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

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};


/************************************
 * 8) SHOPPING LIST MODULE
 ************************************/

const ShoppingList = {
    init() {
        $('#add-grocery-btn').addEventListener('click', () => this.addItem());
        $('#grocery-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        $('#clear-list-btn').addEventListener('click', () => this.clearAll());

        this.render();
    },

    save() {
        Storage.save(STORAGE_KEYS.GROCERY, AppState.groceryList);
    },

    addItem() {
        const input = $('#grocery-input');
        const item = input.value.trim();
        if (!item) return;

        AppState.groceryList.push({ id: Date.now(), text: item, checked: false });
        input.value = '';
        this.save();
        this.render();
    },

    removeItem(id) {
        AppState.groceryList = AppState.groceryList.filter(item => item.id !== id);
        this.save();
        this.render();
    },

    toggleItem(id) {
        const item = AppState.groceryList.find(i => i.id === id);
        if (!item) return;

        item.checked = !item.checked;
        this.save();
        this.render();
    },

    clearAll() {
        if (!confirm('Are you sure you want to clear all items?')) return;

        AppState.groceryList = [];
        this.save();
        this.render();
    },

    render() {
        const listContainer = $('#grocery-list');
        listContainer.innerHTML = '';

        if (AppState.groceryList.length === 0) {
            listContainer.innerHTML = '<li class="empty-message">Your shopping list is empty. Add items to get started!</li>';
            return;
        }

        AppState.groceryList.forEach(item => {
            const li = document.createElement('li');
            li.className = `grocery-item ${item.checked ? 'checked' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked;
            checkbox.addEventListener('change', () => this.toggleItem(item.id));

            const textSpan = document.createElement('span');
            textSpan.className = 'grocery-text';
            textSpan.textContent = item.text;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => this.removeItem(item.id));

            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(removeBtn);

            listContainer.appendChild(li);
        });
    }
};


/************************************
 * 9) ALLERGY INFO MODULE
 ************************************/

const AllergyInfo = {
    init() {
        $('#search-allergy-btn').addEventListener('click', () => this.searchReplacement());
        $('#allergy-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchReplacement();
        });

        this.renderAllergyCards();
    },

    searchReplacement() {
        const input = $('#allergy-search-input');
        const searchTerm = input.value.trim().toLowerCase();
        const resultDiv = $('#replacement-result');

        if (!searchTerm) {
            resultDiv.classList.add('hidden');
            return;
        }

        let replacements = null;

        // Check SUBSTITUTION_RULES for matching allergen
        for (const [allergen, ruleData] of Object.entries(SUBSTITUTION_RULES)) {
            if (allergen.includes(searchTerm) || searchTerm.includes(allergen)) {
                // Get all suggestions from all rules plus fallback
                replacements = [];
                ruleData.rules.forEach(rule => {
                    rule.suggest.forEach(s => {
                        if (!replacements.includes(s)) replacements.push(s);
                    });
                });
                if (ruleData.fallback) {
                    ruleData.fallback.forEach(s => {
                        if (!replacements.includes(s)) replacements.push(s);
                    });
                }
                break;
            }
        }

        if (!replacements) {
            for (const [allergen, ruleData] of Object.entries(SUBSTITUTION_RULES)) {
                if (allergen.includes(searchTerm) || searchTerm.split(' ').some(word => allergen.includes(word))) {
                    replacements = [];
                    ruleData.rules.forEach(rule => {
                        rule.suggest.forEach(s => {
                            if (!replacements.includes(s)) replacements.push(s);
                        });
                    });
                    if (ruleData.fallback) {
                        ruleData.fallback.forEach(s => {
                            if (!replacements.includes(s)) replacements.push(s);
                        });
                    }
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
        } else {
            resultDiv.innerHTML = `
                <p class="no-result">No specific replacements found for "${input.value}".
                Please consult with a healthcare professional or nutritionist for personalized advice.</p>
            `;
        }

        resultDiv.classList.remove('hidden');
    },

    renderAllergyCards() {
        const listContainer = $('#allergy-list');
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
};


/************************************
 * 10) FORECAST MODULE
 ************************************/

const Forecast = {
    normalizeIngredient(ingredient) {
        return ingredient
            .toLowerCase()
            .replace(/\d+[gml]?\s*/g, '')
            .replace(/\d+\s*/g, '')
            .replace(/\b(cut|diced|grated|minced|chopped|sliced|softened|fresh|dried|canned|for|and|or|with|the|a|an)\b/g, '')
            .replace(/[,\s]+/g, ' ')
            .trim();
    },

    extractKeyWords(ingredient) {
        const normalized = this.normalizeIngredient(ingredient);
        return normalized.split(/\s+/).filter(w => w.length > 2);
    },

    checkIngredientMatch(shoppingItem, recipeIngredient) {
        const shoppingNormalized = this.normalizeIngredient(shoppingItem);
        const recipeNormalized = this.normalizeIngredient(recipeIngredient);
        const shoppingWords = this.extractKeyWords(shoppingItem);
        const recipeWords = this.extractKeyWords(recipeIngredient);

        if (shoppingNormalized === recipeNormalized) return true;

        for (const word of shoppingWords) {
            if (recipeWords.some(rw => rw.includes(word) || word.includes(rw))) {
                return true;
            }
        }

        if (shoppingNormalized.includes(recipeNormalized) || recipeNormalized.includes(shoppingNormalized)) {
            return true;
        }

        return false;
    },

    analyzeRecipe(recipe, shoppingItems) {
        const availableItems = shoppingItems.map(item => item.toLowerCase());
        const matchedIngredients = [];
        const missingIngredients = [];

        recipe.ingredients.forEach(ingredient => {
            let found = false;
            for (const shoppingItem of availableItems) {
                if (this.checkIngredientMatch(shoppingItem, ingredient)) {
                    matchedIngredients.push(ingredient);
                    found = true;
                    break;
                }
            }
            if (!found) missingIngredients.push(ingredient);
        });

        const matchPercentage = (matchedIngredients.length / recipe.ingredients.length) * 100;

        return {
            recipe,
            matchedIngredients,
            missingIngredients,
            matchPercentage,
            canCook: missingIngredients.length === 0
        };
    },

    addSuggestedItem(ingredient) {
        AppState.groceryList.push({ id: Date.now(), text: ingredient, checked: false });
        ShoppingList.save();
        ShoppingList.render();
        this.render();
    },

    render() {
        const forecastContent = $('#forecast-content');

        if (AppState.groceryList.length === 0) {
            forecastContent.innerHTML = `
                <div class="forecast-empty">
                    <p>Your shopping list is empty. Add items to your shopping list to see recommended recipes!</p>
                    <button class="nav-btn" id="go-to-shopping-btn">Go to Shopping List</button>
                </div>
            `;

            const goBtn = $('#go-to-shopping-btn');
            if (goBtn) {
                goBtn.addEventListener('click', () => Navigation.switchView('shopping'));
            }
            return;
        }

        const shoppingItems = AppState.groceryList.filter(item => !item.checked).map(item => item.text);
        const recipeAnalyses = recipes.map(recipe => this.analyzeRecipe(recipe, shoppingItems));

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

        const canCookRecipes = recommendedRecipes.filter(analysis => analysis.canCook);
        const partialRecipes = recommendedRecipes.filter(analysis => !analysis.canCook);

        const allMissingIngredients = new Set();
        recommendedRecipes.forEach(analysis => {
            analysis.missingIngredients.forEach(ing => allMissingIngredients.add(ing));
        });

        let html = `
            <div class="forecast-intro">
                <p class="forecast-intro-text">Based on your shopping list, here are recommended recipes you can cook. Missing ingredients are highlighted for each recipe.</p>
            </div>
        `;

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

        if (allMissingIngredients.size > 0) {
            html += `
                <div class="forecast-section">
                    <h3 class="forecast-section-title shopping">🛒 Complete Your Shopping List</h3>
                    <p class="section-description">Add these missing ingredients to cook more recipes:</p>
                    <div class="shopping-suggestions">
                        <ul class="suggested-items-list">
                            ${Array.from(allMissingIngredients).map(ingredient => `
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

        // Add buttons: add to shopping list
        $$('.add-suggestion-btn, .add-missing-btn', forecastContent).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const ingredient = btn.getAttribute('data-ingredient');
                this.addSuggestedItem(ingredient);
            });
        });

        // Make ready-cards clickable (open recipe detail and switch view)
        $$('.ready-card', forecastContent).forEach(card => {
            card.addEventListener('click', () => {
                const recipeId = parseInt(card.getAttribute('data-recipe-id'), 10);
                if (!recipeId) return;

                Recipes.renderDetail(recipeId);
                Navigation.switchView('recipes');
            });
        });
    }
};


/************************************
 * 11) APP BOOTSTRAP
 ************************************/

const App = {
    init() {
        ensureDefaultProfile();
        Recipes.init();
        ShoppingList.init();
        AllergyInfo.init();
        Navigation.init();
        Profiles.init();
        Log.init();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
