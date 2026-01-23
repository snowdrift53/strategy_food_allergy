# Event Listener Duplication Risk Audit

## Summary

This document details the audit and fixes for event listener duplication risks in the application.

## Duplication Risks Identified and Fixed

### 1. ShoppingList.render() - FIXED ✅

**Location:** `src/features/grocery.js`

**Before:**
- Event listeners attached in a loop inside `render()` method
- Called multiple times: `init()`, `renderApp()`, after `addItem()`, `removeItem()`, `toggleItem()`, `clearAll()`
- **Risk:** Listeners accumulate on each render, causing duplicate handlers

**After:**
- Added `_listenersAttached` guard flag
- Static listeners (add button, input, clear button) attached once in `init()`
- Dynamic listeners (checkboxes, remove buttons) handled via event delegation on `#grocery-list` container
- Added `data-item-id` attribute to list items for event delegation
- **Fix:** Event delegation ensures listeners are attached only once to the stable container

**Changes:**
- Lines 13-22: Added `_listenersAttached` flag and event delegation setup in `init()`
- Lines 97-134: Removed `addEventListener` calls from `render()`, added `data-item-id` attributes

### 2. Log.render() - FIXED ✅

**Location:** `src/features/profiles.js`

**Before:**
- Delete button listeners attached in a loop inside `render()` method
- Called multiple times: `init()`, `renderApp()`, after `saveEntry()`, `deleteEntry()`
- **Risk:** Listeners accumulate on each render, causing duplicate handlers

**After:**
- Added `_listenersAttached` guard flag
- Static listeners attached once in `attachEvents()` with guard
- Dynamic delete button listeners handled via event delegation on `#log-entries` container
- **Fix:** Event delegation ensures listeners are attached only once to the stable container

**Changes:**
- Line 600: Added `_listenersAttached: false` property
- Lines 605-648: Added guard in `attachEvents()` and event delegation for delete buttons
- Lines 729-748: Removed `addEventListener` loop from `render()`

### 3. Forecast.render() - FIXED ✅

**Location:** `src/app.js`

**Before:**
- Missing ingredient "+" button listeners attached in a loop inside `render()` method
- Ready-card click listeners attached in a loop inside `render()` method
- "Go to Shopping List" button listener attached conditionally
- Called multiple times: from `Navigation.switchView()`, `renderApp()`
- **Risk:** Listeners accumulate on each render, causing duplicate handlers

**After:**
- Added `_listenersAttached` guard flag
- Created `initOnce()` method to set up event delegation once
- All dynamic listeners handled via event delegation on `#forecast-content` container
- **Fix:** Event delegation ensures listeners are attached only once to the stable container

**Changes:**
- Line 3696: Added `_listenersAttached: false` property
- Lines 3897-3939: Added `initOnce()` method with event delegation
- Line 3897: Modified `render()` to call `initOnce()` first
- Lines 4064-4088: Removed `addEventListener` loops from `render()`
- Line 4163: Added `Forecast.initOnce()` call in `App.init()`

## Safe Render Functions (No Changes Needed)

### 1. Recipes.renderList()
- **Location:** `src/app.js` line 2696
- **Safety:** Clears `innerHTML = ''` before rendering (line 2703)
- **Reason:** Old elements and their listeners are removed before new ones are created

### 2. Recipes.showSuggestion()
- **Location:** `src/app.js` line 2782
- **Safety:** Removes existing suggestion element before creating new one (lines 2787-2790)
- **Reason:** Only one suggestion element exists at a time

### 3. renderRecipesGrid()
- **Location:** `src/ui/renderRecipes.js` line 19
- **Safety:** Clears `containerEl.innerHTML = ''` before rendering (line 34)
- **Reason:** Old elements and their listeners are removed before new ones are created

### 4. renderAddRecipeModal renderList()
- **Location:** `src/ui/renderAddRecipeModal.js` line 151
- **Safety:** Clears `list.innerHTML = ''` via template before rendering (line 155)
- **Reason:** Old elements and their listeners are removed before new ones are created

## Event Delegation Pattern Used

All fixes use the same pattern:

1. **Stable Container:** Attach listener once to a parent container that persists across renders
2. **Event Bubbling:** Use event bubbling to catch clicks on dynamically created children
3. **Target Matching:** Check `e.target` or `e.target.closest()` to identify the clicked element
4. **Data Attributes:** Use `data-*` attributes to store identifiers needed for the action

**Example Pattern:**
```javascript
container.addEventListener('click', (e) => {
    if (e.target.matches('.dynamic-button')) {
        const id = e.target.getAttribute('data-id');
        this.handleAction(id);
    }
});
```

## Behavior Preservation

All fixes preserve 100% of existing behavior:
- Same click handlers
- Same event timing
- Same UI interactions
- Same data flow
- No visual changes
- No functional changes

The only difference is that listeners are now attached once instead of multiple times, preventing:
- Memory leaks from accumulated listeners
- Duplicate action execution
- Performance degradation from multiple handlers

## Testing Recommendations

To verify the fixes work correctly:
1. Add/remove shopping list items multiple times - checkboxes and remove buttons should work correctly
2. Add/delete log entries multiple times - delete buttons should work correctly
3. Navigate to forecast view multiple times - "+" buttons and recipe cards should work correctly
4. Verify no duplicate actions occur (e.g., clicking once should not trigger multiple handlers)
