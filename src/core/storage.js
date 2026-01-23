/************************************
 * STORAGE MODULE
 * Handles localStorage operations with prefix management
 ************************************/

window.Melory = window.Melory || {};

const APP_META = {
    name: "MeloryCook",
    tagline: "Discover delicious recipes from around the world",
    storagePrefix: "melorycook"
};

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

// Expose via global namespace
window.Melory.Storage = Storage;
window.Melory.APP_META = APP_META;
window.Melory.STORAGE_KEYS = STORAGE_KEYS;
window.Melory.migrateStorageKeys = migrateStorageKeys;
