/************************************
 * APP METADATA
 ************************************/

const APP_META = {
    name: "Cooking Recipes",
    tagline: "Discover delicious recipes from around the world",
    storagePrefix: "cookingapp"
};

/************************************
 * 1) CONFIG + HELPERS
 ************************************/

const DEBUG_ALLERGY = false;

const STORAGE_KEYS = {
    GROCERY: 'groceryList',
    PROFILES: 'userProfiles',
    ACTIVE_PROFILE_ID: 'activeProfileId',
    PROFILE_LOGS: 'profileLogs',
};

const Storage = {
    load(key, fallback) {
        try {
            const prefixedKey = `${APP_META.storagePrefix}_${key}`;
            const raw = localStorage.getItem(prefixedKey);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.warn(`Storage.load failed for key "${key}"`, e);
            return fallback;
        }
    },
    save(key, value) {
        try {
            const prefixedKey = `${APP_META.storagePrefix}_${key}`;
            localStorage.setItem(prefixedKey, JSON.stringify(value));
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
 * 
 * Note: Large data objects have been moved to separate files:
 * - data/recipes.local.js exports: recipes
 * - data/allergens.js exports: ALLERGEN_CANONICAL, ALLERGEN_KEYWORDS, SUBSTITUTION_RULES
 * These are loaded via <script> tags in index.html before this file.
 ************************************/

function normalizeUserAllergies(rawList) {
    if (!Array.isArray(rawList)) return [];
    
    const canonicalSet = new Set();
    rawList.forEach(allergy => {
        if (!allergy || typeof allergy !== 'string') return;
        const allergyLower = allergy.toLowerCase().trim();
        if (!allergyLower) return;
        
        // Get canonical form, or use the allergy itself if not in map
        const canonical = ALLERGEN_CANONICAL[allergyLower] || allergyLower;
        canonicalSet.add(canonical);
    });
    
    return Array.from(canonicalSet);
}

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
 * 3) STATE + STORAGE
 ************************************/

function loadState() {
    return {
        shoppingList: Storage.load(STORAGE_KEYS.GROCERY, []),
        profiles: (() => {
            const loaded = Storage.load(STORAGE_KEYS.PROFILES, []);
            // Normalize allergies for all existing profiles
            loaded.forEach(profile => {
                if (profile.allergies && Array.isArray(profile.allergies)) {
                    profile.allergies = normalizeUserAllergies(profile.allergies);
                }
            });
            return loaded;
        })(),
        activeProfileId: Storage.load(STORAGE_KEYS.ACTIVE_PROFILE_ID, null),
        profileLogs: Storage.load(STORAGE_KEYS.PROFILE_LOGS, {}),
    };
}

function saveState() {
    Storage.save(STORAGE_KEYS.GROCERY, state.shoppingList);
    Storage.save(STORAGE_KEYS.PROFILES, state.profiles);
    Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, state.activeProfileId);
    Storage.save(STORAGE_KEYS.PROFILE_LOGS, state.profileLogs);
}

const state = loadState();

// Legacy AppState for backward compatibility during transition
const AppState = {
    get groceryList() { return state.shoppingList; },
    set groceryList(value) { state.shoppingList = value; },
    get profiles() { return state.profiles; },
    set profiles(value) { state.profiles = value; },
    get activeProfileId() { return state.activeProfileId; },
    set activeProfileId(value) { state.activeProfileId = value; },
    get profileLogs() { return state.profileLogs; },
    set profileLogs(value) { state.profileLogs = value; },
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
        saveState();
    } else if (!AppState.activeProfileId || !AppState.profiles.find(p => p.id === AppState.activeProfileId)) {
        AppState.activeProfileId = AppState.profiles[0].id;
        saveState();
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
        saveState();
        renderApp();
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
        saveState();
        input.value = '';
        renderApp();
    },

    saveAllergies() {
        const input = $('#profile-allergies-input');
        const allergiesText = input.value.trim();
        const rawAllergies = Text.splitList(allergiesText);
        const allergies = normalizeUserAllergies(rawAllergies);

        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        if (activeProfile) {
            activeProfile.allergies = allergies;
            saveState();
            renderApp();
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

        saveState();
        renderApp();
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
        saveState();

        textarea.value = '';
        renderApp();
    },

    deleteEntry(entryId) {
        const profileId = AppState.activeProfileId;
        if (!profileId || !AppState.profileLogs[profileId]) return;

        AppState.profileLogs[profileId] = AppState.profileLogs[profileId].filter(entry => entry.id !== entryId);
        saveState();
        renderApp();
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
 * 6) ALLERGY ENGINE MODULE
 ************************************/

// Simple allergy replacements map (fallback substitutions)
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
    'sesame': ['Sunflower seeds', 'Pumpkin seeds', 'Hemp seeds', 'Poppy seeds']
};

const AllergyEngine = {
    normalizeText(s) {
        if (!s || typeof s !== 'string') return '';
        return s
            .toLowerCase()
            .replace(/[.,;:!?()[\]{}'"]/g, '')
            .trim();
    },

    parseAllergies(raw) {
        if (!raw) return [];
        if (typeof raw === 'string') {
            return raw
                .split(/[,;]/)
                .map(item => this.normalizeText(item))
                .filter(item => item.length > 0);
        }
        if (Array.isArray(raw)) {
            return raw
                .map(item => typeof item === 'string' ? this.normalizeText(item) : '')
                .filter(item => item.length > 0);
        }
        return [];
    },

    detectAllergens(recipeIngredients, allergies) {
        const hitIngredients = [];
        const detectedAllergens = new Set();
        
        if (!Array.isArray(recipeIngredients) || !Array.isArray(allergies)) {
            return { hitIngredients: [], detectedAllergens: [] };
        }

        const normalizedAllergies = this.parseAllergies(allergies);
        
        // Map user allergies to canonical allergen keys
        const activeAllergenKeys = new Set();
        normalizedAllergies.forEach(allergy => {
            const canonical = ALLERGEN_CANONICAL[allergy] || allergy;
            // Check if it's a direct key or should be mapped
            if (ALLERGEN_KEYWORDS.hasOwnProperty(canonical)) {
                activeAllergenKeys.add(canonical);
            } else {
                // Check if allergy is a keyword for an allergen key
                for (const [key, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
                    if (keywords.includes(allergy) || keywords.includes(canonical)) {
                        activeAllergenKeys.add(key);
                        break;
                    }
                }
            }
        });

        // For each ingredient line, check against allergen trigger keywords
        recipeIngredients.forEach(ingredientLine => {
            if (!ingredientLine || typeof ingredientLine !== 'string') return;
            
            const normalizedIngredient = ingredientLine.toLowerCase();
            let ingredientHit = false;
            const allergensForThisIngredient = new Set();

            // Check each active allergen key
            activeAllergenKeys.forEach(allergenKey => {
                if (ALLERGEN_KEYWORDS.hasOwnProperty(allergenKey)) {
                    const triggers = ALLERGEN_KEYWORDS[allergenKey];
                    // Check if ANY trigger keyword is contained in the ingredient line
                    const hasMatch = triggers.some(trigger => normalizedIngredient.includes(trigger));
                    if (hasMatch) {
                        ingredientHit = true;
                        allergensForThisIngredient.add(allergenKey);
                        detectedAllergens.add(allergenKey);
                    }
                }
            });

            if (ingredientHit) {
                hitIngredients.push(ingredientLine);
            }
        });

        return {
            hitIngredients: hitIngredients,
            detectedAllergens: Array.from(detectedAllergens)
        };
    },

    getSubstitutionsForAllergen(allergenKey) {
        if (!allergenKey || typeof allergenKey !== 'string') return null;
        const key = allergenKey.toLowerCase();
        
        // Direct lookup by allergen key (dairy, gluten, eggs)
        if (allergyReplacements.hasOwnProperty(key)) {
            return allergyReplacements[key];
        }
        
        return null;
    },

    classifyRecipe(recipe, allergies) {
        if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
            return { status: 'safe', hitIngredients: [], detectedAllergens: [], substitutionsByAllergen: {} };
        }

        const totalIngredients = recipe.ingredients.length;
        const detection = this.detectAllergens(recipe.ingredients, allergies);
        const hitIngredients = detection.hitIngredients;
        const detectedAllergens = detection.detectedAllergens;

        // Ratio-based severity rule (no substitution gating)
        if (hitIngredients.length === 0) {
            return { status: 'safe', hitIngredients: [], detectedAllergens: [], substitutionsByAllergen: {} };
        }

        const hitRatio = hitIngredients.length / totalIngredients;

        // Generate substitutions by allergen key
        const substitutionsByAllergen = {};
        detectedAllergens.forEach(allergenKey => {
            const substitutions = this.getSubstitutionsForAllergen(allergenKey);
            if (substitutions) {
                substitutionsByAllergen[allergenKey] = substitutions;
            }
        });

        if (hitRatio <= 0.60) {
            return { status: 'substitutable', hitIngredients: hitIngredients, detectedAllergens: detectedAllergens, substitutionsByAllergen: substitutionsByAllergen };
        }

        return { status: 'avoid', hitIngredients: hitIngredients, detectedAllergens: detectedAllergens, substitutionsByAllergen: substitutionsByAllergen };
    }
};


/************************************
 * 7) UI NAVIGATION MODULE
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
    currentRecipes: [],
    searchMode: 'local',

    init() {
        const backBtn = $('#back-btn');
        if (backBtn) {
        backBtn.addEventListener('click', () => this.renderList());
        }

        const searchInput = $('#recipe-search-input');
        const localBtn = $('#recipe-search-local-btn');
        const onlineBtn = $('#recipe-search-online-btn');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        if (localBtn) {
            localBtn.addEventListener('click', () => {
                this.searchMode = 'local';
                this.handleSearch();
            });
        }

        if (onlineBtn) {
            onlineBtn.addEventListener('click', () => {
                this.searchMode = 'online';
                this.handleSearch();
            });
        }

        // Initialize with local recipes
        this.currentRecipes = Array.isArray(recipes) ? [...recipes] : [];
        this.renderList();
    },

    handleSearch() {
        const searchInput = $('#recipe-search-input');
        const query = searchInput ? searchInput.value.trim() : '';

        if (this.searchMode === 'online') {
            this.searchOnline(query);
        } else {
            this.searchLocal(query);
        }
    },

    searchLocal(query) {
        if (!query) {
            this.currentRecipes = Array.isArray(recipes) ? [...recipes] : [];
        } else {
            const queryLower = query.toLowerCase();
            this.currentRecipes = (Array.isArray(recipes) ? recipes : []).filter(recipe => {
                const titleMatch = recipe.title && recipe.title.toLowerCase().includes(queryLower);
                const descMatch = recipe.description && recipe.description.toLowerCase().includes(queryLower);
                return titleMatch || descMatch;
            });
        }
        this.renderList();
    },

    async searchOnline(query) {
        if (!query) {
            this.currentRecipes = [];
            this.renderList();
            return;
        }

        const recipeList = $('#recipe-list');
        if (recipeList) {
            recipeList.innerHTML = '<div class="recipe-loading">Searching...</div>';
        }

        try {
            const onlineRecipes = await searchRecipesOnline(query);
            this.currentRecipes = onlineRecipes;
            this.renderList();
        } catch (error) {
            console.warn('Online search failed:', error);
            if (recipeList) {
                recipeList.innerHTML = '<div class="recipe-error">Online search unavailable.</div>';
            }
        }
    },

    normalizeIngredient(ingredient) {
        // Lowercase, remove quantities/units, and remove punctuation
        return ingredient
            .toLowerCase()
            .replace(/\d+[gml]?\s*/g, '')
            .replace(/\d+\s*(cup|cups|tbsp|tsp|oz|lb|kg|g|ml|l)\s*/gi, '')
            .replace(/[.,;:!?()[\]{}'"]/g, '')
            .replace(/^\s+|\s+$/g, '');
    },

    detectProblemIngredients(recipeIngredients, userAllergies) {
        const problems = [];
        
        recipeIngredients.forEach(ingredient => {
            const normalized = this.normalizeIngredient(ingredient);
            
            userAllergies.forEach(allergy => {
                const allergyLower = allergy.toLowerCase();
                const canonicalAllergy = ALLERGEN_CANONICAL[allergyLower] || allergyLower;
                
                // Check if canonical allergen has keywords
                if (ALLERGEN_KEYWORDS.hasOwnProperty(canonicalAllergy)) {
                    const keywords = ALLERGEN_KEYWORDS[canonicalAllergy];
                    const hasMatch = keywords.some(keyword => normalized.includes(keyword));
                    
                    if (hasMatch) {
                        problems.push({
                            allergen: canonicalAllergy,
                            ingredient: ingredient
                        });
                    }
                } else {
                    // Fallback to simple substring match
                    if (normalized.includes(canonicalAllergy) || normalized.includes(allergyLower)) {
                        problems.push({
                            allergen: canonicalAllergy,
                            ingredient: ingredient
                        });
                    }
                }
            });
        });
        
        return problems;
    },

    checkAllergenMatch(ingredient, allergy) {
        const normalized = this.normalizeIngredient(ingredient);
        const allergyLower = allergy.toLowerCase();
        const canonicalAllergy = ALLERGEN_CANONICAL[allergyLower] || allergyLower;
        
        // First check if canonical allergen has keywords
        if (ALLERGEN_KEYWORDS.hasOwnProperty(canonicalAllergy)) {
            const keywords = ALLERGEN_KEYWORDS[canonicalAllergy];
            return keywords.some(keyword => normalized.includes(keyword));
        }
        
        // Also check original allergy if different from canonical
        if (canonicalAllergy !== allergyLower && ALLERGEN_KEYWORDS.hasOwnProperty(allergyLower)) {
            const keywords = ALLERGEN_KEYWORDS[allergyLower];
            if (keywords.some(keyword => normalized.includes(keyword))) {
                return true;
            }
        }
        
        // Fallback to simple substring match
        return normalized.includes(canonicalAllergy) || normalized.includes(allergyLower);
    },

    checkRecipeSuitability(recipe) {
        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        if (!activeProfile || !activeProfile.allergies || activeProfile.allergies.length === 0) {
            return null;
        }

        const allergies = activeProfile.allergies;
        const detection = AllergyEngine.detectAllergens(recipe.ingredients, allergies);
        const hitIngredients = detection.hitIngredients;
        const totalIngredients = recipe.ingredients.length;

        // Ratio-based severity rule (no substitution gating)
        if (hitIngredients.length === 0) {
            return 'SAFE';
        }

        const hitRatio = hitIngredients.length / totalIngredients;

        if (hitRatio <= 0.60) {
            return 'REPLACEABLE';
        }

        return 'UNSAFE';
    },

    getSubstitutionsForProblem(allergen, ingredientText) {
        const allergenLower = allergen.toLowerCase();
        const canonicalAllergen = ALLERGEN_CANONICAL[allergenLower] || allergenLower;
        
        if (!SUBSTITUTION_RULES.hasOwnProperty(canonicalAllergen)) {
            return [];
        }

        const rules = SUBSTITUTION_RULES[canonicalAllergen];
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
                const canonicalAllergy = ALLERGEN_CANONICAL[allergyLower] || allergyLower;
                
                if (this.checkAllergenMatch(ingredient, allergy)) {
                    // Store canonical form
                    triggeredAllergies.add(canonicalAllergy);
                    problemIngredients.add(ingredient);
                    
                    if (!ingredientToAllergens[ingredient]) {
                        ingredientToAllergens[ingredient] = [];
                    }
                    if (!ingredientToAllergens[ingredient].includes(canonicalAllergy)) {
                        ingredientToAllergens[ingredient].push(canonicalAllergy);
                    }

                    // Get context-aware substitutions for this ingredient and canonical allergen
                    const substitutions = this.getSubstitutionsForProblem(canonicalAllergy, ingredient);
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

        if (!recipeList) return;

        recipeList.innerHTML = '';
        recipeList.classList.remove('hidden');
        if (recipeDetail) {
            recipeDetail.classList.add('hidden');
        }

        if (this.currentRecipes.length === 0) {
            recipeList.innerHTML = '<div class="recipe-empty">No recipes found.</div>';
            return;
        }

        this.currentRecipes.forEach(recipe => {
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
            badgeHtml = '<div class="mini-flag flag-safe">OK</div>';
        } else if (suitability === 'REPLACEABLE') {
            badgeHtml = '<div class="mini-flag flag-changes">ADAPT</div>';
        } else if (suitability === 'UNSAFE') {
            badgeHtml = '<div class="mini-flag flag-avoid">AVOID</div>';
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
        const recipe = this.currentRecipes.find(r => String(r.id) === String(recipeId));
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

        const activeProfile = AppState.profiles.find(p => p.id === AppState.activeProfileId);
        const activeAllergies = activeProfile ? (activeProfile.allergies || []) : [];
        const classification = AllergyEngine.classifyRecipe(recipe, activeAllergies);
        
        let suitabilityHtml = '';
        
        if (classification.status === 'safe') {
            suitabilityHtml = `
                <div class="recipe-suitability recipe-suitability-safe">
                    <span class="mini-flag flag-safe">OK</span>
                    <span class="recipe-suitability-text">OK for your profile</span>
                </div>
            `;
        } else if (classification.status === 'substitutable') {
            const uniqueIngredients = [...new Set(classification.hitIngredients)];
            const substitutionsKeys = Object.keys(classification.substitutionsByAllergen);
            
            suitabilityHtml = `
                <div class="recipe-suitability recipe-suitability-replaceable">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span class="mini-flag flag-changes">ADAPT</span>
                        <span class="recipe-suitability-text" style="font-weight: 600; margin-left: 8px;">Adaptable with substitutions</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <div style="margin-bottom: 8px;">
                            <strong>Problem ingredients:</strong>
                            <ul style="margin: 4px 0; padding-left: 20px; font-size: 1.1rem; line-height: 1.5;">
                                ${uniqueIngredients.map(ing => `<li>${this.escapeHtml(ing)}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <strong>Suggested substitutions:</strong>
                            <ul style="margin: 4px 0; padding-left: 20px; font-size: 1.1rem; line-height: 1.5;">
                                ${substitutionsKeys.map(allergenKey => {
                                    const subs = classification.substitutionsByAllergen[allergenKey];
                                    return `<li><strong>${this.escapeHtml(allergenKey)}</strong>: ${subs.map(s => this.escapeHtml(s)).join(', ')}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (classification.status === 'avoid') {
            const uniqueIngredients = [...new Set(classification.hitIngredients)];
            
            suitabilityHtml = `
                <div class="recipe-suitability recipe-suitability-unsafe">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span class="mini-flag flag-avoid">AVOID</span>
                        <span class="recipe-suitability-text" style="font-weight: 600; margin-left: 8px;">Avoid (too many conflicts)</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <div style="margin-bottom: 8px;">
                            <strong>Problem ingredients:</strong>
                            <ul style="margin: 4px 0; padding-left: 20px; font-size: 1.1rem; line-height: 1.5;">
                                ${uniqueIngredients.map(ing => `<li>${this.escapeHtml(ing)}</li>`).join('')}
                            </ul>
                        </div>
                        <div style="font-size: 1.1rem; line-height: 1.5;">No suitable substitutions found</div>
                    </div>
                </div>
            `;
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
        $('#reset-demo-btn').addEventListener('click', () => this.resetDemoData());

        this.render();
    },

    save() {
        saveState();
    },

    addItem() {
        const input = $('#grocery-input');
        const item = input.value.trim();
        if (!item) return;

        AppState.groceryList.push({ id: Date.now(), text: item, checked: false });
        input.value = '';
        this.save();
        renderApp();
    },

    removeItem(id) {
        AppState.groceryList = AppState.groceryList.filter(item => item.id !== id);
        this.save();
        renderApp();
    },

    toggleItem(id) {
        const item = AppState.groceryList.find(i => i.id === id);
        if (!item) return;

        item.checked = !item.checked;
        this.save();
        renderApp();
    },

    clearAll() {
        if (!confirm('Are you sure you want to clear all items?')) return;

        AppState.groceryList = [];
        this.save();
        renderApp();
    },

    resetDemoData() {
        if (!confirm('Reset all demo data? This will clear your shopping list and refresh the forecast.')) return;

        // Clear app-specific localStorage keys
        localStorage.removeItem(`${APP_META.storagePrefix}_${STORAGE_KEYS.GROCERY}`);

        // Reset app state
        AppState.groceryList = [];

        // Refresh UI
        renderApp();
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
        renderApp();
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
                const recipeId = card.getAttribute('data-recipe-id');
                if (!recipeId) return;

                Recipes.renderDetail(recipeId);
                Navigation.switchView('recipes');
            });
        });
    }
};


/************************************
 * 11) RENDER ENTRY POINT
 ************************************/

function renderApp() {
    // Render all UI components that depend on state
    if (typeof Profiles !== 'undefined' && Profiles.render) {
        Profiles.render();
    }
    if (typeof Log !== 'undefined' && Log.render) {
        Log.render();
    }
    if (typeof Recipes !== 'undefined' && Recipes.renderList) {
        Recipes.renderList();
    }
    if (typeof ShoppingList !== 'undefined' && ShoppingList.render) {
        ShoppingList.render();
    }
    // Forecast render is conditional - only if forecast view is active
    const forecastView = $('#forecast-view');
    if (forecastView && !forecastView.classList.contains('hidden')) {
        if (typeof Forecast !== 'undefined' && Forecast.render) {
            Forecast.render();
        }
    }
}


/************************************
 * 12) APP BOOTSTRAP
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
