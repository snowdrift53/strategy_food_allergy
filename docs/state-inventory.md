# State and AppState Inventory Report

## 1. State Creation/Loading/Saving

### State Creation
- **Location**: Line 657
- **Code**: `const state = loadState();`
- **Type**: Constant object created once at module load

### State Loading
- **Function**: `loadState()` (lines 260-345)
- **Called from**: Line 657 (initialization)
- **Returns**: Object with structure:
  ```javascript
  {
    activeProfileId: string,        // Profile-owned state active ID
    profiles: object,                // Profile-owned state: { profileId: { localRecipes, shoppingList, allergyFilters, symptomLog } }
    localRecipes: array,             // Legacy: local recipes from active profile
    userProfiles: array,             // User profile definitions
    userActiveProfileId: string|null, // Active user profile ID
    profileLogs: object              // Profile logs: { profileId: [entries] }
  }
  ```

### State Saving
- **Function**: `saveState()` (lines 347-360)
- **Called from**: Multiple locations throughout the app after state mutations
- **Saves**:
  - `state.profiles` → `melorycook_profileOwnedState`
  - `state.activeProfileId` → `melorycook_profileActiveId`
  - `activeProfile.localRecipes` → `melorycook_localRecipes` (legacy)
  - `state.userProfiles` → `melorycook_userProfiles`
  - `state.userActiveProfileId` → `melorycook_activeProfileId`
  - `state.profileLogs` → `melorycook_profileLogs`

## 2. AppState Definition

### Location
- **Lines**: 660-671
- **Type**: Object with getters/setters (proxy pattern)

### Definition
```javascript
const AppState = {
    get groceryList() { return getProfileShoppingList(); },
    set groceryList(value) { setProfileShoppingList(value); },
    get profiles() { return state.userProfiles; },
    set profiles(value) { state.userProfiles = value; },
    get activeProfileId() { return state.userActiveProfileId; },
    set activeProfileId(value) { state.userActiveProfileId = value; },
    get profileLogs() { return state.profileLogs; },
    set profileLogs(value) { state.profileLogs = value; },
    get localRecipes() { return getProfileLocalRecipes(); },
    set localRecipes(value) { setProfileLocalRecipes(value); },
};
```

### Purpose
- Legacy compatibility layer during transition
- Provides backward-compatible API for existing code
- Maps to underlying `state` object

## 3. AppState → State Mapping Table

| AppState Field | State Field (Best Equivalent) | Access Pattern | Notes |
|----------------|------------------------------|----------------|-------|
| `AppState.groceryList` | `state.profiles[state.activeProfileId].shoppingList` | Via `getProfileShoppingList()` | Computed from active profile |
| `AppState.profiles` | `state.userProfiles` | Direct reference | User profile definitions array |
| `AppState.activeProfileId` | `state.userActiveProfileId` | Direct reference | Active user profile ID |
| `AppState.profileLogs` | `state.profileLogs` | Direct reference | Profile logs object |
| `AppState.localRecipes` | `state.profiles[state.activeProfileId].localRecipes` | Via `getProfileLocalRecipes()` | Computed from active profile |

### Additional State Fields (Not in AppState)
- `state.activeProfileId` - Profile-owned state active ID (different from `userActiveProfileId`)
- `state.profiles` - Profile-owned state object (not user profiles)

## 4. Functions Reading from AppState and Writing to State

### Functions that Read AppState → Write State

1. **`ensureDefaultProfile()`** (lines 678-733)
   - Reads: `AppState.profiles`, `AppState.activeProfileId`
   - Writes: `state.activeProfileId`, `state.profiles[profileId]`
   - Syncs: `state.activeProfileId = AppState.activeProfileId` (line 731)

2. **`Profiles.switchProfile(profileId)`** (lines 894-915)
   - Reads: None directly (takes parameter)
   - Writes: `AppState.activeProfileId = profileId` (line 895)
   - Then writes: `state.activeProfileId = profileId` (line 897)
   - Also writes: `state.profiles[profileId]` (if missing, line 899-906)

3. **`Profiles.addProfile()`** (lines 917-943)
   - Reads: None directly
   - Writes: `AppState.profiles.push(newProfile)` (line 928)
   - Writes: `AppState.activeProfileId = newProfile.id` (line 929)
   - Writes: `state.activeProfileId = newProfile.id` (line 932)
   - Writes: `state.profiles[newProfile.id]` (line 933-938)

4. **`Profiles.deleteProfile(profileId)`** (lines 945-992)
   - Reads: `AppState.activeProfileId`, `AppState.profiles`
   - Writes: `AppState.profiles` (filtered, line 968)
   - Writes: `state.profiles[deletedProfileId]` (delete, line 971-972)
   - Writes: `AppState.activeProfileId` (line 976 or 989)
   - Writes: `state.activeProfileId` (line 978 or 990)

5. **`Profiles.updateProfileAvatar(avatarDataUrl)`** (lines 1103-1132)
   - Reads: `AppState.activeProfileId`, `AppState.profiles` (line 1112)
   - Writes: `state.userProfiles = profiles` (line 1125)
   - Note: Modifies `profiles` array (which is `state.userProfiles` via getter), then explicitly syncs

6. **`Profiles.removeProfileAvatar()`** (lines 1134-1210)
   - Reads: `AppState.activeProfileId`, `AppState.profiles` (line 1187)
   - Writes: `state.userProfiles = profiles` (line 1199)
   - Note: Same pattern as `updateProfileAvatar`

### Functions that Read State → Write AppState

**None found** - All writes to AppState are direct assignments, not computed from state.

### Bidirectional Sync Points

1. **`ensureDefaultProfile()`** (line 731)
   - Syncs: `state.activeProfileId = AppState.activeProfileId`
   - Context: Ensures profile-owned state activeProfileId matches user profile activeProfileId

2. **`Profiles.switchProfile()`** (lines 895, 897)
   - Sets both: `AppState.activeProfileId` and `state.activeProfileId` to same value
   - Ensures both systems stay in sync

3. **`Profiles.addProfile()`** (lines 929, 932)
   - Sets both: `AppState.activeProfileId` and `state.activeProfileId` to new profile ID

4. **`Profiles.deleteProfile()`** (lines 976/989, 978/990)
   - Sets both: `AppState.activeProfileId` and `state.activeProfileId` after deletion

## 5. Exact localStorage Keys Currently Used

### Primary Keys (with prefix `melorycook_`)

| Key | Source | Stored Value | Loaded In | Saved In |
|-----|--------|--------------|-----------|----------|
| `melorycook_profileOwnedState` | `Storage.save('profileOwnedState', ...)` | `state.profiles` object | `loadState()` line 281 | `saveState()` line 349 |
| `melorycook_profileActiveId` | `Storage.save('profileActiveId', ...)` | `state.activeProfileId` string | `loadState()` line 282 | `saveState()` line 350 |
| `melorycook_groceryList` | `Storage.load(STORAGE_KEYS.GROCERY, ...)` | Legacy shopping list (deprecated) | `loadState()` line 265 | Not saved (deprecated) |
| `melorycook_userProfiles` | `Storage.save(STORAGE_KEYS.PROFILES, ...)` | `state.userProfiles` array | `loadState()` line 268 | `saveState()` line 357 |
| `melorycook_activeProfileId` | `Storage.save(STORAGE_KEYS.ACTIVE_PROFILE_ID, ...)` | `state.userActiveProfileId` string\|null | `loadState()` line 277 | `saveState()` line 358 |
| `melorycook_profileLogs` | `Storage.save(STORAGE_KEYS.PROFILE_LOGS, ...)` | `state.profileLogs` object | `loadState()` line 278 | `saveState()` line 359 |
| `melorycook_localRecipes` | `Storage.save(STORAGE_KEYS.LOCAL_RECIPES, ...)` | Active profile's `localRecipes` array | `loadState()` line 266 | `saveState()` line 355 |

### Migration Key

| Key | Purpose | Set In |
|-----|---------|--------|
| `melorycook_migration_complete` | One-time migration flag | `migrateStorageKeys()` line 118 |

### Legacy Keys (from old prefix `cookingapp_`)

These keys are migrated from on first load (if they exist):
- `cookingapp_profileOwnedState`
- `cookingapp_profileActiveId`
- `cookingapp_groceryList`
- `cookingapp_userProfiles`
- `cookingapp_activeProfileId`
- `cookingapp_profileLogs`
- `cookingapp_localRecipes`

### Storage Prefix
- **Prefix**: `melorycook` (defined in `APP_META.storagePrefix`, line 8)
- **Format**: `${APP_META.storagePrefix}_${key}` (line 28, 38)

## Summary

### Key Findings

1. **Dual State System**:
   - `state` = Internal state object (profile-owned state + legacy data)
   - `AppState` = Legacy compatibility layer (getters/setters)

2. **Two Active Profile IDs**:
   - `state.activeProfileId` = Profile-owned state active ID
   - `state.userActiveProfileId` = User profile active ID (exposed via `AppState.activeProfileId`)
   - These are kept in sync by `ensureDefaultProfile()` and profile switching functions

3. **Profile-Owned State Structure**:
   - `state.profiles[profileId]` = `{ localRecipes, shoppingList, allergyFilters, symptomLog }`
   - Each profile has isolated data

4. **Legacy Compatibility**:
   - `AppState` provides backward-compatible API
   - Some data saved to both new and legacy keys (e.g., `localRecipes`)

5. **Sync Points**:
   - Profile switching functions maintain sync between `AppState.activeProfileId` and `state.activeProfileId`
   - Profile management functions update both systems

### Critical Dependencies

- `AppState` getters/setters directly reference `state` fields
- Profile helper functions (`getActiveProfile()`, `getProfileShoppingList()`, etc.) read from `state.profiles[state.activeProfileId]`
- `saveState()` must be called after any state mutations
- Both `state.activeProfileId` and `state.userActiveProfileId` must be kept in sync
