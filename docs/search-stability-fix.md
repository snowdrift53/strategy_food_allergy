# Search Stability Fix - Root Cause Resolution

## Problem

Intermittent search glitches occurred where pressing Enter repeatedly sometimes "fixed" the issue. The root causes were:
1. **Stale async responses**: Multiple concurrent online searches could complete out of order
2. **Inconsistent search entry points**: Different event handlers called different methods, leading to race conditions
3. **No request cancellation**: Previous requests weren't aborted when new ones started

## Solution

### 1. Centralized Search Entry Point

Created `runSearch({ query, mode, source })` function that:
- Accepts optional `query` (reads from input if not provided)
- Accepts optional `mode` (uses current mode if not provided)
- Accepts `source` parameter for debug logging: `'input' | 'enter' | 'button' | 'clear' | 'profile-change' | 'suggestion' | 'recipe-edit' | 'recipe-delete'`
- Handles AbortController creation/abortion for online searches
- Increments request ID for stale response detection

**Location:** `src/app.js` - `Recipes.runSearch()`

### 2. AbortController for Online Searches

- Added `onlineAbortController` property to `Recipes` module
- When starting a new online search:
  - Aborts previous request if exists
  - Creates new AbortController
  - Passes signal to `searchRecipesOnline()`
- Abort errors are silently ignored (expected behavior)

**Location:** 
- `src/app.js` - `Recipes.onlineAbortController` property
- `src/app.js` - `Recipes.runSearch()` - AbortController management
- `data/providers.js` - Updated to accept `{ signal }` option

### 3. Request ID Guard (Maintained)

- Kept existing `onlineSearchRequestId` counter
- Incremented at start of each online search
- Checked before applying results (multiple checkpoints)
- Stale responses are ignored silently

**Location:** `src/app.js` - `Recipes.searchOnline()`

### 4. Provider Updates

Updated `data/providers.js` to support AbortController:
- `searchRecipesOnline(query, options = {})` - accepts `{ signal }` option
- `fetchMealsByArea(areaOrAreas, options = {})` - accepts `{ signal }` and passes to fetch calls
- `fetchMealDetails(mealId, options = {})` - accepts `{ signal }` and passes to fetch calls
- All fetch calls now include `{ signal }` option
- Abort errors are re-thrown to let caller handle

### 5. All Entry Points Updated

All search triggers now call `runSearch()`:

**Input typing:**
- `source: 'input'` - Debounced for online mode, instant for local mode

**Enter key:**
- `source: 'enter'` - Bypasses debounce, runs immediately

**Clear button:**
- `source: 'clear'` - Passes empty query to show default state

**Mode toggle buttons:**
- `source: 'button'` - Passes current mode to ensure correct behavior

**Profile switching:**
- `source: 'profile-change'` - Re-runs current search with current query/mode

**Typo suggestion:**
- `source: 'suggestion'` - Uses suggested query

**Recipe edit/delete:**
- `source: 'recipe-edit'` / `source: 'recipe-delete'` - Refreshes current search

### 6. Debug Logging

Added `?searchDebug=1` URL parameter for debugging:
- Logs every search trigger: `[SEARCH] source=..., mode=..., query=..., reqId=...`
- Logs abort events: `[SEARCH] aborted previous request`
- Logs stale response ignores: `[SEARCH] stale response ignored (reqId=..., current=...)`
- Logs abort errors: `[SEARCH] request aborted (reqId=...)`

**Location:** `src/app.js` - `Recipes.runSearch()` and `Recipes.searchOnline()`

## Behavior Preservation

✅ **No UX layout changes** - All UI remains identical  
✅ **Local search remains fast** - No debounce for local mode, instant execution  
✅ **Online search is stable** - AbortController + request ID guard prevent stale responses  
✅ **Profile switching works** - Properly aborts previous requests and re-runs search  
✅ **Empty query handling** - Shows correct default state for each mode:
  - Local mode: Shows all local recipes
  - Online mode: Shows "Type a country, cuisine, or region to search online recipes."

## Testing

To verify the fix:

1. **Test Enter key stability:**
   - Type a query in online mode
   - Press Enter multiple times rapidly
   - Results should be consistent (no flickering/changes)

2. **Test clear button:**
   - Type a query
   - Click clear button
   - Should show default state for current mode

3. **Test mode switching:**
   - Type a query in local mode
   - Switch to online mode
   - Should show correct results for online mode
   - Switch back to local mode
   - Should show correct results for local mode

4. **Test profile switching:**
   - Search for recipes in one profile
   - Switch to another profile
   - Should refresh search with new profile's data

5. **Test with debug flag:**
   - Add `?searchDebug=1` to URL
   - Open browser console
   - Perform searches and verify logs show:
     - All search triggers logged
     - Abort events logged when appropriate
     - Stale responses ignored (if any)

## Files Changed

1. **src/app.js:**
   - Added `onlineAbortController` property
   - Created `runSearch()` function
   - Updated `searchOnline()` to use AbortController and signal
   - Updated all event handlers to call `runSearch()`
   - Added debug logging

2. **data/providers.js:**
   - Updated `searchRecipesOnline()` to accept `{ signal }` option
   - Updated `fetchMealsByArea()` to accept and use `{ signal }`
   - Updated `fetchMealDetails()` to accept and use `{ signal }`
   - All fetch calls now include signal for cancellation

## Deliverables

✅ Pressing Enter repeatedly no longer changes outcomes  
✅ Clearing input reliably returns to default list  
✅ Online search results never get overwritten by older responses  
✅ All search entry points use centralized `runSearch()` function  
✅ AbortController cancels in-flight requests  
✅ Request ID guard prevents stale responses  
✅ Debug logging available with `?searchDebug=1`
