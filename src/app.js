/************************************
 * APP METADATA
 ************************************/

const APP_META = {
    name: "MeloryCook",
    tagline: "Discover delicious recipes from around the world",
    storagePrefix: "melorycook"
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
    LOCAL_RECIPES: 'localRecipes',
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
            // Re-throw quota errors so they can be handled by caller
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                throw e;
            }
        }
    }
};

/**
 * Migrate storage keys from old prefix "cookingapp" to new prefix "melorycook"
 * This is a one-time migration that runs on app init
 */
function migrateStorageKeys() {
    const DEBUG = new URLSearchParams(location.search).has("debug");
    const OLD_PREFIX = "cookingapp";
    const NEW_PREFIX = "melorycook";
    const MIGRATION_FLAG_KEY = `${NEW_PREFIX}_migration_complete`;
    
    // Check if migration has already been completed
    if (localStorage.getItem(MIGRATION_FLAG_KEY) === "true") {
        if (DEBUG) {
            console.log("[MIGRATION] Already migrated, skipping");
        }
        return;
    }
    
    if (DEBUG) {
        console.log("[MIGRATION] Starting storage key migration from", OLD_PREFIX, "to", NEW_PREFIX);
    }
    
    // List of all storage keys that need migration
    const keysToMigrate = [
        'profileOwnedState',
        'profileActiveId',
        'groceryList',
        'userProfiles',
        'activeProfileId',
        'profileLogs',
        'localRecipes'
    ];
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Migrate each key
    keysToMigrate.forEach(key => {
        const oldKey = `${OLD_PREFIX}_${key}`;
        const newKey = `${NEW_PREFIX}_${key}`;
        
        try {
            // Check if old key exists
            const oldValue = localStorage.getItem(oldKey);
            if (oldValue !== null) {
                // Check if new key already exists (don't overwrite)
                const newValue = localStorage.getItem(newKey);
                if (newValue === null) {
                    // Copy old value to new key
                    localStorage.setItem(newKey, oldValue);
                    migratedCount++;
                    if (DEBUG) {
                        console.log("[MIGRATION] Migrated:", oldKey, "->", newKey);
                    }
                } else {
                    if (DEBUG) {
                        console.log("[MIGRATION] New key already exists, skipping:", newKey);
                    }
                }
            }
        } catch (error) {
            errorCount++;
            console.error(`[MIGRATION] Failed to migrate key "${key}":`, error);
        }
    });
    
    // Mark migration as complete
    try {
        localStorage.setItem(MIGRATION_FLAG_KEY, "true");
        
        // Optionally remove old keys after successful migration (only if all keys migrated)
        if (migratedCount > 0 && errorCount === 0) {
            // Remove old keys after a short delay to ensure new keys are working
            setTimeout(() => {
                keysToMigrate.forEach(key => {
                    const oldKey = `${OLD_PREFIX}_${key}`;
                    try {
                        localStorage.removeItem(oldKey);
                        if (DEBUG) {
                            console.log("[MIGRATION] Removed old key:", oldKey);
                        }
                    } catch (e) {
                        console.warn(`[MIGRATION] Failed to remove old key "${oldKey}":`, e);
                    }
                });
            }, 1000);
        }
        
        if (DEBUG) {
            console.log(`[MIGRATION] Complete. Migrated ${migratedCount} keys, ${errorCount} errors`);
        }
    } catch (error) {
        console.error("[MIGRATION] Failed to set migration flag:", error);
    }
}

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
    // Migrate storage keys from old prefix to new prefix (one-time migration)
    migrateStorageKeys();
    
    // Load legacy data for migration
    const legacyShoppingList = Storage.load(STORAGE_KEYS.GROCERY, []);
    const legacyLocalRecipes = Storage.load(STORAGE_KEYS.LOCAL_RECIPES, []);
    const legacyUserProfiles = (() => {
        const loaded = Storage.load(STORAGE_KEYS.PROFILES, []);
        // Normalize allergies for all existing profiles
        loaded.forEach(profile => {
            if (profile.allergies && Array.isArray(profile.allergies)) {
                profile.allergies = normalizeUserAllergies(profile.allergies);
            }
        });
        return loaded;
    })();
    const legacyActiveProfileId = Storage.load(STORAGE_KEYS.ACTIVE_PROFILE_ID, null);
    const legacyProfileLogs = Storage.load(STORAGE_KEYS.PROFILE_LOGS, {});
    
    // Load new profile-owned state structure (using storage prefix)
    const savedProfiles = Storage.load('profileOwnedState', null);
    const savedActiveProfileId = Storage.load('profileActiveId', null);
    
    // Initialize profile-owned state
    let profileOwnedState = savedProfiles || {};
    const activeProfileId = savedActiveProfileId || 'default';
    
    // Migrate legacy shopping list data ONCE if profiles are empty and legacy data exists
    // Use the active user profile ID as the key, or "default" if no user profile exists
    const migrationProfileId = legacyActiveProfileId || (legacyUserProfiles.length > 0 ? legacyUserProfiles[0].id : 'default');
    
    if (!profileOwnedState[migrationProfileId] && legacyShoppingList.length > 0) {
        const activeUserProfile = legacyUserProfiles.find(p => p.id === legacyActiveProfileId) || legacyUserProfiles[0];
        // Create new array (not shared by reference) - use spread operator for deep copy
        profileOwnedState[migrationProfileId] = {
            localRecipes: legacyLocalRecipes.length > 0 ? [...legacyLocalRecipes] : [],
            shoppingList: legacyShoppingList.map(item => ({ ...item })), // Deep copy array items
            allergyFilters: activeUserProfile?.allergies ? [...(activeUserProfile.allergies)] : [],
            symptomLog: legacyActiveProfileId && legacyProfileLogs[legacyActiveProfileId] ? [...legacyProfileLogs[legacyActiveProfileId]] : []
        };
        // Delete old localStorage key to avoid future collisions
        try {
            const prefixedKey = `${APP_META.storagePrefix}_${STORAGE_KEYS.GROCERY}`;
            localStorage.removeItem(prefixedKey);
        } catch (e) {
            console.warn('Failed to remove legacy groceryList key', e);
        }
    }
    
    // Ensure all existing user profiles have corresponding profile-owned state entries
    legacyUserProfiles.forEach(userProfile => {
        if (!profileOwnedState[userProfile.id]) {
            profileOwnedState[userProfile.id] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: userProfile.allergies ? [...userProfile.allergies] : [],
                symptomLog: legacyProfileLogs[userProfile.id] ? [...legacyProfileLogs[userProfile.id]] : []
            };
        }
    });
    
    // Ensure default profile exists if no user profiles
    if (legacyUserProfiles.length === 0 && !profileOwnedState.default) {
        profileOwnedState.default = {
            localRecipes: legacyLocalRecipes.length > 0 ? [...legacyLocalRecipes] : [],
            shoppingList: legacyShoppingList.length > 0 ? legacyShoppingList.map(item => ({ ...item })) : [],
            allergyFilters: [],
            symptomLog: []
        };
    }
    
    // Sync activeProfileId with userActiveProfileId if user profile exists
    const finalActiveProfileId = legacyActiveProfileId && legacyUserProfiles.find(p => p.id === legacyActiveProfileId) 
        ? legacyActiveProfileId 
        : (activeProfileId || (legacyUserProfiles.length > 0 ? legacyUserProfiles[0].id : 'default'));
    
    return {
        activeProfileId: finalActiveProfileId,
        profiles: profileOwnedState,
        localRecipes: profileOwnedState[finalActiveProfileId]?.localRecipes || [],
        userProfiles: legacyUserProfiles,
        userActiveProfileId: legacyActiveProfileId,
        profileLogs: legacyProfileLogs,
    };
}

function saveState() {
    // Save profile-owned state (using storage prefix via Storage.save)
    Storage.save('profileOwnedState', state.profiles);
    Storage.save('profileActiveId', state.activeProfileId);
    
    // Keep legacy saves for backward compatibility (except GROCERY - now stored in profiles only)
    const activeProfile = getActiveProfile();
    if (activeProfile) {
        Storage.save(STORAGE_KEYS.LOCAL_RECIPES, activeProfile.localRecipes);
    }
    Storage.save(STORAGE_KEYS.PROFILES, state.userProfiles);
    Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, state.userActiveProfileId || null);
    Storage.save(STORAGE_KEYS.PROFILE_LOGS, state.profileLogs);
}

// Helper functions for profile-owned state
function getActiveProfile() {
    return state.profiles[state.activeProfileId] || null;
}

function getProfileShoppingList() {
    const profile = getActiveProfile();
    return profile ? profile.shoppingList : [];
}

function setProfileShoppingList(list) {
    const profile = getActiveProfile();
    if (profile) {
        profile.shoppingList = list;
    }
}

function addShoppingItem(item) {
    const profile = getActiveProfile();
    if (profile) {
        if (!profile.shoppingList) {
            profile.shoppingList = [];
        }
        profile.shoppingList.push({ id: Date.now(), text: item, checked: false });
    }
}

function removeShoppingItem(id) {
    const profile = getActiveProfile();
    if (profile && profile.shoppingList) {
        profile.shoppingList = profile.shoppingList.filter(item => item.id !== id);
    }
}

function getProfileLocalRecipes() {
    const profile = getActiveProfile();
    return profile && Array.isArray(profile.localRecipes) ? profile.localRecipes : [];
}

function setProfileLocalRecipes(list) {
    const profile = getActiveProfile();
    if (profile) {
        profile.localRecipes = list;
    }
}

function isRecipeLiked(recipeId) {
    if (!recipeId) return false;
    const localRecipes = getProfileLocalRecipes();
    const recipeIdStr = String(recipeId);
    return localRecipes.some(r => String(r.id) === recipeIdStr);
}

/**
 * Compress image file to data URL with size constraints
 * @param {File} file - Image file
 * @param {Object} opts - Options { maxDimension: number, quality: number, maxSize: number }
 * @returns {Promise<string>} Compressed image as data URL
 */
async function fileToCompressedDataUrl(file, opts = {}) {
    const maxDimension = opts.maxDimension || 1000;
    const initialQuality = opts.quality || 0.75;
    const maxSize = opts.maxSize || 600000; // ~450KB in base64 chars
    
    // Debug flag (for avatars)
    const AVATAR_DEBUG = new URLSearchParams(location.search).has("avatarDebug");
    if (AVATAR_DEBUG && opts.maxDimension === 256) {
        console.log("[AVATAR_DEBUG] Selected file:", {
            name: file.name,
            size: file.size,
            type: file.type
        });
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions preserving aspect ratio
                let width = img.width;
                let height = img.height;
                
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Try compression with initial quality
                let quality = initialQuality;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                let attempts = 0;
                const maxAttempts = 3;

                // If too large, reduce quality progressively
                while (dataUrl.length > maxSize && attempts < maxAttempts) {
                    quality = Math.max(0.5, quality - 0.1);
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                    attempts++;
                    if (AVATAR_DEBUG && opts.maxDimension === 256) {
                        console.log("[AVATAR_DEBUG] Compression attempt:", attempts, "Quality:", quality, "Size:", dataUrl.length);
                    }
                }

                // If still too large, try scaling down more
                if (dataUrl.length > maxSize && attempts >= maxAttempts) {
                    // Scale down to 75% of current size
                    const newWidth = Math.floor(width * 0.75);
                    const newHeight = Math.floor(height * 0.75);
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                }

                // Final check
                if (dataUrl.length > maxSize) {
                    reject(new Error('Image is too large even after compression. Please use a smaller image.'));
                    return;
                }

                if (AVATAR_DEBUG && opts.maxDimension === 256) {
                    console.log("[AVATAR_DEBUG] Image compression complete. Data URL length:", dataUrl.length);
                }

                resolve(dataUrl);
            };
            img.onerror = () => {
                reject(new Error('Failed to load image. Please try a different file.'));
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file. Please try again.'));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Add recipe to active profile's local recipes
 * @param {Object} recipeObj - Recipe object (without id, may include imageFile)
 * @returns {Promise<Object>} Recipe object with generated id
 */
async function addRecipeToProfile(recipeObj) {
    if (!recipeObj || !recipeObj.title) {
        console.warn('Invalid recipe object');
        return null;
    }

    // Debug flag
    const IMG_DEBUG = new URLSearchParams(location.search).has("imgDebug");

    // Generate unique ID: "u_" prefix for user-added recipes
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const recipeId = `u_${timestamp}_${random}`;

    // Process image if provided - MUST complete before saving
    let imageDataUrl = null;
    if (recipeObj.imageFile) {
        try {
            if (IMG_DEBUG) {
                console.log("[IMG_DEBUG] Starting image compression for file:", recipeObj.imageFile.name);
            }
            imageDataUrl = await fileToCompressedDataUrl(recipeObj.imageFile);
            if (IMG_DEBUG) {
                console.log("[IMG_DEBUG] Image compression complete. Data URL length:", imageDataUrl ? imageDataUrl.length : 0);
            }
        } catch (error) {
            console.error('Image compression failed:', error);
            throw error; // Re-throw to show error to user
        }
    }

    // Create full recipe object with id (remove imageFile, add imageDataUrl if available)
    const { imageFile, ...recipeWithoutFile } = recipeObj;
    const fullRecipe = {
        ...recipeWithoutFile,
        id: recipeId,
        isUserCreated: true // Mark as user-created
    };

    // Add imageDataUrl if available (standardized field name)
    if (imageDataUrl) {
        fullRecipe.imageDataUrl = imageDataUrl;
        fullRecipe.imageType = 'photo';
        fullRecipe.photo = imageDataUrl; // Also set for compatibility with existing rendering
    }

    // Debug: verify saved recipe contains imageDataUrl
    if (IMG_DEBUG) {
        console.log("[IMG_DEBUG] Recipe object contains imageDataUrl:", !!fullRecipe.imageDataUrl);
        console.log("[IMG_DEBUG] Full recipe object:", {
            id: fullRecipe.id,
            title: fullRecipe.title,
            hasImageDataUrl: !!fullRecipe.imageDataUrl,
            imageDataUrlLength: fullRecipe.imageDataUrl ? fullRecipe.imageDataUrl.length : 0
        });
    }

    // Build cuisine tags if Recipes module is available
    if (typeof Recipes !== 'undefined' && Recipes.buildCuisineTags) {
        fullRecipe.cuisineTags = Recipes.buildCuisineTags(fullRecipe);
    }

    // Get current local recipes
    const localRecipes = getProfileLocalRecipes();

    // Add new recipe
    localRecipes.push(fullRecipe);

    // Save to profile with error handling
    try {
        setProfileLocalRecipes(localRecipes);
        saveState();
    } catch (error) {
        // Check if it's a quota error
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            const errorMsg = 'Storage quota exceeded. Please remove some recipes or images to free up space.';
            alert(errorMsg);
            throw new Error(errorMsg);
        }
        // Other storage errors
        const errorMsg = 'Failed to save recipe. ' + (error.message || 'Please try again.');
        alert(errorMsg);
        throw new Error(errorMsg);
    }

    return fullRecipe;
}

/**
 * Build ingredient suggestions from all available sources
 * @returns {Array<string>} Array of unique ingredient strings
 */
function buildIngredientSuggestions() {
    const suggestions = new Set();

    // Get base recipes (from recipes.local.js)
    if (typeof recipes !== 'undefined' && Array.isArray(recipes)) {
        recipes.forEach(recipe => {
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                recipe.ingredients.forEach(ing => {
                    if (ing && typeof ing === 'string' && ing.trim()) {
                        suggestions.add(ing.trim());
                    }
                });
            }
        });
    }

    // Get user-added recipes from all profiles
    if (state.profiles) {
        Object.values(state.profiles).forEach(profile => {
            if (profile.localRecipes && Array.isArray(profile.localRecipes)) {
                profile.localRecipes.forEach(recipe => {
                    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                        recipe.ingredients.forEach(ing => {
                            if (ing && typeof ing === 'string' && ing.trim()) {
                                suggestions.add(ing.trim());
                            }
                        });
                    }
                });
            }
        });
    }

    // Get shopping list items (optional)
    const activeProfile = getActiveProfile();
    if (activeProfile && activeProfile.shoppingList && Array.isArray(activeProfile.shoppingList)) {
        activeProfile.shoppingList.forEach(item => {
            if (item && item.text && typeof item.text === 'string' && item.text.trim()) {
                suggestions.add(item.text.trim());
            }
        });
    }

    // Convert to sorted array
    return Array.from(suggestions).sort();
}

const state = loadState();

// Legacy AppState for backward compatibility during transition
// AppState is now a pure wrapper around state - all reads and writes go through state
// Setters automatically persist changes via saveState() to ensure data is saved
// NOTE: groceryList, profiles, and activeProfileId removed - these features now use state directly
const AppState = {
    get profileLogs() { 
        // Direct read from state
        return state.profileLogs; 
    },
    set profileLogs(value) { 
        // Direct write to state
        state.profileLogs = value;
        // Auto-save to ensure persistence (old code expects this)
        saveState();
    },
    get localRecipes() { 
        // Read from state via helper function
        return getProfileLocalRecipes(); 
    },
    set localRecipes(value) { 
        // Write to state via helper function
        setProfileLocalRecipes(value);
        // Auto-save to ensure persistence (old code expects this)
        saveState();
    },
};


/************************************
 * 4) PROFILES MODULE
 ************************************/

function ensureDefaultProfile() {
    // Migration: ensure all profiles have avatarDataUrl field
    state.userProfiles.forEach(profile => {
        if (profile.avatarDataUrl === undefined) {
            profile.avatarDataUrl = null;
        }
    });
    
    if (state.userProfiles.length === 0) {
        const defaultProfile = {
            id: Id.uid(),
            name: 'Default',
            allergies: [],
            avatarDataUrl: null
        };
        state.userProfiles.push(defaultProfile);
        state.userActiveProfileId = defaultProfile.id;
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = defaultProfile.id;
        // Create corresponding profile-owned state with fresh empty arrays
        if (!state.profiles[defaultProfile.id]) {
            state.profiles[defaultProfile.id] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        saveState();
    } else if (!state.userActiveProfileId || !state.userProfiles.find(p => p.id === state.userActiveProfileId)) {
        state.userActiveProfileId = state.userProfiles[0].id;
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = state.userProfiles[0].id;
        // Ensure profile-owned state exists
        if (!state.profiles[state.userProfiles[0].id]) {
            state.profiles[state.userProfiles[0].id] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        saveState();
    } else {
        // Ensure current active profile has profile-owned state
        if (!state.profiles[state.userActiveProfileId]) {
            state.profiles[state.userActiveProfileId] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        // Sync state.activeProfileId with state.userActiveProfileId
        state.activeProfileId = state.userActiveProfileId;
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
            <div class="profile-card">
                <div class="profile-card-header">
                    <div class="profile-avatar" id="profile-avatar" role="button" tabindex="0" aria-label="Profile avatar"></div>
                    <div class="profile-info">
                        <h3 class="profile-name" id="profile-name">Default</h3>
                        <p class="profile-subtitle">Profile</p>
                    </div>
                </div>
                <button class="profile-settings-btn" id="profile-settings-btn" aria-expanded="false" aria-controls="profile-settings-body">
                    <span>Settings</span>
                    <span class="profile-settings-chevron">▼</span>
                </button>
                <div class="profile-settings-body collapsed" id="profile-settings-body" role="region" aria-labelledby="profile-settings-btn">
                    <div class="profile-section">
                        <label for="profile-select">Active profile</label>
                        <select id="profile-select" class="profile-select"></select>
                    </div>
                    <div class="profile-section">
                        <label>Profile picture</label>
                        <div class="profile-avatar-actions">
                            <button id="profile-avatar-change-btn" class="profile-btn profile-btn-secondary">Change picture</button>
                            <button id="profile-avatar-remove-btn" class="profile-btn profile-btn-secondary" style="display: none;">Remove picture</button>
                        </div>
                        <input type="file" id="profile-avatar-input" accept="image/*" style="display: none;">
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
                        <div class="profile-allergies-input-wrapper">
                            <input type="text" id="profile-allergies-input" class="profile-input" placeholder="e.g., milk, eggs, nuts">
                            <button id="profile-allergies-clear-btn" class="profile-allergies-clear-btn" title="Clear allergies" style="display: none;">Clear</button>
                        </div>
                    </div>
                    <div class="profile-section">
                        <button id="profile-delete-btn" class="profile-delete-btn">Delete Active Profile</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    },

    attachEvents() {
        $('#profile-settings-btn').addEventListener('click', () => this.toggleWidget());
        $('#profile-settings-btn').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleWidget();
            }
        });
        $('#profile-select').addEventListener('change', (e) => this.switchProfile(e.target.value));
        $('#profile-add-btn').addEventListener('click', () => this.addProfile());
        $('#profile-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProfile();
        });
        $('#profile-delete-btn').addEventListener('click', () => this.deleteProfile());
        
        // Avatar upload handlers
        const avatarInput = $('#profile-avatar-input');
        const avatarChangeBtn = $('#profile-avatar-change-btn');
        const avatarRemoveBtn = $('#profile-avatar-remove-btn');
        
        if (avatarChangeBtn && avatarInput) {
            avatarChangeBtn.addEventListener('click', () => {
                avatarInput.click();
            });
        }
        
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                // Ensure we get the actual File object from input
                const file = avatarInput.files && avatarInput.files[0] ? avatarInput.files[0] : null;
                
                // Debug logging
                const AVATAR_DEBUG = new URLSearchParams(location.search).has("avatarDebug");
                if (AVATAR_DEBUG) {
                    console.log("[AVATAR] file:", file?.name, file?.size, file?.type);
                }
                
                if (file) {
                    await this.handleAvatarUpload(file);
                }
            });
        }
        
        if (avatarRemoveBtn) {
            avatarRemoveBtn.addEventListener('click', () => {
                this.removeAvatar();
            });
        }
        
        const allergiesInput = $('#profile-allergies-input');
        const clearBtn = $('#profile-allergies-clear-btn');
        
        if (allergiesInput) {
            // Update clear button visibility on input change
            const updateClearButton = () => {
                if (clearBtn) {
                    clearBtn.style.display = allergiesInput.value.trim().length > 0 ? 'block' : 'none';
                }
            };

            allergiesInput.addEventListener('input', updateClearButton);
            allergiesInput.addEventListener('blur', () => {
                this.saveAllergies();
                updateClearButton();
            });

            // Clear button click handler
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
                    if (activeProfile) {
                        activeProfile.allergies = [];
                        allergiesInput.value = '';
                        saveState();
                        updateClearButton();
                        renderApp();
                    }
                });
            }

            // Initial state
            updateClearButton();
        }
    },

    toggleWidget() {
        const body = $('#profile-settings-body');
        const btn = $('#profile-settings-btn');
        const isCollapsed = body.classList.contains('collapsed');
        if (isCollapsed) {
            body.classList.remove('collapsed');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            body.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
        }
    },

    switchProfile(profileId) {
        state.userActiveProfileId = profileId;
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = profileId;
        // Ensure profile-owned state exists for this profile
        if (!state.profiles[profileId]) {
            state.profiles[profileId] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        saveState();
        
        // Refresh recipe view after profile change to update liked recipes and cancel stale requests
        if (typeof Recipes !== 'undefined' && Recipes.refreshViewAfterProfileChange) {
            Recipes.refreshViewAfterProfileChange();
        }
        
        renderApp();
    },

    addProfile() {
        const input = $('#profile-name-input');
        const name = input.value.trim();
        if (!name) return;

        const newProfile = {
            id: Id.uid(),
            name: name,
            allergies: [],
            avatarDataUrl: null
        };
        state.userProfiles.push(newProfile);
        state.userActiveProfileId = newProfile.id;
        
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = newProfile.id;
        // Create corresponding profile-owned state with fresh empty arrays (not shared by reference)
        state.profiles[newProfile.id] = {
            localRecipes: [],
            shoppingList: [],
            allergyFilters: [],
            symptomLog: []
        };
        
        saveState();
        input.value = '';
        renderApp();
    },

    saveAllergies() {
        const input = $('#profile-allergies-input');
        const allergiesText = input.value.trim();
        const rawAllergies = Text.splitList(allergiesText);
        const allergies = normalizeUserAllergies(rawAllergies);

        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
        if (activeProfile) {
            activeProfile.allergies = allergies;
            saveState();
            renderApp();
        }
    },

    deleteProfile() {
        if (state.userProfiles.length <= 1) {
            alert('Cannot delete the last remaining profile.');
            return;
        }

        if (!confirm('Are you sure you want to delete this profile?')) return;

        const deletedProfileId = state.userActiveProfileId;
        state.userProfiles = state.userProfiles.filter(p => p.id !== state.userActiveProfileId);
        
        // Delete corresponding profile-owned state
        if (state.profiles[deletedProfileId]) {
            delete state.profiles[deletedProfileId];
        }
        
        if (state.userProfiles.length > 0) {
            state.userActiveProfileId = state.userProfiles[0].id;
            // Sync profile-owned state activeProfileId with user profile ID
            state.activeProfileId = state.userProfiles[0].id;
            // Ensure profile-owned state exists
            if (!state.profiles[state.userProfiles[0].id]) {
                state.profiles[state.userProfiles[0].id] = {
                    localRecipes: [],
                    shoppingList: [],
                    allergyFilters: [],
                    symptomLog: []
                };
            }
        } else {
            state.userActiveProfileId = null;
            state.activeProfileId = 'default';
        }

        saveState();
        renderApp();
    },

    render() {
        const select = $('#profile-select');
        const allergiesInput = $('#profile-allergies-input');
        const profileNameEl = $('#profile-name');
        const profileAvatar = $('#profile-avatar');

        select.innerHTML = '';
        state.userProfiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            if (profile.id === state.userActiveProfileId) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
        const clearBtn = $('#profile-allergies-clear-btn');
        
        if (activeProfile) {
            allergiesInput.value = activeProfile.allergies.join(', ');
            if (profileNameEl) {
                profileNameEl.textContent = activeProfile.name;
            }
            if (profileAvatar) {
                // Show avatar image if available, else show initial
                if (activeProfile.avatarDataUrl && activeProfile.avatarDataUrl.trim() !== '') {
                    const escapeHtml = (typeof window.UI !== 'undefined' && window.UI.escape) ? window.UI.escape : (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
                    profileAvatar.innerHTML = `<img src="${escapeHtml(activeProfile.avatarDataUrl)}" alt="${escapeHtml(activeProfile.name)}" class="profile-avatar-img">`;
                    profileAvatar.classList.add('has-avatar');
                } else {
                    const initial = activeProfile.name.charAt(0).toUpperCase();
                    profileAvatar.textContent = initial;
                    profileAvatar.classList.remove('has-avatar');
                }
            }
            
            // Update avatar remove button visibility
            const avatarRemoveBtn = $('#profile-avatar-remove-btn');
            if (avatarRemoveBtn) {
                avatarRemoveBtn.style.display = (activeProfile.avatarDataUrl && activeProfile.avatarDataUrl.trim() !== '') ? 'inline-block' : 'none';
            }
        } else {
            allergiesInput.value = '';
            if (profileNameEl) {
                profileNameEl.textContent = 'Default';
            }
            if (profileAvatar) {
                profileAvatar.textContent = 'D';
                profileAvatar.classList.remove('has-avatar');
            }
            
            const avatarRemoveBtn = $('#profile-avatar-remove-btn');
            if (avatarRemoveBtn) {
                avatarRemoveBtn.style.display = 'none';
            }
        }

        // Update clear button visibility
        if (clearBtn) {
            clearBtn.style.display = allergiesInput.value.trim().length > 0 ? 'block' : 'none';
        }

        const deleteBtn = $('#profile-delete-btn');
        if (state.userProfiles.length <= 1) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
        } else {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.style.cursor = 'pointer';
        }
    },

    /**
     * Handle avatar upload for active profile
     * @param {File} file - Image file
     */
    async handleAvatarUpload(file) {
        // Debug flag
        const AVATAR_DEBUG = new URLSearchParams(location.search).has("avatarDebug");
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Get active profile ID before any async operations
        const activeProfileId = state.userActiveProfileId;
        if (!activeProfileId) {
            alert('No active profile found.');
            return;
        }

        if (AVATAR_DEBUG) {
            console.log("[AVATAR] Starting upload for profile id:", activeProfileId);
        }

        try {
            // Compress with strict settings for avatars - MUST await completion
            const avatarDataUrl = await fileToCompressedDataUrl(file, {
                maxDimension: 256,
                quality: 0.7,
                maxSize: 200000 // ~150KB in base64 chars (approximately 200KB raw)
            });

            if (AVATAR_DEBUG) {
                console.log("[AVATAR] dataUrl length:", avatarDataUrl?.length);
            }

            // Find and update the correct profile in the profiles array
            // Get reference to the actual profiles array
            const profiles = state.userProfiles;
            const profileIndex = profiles.findIndex(p => p.id === activeProfileId);
            
            if (profileIndex < 0) {
                alert('Profile not found.');
                return;
            }

            // Update the profile object directly in the array
            profiles[profileIndex].avatarDataUrl = avatarDataUrl;
            
            // Explicitly update state.userProfiles to ensure consistency
            state.userProfiles = profiles;

            if (AVATAR_DEBUG) {
                console.log("[AVATAR] updated profile id:", activeProfileId);
                console.log("[AVATAR] profile has avatarDataUrl:", !!profiles[profileIndex].avatarDataUrl);
                console.log("[AVATAR] profile index:", profileIndex);
            }

            // Persist to LocalStorage using the same mechanism as other profile edits
            try {
                saveState();
                
                // Verify storage immediately after save
                if (AVATAR_DEBUG) {
                    // Re-read from storage to verify
                    const storedProfiles = state.userProfiles;
                    const storedProfile = storedProfiles ? storedProfiles.find(p => p.id === activeProfileId) : null;
                    console.log("[AVATAR] stored?", !!storedProfile?.avatarDataUrl);
                    if (storedProfile?.avatarDataUrl) {
                        console.log("[AVATAR] stored dataUrl length:", storedProfile.avatarDataUrl.length);
                    }
                }
            } catch (error) {
                // Check if it's a quota error
                if (error.name === 'QuotaExceededError' || error.code === 22) {
                    alert('Storage quota exceeded. Please remove some recipes or images to free up space.');
                } else {
                    alert('Failed to save avatar: ' + (error.message || 'Please try again.'));
                }
                console.error('Avatar save error:', error);
                return;
            }

            // Re-render profile widget immediately (no refresh needed)
            this.render();

            // Reset file input
            const avatarInput = $('#profile-avatar-input');
            if (avatarInput) {
                avatarInput.value = '';
            }
        } catch (error) {
            alert('Failed to process avatar: ' + (error.message || 'Please try a different image.'));
            console.error('Avatar upload error:', error);
        }
    },

    /**
     * Remove avatar from active profile
     */
    removeAvatar() {
        const activeProfileId = state.userActiveProfileId;
        if (!activeProfileId) {
            alert('No active profile found.');
            return;
        }

        if (!confirm('Remove profile picture?')) {
            return;
        }

        // Find and update the correct profile in the profiles array
        const profiles = state.userProfiles;
        const profileIndex = profiles.findIndex(p => p.id === activeProfileId);
        
        if (profileIndex < 0) {
            alert('Profile not found.');
            return;
        }

        // Set avatarDataUrl to null
        profiles[profileIndex].avatarDataUrl = null;
        
        // Explicitly update state.userProfiles to ensure consistency
        state.userProfiles = profiles;

        // Persist to LocalStorage
        try {
            saveState();
        } catch (error) {
            alert('Failed to remove avatar: ' + (error.message || 'Please try again.'));
            console.error('Avatar remove error:', error);
            return;
        }

        // Re-render profile widget immediately
        this.render();
    }
};


/************************************
 * 5) LOG MODULE
 ************************************/

const Log = {
    isOpen: false,

    init() {
        this.createWidget();
        this.attachEvents();
        this.render();
    },

    createWidget() {
        // Create floating action button
        const fab = document.createElement('button');
        fab.className = 'log-fab';
        fab.id = 'log-fab';
        fab.setAttribute('aria-label', 'Open log');
        fab.innerHTML = `
            <span class="log-fab-icon">📜</span>
            <span class="log-fab-indicator hidden" id="log-fab-indicator" aria-hidden="true"></span>
        `;
        document.body.appendChild(fab);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'log-overlay hidden';
        overlay.id = 'log-overlay';
        document.body.appendChild(overlay);

        // Create drawer panel
        const panel = document.createElement('div');
        panel.className = 'log-panel hidden';
        panel.id = 'log-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'log-panel-title');
        panel.innerHTML = `
            <div class="log-panel-header">
                <h3 id="log-panel-title">Log</h3>
                <button class="log-close-btn" id="log-close-btn" aria-label="Close log">×</button>
            </div>
            <div class="log-panel-body">
                <div class="log-entry-section">
                    <textarea id="log-textarea" class="log-textarea" placeholder="Write a note..."></textarea>
                    <button id="log-save-btn" class="log-btn">Save</button>
                </div>
                <div class="log-entries" id="log-entries">
                    <!-- Log entries will be rendered here -->
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    },

    attachEvents() {
        const fab = $('#log-fab');
        const overlay = $('#log-overlay');
        const panel = $('#log-panel');
        const closeBtn = $('#log-close-btn');

        // FAB click to open
        fab.addEventListener('click', () => this.openPanel());

        // Close button
        closeBtn.addEventListener('click', () => this.closePanel());

        // Overlay click to close
        overlay.addEventListener('click', () => this.closePanel());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });

        // Save entry
        $('#log-save-btn').addEventListener('click', () => this.saveEntry());
        $('#log-textarea').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.saveEntry();
            }
        });
    },

    openPanel() {
        this.isOpen = true;
        $('#log-overlay').classList.remove('hidden');
        $('#log-panel').classList.remove('hidden');
        $('#log-fab').classList.add('hidden');
        // Focus textarea for better UX
        setTimeout(() => $('#log-textarea').focus(), 100);
    },

    closePanel() {
        this.isOpen = false;
        $('#log-overlay').classList.add('hidden');
        $('#log-panel').classList.add('hidden');
        $('#log-fab').classList.remove('hidden');
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

        const profileId = state.userActiveProfileId;
        if (!profileId) return;

        const logs = this.getProfileLogs(profileId);
        const entry = {
            id: Id.uid(),
            ts: Date.now(),
            text: text
        };
        logs.push(entry);
        state.profileLogs[profileId] = logs;
        saveState();

        textarea.value = '';
        renderApp();
    },

    deleteEntry(entryId) {
        const profileId = state.userActiveProfileId;
        if (!profileId || !state.profileLogs[profileId]) return;

        state.profileLogs[profileId] = state.profileLogs[profileId].filter(entry => entry.id !== entryId);
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
        const profileId = state.userActiveProfileId;
        const indicator = $('#log-fab-indicator');

        if (!profileId) {
            entriesContainer.innerHTML = '<div class="log-empty">No active profile</div>';
            if (indicator) indicator.classList.add('hidden');
            return;
        }

        const logs = this.getProfileLogs(profileId);

        // Update indicator visibility based on log entries
        if (indicator) {
            if (logs.length > 0) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }

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
    },

    /**
     * Analyze a recipe for problem ingredients and suggest substitutions.
     * Detects both allergy conflicts and missing ingredients from shopping list.
     * 
     * @param {Object} recipe - Recipe object with ingredients array
     * @param {Object} activeProfile - Profile object with allergies and shoppingList
     * @returns {Object} Analysis result with problem ingredients and substitutions
     */
    analyzeRecipeAdaptation(recipe, activeProfile) {
        if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
            return {
                hasProblems: false,
                problemIngredients: [],
                suggestedSubstitutions: {}
            };
        }

        const problemIngredients = [];
        const suggestedSubstitutions = {};
        const allergies = activeProfile && Array.isArray(activeProfile.allergies) ? activeProfile.allergies : [];
        const shoppingList = activeProfile && Array.isArray(activeProfile.shoppingList) ? activeProfile.shoppingList : [];
        
        // Get checked shopping list items (items user has available)
        const availableItems = shoppingList
            .filter(item => item && item.checked === true && item.text)
            .map(item => item.text);

        // 1. Detect allergy conflicts
        const allergyDetection = this.detectAllergens(recipe.ingredients, allergies);
        const allergyProblemIngredients = allergyDetection.hitIngredients;
        const detectedAllergens = allergyDetection.detectedAllergens;

        // Add allergy problem ingredients to problem list
        allergyProblemIngredients.forEach(ingredient => {
            if (!problemIngredients.includes(ingredient)) {
                problemIngredients.push(ingredient);
            }
        });

        // Get substitutions for detected allergens
        detectedAllergens.forEach(allergenKey => {
            const substitutions = getSubstitutionsFor(allergenKey);
            if (substitutions && substitutions.length > 0) {
                suggestedSubstitutions[allergenKey] = substitutions;
            }
        });

        // 2. Detect missing ingredients (not in checked shopping list)
        recipe.ingredients.forEach(ingredientLine => {
            if (!ingredientLine || typeof ingredientLine !== 'string') return;

            // Skip if already identified as allergy problem
            if (allergyProblemIngredients.includes(ingredientLine)) {
                return;
            }

            // Check if ingredient is available in shopping list
            let isAvailable = false;
            for (const availableItem of availableItems) {
                if (this.checkIngredientAvailability(availableItem, ingredientLine)) {
                    isAvailable = true;
                    break;
                }
            }

            // If not available, it's a problem ingredient
            if (!isAvailable) {
                if (!problemIngredients.includes(ingredientLine)) {
                    problemIngredients.push(ingredientLine);
                }

                // Try to get substitutions for this specific ingredient
                const ingredientSubs = getSubstitutionsFor(ingredientLine);
                if (ingredientSubs && ingredientSubs.length > 0) {
                    // Use ingredient line as key for missing items
                    suggestedSubstitutions[ingredientLine] = ingredientSubs;
                }
            }
        });

        return {
            hasProblems: problemIngredients.length > 0,
            problemIngredients: problemIngredients,
            suggestedSubstitutions: suggestedSubstitutions
        };
    },

    /**
     * Check if a shopping list item matches a recipe ingredient.
     * Uses normalization similar to Forecast module.
     */
    checkIngredientAvailability(shoppingItem, recipeIngredient) {
        if (!shoppingItem || !recipeIngredient) return false;

        const normalize = (text) => {
            return text
                .toLowerCase()
                .replace(/\d+[gml]?\s*/g, '')
                .replace(/\d+\s*/g, '')
                .replace(/\b(cut|diced|grated|minced|chopped|sliced|softened|fresh|dried|canned|for|and|or|with|the|a|an)\b/g, '')
                .replace(/[,\s]+/g, ' ')
                .trim();
        };

        const extractKeywords = (text) => {
            const normalized = normalize(text);
            return normalized.split(/\s+/).filter(w => w.length > 2);
        };

        const shoppingNormalized = normalize(shoppingItem);
        const recipeNormalized = normalize(recipeIngredient);
        const shoppingWords = extractKeywords(shoppingItem);
        const recipeWords = extractKeywords(recipeIngredient);

        // Exact match
        if (shoppingNormalized === recipeNormalized) return true;

        // Keyword matching
        for (const word of shoppingWords) {
            if (recipeWords.some(rw => rw.includes(word) || word.includes(rw))) {
                return true;
            }
        }

        // Substring matching
        if (shoppingNormalized.includes(recipeNormalized) || recipeNormalized.includes(shoppingNormalized)) {
            return true;
        }

        return false;
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
    lastQuery: '', // Track last query for typo suggestions
    searchDebounceTimer: null, // Debounce timer for search input
    onlineSearchRequestId: 0, // Request token to prevent stale responses

    /**
     * Normalize query: trim + toLowerCase + collapse spaces
     * @param {string} q - Query string
     * @returns {string} Normalized query
     */
    normalizeQuery(q) {
        if (!q || typeof q !== 'string') return '';
        return q.trim().toLowerCase().replace(/\s+/g, ' ');
    },

    /**
     * Dictionary of known cuisines/areas and families for typo suggestions
     */
    SUGGESTION_DICTIONARY: [
        // Canonical cuisines
        'italian', 'italy', 'spanish', 'spain', 'mexican', 'mexico',
        'indian', 'india', 'chinese', 'china', 'japanese', 'japan',
        'korean', 'korea', 'thai', 'thailand',
        // Families
        'mediterranean', 'asian', 'latin'
    ],

    /**
     * Compute a suggested correction for a query (simple Levenshtein-like approach)
     * @param {string} query - Original query
     * @returns {string|null} Suggested correction or null
     */
    suggestCorrection(query) {
        if (!query || query.length < 2) return null;
        
        const normalized = this.normalizeQuery(query);
        if (!normalized) return null;
        
        let bestMatch = null;
        let bestScore = Infinity;
        
        // Simple distance: count character differences
        for (const dictTerm of this.SUGGESTION_DICTIONARY) {
            const distance = this.computeSimpleDistance(normalized, dictTerm);
            // Only suggest if distance is small (1-2 character differences for short words, more for longer)
            const maxDistance = normalized.length <= 4 ? 1 : Math.min(2, Math.floor(normalized.length / 3));
            if (distance <= maxDistance && distance < bestScore) {
                bestScore = distance;
                bestMatch = dictTerm;
            }
        }
        
        return bestMatch && bestMatch !== normalized ? bestMatch : null;
    },

    /**
     * Simple distance computation (character-level differences)
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {number} Distance score
     */
    computeSimpleDistance(a, b) {
        // If one is a substring of the other, distance is 0
        if (a.includes(b) || b.includes(a)) {
            return 0;
        }
        
        // Count character differences (simplified)
        const len = Math.min(a.length, b.length);
        let diff = Math.abs(a.length - b.length);
        
        for (let i = 0; i < len; i++) {
            if (a[i] !== b[i]) {
                diff++;
            }
        }
        
        return diff;
    },

    /**
     * Cuisine taxonomy: canonical tags, groups, and aliases
     * Used for unified cuisine tagging system
     */
    CUISINE_TAXONOMY: {
        // Canonical cuisine tags
        canonicals: {
            italian: { aliases: ['italian', 'italy', 'roma', 'roman', 'tuscan', 'sicilian', 'venetian'], group: 'mediterranean' },
            spanish: { aliases: ['spanish', 'spain', 'catalan', 'andalusian'], group: 'mediterranean' },
            mexican: { aliases: ['mexican', 'mexico', 'tex-mex'], group: 'latin' },
            indian: { aliases: ['indian', 'india', 'curry', 'masala', 'tandoori', 'biryani'], group: 'asian' },
            chinese: { aliases: ['chinese', 'china', 'szechuan', 'sichuan', 'cantonese', 'hunan', 'shanghai'], group: 'asian' },
            japanese: { aliases: ['japanese', 'japan', 'sushi', 'ramen', 'teriyaki'], group: 'asian' },
            korean: { aliases: ['korean', 'korea', 'kimchi', 'bulgogi'], group: 'asian' },
            thai: { aliases: ['thai', 'thailand', 'pad thai', 'tom yum'], group: 'asian' }
        },
        // Group tags (broader categories)
        groups: {
            mediterranean: ['italian', 'spanish'],
            asian: ['chinese', 'japanese', 'korean', 'thai', 'indian'],
            latin: ['mexican']
        }
    },

    /**
     * Build cuisine tags for a recipe based on title, description, and existing cuisine field
     * @param {Object} recipe - Recipe object
     * @returns {Array} Array of canonical cuisine tags and group tags
     */
    buildCuisineTags(recipe) {
        if (!recipe) return [];
        
        const tags = new Set();
        
        // For online recipes, use area/cuisine/family fields directly if available
        if (recipe.area || recipe.cuisine) {
            const areaLower = (recipe.area || recipe.cuisine || '').toLowerCase();
            
            // Map TheMealDB area names to canonical cuisine tags
            const areaToCanonical = {
                'italian': 'italian',
                'spanish': 'spanish',
                'mexican': 'mexican',
                'indian': 'indian',
                'chinese': 'chinese',
                'japanese': 'japanese',
                'korean': 'korean',
                'thai': 'thai'
            };
            
            // Check if area matches a canonical cuisine
            for (const [area, canonical] of Object.entries(areaToCanonical)) {
                if (areaLower === area || areaLower.includes(area)) {
                    tags.add(canonical);
                    // Add group tag
                    const data = this.CUISINE_TAXONOMY.canonicals[canonical];
                    if (data && data.group) {
                        tags.add(data.group);
                    }
                }
            }
            
            // Also add family tag if present
            if (recipe.family) {
                tags.add(recipe.family);
            }
        }
        
        // Also analyze text for additional matches (for local recipes or additional context)
        const text = [
            recipe.title || '',
            recipe.name || '',
            recipe.description || '',
            recipe.shortDescription || '',
            recipe.fullDescription || '',
            recipe.cuisine || '',
            recipe.area || ''
        ].join(' ').toLowerCase();
        
        if (text.trim()) {
            // Check each canonical cuisine for alias matches
            for (const [canonical, data] of Object.entries(this.CUISINE_TAXONOMY.canonicals)) {
                const { aliases, group } = data;
                
                // Skip if already added from area field
                if (tags.has(canonical)) continue;
                
                // Check if any alias appears in the text (word boundary matching)
                const hasMatch = aliases.some(alias => {
                    // Use word boundary regex to avoid partial matches
                    const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    return regex.test(text);
                });
                
                if (hasMatch) {
                    tags.add(canonical);
                    // Add group tag if present
                    if (group) {
                        tags.add(group);
                    }
                }
            }
        }
        
        return Array.from(tags);
    },

    init() {
        const backBtn = $('#back-btn');
        if (backBtn) {
        backBtn.addEventListener('click', () => this.renderList());
        }

        const searchInput = $('#recipe-search-input');
        const clearBtn = $('#recipe-search-clear-btn');
        const localBtn = $('#recipe-search-local-btn');
        const onlineBtn = $('#recipe-search-online-btn');

        if (searchInput) {
            // Update clear button visibility on input change
            const updateClearButton = () => {
                if (clearBtn) {
                    clearBtn.style.display = searchInput.value.trim().length > 0 ? 'flex' : 'none';
                }
            };

            // Debounced search handler for online mode, instant for local mode
            const handleSearchInput = () => {
                updateClearButton();
                // Local mode: run immediately (no debounce)
                if (this.searchMode === 'local') {
                    this.handleSearch();
                } else {
                    // Online mode: use debounce
                    if (this.searchDebounceTimer) {
                        clearTimeout(this.searchDebounceTimer);
                    }
                    this.searchDebounceTimer = setTimeout(() => {
                        this.handleSearch();
                    }, 300);
                }
            };

            searchInput.addEventListener('input', handleSearchInput);
            
            // Enter key bypasses debounce (runs immediately)
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (this.searchDebounceTimer) {
                        clearTimeout(this.searchDebounceTimer);
                        this.searchDebounceTimer = null;
                    }
                    updateClearButton();
                    this.handleSearch();
                }
            });

            // Clear button click handler
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.searchDebounceTimer) {
                        clearTimeout(this.searchDebounceTimer);
                        this.searchDebounceTimer = null;
                    }
                    searchInput.value = '';
                    searchInput.focus();
                    updateClearButton();
                    this.handleSearch();
                });
            }

            // Initial state
            updateClearButton();
        }

        if (localBtn) {
            localBtn.addEventListener('click', () => {
                // Clear any pending debounce timer when switching modes
                if (this.searchDebounceTimer) {
                    clearTimeout(this.searchDebounceTimer);
                    this.searchDebounceTimer = null;
                }
                this.searchMode = 'local';
                this.updateToggleButtons();
                this.handleSearch();
            });
        }

        if (onlineBtn) {
            onlineBtn.addEventListener('click', () => {
                // Clear any pending debounce timer when switching modes
                if (this.searchDebounceTimer) {
                    clearTimeout(this.searchDebounceTimer);
                    this.searchDebounceTimer = null;
                }
                this.searchMode = 'online';
                this.updateToggleButtons();
                this.handleSearch();
            });
        }

        // Set initial active state
        this.updateToggleButtons();

        // Initialize with local recipes (merge base recipes + liked recipes)
        const baseRecipes = Array.isArray(recipes) ? [...recipes] : [];
        const likedRecipes = getProfileLocalRecipes();
        const allLocalRecipes = [...baseRecipes];
        
        // Add liked recipes, avoiding duplicates by ID
        const existingIds = new Set(baseRecipes.map(r => String(r.id)));
        likedRecipes.forEach(likedRecipe => {
            if (!existingIds.has(String(likedRecipe.id))) {
                allLocalRecipes.push(likedRecipe);
                existingIds.add(String(likedRecipe.id));
            }
        });
        
        // Build cuisine tags for all local recipes at initialization
        allLocalRecipes.forEach(recipe => {
            if (!recipe.cuisineTags || recipe.cuisineTags.length === 0) {
                recipe.cuisineTags = this.buildCuisineTags(recipe);
            }
        });
        
        this.currentRecipes = allLocalRecipes;
        this.renderList();
    },

    updateToggleButtons() {
        const localBtn = $('#recipe-search-local-btn');
        const onlineBtn = $('#recipe-search-online-btn');
        
        if (localBtn && onlineBtn) {
            // Always remove active from both first to ensure clean state
            localBtn.classList.remove('active');
            onlineBtn.classList.remove('active');
            
            // Then add active only to the current mode
            if (this.searchMode === 'local') {
                localBtn.classList.add('active');
            } else {
                onlineBtn.classList.add('active');
            }
        }
    },

    handleSearch() {
        const searchInput = $('#recipe-search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        
        // Store query for typo suggestions
        this.lastQuery = query;

        if (this.searchMode === 'online') {
            this.searchOnline(query);
        } else {
            this.searchLocal(query);
        }
    },

    /**
     * Refresh view after profile change
     * Cancels in-flight requests, resets detail view, and re-runs current search
     */
    refreshViewAfterProfileChange() {
        // A) Cancel/invalidate any in-flight online searches
        this.onlineSearchRequestId++;
        
        // Clear any pending debounce timer
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }

        // C) Reset detail view state - go back to grid
        const recipeList = $('#recipe-list');
        const recipeDetail = $('#recipe-detail');
        if (recipeList && recipeDetail) {
            recipeList.classList.remove('hidden');
            recipeDetail.classList.add('hidden');
        }

        // B) Clear current recipe grid rendering immediately
        if (recipeList && typeof window.renderLoading === 'function') {
            window.renderLoading(recipeList, 'Updating…');
        } else if (recipeList) {
            recipeList.innerHTML = '<div class="recipe-loading">Updating…</div>';
        }

        // Get current query and mode
        const searchInput = $('#recipe-search-input');
        const currentQuery = searchInput ? searchInput.value.trim() : '';
        const currentMode = this.searchMode;

        // Debug logging
        const PROFILE_DEBUG = new URLSearchParams(location.search).has("profileDebug");
        if (PROFILE_DEBUG) {
            const activeProfileId = state.userActiveProfileId;
            console.log("[PROFILE] switched to", activeProfileId, "query=", currentQuery, "mode=", currentMode);
        }

        // D) Re-run the current search using the current query and current mode
        // Use setTimeout to ensure state is fully updated before re-running search
        setTimeout(() => {
            if (currentQuery) {
                // If search input has text, re-run search
                this.handleSearch();
            } else {
                // If empty query, re-render the default list for the active mode
                if (currentMode === 'local') {
                    // For local mode, show all local recipes (base + liked)
                    this.searchLocal('');
                } else {
                    // For online mode, show empty state with message
                    this.currentRecipes = [];
                    this.renderList();
                }
            }
        }, 0);
    },

    /**
     * Filter recipes by query string
     * @param {Array} recipes - Array of recipe objects
     * @param {string} query - Search query
     * @returns {Array} Filtered recipes array
     * 
     * Quick tests (in browser console):
     * - filterRecipes(recipes, "italy").some(r => r.title.includes("Carbonara")) // should return true
     * - filterRecipes(recipes, "ITALIAN").some(r => r.title.includes("Carbonara")) // case-insensitive test
     * - filterRecipes(recipes, "mediterranean").length >= 1 // should return true (Italian + Spanish if present)
     * - filterRecipes(recipes, "asian").some(r => r.title.includes("Stir-Fry")) // should return true (Chinese/Korean/Japanese)
     */
    filterRecipes(recipes, query) {
        if (!Array.isArray(recipes)) return [];
        if (!query || typeof query !== 'string') return recipes;
        
        // Normalizer function: lowercases, trims, removes diacritics
        const norm = (s) => (s || "")
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        
        const q = norm(query);
        if (!q) return recipes;
        
        // Build set of terms to match - COMBINE old and new expansion logic
        const terms = new Set([q]); // Start with original normalized query
        
        // OLD EXPANSION LOGIC: Country to area demonym mapping (restored for backwards compatibility)
        const COUNTRY_TO_AREA = {
            "france": "french", "french": "french",
            "italy": "italian", "italian": "italian",
            "spain": "spanish", "spanish": "spanish",
            "portugal": "portuguese", "portuguese": "portuguese",
            "greece": "greek", "greek": "greek",
            "germany": "german", "german": "german",
            "netherlands": "dutch", "dutch": "dutch", "holland": "dutch",
            "switzerland": "swiss", "swiss": "swiss",
            "austria": "austrian", "austrian": "austrian",
            "belgium": "belgian", "belgian": "belgian",
            "poland": "polish", "polish": "polish",
            "sweden": "swedish", "swedish": "swedish",
            "norway": "norwegian", "norwegian": "norwegian",
            "denmark": "danish", "danish": "danish",
            "finland": "finnish", "finnish": "finnish",
            "ireland": "irish", "irish": "irish",
            "scotland": "scottish", "scottish": "scottish",
            "england": "english", "english": "english",
            "uk": "british", "united kingdom": "british", "britain": "british", "british": "british",
            "russia": "russian", "russian": "russian",
            "ukraine": "ukrainian", "ukrainian": "ukrainian",
            "usa": "american", "us": "american", "united states": "american", "american": "american",
            "mexico": "mexican", "mexican": "mexican",
            "canada": "canadian", "canadian": "canadian",
            "brazil": "brazilian", "brazilian": "brazilian",
            "argentina": "argentinian", "argentinian": "argentinian",
            "chile": "chilean", "chilean": "chilean",
            "peru": "peruvian", "peruvian": "peruvian",
            "colombia": "colombian", "colombian": "colombian",
            "venezuela": "venezuelan", "venezuelan": "venezuelan",
            "china": "chinese", "chinese": "chinese",
            "japan": "japanese", "japanese": "japanese",
            "korea": "korean", "south korea": "korean", "korean": "korean",
            "thailand": "thai", "thai": "thai",
            "vietnam": "vietnamese", "vietnamese": "vietnamese",
            "india": "indian", "indian": "indian",
            "pakistan": "pakistani", "pakistani": "pakistani",
            "indonesia": "indonesian", "indonesian": "indonesian",
            "philippines": "filipino", "philippine": "filipino", "filipino": "filipino",
            "malaysia": "malaysian", "malaysian": "malaysian",
            "singapore": "singaporean", "singaporean": "singaporean",
            "morocco": "moroccan", "moroccan": "moroccan",
            "tunisia": "tunisian", "tunisian": "tunisian",
            "algeria": "algerian", "algerian": "algerian",
            "turkey": "turkish", "turkish": "turkish",
            "egypt": "egyptian", "egyptian": "egyptian",
            "australia": "australian", "australian": "australian",
            "new zealand": "new zealand", "nz": "new zealand"
        };
        
        // OLD EXPANSION LOGIC: Regional keywords to areas/demonyms mapping
        const REGION_TO_AREAS = {
            "asia": ["chinese", "japanese", "korean", "thai", "vietnamese", "indian", "malaysian", "indonesian", "filipino"],
            "asian": ["chinese", "japanese", "korean", "thai", "vietnamese", "indian", "malaysian", "indonesian", "filipino"],
            "east asian": ["chinese", "japanese", "korean"],
            "southeast asian": ["thai", "vietnamese", "malaysian", "indonesian", "filipino"],
            "south asian": ["indian", "pakistani"],
            "mediterranean": ["greek", "italian", "spanish", "portuguese", "turkish", "moroccan", "tunisian", "algerian"],
            "north africa": ["moroccan", "tunisian", "algerian"],
            "north african": ["moroccan", "tunisian", "algerian"],
            "maghreb": ["moroccan", "tunisian", "algerian"],
            "middle east": ["turkish"],
            "middle eastern": ["turkish"],
            "latin america": ["mexican", "peruvian", "colombian", "venezuelan", "chilean", "argentinian", "brazilian"],
            "latin american": ["mexican", "peruvian", "colombian", "venezuelan", "chilean", "argentinian", "brazilian"],
            "south america": ["peruvian", "colombian", "venezuelan", "chilean", "argentinian", "brazilian"],
            "europe": ["french", "italian", "spanish", "portuguese", "greek", "dutch", "german", "polish", "swedish", "norwegian", "danish", "finnish", "british", "irish", "scottish", "english", "russian", "ukrainian", "austrian", "swiss", "belgian"],
            "european": ["french", "italian", "spanish", "portuguese", "greek", "dutch", "german", "polish", "swedish", "norwegian", "danish", "finnish", "british", "irish", "scottish", "english", "russian", "ukrainian", "austrian", "swiss", "belgian"],
            "central europe": ["german", "austrian", "swiss", "polish"],
            "central european": ["german", "austrian", "swiss", "polish"]
        };
        
        // Add mapped area from COUNTRY_TO_AREA if exists (old logic)
        if (COUNTRY_TO_AREA[q]) {
            terms.add(COUNTRY_TO_AREA[q]);
        }
        
        // Add regional areas if query matches a region (old logic)
        if (REGION_TO_AREAS[q]) {
            REGION_TO_AREAS[q].forEach(x => terms.add(norm(x)));
        }
        
        // NEW EXPANSION LOGIC: Add taxonomy expansion terms (additive, doesn't replace old logic)
        if (typeof window !== 'undefined' && typeof window.expandCuisineQueryTerms === 'function') {
            const expandedTerms = window.expandCuisineQueryTerms(query);
            if (expandedTerms && expandedTerms.size > 0) {
                // Add all taxonomy-expanded terms to the set
                expandedTerms.forEach(term => terms.add(norm(term)));
            }
        }
        
        // Also add detected areas from detectAreaFromQuery if available (for backwards compatibility)
        const detectAreaFromQueryFn = typeof window !== 'undefined' && window.detectAreaFromQuery 
            ? window.detectAreaFromQuery 
            : (typeof detectAreaFromQuery !== 'undefined' ? detectAreaFromQuery : null);
        
        if (detectAreaFromQueryFn) {
            const detected = detectAreaFromQueryFn(q);
            if (detected) {
                if (Array.isArray(detected)) {
                    detected.forEach(x => {
                        if (typeof x === 'string') {
                            terms.add(norm(x));
                        }
                    });
                } else if (typeof detected === 'string') {
                    terms.add(norm(detected));
                }
            }
        }
        
        return recipes.filter(recipe => {
            if (!recipe) return false;
            
            // Build safe searchable string from title, description, ingredients, cuisineTags, and area/cuisine/family fields
            const title = (recipe.title || recipe.name || '').toLowerCase();
            const description = (recipe.description || '').toLowerCase();
            const ingredients = Array.isArray(recipe.ingredients) 
                ? recipe.ingredients.join(' ').toLowerCase() 
                : '';
            const cuisineTags = Array.isArray(recipe.cuisineTags) 
                ? recipe.cuisineTags.join(' ').toLowerCase() 
                : '';
            const area = norm(recipe.area || '');
            const cuisine = (recipe.cuisine || '').toLowerCase();
            const family = (recipe.family || '').toLowerCase();
            
            const searchableText = `${title} ${description} ${ingredients} ${cuisineTags} ${area} ${cuisine} ${family}`;
            
            // Match if searchableText includes any term OR area equals any term
            return Array.from(terms).some(term => 
                searchableText.includes(term) || area === term
            );
        });
        
        /* ===== Console Tests =====
        // Uncomment to run tests:
        
        // Test 1: Country name -> demonym equivalence
        (function() {
            const testRecipes = [{ title: "Paella", area: "Spanish" }];
            console.assert(this.filterRecipes(testRecipes, "spain").length >= 1, "Spain search failed");
            console.assert(this.filterRecipes(testRecipes, "spanish").length >= 1, "Spanish search failed");
            console.log("✓ Country/demonym equivalence test passed");
        }.bind(this))();
        
        // Test 2: Turkey/Turkish equivalence (critical regression test)
        (function() {
            const testRecipes = [{ title: "Kebab", area: "Turkish" }];
            const turkeyResults = this.filterRecipes(testRecipes, "turkey");
            const turkishResults = this.filterRecipes(testRecipes, "turkish");
            console.assert(turkeyResults.length >= 1, "Turkey search failed", { results: turkeyResults });
            console.assert(turkishResults.length >= 1, "Turkish search failed", { results: turkishResults });
            console.log("✓ Turkey/Turkish equivalence test passed");
        }.bind(this))();
        
        // Test 3: Tunisia/Tunisian equivalence (includes prefix fix)
        (function() {
            const testRecipes = [{ title: "Couscous", area: "Tunisian" }];
            const tunisiaResults = this.filterRecipes(testRecipes, "tunisia");
            const tunisianResults = this.filterRecipes(testRecipes, "tunisian");
            console.assert(tunisiaResults.length >= 1, "Tunisia search failed");
            console.assert(tunisianResults.length >= 1, "Tunisian search failed");
            console.log("✓ Tunisia/Tunisian equivalence test passed");
        }.bind(this))();
        
        // Test 4: Expansion includes both forms
        (function() {
            if (typeof window !== 'undefined' && typeof window.expandCuisineQueryTerms === 'function') {
                const turkeyExpansion = Array.from(window.expandCuisineQueryTerms("turkey"));
                const turkishExpansion = Array.from(window.expandCuisineQueryTerms("turkish"));
                console.assert(turkeyExpansion.includes("turkish"), "Turkey expansion must include 'turkish'", { expansion: turkeyExpansion });
                console.assert(turkishExpansion.includes("turkey"), "Turkish expansion must include 'turkey'", { expansion: turkishExpansion });
                
                const tunisiaExpansion = Array.from(window.expandCuisineQueryTerms("tunisia"));
                const tunisianExpansion = Array.from(window.expandCuisineQueryTerms("tunisian"));
                console.assert(tunisiaExpansion.includes("tunisian"), "Tunisia expansion must include 'tunisian'", { expansion: tunisiaExpansion });
                console.assert(tunisianExpansion.includes("tunisia"), "Tunisian expansion must include 'tunisia'", { expansion: tunisianExpansion });
                console.log("✓ Expansion includes both forms test passed");
            }
        })();
        
        // Test 5: detectAreaFromQuery works for Turkey/Turkish
        (function() {
            if (typeof window !== 'undefined' && typeof window.detectAreaFromQuery === 'function') {
                const turkeyArea = window.detectAreaFromQuery("turkey");
                const turkishArea = window.detectAreaFromQuery("turkish");
                console.assert(turkeyArea === "Turkish", "detectAreaFromQuery('turkey') must return 'Turkish'", { result: turkeyArea });
                console.assert(turkishArea === "Turkish", "detectAreaFromQuery('turkish') must return 'Turkish'", { result: turkishArea });
                console.log("✓ detectAreaFromQuery Turkey/Turkish test passed");
            }
        })();
        
        // Test 6: Regional search
        (function() {
            const mediterraneanRecipes = [{ title: "Pasta", area: "Italian" }, { title: "Tapas", area: "Spanish" }];
            console.assert(this.filterRecipes(mediterraneanRecipes, "mediterranean").length >= 1, "Mediterranean search failed");
            console.log("✓ Regional search test passed");
        }.bind(this))();
        
        // Test 3: Asian search
        // const asianRecipes = [{ title: "Sushi", area: "Japanese" }, { title: "Pad Thai", area: "Thai" }];
        // console.assert(this.filterRecipes(asianRecipes, "china").length >= 0, "China search failed");
        // console.assert(this.filterRecipes(asianRecipes, "asian").length >= 1, "Asian search failed");
        
        // Test 4: Latin American search
        // const latinRecipes = [{ title: "Tacos", area: "Mexican" }];
        // console.assert(this.filterRecipes(latinRecipes, "latin american").length >= 1, "Latin American search failed");
        
        // Test 5: European search
        // const europeanRecipes = [{ title: "Croissant", area: "French" }, { title: "Pasta", area: "Italian" }];
        // console.assert(this.filterRecipes(europeanRecipes, "european").length >= 1, "European search failed");
        
        // Test 6: Online search detection
        // if (typeof window.detectAreaFromQuery === 'function') {
        //     console.assert(window.detectAreaFromQuery("french") === "French", "French detection failed");
        //     const europeanAreas = window.detectAreaFromQuery("european");
        //     console.assert(Array.isArray(europeanAreas) && europeanAreas.includes("French") && europeanAreas.includes("Italian"), "European detection failed");
        // }
        */
    },

    searchLocal(query) {
        // Merge local recipes from state with base recipes
        const baseRecipes = Array.isArray(recipes) ? [...recipes] : [];
        const likedRecipes = getProfileLocalRecipes();
        const allLocalRecipes = [...baseRecipes];
        
        // Add liked recipes, avoiding duplicates by ID
        const existingIds = new Set(baseRecipes.map(r => String(r.id)));
        likedRecipes.forEach(likedRecipe => {
            if (!existingIds.has(String(likedRecipe.id))) {
                allLocalRecipes.push(likedRecipe);
                existingIds.add(String(likedRecipe.id));
            }
        });

        // Build cuisine tags for all local recipes (if not already built)
        allLocalRecipes.forEach(recipe => {
            if (!recipe.cuisineTags || recipe.cuisineTags.length === 0) {
                recipe.cuisineTags = this.buildCuisineTags(recipe);
            }
        });

        // Use filterRecipes function to filter based on query
        this.currentRecipes = this.filterRecipes(allLocalRecipes, query);
        this.renderList();
    },

    async searchOnline(query) {
        // Normalize query: trim whitespace
        const normalizedQuery = query ? query.trim() : '';
        
        // Store query for typo suggestions
        this.lastQuery = normalizedQuery;
        
        // CRITICAL: Reset online results immediately when query is empty
        if (!normalizedQuery) {
            // Clear container and reset state to prevent duplication
            this.currentRecipes = [];
            const recipeList = $('#recipe-list');
            if (recipeList) {
                recipeList.innerHTML = '';
            }
            this.renderList();
            return;
        }

        // Add minimum query length check to reduce noise
        if (normalizedQuery.length < 2) {
            // Clear results for very short queries
            this.currentRecipes = [];
            const recipeList = $('#recipe-list');
            if (recipeList) {
                recipeList.innerHTML = '';
            }
            this.renderList();
            return;
        }

        // Increment request ID at start to track this request
        const reqId = ++this.onlineSearchRequestId;

        // CRITICAL: Reset currentRecipes BEFORE fetching (replace, never append)
        this.currentRecipes = [];

        const recipeList = $('#recipe-list');
        if (recipeList && typeof window.renderLoading === 'function') {
            // Use UI render function for loading state
            window.renderLoading(recipeList, 'Searching...');
        } else if (recipeList) {
            // Fallback
            recipeList.innerHTML = '<div class="recipe-loading">Searching...</div>';
        }

        try {
            const onlineRecipes = await searchRecipesOnline(normalizedQuery);
            
            // CRITICAL: Check if this response is stale before applying results
            if (reqId !== this.onlineSearchRequestId) {
                // Stale response, ignore it
                return;
            }
            
            // Build cuisine tags for all online recipes
            onlineRecipes.forEach(recipe => {
                if (!recipe.cuisineTags || recipe.cuisineTags.length === 0) {
                    recipe.cuisineTags = this.buildCuisineTags(recipe);
                }
            });
            
            // CRITICAL: Check again before applying results (double-check for race conditions)
            if (reqId !== this.onlineSearchRequestId) {
                // Stale response, ignore it
                return;
            }
            
            // CRITICAL: Replace currentRecipes with filtered results (never append or concat)
            // filterRecipes returns a new array, so we're replacing, not mutating
            this.currentRecipes = this.filterRecipes(onlineRecipes, normalizedQuery);
            
            // CRITICAL: Final check before rendering
            if (reqId !== this.onlineSearchRequestId) {
                // Stale response, ignore it
                return;
            }
            
            // CRITICAL: renderList() will clear container and render fresh
            this.renderList();
        } catch (error) {
            // CRITICAL: Check if this error is from a stale request
            if (reqId !== this.onlineSearchRequestId) {
                // Stale error, ignore it
                return;
            }
            
            console.warn('Online search failed:', error);
            // Reset on error to prevent stale results
            this.currentRecipes = [];
            const recipeList = $('#recipe-list');
            if (recipeList && typeof window.renderError === 'function') {
                // Use UI render function for error state
                window.renderError(recipeList, 'Online search unavailable.');
            } else if (recipeList) {
                // Fallback
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
        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
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
        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
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

        // CRITICAL: Always clear container completely before rendering to prevent duplication
        recipeList.innerHTML = '';
        recipeList.classList.remove('hidden');
        if (recipeDetail) {
            recipeDetail.classList.add('hidden');
        }

        // Hide any existing suggestion
        this.hideSuggestion();

        // Note: currentRecipes is set by searchLocal/searchOnline, so we don't refresh it here
        // This ensures filtered results are preserved

        // Determine empty message
        let emptyMessage = 'No recipes found.';
        if (this.currentRecipes.length === 0) {
            if (this.searchMode === 'online' && (!this.lastQuery || !this.lastQuery.trim())) {
                emptyMessage = 'Type a country, cuisine, or region to search online recipes.';
            }
        }

        // Use UI render function
        if (typeof window.renderRecipesGrid === 'function') {
            window.renderRecipesGrid({
                recipes: this.currentRecipes,
                containerEl: recipeList,
                onRecipeClick: (recipeId) => this.renderDetail(recipeId),
                onToggleLike: (recipe) => this.toggleLikeRecipe(recipe),
                checkRecipeSuitability: (recipe) => this.checkRecipeSuitability(recipe),
                isRecipeLiked: (recipeId) => isRecipeLiked(recipeId),
                onEditRecipe: (recipeId) => this.openEditRecipeModal(recipeId),
                emptyMessage: emptyMessage
            });

            // Show typo suggestion if we have a query and no results
            if (this.currentRecipes.length === 0 && this.lastQuery && this.lastQuery.trim()) {
                const suggestion = this.suggestCorrection(this.lastQuery);
                if (suggestion) {
                    this.showSuggestion(suggestion);
                }
            }

            // Debug logging
            const UI_DEBUG = new URLSearchParams(location.search).has("uiDebug");
            if (UI_DEBUG) {
                const cardCount = recipeList.querySelectorAll('.recipe-card').length;
                console.log("[UI_DEBUG] Rendered cards:", cardCount);
            }
        } else {
            // Fallback to old rendering if UI functions not available
            if (this.currentRecipes.length === 0) {
                if (this.searchMode === 'online' && (!this.lastQuery || !this.lastQuery.trim())) {
                    recipeList.innerHTML = '<div class="recipe-empty">Type a country, cuisine, or region to search online recipes.</div>';
                } else {
                    recipeList.innerHTML = '<div class="recipe-empty">No recipes found.</div>';
                }
                
                if (this.lastQuery && this.lastQuery.trim()) {
                    const suggestion = this.suggestCorrection(this.lastQuery);
                    if (suggestion) {
                        this.showSuggestion(suggestion);
                    }
                }
                return;
            }

            const uniqueRecipes = this.currentRecipes.filter((recipe, index, self) => 
                index === self.findIndex(r => String(r.id) === String(recipe.id))
            );

            uniqueRecipes.forEach(recipe => {
                recipeList.appendChild(this.createCard(recipe));
            });
        }
    },

    /**
     * Show typo suggestion near search input
     * @param {string} suggestion - Suggested correction
     */
    showSuggestion(suggestion) {
        const searchSection = document.querySelector('.recipe-search-section');
        if (!searchSection) return;
        
        // Remove existing suggestion if any
        const existing = document.getElementById('recipe-search-suggestion');
        if (existing) {
            existing.remove();
        }
        
        // Create suggestion element
        const suggestionEl = document.createElement('div');
        suggestionEl.id = 'recipe-search-suggestion';
        suggestionEl.className = 'recipe-search-suggestion';
        suggestionEl.innerHTML = `Did you mean: <a href="#" class="suggestion-link">${suggestion}</a>?`;
        
        // Add click handler
        const link = suggestionEl.querySelector('.suggestion-link');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const searchInput = $('#recipe-search-input');
                if (searchInput) {
                    searchInput.value = suggestion;
                    this.lastQuery = suggestion;
                    this.handleSearch();
                }
            });
        }
        
        // Insert after search section
        searchSection.parentNode.insertBefore(suggestionEl, searchSection.nextSibling);
    },

    /**
     * Hide typo suggestion
     */
    hideSuggestion() {
        const existing = document.getElementById('recipe-search-suggestion');
        if (existing) {
            existing.remove();
        }
    },

    createCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.addEventListener('click', () => this.renderDetail(recipe.id));

        // Image resolution: use recipe.imageType to choose between recipe.illustration vs recipe.photo
        const isOnlineRecipe = recipe.id && String(recipe.id).startsWith('online-');
        let imageUrl = '';
        
        if (recipe.imageType === 'illustration' && recipe.illustration && recipe.illustration.trim() !== '') {
            imageUrl = recipe.illustration;
        } else if (recipe.photo && recipe.photo.trim() !== '') {
            imageUrl = recipe.photo;
        }
        
        // If still no imageUrl, use placeholder
        if (!imageUrl || imageUrl.trim() === '') {
            imageUrl = 'images/recipes/placeholder-recipe.jpg';
        }
        
        const imageClass = recipe.imageType === 'illustration' ? 'recipe-image illustration' : 'recipe-image photo';
        const placeholderUrl = 'images/recipes/placeholder-recipe.jpg';

        const suitability = this.checkRecipeSuitability(recipe);
        let badgeHtml = '';
        if (suitability === 'SAFE') {
            badgeHtml = '<div class="mini-flag flag-safe">OK</div>';
        } else if (suitability === 'REPLACEABLE') {
            badgeHtml = '<div class="mini-flag flag-changes">ADAPT</div>';
        } else if (suitability === 'UNSAFE') {
            badgeHtml = '<div class="mini-flag flag-avoid">AVOID</div>';
        }
        const isLiked = isOnlineRecipe && isRecipeLiked(recipe.id);
        const likeButtonClass = isOnlineRecipe ? (isLiked ? 'like-btn liked' : 'like-btn') : '';
        const likeButtonHtml = isOnlineRecipe ? '<button class="' + likeButtonClass + '" data-recipe-id="' + recipe.id + '" title="' + (isLiked ? 'Remove from My Recipes' : 'Add to My Recipes') + '">❤️</button>' : '';

        card.innerHTML = `
            <div class="${imageClass}">
                <img src="${imageUrl}" alt="${recipe.title}" onerror="this.onerror=null; this.src='${placeholderUrl}';">
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
                ${likeButtonHtml}
            </div>
        `;

        // Attach like button event handler for online recipes
        if (isOnlineRecipe) {
            const likeBtn = card.querySelector('.like-btn');
            if (likeBtn) {
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleLikeRecipe(recipe);
                });
            }
        }

        return card;
    },

    renderDetail(recipeId) {
        const recipe = this.currentRecipes.find(r => String(r.id) === String(recipeId));
        if (!recipe) return;

        const recipeList = $('#recipe-list');
        const recipeDetail = $('#recipe-detail');
        const detailContent = $('#detail-content');

        if (!recipeList || !recipeDetail || !detailContent) return;

        recipeList.classList.add('hidden');
        recipeDetail.classList.remove('hidden');

        // Get active allergies for classification
        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
        const activeAllergies = activeProfile ? (activeProfile.allergies || []) : [];

        // Use UI render function
        if (typeof window.renderRecipeDetail === 'function') {
            window.renderRecipeDetail({
                recipe: recipe,
                containerEl: detailContent,
                classifyRecipe: (recipe, allergies) => AllergyEngine.classifyRecipe(recipe, allergies),
                escapeHtml: (text) => this.escapeHtml(text),
                activeAllergies: activeAllergies,
                onEditRecipe: (recipeId) => this.openEditRecipeModal(recipeId)
            });

            // Debug logging
            const UI_DEBUG = new URLSearchParams(location.search).has("uiDebug");
            if (UI_DEBUG) {
                const hasTitle = !!detailContent.querySelector('h1, h2, .recipe-title');
                console.assert(hasTitle, "Detail title missing");
                if (hasTitle) {
                    console.log("[UI_DEBUG] Recipe detail rendered successfully");
                }
            }
        } else {
            // Fallback to old rendering if UI functions not available
            const isOnlineRecipe = recipe.id && String(recipe.id).startsWith('online-');
            let mainImageUrl = '';
            let secondaryImageUrl = '';
            
            if (recipe.imageType === 'illustration' && recipe.illustration && recipe.illustration.trim() !== '') {
                mainImageUrl = recipe.illustration;
                secondaryImageUrl = recipe.photo || recipe.illustration;
            } else if (recipe.photo && recipe.photo.trim() !== '') {
                mainImageUrl = recipe.photo;
                secondaryImageUrl = recipe.illustration || recipe.photo;
            }
            
            if (!mainImageUrl || mainImageUrl.trim() === '') {
                mainImageUrl = 'images/recipes/placeholder-recipe.jpg';
            }
            if (!secondaryImageUrl || secondaryImageUrl.trim() === '') {
                secondaryImageUrl = 'images/recipes/placeholder-recipe.jpg';
            }
            
            const mainImageClass = recipe.imageType === 'illustration' ? 'detail-image illustration' : 'detail-image photo';
            const placeholderUrl = 'images/recipes/placeholder-recipe.jpg';

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
                        <div class="adapt-flag" style="display: inline-block; margin-bottom: 12px;">
                            <div style="margin-bottom: 4px;">
                                <span class="mini-flag flag-changes">ADAPT</span>
                            </div>
                            <div style="font-size: 0.85rem; color: #6B4E3D; line-height: 1.3; text-align: left;">
                                Adapt &<br>enjoy!
                            </div>
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
                            <img src="${mainImageUrl}" alt="${recipe.title}" onerror="this.onerror=null; this.src='${placeholderUrl}';"> 
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
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    toggleLikeRecipe(recipe) {
        if (!recipe || !recipe.id) return;
        
        const localRecipes = getProfileLocalRecipes();
        const recipeId = String(recipe.id);
        
        // Check if already liked
        const existingIndex = localRecipes.findIndex(r => String(r.id) === recipeId);
        
        if (existingIndex >= 0) {
            // Remove from localRecipes (unlike)
            localRecipes.splice(existingIndex, 1);
        } else {
            // Add recipe to localRecipes (like)
            const recipeCopy = { ...recipe };
            localRecipes.push(recipeCopy);
        }
        
        setProfileLocalRecipes(localRecipes);
        
        // Persist and re-render
        saveState();
        renderApp();
    },

    /**
     * Open edit recipe modal for a user-created recipe
     * @param {string} recipeId - Recipe ID
     */
    openEditRecipeModal(recipeId) {
        // Find recipe in current recipes first
        let recipe = this.currentRecipes.find(r => String(r.id) === String(recipeId));
        
        // If not found in current recipes, search in active profile's local recipes
        if (!recipe) {
            const localRecipes = getProfileLocalRecipes();
            recipe = localRecipes.find(r => String(r.id) === String(recipeId));
        }
        
        if (!recipe) {
            alert('Recipe not found.');
            return;
        }

        // Check if recipe is user-created
        const isUserCreated = recipe.isUserCreated || (recipe.id && String(recipe.id).startsWith('u_'));
        if (!isUserCreated) {
            alert('Only user-created recipes can be edited.');
            return;
        }

        // Store the active profile ID at modal open time for safety check
        const activeProfileIdAtOpen = state.userActiveProfileId;

        // Build ingredient suggestions
        const ingredientSuggestions = buildIngredientSuggestions();

        // Open edit modal
        if (typeof window.renderRecipeEditorModal === 'function') {
            window.renderRecipeEditorModal({
                mode: 'edit',
                initialRecipe: recipe,
                ingredientSuggestions: ingredientSuggestions,
                onClose: () => {
                    if (typeof window.closeRecipeEditorModal === 'function') {
                        window.closeRecipeEditorModal();
                    }
                },
                onSave: async (updatedRecipeObj, imageFile, removeImage) => {
                    // Safety check: ensure profile hasn't changed
                    if (state.userActiveProfileId !== activeProfileIdAtOpen) {
                        alert('Profile was switched. Please close and reopen the edit dialog.');
                        return;
                    }
                    
                    await this.saveEditedRecipe(recipeId, updatedRecipeObj, imageFile, removeImage);
                },
                onDelete: (recipeIdToDelete) => {
                    // Safety check: ensure profile hasn't changed
                    if (state.userActiveProfileId !== activeProfileIdAtOpen) {
                        alert('Profile was switched. Please close and reopen the edit dialog.');
                        return;
                    }
                    
                    this.deleteUserRecipe(recipeIdToDelete);
                }
            });
        }
    },

    /**
     * Save edited recipe
     * @param {string} recipeId - Recipe ID
     * @param {Object} updatedRecipeObj - Updated recipe object (without image)
     * @param {File|null} imageFile - New image file (if provided)
     * @param {boolean} removeImage - Whether to remove the image
     */
    async saveEditedRecipe(recipeId, updatedRecipeObj, imageFile, removeImage) {
        try {
            // Process image if provided
            let imageDataUrl = null;
            if (imageFile) {
                try {
                    imageDataUrl = await fileToCompressedDataUrl(imageFile);
                } catch (error) {
                    alert('Failed to process image: ' + (error.message || 'Please try a different image.'));
                    return;
                }
            }

            // Get current local recipes
            const localRecipes = getProfileLocalRecipes();
            const recipeIndex = localRecipes.findIndex(r => String(r.id) === String(recipeId));
            
            if (recipeIndex < 0) {
                alert('Recipe not found in storage.');
                return;
            }

            // Update recipe
            const existingRecipe = localRecipes[recipeIndex];
            
            // Preserve id and isUserCreated
            updatedRecipeObj.id = existingRecipe.id;
            updatedRecipeObj.isUserCreated = existingRecipe.isUserCreated !== undefined ? existingRecipe.isUserCreated : true;
            
            // Handle image
            if (removeImage) {
                delete updatedRecipeObj.imageDataUrl;
            } else if (imageDataUrl) {
                updatedRecipeObj.imageDataUrl = imageDataUrl;
            } else if (existingRecipe.imageDataUrl) {
                // Keep existing image if no change
                updatedRecipeObj.imageDataUrl = existingRecipe.imageDataUrl;
            }

            // Build cuisine tags if Recipes module is available
            if (typeof Recipes !== 'undefined' && Recipes.buildCuisineTags) {
                updatedRecipeObj.cuisineTags = Recipes.buildCuisineTags(updatedRecipeObj);
            }

            // Replace recipe in array
            localRecipes[recipeIndex] = updatedRecipeObj;

            // Save to storage
            try {
                setProfileLocalRecipes(localRecipes);
                saveState();
            } catch (error) {
                if (error.name === 'QuotaExceededError' || error.code === 22) {
                    alert('Storage quota exceeded. Please remove some recipes or images to free up space.');
                    return;
                }
                throw error;
            }

            // Close modal
            if (typeof window.closeRecipeEditorModal === 'function') {
                window.closeRecipeEditorModal();
            }

            // Update currentRecipes if recipe is in current view
            const currentIndex = this.currentRecipes.findIndex(r => String(r.id) === String(recipeId));
            if (currentIndex >= 0) {
                this.currentRecipes[currentIndex] = { ...updatedRecipeObj };
            }

            // Re-render current view
            const recipeDetail = $('#recipe-detail');
            const recipeList = $('#recipe-list');
            
            if (recipeDetail && !recipeDetail.classList.contains('hidden')) {
                // Currently viewing this recipe's detail - re-render detail
                this.renderDetail(recipeId);
            } else {
                // Re-run current search to refresh grid
                if (this.searchMode === 'local') {
                    const searchInput = $('#recipe-search-input');
                    const currentQuery = searchInput ? searchInput.value.trim() : '';
                    this.searchLocal(currentQuery);
                } else {
                    // For online mode, just refresh the list
                    this.renderList();
                }
            }
        } catch (error) {
            console.error('Error saving edited recipe:', error);
            alert('Failed to save recipe: ' + (error.message || 'Please try again.'));
        }
    },

    /**
     * Delete a user-created recipe
     * @param {string} recipeId - Recipe ID
     */
    deleteUserRecipe(recipeId) {
        // Get current local recipes
        const localRecipes = getProfileLocalRecipes();
        const recipeIndex = localRecipes.findIndex(r => String(r.id) === String(recipeId));
        
        if (recipeIndex < 0) {
            alert('Recipe not found.');
            return;
        }

        // Remove from local recipes
        localRecipes.splice(recipeIndex, 1);

        // Also remove from favorites/liked if stored elsewhere (they're in the same array)
        // No additional action needed since liked recipes are in the same localRecipes array

        // Save to storage
        try {
            setProfileLocalRecipes(localRecipes);
            saveState();
        } catch (error) {
            alert('Failed to delete recipe: ' + (error.message || 'Please try again.'));
            return;
        }

        // Close modal
        if (typeof window.closeRecipeEditorModal === 'function') {
            window.closeRecipeEditorModal();
        }

        // Check if currently viewing this recipe's detail
        const recipeDetail = $('#recipe-detail');
        const recipeList = $('#recipe-list');
        
        if (recipeDetail && !recipeDetail.classList.contains('hidden')) {
            // Currently viewing deleted recipe - go back to grid
            recipeDetail.classList.add('hidden');
            if (recipeList) {
                recipeList.classList.remove('hidden');
            }
        }

        // Remove from currentRecipes if present
        const currentIndex = this.currentRecipes.findIndex(r => String(r.id) === String(recipeId));
        if (currentIndex >= 0) {
            this.currentRecipes.splice(currentIndex, 1);
        }

        // Refresh grid
        if (this.searchMode === 'local') {
            const searchInput = $('#recipe-search-input');
            const currentQuery = searchInput ? searchInput.value.trim() : '';
            this.searchLocal(currentQuery);
        } else {
            this.renderList();
        }
    },

    /**
     * Legacy: Edit picture for a user-created recipe (kept for backward compatibility, but redirects to edit modal)
     * @param {string} recipeId - Recipe ID
     */
    async editRecipePicture(recipeId) {
        // Redirect to full edit modal
        this.openEditRecipeModal(recipeId);
        return;

        // Show options: Change picture or Remove picture
        const hasImage = recipe.imageDataUrl && recipe.imageDataUrl.trim() !== '';
        const action = hasImage 
            ? confirm('Change picture? (Click Cancel to remove picture)')
                ? 'change'
                : 'remove'
            : 'change';

        if (action === 'remove') {
            // Remove picture
            if (!confirm('Remove picture from this recipe?')) {
                return;
            }

            // Update recipe in storage
            const localRecipes = getProfileLocalRecipes();
            const recipeIndex = localRecipes.findIndex(r => String(r.id) === String(recipeId));
            
            if (recipeIndex >= 0) {
                delete localRecipes[recipeIndex].imageDataUrl;
                
                try {
                    setProfileLocalRecipes(localRecipes);
                    saveState();
                    
                    // Update currentRecipes
                    const currentIndex = this.currentRecipes.findIndex(r => String(r.id) === String(recipeId));
                    if (currentIndex >= 0) {
                        delete this.currentRecipes[currentIndex].imageDataUrl;
                    }
                    
                    // Re-render detail view
                    this.renderDetail(recipeId);
                } catch (error) {
                    alert('Failed to remove picture: ' + (error.message || 'Please try again.'));
                }
            }
            return;
        }

        // Change picture - create hidden file input if it doesn't exist
        let fileInput = document.getElementById('edit-recipe-image-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.id = 'edit-recipe-image-input';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }

        // Create a promise to handle file selection
        const filePromise = new Promise((resolve, reject) => {
            const handleChange = (e) => {
                const file = e.target.files[0];
                fileInput.removeEventListener('change', handleChange);
                if (file) {
                    if (!file.type.startsWith('image/')) {
                        alert('Please select an image file.');
                        reject(new Error('Invalid file type'));
                        return;
                    }
                    resolve(file);
                } else {
                    reject(new Error('No file selected'));
                }
            };
            fileInput.addEventListener('change', handleChange);
            fileInput.click();
        });

        // Also handle cancel (user closes file picker without selecting)
        const cancelPromise = new Promise((resolve) => {
            const handleCancel = () => {
                window.removeEventListener('focus', handleCancel);
                setTimeout(() => {
                    if (!fileInput.files || fileInput.files.length === 0) {
                        resolve(null);
                    }
                }, 300);
            };
            window.addEventListener('focus', handleCancel);
        });

        try {
            // Wait for file selection or cancel
            const file = await Promise.race([filePromise, cancelPromise]);
            
            if (!file) {
                // User cancelled
                return;
            }

            // Compress image
            const IMG_DEBUG = new URLSearchParams(location.search).has("imgDebug");
            if (IMG_DEBUG) {
                console.log("[IMG_DEBUG] Editing picture for recipe:", recipeId, "File:", file.name, "Size:", file.size);
            }

            let imageDataUrl = null;
            try {
                imageDataUrl = await fileToCompressedDataUrl(file);
                if (IMG_DEBUG) {
                    console.log("[IMG_DEBUG] Image compression complete. Data URL length:", imageDataUrl ? imageDataUrl.length : 0);
                }
            } catch (error) {
                alert('Failed to process image: ' + (error.message || 'Please try a different image.'));
                return;
            }

            // Update recipe in storage
            const localRecipes = getProfileLocalRecipes();
            const recipeIndex = localRecipes.findIndex(r => String(r.id) === String(recipeId));
            
            if (recipeIndex >= 0) {
                // Update imageDataUrl
                if (imageDataUrl) {
                    localRecipes[recipeIndex].imageDataUrl = imageDataUrl;
                } else {
                    delete localRecipes[recipeIndex].imageDataUrl;
                }
                
                // Save
                try {
                    setProfileLocalRecipes(localRecipes);
                    saveState();
                    
                    if (IMG_DEBUG) {
                        console.log("[IMG_DEBUG] Recipe updated with imageDataUrl:", !!localRecipes[recipeIndex].imageDataUrl);
                    }
                    
                    // Update currentRecipes to reflect change
                    const currentIndex = this.currentRecipes.findIndex(r => String(r.id) === String(recipeId));
                    if (currentIndex >= 0) {
                        if (imageDataUrl) {
                            this.currentRecipes[currentIndex].imageDataUrl = imageDataUrl;
                        } else {
                            delete this.currentRecipes[currentIndex].imageDataUrl;
                        }
                    }
                    
                    // Re-render detail view immediately
                    this.renderDetail(recipeId);
                } catch (error) {
                    if (error.name === 'QuotaExceededError' || error.code === 22) {
                        alert('Storage quota exceeded. Please remove some recipes or images to free up space.');
                    } else {
                        alert('Failed to save image: ' + (error.message || 'Please try again.'));
                    }
                }
            }
        } catch (error) {
            if (error.message !== 'No file selected' && error.message !== 'Invalid file type') {
                console.error('Edit picture error:', error);
            }
        } finally {
            // Reset file input
            fileInput.value = '';
        }
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

        addShoppingItem(item);
        input.value = '';
        this.save();
        renderApp();
    },

    removeItem(id) {
        removeShoppingItem(id);
        this.save();
        renderApp();
    },

    toggleItem(id) {
        const shoppingList = getProfileShoppingList();
        const item = shoppingList.find(i => i.id === id);
        if (!item) return;

        item.checked = !item.checked;
        this.save();
        renderApp();
    },

    clearAll() {
        if (!confirm('Are you sure you want to clear all items?')) return;

        setProfileShoppingList([]);
        this.save();
        renderApp();
    },

    resetDemoData() {
        if (!confirm('Reset all demo data? This will clear your shopping list and refresh the forecast.')) return;

        // Reset shopping list in active profile
        setProfileShoppingList([]);

        // Refresh UI
        renderApp();
    },

    render() {
        const listContainer = $('#grocery-list');
        listContainer.innerHTML = '';

        const shoppingList = getProfileShoppingList();
        if (shoppingList.length === 0) {
            listContainer.innerHTML = '<li class="empty-message">Your shopping list is empty. Add items to get started!</li>';
            return;
        }

        shoppingList.forEach(item => {
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

    /**
     * Pure matching function for weekly forecast suggestions.
     * Matches recipes against shopping list items and returns sorted suggestions.
     * 
     * @param {Array} shoppingList - Array of shopping list item strings
     * @param {Array} localRecipes - Array of recipe objects with id, title, ingredients
     * @returns {Array} Sorted array of recipe suggestions with match data
     */
    suggestRecipesFromShoppingList(shoppingList, localRecipes) {
        if (!Array.isArray(shoppingList) || !Array.isArray(localRecipes)) {
            return [];
        }

        // Extract shopping list item text from CHECKED items only (items user has)
        // Handle both string items and object items with checked property
        const shoppingItems = shoppingList
            .filter(item => {
                // Only include checked items (user has these)
                if (typeof item === 'string') return false; // String items can't be checked
                return item.checked === true;
            })
            .map(item => {
                return typeof item === 'string' ? item : (item.text || '');
            })
            .filter(item => item.trim().length > 0);

        if (shoppingItems.length === 0) {
            return [];
        }

        const suggestions = [];

        // Process each recipe
        localRecipes.forEach(recipe => {
            if (!recipe || !recipe.id || !Array.isArray(recipe.ingredients)) {
                return;
            }

            const matchedIngredients = [];
            const missingIngredients = [];
            const totalIngredients = recipe.ingredients.length;

            if (totalIngredients === 0) {
                return; // Skip recipes with no ingredients
            }

            // Match each recipe ingredient against shopping list
            recipe.ingredients.forEach(ingredient => {
                if (!ingredient || typeof ingredient !== 'string') {
                    return;
                }

                let found = false;
                // Check if any shopping list item matches this ingredient
                for (const shoppingItem of shoppingItems) {
                    if (this.checkIngredientMatch(shoppingItem, ingredient)) {
                        matchedIngredients.push(ingredient);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    missingIngredients.push(ingredient);
                }
            });

            // Only include recipes with at least one matched ingredient
            if (matchedIngredients.length > 0) {
                const matchScore = matchedIngredients.length / totalIngredients;

                suggestions.push({
                    recipeId: String(recipe.id),
                    recipeTitle: recipe.title || 'Untitled Recipe',
                    matchScore: matchScore,
                    matchedIngredients: [...matchedIngredients], // Copy array
                    missingIngredients: [...missingIngredients]  // Copy array
                });
            }
        });

        // Sort results:
        // 1. Highest matchScore first (descending)
        // 2. Then fewer missing ingredients (ascending)
        suggestions.sort((a, b) => {
            // Primary sort: matchScore (higher is better)
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            // Secondary sort: missing ingredients count (fewer is better)
            return a.missingIngredients.length - b.missingIngredients.length;
        });

        return suggestions;
    },

    /**
     * Check if an ingredient is already in the active profile's shopping list.
     * Uses normalization for case-insensitive matching.
     * 
     * @param {string} ingredient - The ingredient to check
     * @returns {boolean} True if ingredient is already in shopping list (checked or unchecked)
     */
    isIngredientInShoppingList(ingredient) {
        if (!ingredient || typeof ingredient !== 'string') {
            return false;
        }

        const shoppingList = getProfileShoppingList();
        if (!Array.isArray(shoppingList) || shoppingList.length === 0) {
            return false;
        }

        const normalizedIngredient = this.normalizeIngredient(ingredient);

        // Check if any shopping list item matches this ingredient
        return shoppingList.some(item => {
            if (!item || !item.text) return false;
            const normalizedItem = this.normalizeIngredient(item.text);
            return normalizedItem === normalizedIngredient || 
                   this.checkIngredientMatch(item.text, ingredient);
        });
    },

    addSuggestedItem(ingredient) {
        // Prevent duplicate adds
        if (this.isIngredientInShoppingList(ingredient)) {
            return;
        }
        
        addShoppingItem(ingredient);
        ShoppingList.save();
        renderApp();
    },

    render() {
        const forecastContent = $('#forecast-content');
        const p = getActiveProfile();
        
        // Get all local recipes (base + liked from active profile)
        const baseRecipes = Array.isArray(recipes) ? [...recipes] : [];
        const likedRecipes = p && Array.isArray(p.localRecipes) ? p.localRecipes : [];
        const allLocalRecipes = [...baseRecipes];
        
        // Add liked recipes, avoiding duplicates by ID
        const existingIds = new Set(baseRecipes.map(r => String(r.id)));
        likedRecipes.forEach(likedRecipe => {
            if (!existingIds.has(String(likedRecipe.id))) {
                allLocalRecipes.push(likedRecipe);
                existingIds.add(String(likedRecipe.id));
            }
        });

        // Empty state: no local recipes
        if (allLocalRecipes.length === 0) {
            forecastContent.innerHTML = `
                <div class="forecast-empty">
                    <p>No recipes available. Add recipes to your collection to see weekly forecast suggestions!</p>
                </div>
            `;
            return;
        }

        const shoppingList = getProfileShoppingList();

        // Empty state: shopping list empty
        if (shoppingList.length === 0) {
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

        // Use only checked items (items user has) for forecast matching
        const shoppingItems = shoppingList.filter(item => item.checked).map(item => item.text);
        
        // Analyze all recipes
        const recipeAnalyses = allLocalRecipes.map(recipe => this.analyzeRecipe(recipe, shoppingItems));

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
                        ${canCookRecipes.map(analysis => {
                            // Use recipe.imageType to choose between recipe.illustration vs recipe.photo
                            let imageUrl = '';
                            if (analysis.recipe.imageType === 'illustration' && analysis.recipe.illustration && analysis.recipe.illustration.trim() !== '') {
                                imageUrl = analysis.recipe.illustration;
                            } else if (analysis.recipe.photo && analysis.recipe.photo.trim() !== '') {
                                imageUrl = analysis.recipe.photo;
                            }
                            if (!imageUrl || imageUrl.trim() === '') {
                                imageUrl = 'images/recipes/placeholder-recipe.jpg';
                            }
                            const placeholderUrl = 'images/recipes/placeholder-recipe.jpg';
                            return `
                            <div class="recipe-forecast-card ready-card" data-recipe-id="${analysis.recipe.id}">
                                <div class="forecast-recipe-image">
                                    <img src="${imageUrl}" alt="${this.escapeHtml(analysis.recipe.title)}" onerror="this.onerror=null; this.src='${placeholderUrl}';">
                                </div>
                                <h4>${this.escapeHtml(analysis.recipe.title)}</h4>
                                <p class="forecast-meta">⏱️ ${analysis.recipe.time} | 👥 ${analysis.recipe.servings} servings</p>
                                <div class="forecast-status success-status">✓ All ingredients available!</div>
                                <div class="ingredient-match-info">
                                    <span class="match-badge">${analysis.matchedIngredients.length}/${analysis.recipe.ingredients.length} ingredients</span>
                                </div>
                            </div>
                        `;
                        }).join('')}
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
                        ${partialRecipes.map(analysis => {
                            // Use recipe.imageType to choose between recipe.illustration vs recipe.photo
                            let imageUrl = '';
                            if (analysis.recipe.imageType === 'illustration' && analysis.recipe.illustration && analysis.recipe.illustration.trim() !== '') {
                                imageUrl = analysis.recipe.illustration;
                            } else if (analysis.recipe.photo && analysis.recipe.photo.trim() !== '') {
                                imageUrl = analysis.recipe.photo;
                            }
                            if (!imageUrl || imageUrl.trim() === '') {
                                imageUrl = 'images/recipes/placeholder-recipe.jpg';
                            }
                            const placeholderUrl = 'images/recipes/placeholder-recipe.jpg';
                            return `
                            <div class="recipe-forecast-card partial-card">
                                <div class="forecast-recipe-image">
                                    <img src="${imageUrl}" alt="${this.escapeHtml(analysis.recipe.title)}" onerror="this.onerror=null; this.src='${placeholderUrl}';">
                                </div>
                                <h4>${this.escapeHtml(analysis.recipe.title)}</h4>
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
                                        ${analysis.missingIngredients.map(ing => {
                                            const isAdded = this.isIngredientInShoppingList(ing);
                                            const btnClass = isAdded ? 'add-missing-btn add-btn added' : 'add-missing-btn add-btn';
                                            const btnTitle = isAdded ? 'Already in shopping list' : 'Add to shopping list';
                                            const btnDisabled = isAdded ? 'disabled' : '';
                                            return `
                                            <li>
                                                <span>${this.escapeHtml(ing)}</span>
                                                <button class="${btnClass}" data-ingredient="${this.escapeHtml(ing).replace(/"/g, '&quot;')}" title="${btnTitle}" ${btnDisabled}>+</button>
                                            </li>
                                        `;
                                        }).join('')}
                                    </ul>
                                </div>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        forecastContent.innerHTML = html;

        // Add event listeners for missing ingredient "+" buttons
        $$('.add-missing-btn', forecastContent).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Don't add if button is disabled (already in list)
                if (btn.disabled || btn.classList.contains('added')) {
                    return;
                }
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
    },

    escapeHtml(text) {
        if (!text || typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        this.initAddRecipe();
    },

    initAddRecipe() {
        // Build ingredient suggestions
        const ingredientSuggestions = buildIngredientSuggestions();

        // Render FAB
        if (typeof window.renderAddRecipeFab === 'function') {
            window.renderAddRecipeFab({
                onClick: () => {
                    // Open modal
                    if (typeof window.renderAddRecipeModal === 'function') {
                        window.renderAddRecipeModal({
                            onClose: () => {
                                if (typeof window.closeAddRecipeModal === 'function') {
                                    window.closeAddRecipeModal();
                                }
                            },
                            onSubmit: async (recipeObj) => {
                                try {
                                    // Save recipe (async due to image compression)
                                    const savedRecipe = await addRecipeToProfile(recipeObj);
                                    if (savedRecipe) {
                                        // Close modal
                                        if (typeof window.closeAddRecipeModal === 'function') {
                                            window.closeAddRecipeModal();
                                        }

                                        // Refresh recipe list if in local mode
                                        if (Recipes.searchMode === 'local') {
                                            const searchInput = $('#recipe-search-input');
                                            const currentQuery = searchInput ? searchInput.value.trim() : '';
                                            Recipes.searchLocal(currentQuery);
                                        } else {
                                            // If in online mode, switch to local to show the new recipe
                                            Recipes.searchMode = 'local';
                                            Recipes.updateToggleButtons();
                                            Recipes.searchLocal('');
                                        }
                                    }
                                } catch (error) {
                                    // Show user-friendly error message
                                    alert(error.message || 'Failed to save recipe. Please try again.');
                                    console.error('Recipe save error:', error);
                                }
                            },
                            ingredientSuggestions: ingredientSuggestions
                        });
                    }
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
