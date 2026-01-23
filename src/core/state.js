/************************************
 * STATE MODULE
 * Handles application state loading, saving, and helper functions
 ************************************/

window.Melory = window.Melory || {};

// Dependencies: Storage, STORAGE_KEYS, APP_META, migrateStorageKeys from storage.js
// normalizeUserAllergies from app.js (will be available globally)

function loadState() {
    // Migrate storage keys from old prefix to new prefix (one-time migration)
    if (typeof window.Melory.migrateStorageKeys === 'function') {
        window.Melory.migrateStorageKeys();
    }
    
    const Storage = window.Melory.Storage;
    const STORAGE_KEYS = window.Melory.STORAGE_KEYS;
    const APP_META = window.Melory.APP_META;
    
    // Load legacy data for migration
    const legacyShoppingList = Storage.load(STORAGE_KEYS.GROCERY, []);
    const legacyLocalRecipes = Storage.load(STORAGE_KEYS.LOCAL_RECIPES, []);
    const legacyUserProfiles = (() => {
        const loaded = Storage.load(STORAGE_KEYS.PROFILES, []);
        // Normalize allergies for all existing profiles
        loaded.forEach(profile => {
            if (profile.allergies && Array.isArray(profile.allergies)) {
                // normalizeUserAllergies will be available from app.js
                if (typeof normalizeUserAllergies === 'function') {
                    profile.allergies = normalizeUserAllergies(profile.allergies);
                }
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
    const Storage = window.Melory.Storage;
    const STORAGE_KEYS = window.Melory.STORAGE_KEYS;
    
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

// Expose via global namespace
window.Melory.loadState = loadState;
window.Melory.saveState = saveState;
window.Melory.getActiveProfile = getActiveProfile;
window.Melory.getProfileShoppingList = getProfileShoppingList;
window.Melory.setProfileShoppingList = setProfileShoppingList;
window.Melory.addShoppingItem = addShoppingItem;
window.Melory.removeShoppingItem = removeShoppingItem;
window.Melory.getProfileLocalRecipes = getProfileLocalRecipes;
window.Melory.setProfileLocalRecipes = setProfileLocalRecipes;
window.Melory.isRecipeLiked = isRecipeLiked;
