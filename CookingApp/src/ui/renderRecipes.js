/**
 * Recipe Grid Rendering - Renders recipe cards in a grid
 */
(function() {
    'use strict';

    /**
     * Render recipe cards grid
     * @param {Object} options - Configuration object
     * @param {Array} options.recipes - Array of recipe objects
     * @param {Element} options.containerEl - Container element to render into
     * @param {Function} options.onRecipeClick - Callback when recipe card is clicked (recipeId)
     * @param {Function} options.onToggleLike - Callback when like button is clicked (recipe)
     * @param {Function} options.checkRecipeSuitability - Function to check recipe suitability (recipe) -> 'SAFE'|'REPLACEABLE'|'UNSAFE'
     * @param {Function} options.isRecipeLiked - Function to check if recipe is liked (recipeId) -> boolean
     * @param {string} options.emptyMessage - Message to show when recipes array is empty
     */
    window.renderRecipesGrid = function(options) {
        if (!options || !options.containerEl) return;

        const {
            recipes = [],
            containerEl,
            onRecipeClick,
            onToggleLike,
            checkRecipeSuitability,
            isRecipeLiked,
            emptyMessage
        } = options;

        // Clear container
        containerEl.innerHTML = '';

        // Show empty state if no recipes
        if (recipes.length === 0) {
            if (emptyMessage) {
                window.renderEmpty(containerEl, emptyMessage);
            }
            return;
        }

        // Remove duplicates by ID
        const uniqueRecipes = recipes.filter((recipe, index, self) => 
            index === self.findIndex(r => String(r.id) === String(recipe.id))
        );

        // Render each recipe card
        uniqueRecipes.forEach(recipe => {
            const card = createRecipeCard(recipe, {
                onRecipeClick,
                onToggleLike,
                checkRecipeSuitability,
                isRecipeLiked
            });
            containerEl.appendChild(card);
        });
    };

    /**
     * Create a single recipe card element
     * @param {Object} recipe - Recipe object
     * @param {Object} callbacks - Callback functions
     * @returns {Element} Recipe card element
     */
    function createRecipeCard(recipe, callbacks) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        if (callbacks.onRecipeClick) {
            card.addEventListener('click', () => callbacks.onRecipeClick(recipe.id));
        }

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

        // Check recipe suitability
        let badgeHtml = '';
        if (callbacks.checkRecipeSuitability) {
            const suitability = callbacks.checkRecipeSuitability(recipe);
            if (suitability === 'SAFE') {
                badgeHtml = '<div class="mini-flag flag-safe">OK</div>';
            } else if (suitability === 'REPLACEABLE') {
                badgeHtml = '<div class="mini-flag flag-changes">ADAPT</div>';
            } else if (suitability === 'UNSAFE') {
                badgeHtml = '<div class="mini-flag flag-avoid">AVOID</div>';
            }
        }

        // Like button for online recipes
        const isLiked = isOnlineRecipe && callbacks.isRecipeLiked && callbacks.isRecipeLiked(recipe.id);
        const likeButtonClass = isOnlineRecipe ? (isLiked ? 'like-btn liked' : 'like-btn') : '';
        const likeButtonHtml = isOnlineRecipe ? '<button class="' + likeButtonClass + '" data-recipe-id="' + UI.escape(recipe.id) + '" title="' + UI.escape(isLiked ? 'Remove from My Recipes' : 'Add to My Recipes') + '">❤️</button>' : '';

        card.innerHTML = `
            <div class="${imageClass}">
                <img src="${UI.escape(imageUrl)}" alt="${UI.escape(recipe.title || '')}" onerror="this.onerror=null; this.src='${UI.escape(placeholderUrl)}';">
                ${badgeHtml}
            </div>
            <div class="recipe-info">
                <h2 class="recipe-title">${UI.escape(recipe.title || '')}</h2>
                <p class="recipe-description">${UI.escape(recipe.description || '')}</p>
                <div class="recipe-meta">
                    <span>⏱️ ${UI.escape(recipe.time || '')}</span>
                    <span>👥 ${UI.escape(recipe.servings || '')} servings</span>
                    <span>⭐ ${UI.escape(recipe.difficulty || '')}</span>
                </div>
                ${likeButtonHtml}
            </div>
        `;

        // Attach like button event handler for online recipes
        if (isOnlineRecipe && callbacks.onToggleLike) {
            const likeBtn = card.querySelector('.like-btn');
            if (likeBtn) {
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    callbacks.onToggleLike(recipe);
                });
            }
        }

        return card;
    }
})();
