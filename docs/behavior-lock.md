# Behavior Lock Checklist

This document lists all key behaviors that **MUST remain identical** during refactoring. Any changes to these behaviors are **NON-NEGOTIABLE** and will break the application.

## Storage Keys & Persistence

### localStorage Keys (with prefix `melorycook_`)
- [ ] `melorycook_profileOwnedState` - Profile-owned state (localRecipes, shoppingList, allergyFilters, symptomLog per profile)
- [ ] `melorycook_profileActiveId` - Active profile ID
- [ ] `melorycook_groceryList` - Legacy grocery list (deprecated, but may exist)
- [ ] `melorycook_userProfiles` - User profiles array
- [ ] `melorycook_activeProfileId` - Active user profile ID
- [ ] `melorycook_profileLogs` - Profile logs object
- [ ] `melorycook_localRecipes` - Legacy local recipes (backward compatibility)
- [ ] `melorycook_migration_complete` - Migration flag for storage key migration

### Storage Behavior
- [ ] Storage prefix must be `melorycook` (defined in `APP_META.storagePrefix`)
- [ ] All storage operations must use `Storage.load()` and `Storage.save()` helpers
- [ ] Storage migration from `cookingapp_` prefix must remain functional
- [ ] Quota errors must be caught and re-thrown for user notification
- [ ] Storage keys must NOT be renamed or changed

## Recipe Search and Filtering

### Search Modes
- [ ] Two search modes: `'local'` and `'online'` (stored in `Recipes.searchMode`)
- [ ] Toggle buttons must switch between Local and Online modes
- [ ] Search mode state must persist during session

### Search Input Behavior
- [ ] Search input debouncing must work (prevents excessive API calls)
- [ ] Clear button (×) appears when input has value, hidden when empty
- [ ] Enter key triggers search
- [ ] Query normalization: trim, toLowerCase, collapse spaces

### Local Search Behavior
- [ ] Searches through: local recipes + online recipes cached in `currentRecipes`
- [ ] Filtering searches: title, description, ingredients, cuisineTags, area, cuisine, family
- [ ] Multi-term search: splits query by spaces, matches ANY term (OR logic)
- [ ] Area matching: exact match on normalized area field
- [ ] Country/demonym equivalence (e.g., "turkey" matches "Turkish", "spain" matches "Spanish")
- [ ] Regional search support (e.g., "mediterranean" matches multiple areas)

### Online Search Behavior
- [ ] Uses TheMealDB API (`https://www.themealdb.com/api/json/v1/1/search.php?s=`)
- [ ] Area detection from query (via `detectAreaFromQuery`)
- [ ] If area detected, uses area filter endpoint
- [ ] Request ID tracking to prevent stale responses
- [ ] Cancels in-flight requests when profile changes or new search starts
- [ ] Converts TheMealDB format to app format via `mapMealToRecipe`

### Search Results
- [ ] Results stored in `Recipes.currentRecipes` array
- [ ] Duplicate removal by ID when rendering
- [ ] Empty state message when no results
- [ ] Loading state during async operations

## Opening Recipe Detail

### Detail View Navigation
- [ ] Clicking recipe card opens detail view
- [ ] Recipe list (`#recipe-list`) hidden, detail (`#recipe-detail`) shown
- [ ] Back button returns to recipe grid
- [ ] Detail view finds recipe from `Recipes.currentRecipes` by ID

### Detail View Content
- [ ] Recipe classification for allergy suitability (SAFE/REPLACEABLE/UNSAFE)
- [ ] Image resolution priority: `imageDataUrl` > `illustration` (if `imageType === 'illustration'`) > `photo` > placeholder
- [ ] Placeholder image: `images/recipes/placeholder-recipe.jpg`
- [ ] Edit button shown for user-created recipes (`isUserCreated === true`)
- [ ] HTML escaping for all user-generated content

### Detail View State
- [ ] Detail view resets to grid when profile changes
- [ ] Detail view closes when viewing recipe is deleted
- [ ] Scroll position resets to top when opening detail

## Profile Switching and Active Profile

### Profile State
- [ ] Active profile ID stored in `AppState.activeProfileId` and `state.activeProfileId`
- [ ] Default profile created if no profiles exist (id: generated, name: 'Default')
- [ ] Active profile must exist in profiles array (fallback to first profile if invalid)
- [ ] Profile switching updates both `AppState.activeProfileId` and `state.activeProfileId`

### Profile Switching Behavior
- [ ] `Profiles.switchProfile(profileId)` updates active profile
- [ ] Creates profile-owned state if missing (localRecipes, shoppingList, allergyFilters, symptomLog)
- [ ] Saves state after switching
- [ ] Cancels in-flight recipe searches
- [ ] Resets recipe detail view to grid
- [ ] Re-runs current search query after profile switch
- [ ] Refreshes entire app view (`renderApp()`)

### Profile Data Isolation
- [ ] Each profile has isolated: localRecipes, shoppingList, allergyFilters, symptomLog
- [ ] Profile-owned state stored in `state.profiles[profileId]`
- [ ] Legacy compatibility: `localRecipes` also saved to `STORAGE_KEYS.LOCAL_RECIPES`

### Profile Management
- [ ] Add profile: creates new profile with unique ID, empty state
- [ ] Profile avatar support: `avatarDataUrl` field (nullable)
- [ ] Profile allergies: stored in profile object, used for recipe classification

## Grocery List Add/Remove Behavior

### Adding Items
- [ ] Add button (`#add-grocery-btn`) adds item
- [ ] Enter key in input (`#grocery-input`) adds item
- [ ] Item text trimmed before adding
- [ ] Empty items ignored
- [ ] Item structure: `{ id: string, text: string, checked: boolean }`
- [ ] ID generated using `Id.uid()`
- [ ] Input cleared after adding
- [ ] State saved immediately after add
- [ ] UI refreshed after add

### Removing Items
- [ ] Remove button (×) removes item by ID
- [ ] `removeShoppingItem(id)` filters out item from shopping list
- [ ] State saved immediately after remove
- [ ] UI refreshed after remove

### Item Toggle
- [ ] Checkbox toggles `item.checked` boolean
- [ ] Checked items have `checked` CSS class
- [ ] State saved immediately after toggle
- [ ] UI refreshed after toggle

### List Management
- [ ] Clear all: confirmation dialog, then clears entire list
- [ ] Reset demo: confirmation dialog, clears list, refreshes forecast
- [ ] Empty state message: "Your shopping list is empty. Add items to get started!"
- [ ] Shopping list stored per profile in `profile.shoppingList`

### Shopping List Storage
- [ ] Stored in profile-owned state: `state.profiles[profileId].shoppingList`
- [ ] Legacy key `melorycook_groceryList` may exist but is deprecated
- [ ] Migration from legacy key happens once on first load

## Local Recipe Add/Remove Behavior

### Adding Local Recipes
- [ ] Add recipe button opens modal (`renderAddRecipeModal`)
- [ ] Recipe ID format: `u_{timestamp}_{random}` (user-created prefix)
- [ ] `isUserCreated: true` flag set on user-created recipes
- [ ] Image compression: `fileToCompressedDataUrl()` converts image file to data URL
- [ ] Image stored in `imageDataUrl` field
- [ ] `imageType: 'photo'` set when image provided
- [ ] Cuisine tags built via `Recipes.buildCuisineTags()` if available
- [ ] Recipe added to active profile's `localRecipes` array
- [ ] State saved with error handling (quota errors shown to user)
- [ ] Modal closes after successful save
- [ ] If in local mode: refreshes search with current query
- [ ] If in online mode: switches to local mode and shows new recipe

### Editing Local Recipes
- [ ] Edit button shown on user-created recipes in detail view
- [ ] Edit opens modal with pre-filled data
- [ ] Preserves `id` and `isUserCreated` fields
- [ ] Image can be replaced or removed
- [ ] Save updates recipe in `localRecipes` array
- [ ] State saved with error handling
- [ ] Modal closes after successful save
- [ ] Recipe grid refreshes if in local mode

### Deleting Local Recipes
- [ ] Delete button in edit modal
- [ ] Confirmation dialog: "Are you sure you want to delete this recipe? This action cannot be undone."
- [ ] Removes recipe from `localRecipes` array by ID
- [ ] State saved after deletion
- [ ] If viewing deleted recipe detail: returns to grid
- [ ] Removes from `Recipes.currentRecipes` if present
- [ ] Refreshes grid if in local mode

### Local Recipe Storage
- [ ] Stored in profile-owned state: `state.profiles[profileId].localRecipes`
- [ ] Also saved to legacy key `melorycook_localRecipes` for backward compatibility
- [ ] Recipe structure must match expected format (title, ingredients, instructions, etc.)

## UI Rendering Behavior

### Recipe Grid
- [ ] Uses `window.renderRecipesGrid()` function
- [ ] Removes duplicates by ID before rendering
- [ ] Empty state message when no recipes
- [ ] Recipe cards show: image, title, suitability badge, like button, edit button (if user-created)

### Recipe Cards
- [ ] Click opens detail view
- [ ] Like button toggles recipe like status
- [ ] Suitability badge: SAFE (green), REPLACEABLE (yellow), UNSAFE (red)
- [ ] Edit button only for user-created recipes

### Navigation
- [ ] View switching: Recipes, Shopping List, Weekly Forecast, Allergy Information
- [ ] Active nav button has `active` class
- [ ] `Navigation.switchView()` updates active state and scrolls to top

### Modal Behavior
- [ ] Add recipe modal: opens/closes via `window.openAddRecipeModal()` / `window.closeAddRecipeModal()`
- [ ] Edit recipe modal: opens/closes via `window.openRecipeEditorModal()` / `window.closeRecipeEditorModal()`
- [ ] Modals prevent body scroll when open
- [ ] Focus management: first input focused on open

## Data Structures

### Recipe Object
- [ ] Must have: `id`, `title` (or `name`), `ingredients` (array), `instructions` (or `steps`)
- [ ] Optional: `description`, `photo`, `illustration`, `imageDataUrl`, `imageType`, `area`, `cuisine`, `family`, `cuisineTags`, `isUserCreated`
- [ ] ID format: `u_*` for user-created, `online-*` for online recipes

### Profile Object
- [ ] Must have: `id`, `name`, `allergies` (array)
- [ ] Optional: `avatarDataUrl`

### Shopping List Item
- [ ] Must have: `id`, `text`, `checked` (boolean)

## Error Handling

### Storage Errors
- [ ] Quota errors caught and shown to user via alert
- [ ] Other storage errors logged with warning
- [ ] Storage failures don't crash app (fallback values used)

### API Errors
- [ ] Online search failures logged as warnings
- [ ] Failed searches return empty array
- [ ] Network errors don't crash app

## Migration & Backward Compatibility

### Storage Migration
- [ ] One-time migration from `cookingapp_` to `melorycook_` prefix
- [ ] Migration flag prevents re-running
- [ ] Legacy keys preserved during migration (not deleted immediately)
- [ ] Profile-owned state migration from legacy shopping list

### Data Format Compatibility
- [ ] Legacy `groceryList` key migrated to profile-owned state
- [ ] Legacy `localRecipes` key synced with profile-owned state
- [ ] Profile logs structure maintained

## Critical Test Cases (Regression Prevention)

### Recipe Search
- [ ] "turkey" search must match recipes with area "Turkish"
- [ ] "tunisia" search must match recipes with area "Tunisian"
- [ ] "spain" search must match recipes with area "Spanish"
- [ ] Multi-term search matches if ANY term matches
- [ ] Empty search shows all local recipes (in local mode)

### Profile Switching
- [ ] Switching profile preserves search query and mode
- [ ] Switching profile cancels in-flight online searches
- [ ] Switching profile resets detail view to grid
- [ ] Each profile has isolated shopping list and recipes

### Recipe Management
- [ ] User-created recipes appear in local search
- [ ] Editing recipe preserves ID and isUserCreated flag
- [ ] Deleting recipe removes from grid if currently viewing
- [ ] Image compression works before saving recipe

---

## Notes

- **DO NOT** change any of the behaviors listed above
- **DO NOT** rename storage keys
- **DO NOT** change data structure formats
- **DO NOT** modify UI flows or user interactions
- **DO NOT** change function signatures of public APIs
- **ALLOWED**: Refactor code organization, move code to new files, reorganize modules
- **ALLOWED**: Update internal references after moving code
- **REQUIRED**: Test all behaviors after any refactoring
