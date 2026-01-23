/**
 * Add Recipe Modal - Modal form for adding new recipes
 */
(function() {
    'use strict';

    /**
     * Render add recipe modal
     * @param {Object} options - Configuration object
     * @param {Function} options.onClose - Callback when modal is closed
     * @param {Function} options.onSubmit - Callback when form is submitted (recipeObj)
     * @param {Array} options.ingredientSuggestions - Array of ingredient strings for autocomplete
     */
    window.renderAddRecipeModal = function(options) {
        if (!options) return;

        const { onClose, onSubmit, ingredientSuggestions = [] } = options;

        // Remove existing modal if present
        const existing = document.getElementById('add-recipe-modal');
        if (existing) {
            existing.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'add-recipe-overlay';
        overlay.id = 'add-recipe-overlay';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && onClose) {
                onClose();
            }
        });

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'add-recipe-modal';
        modal.id = 'add-recipe-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'add-recipe-modal-title');

        // Build datalist for ingredient autocomplete
        const datalistId = 'ingredient-suggestions';
        let datalistHtml = '';
        if (ingredientSuggestions.length > 0) {
            datalistHtml = `<datalist id="${datalistId}">${ingredientSuggestions.map(ing => `<option value="${UI.escape(ing)}">`).join('')}</datalist>`;
        }

        modal.innerHTML = `
            <div class="add-recipe-modal-header">
                <h3 id="add-recipe-modal-title">Add Recipe</h3>
                <button class="add-recipe-close-btn" id="add-recipe-close-btn" aria-label="Close">×</button>
            </div>
            <div class="add-recipe-modal-body">
                <form id="add-recipe-form">
                    <div class="add-recipe-field">
                        <label for="recipe-title-input">Title <span class="required">*</span></label>
                        <input type="text" id="recipe-title-input" class="add-recipe-input" required placeholder="e.g., Chocolate Chip Cookies">
                    </div>

                    <div class="add-recipe-field">
                        <label for="recipe-description-input">Description</label>
                        <textarea id="recipe-description-input" class="add-recipe-textarea" rows="3" placeholder="Optional description..."></textarea>
                    </div>

                    <div class="add-recipe-field">
                        <label>Ingredients <span class="required">*</span></label>
                        <div class="add-recipe-list-input-wrapper">
                            <input type="text" id="ingredient-input" class="add-recipe-input" list="${datalistId}" placeholder="e.g., 2 cups flour">
                            <button type="button" id="add-ingredient-btn" class="add-recipe-add-btn">Add</button>
                        </div>
                        ${datalistHtml}
                        <ul id="ingredients-list" class="add-recipe-list"></ul>
                    </div>

                    <div class="add-recipe-field">
                        <label>Steps <span class="required">*</span></label>
                        <div class="add-recipe-list-input-wrapper">
                            <input type="text" id="step-input" class="add-recipe-input" placeholder="e.g., Preheat oven to 350°F">
                            <button type="button" id="add-step-btn" class="add-recipe-add-btn">Add</button>
                        </div>
                        <ul id="steps-list" class="add-recipe-list"></ul>
                    </div>

                    <div class="add-recipe-field">
                        <label for="recipe-cuisine-input">Cuisine/Tags (optional)</label>
                        <input type="text" id="recipe-cuisine-input" class="add-recipe-input" placeholder="e.g., Italian, Mediterranean">
                    </div>

                    <div class="add-recipe-field">
                        <label for="recipe-image-input">Picture (optional)</label>
                        <div class="add-recipe-image-section">
                            <input type="file" id="recipe-image-input" class="add-recipe-file-input" accept="image/*" style="display: none;">
                            <button type="button" id="recipe-image-select-btn" class="add-recipe-image-btn">Choose Picture</button>
                            <div id="recipe-image-preview-wrapper" class="add-recipe-image-preview-wrapper hidden">
                                <img id="recipe-image-preview" class="add-recipe-image-preview" alt="Recipe preview">
                                <button type="button" id="recipe-image-remove-btn" class="add-recipe-image-remove-btn" aria-label="Remove picture">×</button>
                            </div>
                        </div>
                    </div>

                    <div class="add-recipe-modal-actions">
                        <button type="button" id="add-recipe-cancel-btn" class="add-recipe-btn add-recipe-btn-secondary">Cancel</button>
                        <button type="submit" id="add-recipe-submit-btn" class="add-recipe-btn add-recipe-btn-primary">Save Recipe</button>
                    </div>
                </form>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // State for ingredients and steps
        const ingredients = [];
        const steps = [];

        // Helper to render list items
        const renderList = (listId, items, onRemove) => {
            const list = document.getElementById(listId);
            if (!list) return;
            
            list.innerHTML = items.map((item, index) => `
                <li class="add-recipe-list-item">
                    <span>${UI.escape(item)}</span>
                    <button type="button" class="add-recipe-remove-btn" data-index="${index}" aria-label="Remove">×</button>
                </li>
            `).join('');

            // Attach remove handlers
            list.querySelectorAll('.add-recipe-remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.getAttribute('data-index'));
                    onRemove(index);
                });
            });
        };

        // Ingredients list management
        const ingredientInput = document.getElementById('ingredient-input');
        const addIngredientBtn = document.getElementById('add-ingredient-btn');
        
        const addIngredient = () => {
            const value = ingredientInput.value.trim();
            if (value) {
                ingredients.push(value);
                ingredientInput.value = '';
                renderList('ingredients-list', ingredients, (index) => {
                    ingredients.splice(index, 1);
                    renderList('ingredients-list', ingredients, addIngredient);
                });
            }
        };

        addIngredientBtn.addEventListener('click', addIngredient);
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
            }
        });

        // Steps list management
        const stepInput = document.getElementById('step-input');
        const addStepBtn = document.getElementById('add-step-btn');
        
        const addStep = () => {
            const value = stepInput.value.trim();
            if (value) {
                steps.push(value);
                stepInput.value = '';
                renderList('steps-list', steps, (index) => {
                    steps.splice(index, 1);
                    renderList('steps-list', steps, addStep);
                });
            }
        };

        addStepBtn.addEventListener('click', addStep);
        stepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addStep();
            }
        });

        // Image upload handling
        const imageInput = document.getElementById('recipe-image-input');
        const imageSelectBtn = document.getElementById('recipe-image-select-btn');
        const imagePreviewWrapper = document.getElementById('recipe-image-preview-wrapper');
        const imagePreview = document.getElementById('recipe-image-preview');
        const imageRemoveBtn = document.getElementById('recipe-image-remove-btn');

        imageSelectBtn.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    imageInput.value = '';
                    return;
                }

                // Validate file size (before compression, warn if > 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert('Image is very large. It will be compressed automatically.');
                }

                selectedImageFile = file;

                // Show preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    imagePreviewWrapper.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });

        imageRemoveBtn.addEventListener('click', () => {
            selectedImageFile = null;
            imageInput.value = '';
            imagePreviewWrapper.classList.add('hidden');
            imagePreview.src = '';
        });

        // Form submission
        const form = document.getElementById('add-recipe-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const titleInput = document.getElementById('recipe-title-input');
            const title = titleInput.value.trim();
            const description = document.getElementById('recipe-description-input').value.trim();
            const cuisine = document.getElementById('recipe-cuisine-input').value.trim();

            // Validation
            if (!title) {
                alert('Please enter a recipe title.');
                titleInput.focus();
                return;
            }

            if (ingredients.length === 0) {
                alert('Please add at least one ingredient.');
                ingredientInput.focus();
                return;
            }

            if (steps.length === 0) {
                alert('Please add at least one step.');
                stepInput.focus();
                return;
            }

            // Get file from input (ensure we have the actual File object)
            const fileFromInput = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
            const imageFileToUse = fileFromInput || selectedImageFile || null;

            // Debug logging
            const IMG_DEBUG = new URLSearchParams(location.search).has("imgDebug");
            if (IMG_DEBUG) {
                if (imageFileToUse) {
                    console.log("[IMG_DEBUG] Selected file:", {
                        name: imageFileToUse.name,
                        size: imageFileToUse.size,
                        type: imageFileToUse.type
                    });
                } else {
                    console.log("[IMG_DEBUG] No image file selected");
                }
            }

            // Build recipe object
            const recipeObj = {
                title: title,
                description: description || '',
                fullDescription: description || '',
                ingredients: ingredients,
                steps: steps,
                cuisine: cuisine || '',
                time: 'N/A',
                servings: 'N/A',
                difficulty: 'N/A',
                imageType: 'photo',
                photo: '',
                illustration: '',
                imageFile: imageFileToUse
            };

            if (onSubmit) {
                onSubmit(recipeObj);
            }
        });

        // Close handlers
        const closeBtn = document.getElementById('add-recipe-close-btn');
        const cancelBtn = document.getElementById('add-recipe-cancel-btn');
        
        const closeModal = () => {
            if (onClose) {
                onClose();
            }
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Focus first input
        setTimeout(() => {
            titleInput.focus();
        }, 100);
    };

    /**
     * Close add recipe modal
     */
    window.closeAddRecipeModal = function() {
        const overlay = document.getElementById('add-recipe-overlay');
        if (overlay) {
            overlay.remove();
        }
    };
})();
