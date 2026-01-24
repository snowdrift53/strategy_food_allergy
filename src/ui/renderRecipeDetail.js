/**
 * Recipe Detail Rendering - Renders recipe detail view
 */
(function() {
    'use strict';

    /**
     * Get deterministic color class for a tag (c1-c6)
     * @param {string} tagText - Tag text
     * @returns {string} Color class (tag--c1 through tag--c6)
     */
    function getTagColorClass(tagText) {
        if (!tagText || typeof tagText !== 'string') return 'tag--c1';
        // Simple stable hash: sum of char codes mod 6
        let sum = 0;
        for (let i = 0; i < tagText.length; i++) {
            sum += tagText.charCodeAt(i);
        }
        const colorIndex = (sum % 6) + 1; // 1-6
        return `tag--c${colorIndex}`;
    }

    /**
     * Render recipe detail view
     * @param {Object} options - Configuration object
     * @param {Object} options.recipe - Recipe object
     * @param {Element} options.containerEl - Container element to render into
     * @param {Function} options.classifyRecipe - Function to classify recipe (recipe, allergies) -> classification object
     * @param {Function} options.escapeHtml - Function to escape HTML (text) -> escaped string
     * @param {Array} options.activeAllergies - Array of active allergies for classification
     * @param {Function} options.onEditRecipe - Callback when edit recipe is clicked (recipeId)
     */
    window.renderRecipeDetail = function(options) {
        if (!options || !options.recipe || !options.containerEl) return;

        const {
            recipe,
            containerEl,
            classifyRecipe,
            escapeHtml,
            activeAllergies = [],
            onEditRecipe
        } = options;

        // Image resolution: prioritize user-uploaded image, then use recipe.imageType to choose between recipe.illustration vs recipe.photo
        const isOnlineRecipe = recipe.id && String(recipe.id).startsWith('online-');
        let mainImageUrl = '';
        let secondaryImageUrl = '';
        
        // Check for user-uploaded image first (imageDataUrl)
        if (recipe.imageDataUrl && recipe.imageDataUrl.trim() !== '') {
            mainImageUrl = recipe.imageDataUrl;
            secondaryImageUrl = recipe.imageDataUrl;
        } else if (recipe.imageType === 'illustration' && recipe.illustration && recipe.illustration.trim() !== '') {
            mainImageUrl = recipe.illustration;
            secondaryImageUrl = recipe.photo || recipe.illustration;
        } else if (recipe.photo && recipe.photo.trim() !== '') {
            mainImageUrl = recipe.photo;
            secondaryImageUrl = recipe.illustration || recipe.photo;
        }
        
        // Fallback to placeholder if still empty
        if (!mainImageUrl || mainImageUrl.trim() === '') {
            mainImageUrl = 'images/recipes/placeholder-recipe.jpg';
        }
        if (!secondaryImageUrl || secondaryImageUrl.trim() === '') {
            secondaryImageUrl = 'images/recipes/placeholder-recipe.jpg';
        }
        
        const mainImageClass = recipe.imageType === 'illustration' ? 'detail-image illustration' : 'detail-image photo';
        const secondaryImageClass = recipe.imageType === 'illustration' ? 'detail-image photo' : 'detail-image illustration';
        const placeholderUrl = 'images/recipes/placeholder-recipe.jpg';

        // Classify recipe for allergy suitability
        let suitabilityHtml = '';
        if (classifyRecipe) {
            const classification = classifyRecipe(recipe, activeAllergies);
            
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
                        <div class="adapt-flag">
                            <div class="adapt-flag-header">
                                <span class="mini-flag flag-changes">ADAPT</span>
                            </div>
                            <div class="adapt-flag-text">
                                Adapt &<br>enjoy!
                            </div>
                        </div>
                        <div class="suitability-content">
                            <div class="suitability-block">
                                <strong>Problem ingredients:</strong>
                                <ul class="suitability-list">
                                    ${uniqueIngredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="suitability-block">
                                <strong>Suggested substitutions:</strong>
                                <ul class="suitability-list">
                                    ${substitutionsKeys.map(allergenKey => {
                                        const subs = classification.substitutionsByAllergen[allergenKey];
                                        return `<li><strong>${escapeHtml(allergenKey)}</strong>: ${subs.map(s => escapeHtml(s)).join(', ')}</li>`;
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
                        <div class="suitability-header">
                            <span class="mini-flag flag-avoid">AVOID</span>
                            <span class="recipe-suitability-text">Avoid (too many conflicts)</span>
                        </div>
                        <div class="suitability-content">
                            <div class="suitability-block">
                                <strong>Problem ingredients:</strong>
                                <ul class="suitability-list">
                                    ${uniqueIngredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="suitability-message">No suitable substitutions found</div>
                        </div>
                    </div>
                `;
            }
        }

        // Check if recipe is user-created
        const isUserCreated = recipe.isUserCreated || (recipe.id && String(recipe.id).startsWith('u_'));
        
        // Edit recipe button for user-created recipes
        const editRecipeBtnHtml = isUserCreated && onEditRecipe ? `
            <button class="edit-picture-btn" id="edit-recipe-btn" data-recipe-id="${UI.escape(recipe.id)}" aria-label="Edit recipe" title="Edit recipe">⚙️</button>
        ` : '';

        containerEl.innerHTML = `
            <div class="detail-header">
                <div class="detail-images">
                    <div class="${mainImageClass}" style="position: relative;">
                        <img src="${UI.escape(mainImageUrl)}" alt="${UI.escape(recipe.title || '')}" onerror="this.onerror=null; this.src='${UI.escape(placeholderUrl)}';">
                        ${editRecipeBtnHtml}
                    </div>
                </div>
                <h1 class="detail-title">${UI.escape(recipe.title || '')}</h1>
                ${recipe.cuisineTags && Array.isArray(recipe.cuisineTags) && recipe.cuisineTags.length > 0 ? `
                <div class="detail-tags">
                    ${recipe.cuisineTags.map(tag => `<span class="tag tag-pill ${getTagColorClass(tag)}">${UI.escape(tag)}</span>`).join('')}
                </div>
                ` : ''}
                <div class="detail-meta">
                    <div class="detail-meta-item"><span>⏱️</span><span>${UI.escape(recipe.time || '')}</span></div>
                    <div class="detail-meta-item"><span>👥</span><span>${UI.escape(recipe.servings || '')} servings</span></div>
                    <div class="detail-meta-item"><span>⭐</span><span>${UI.escape(recipe.difficulty || '')}</span></div>
                </div>
                ${suitabilityHtml}
                <p class="detail-description">${UI.escape(recipe.fullDescription || recipe.description || '')}</p>
            </div>

            <div class="detail-section">
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${(recipe.ingredients || []).map(ingredient => `<li>${UI.escape(ingredient)}</li>`).join('')}
                </ul>
            </div>

            <div class="detail-section">
                <h3>Instructions</h3>
                <ol class="steps-list">
                    ${(recipe.steps || []).map(step => `<li>${UI.escape(step)}</li>`).join('')}
                </ol>
            </div>
        `;

        // Attach edit recipe button handler
        if (isUserCreated && onEditRecipe) {
            const editBtn = containerEl.querySelector('#edit-recipe-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const recipeId = editBtn.getAttribute('data-recipe-id');
                    if (recipeId && onEditRecipe) {
                        onEditRecipe(recipeId);
                    }
                });
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
})();
