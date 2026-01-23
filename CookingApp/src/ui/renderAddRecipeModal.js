/**
 * Recipe Editor Modal - Reusable modal for creating and editing recipes
 */
(function() {
    'use strict';

    /**
     * Render recipe editor modal (create or edit mode)
     * @param {Object} options - Configuration object
     * @param {string} options.mode - "create" | "edit"
     * @param {Object|null} options.initialRecipe - Recipe object for edit mode, null for create
     * @param {Array} options.ingredientSuggestions - Array of ingredient strings for autocomplete
     * @param {Function} options.onClose - Callback when modal is closed
     * @param {Function} options.onSave - Callback when form is saved (recipeObj, imageFile, removeImage)
     * @param {Function} options.onDelete - Callback when delete is clicked (recipeId) - only in edit mode
     */
    window.renderRecipeEditorModal = function(options) {
        if (!options) return;

        const { 
            mode = 'create', 
            initialRecipe = null, 
            ingredientSuggestions = [], 
            onClose, 
            onSave,
            onDelete 
        } = options;

        const isEditMode = mode === 'edit' && initialRecipe;

        // Remove existing modal if present
        const modalId = 'recipe-editor-modal';
        const overlayId = 'recipe-editor-overlay';
        const existing = document.getElementById(modalId);
        if (existing) {
            existing.remove();
        }
        const existingOverlay = document.getElementById(overlayId);
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'add-recipe-overlay';
        overlay.id = overlayId;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && onClose) {
                onClose();
            }
        });

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'add-recipe-modal';
        modal.id = modalId;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'recipe-editor-modal-title');

        // Build datalist for ingredient autocomplete
        const datalistId = 'ingredient-suggestions';
        let datalistHtml = '';
        if (ingredientSuggestions.length > 0) {
            datalistHtml = `<datalist id="${datalistId}">${ingredientSuggestions.map(ing => `<option value="${UI.escape(ing)}">`).join('')}</datalist>`;
        }

        // Pre-fill values for edit mode
        const initialTitle = isEditMode ? (initialRecipe.title || '') : '';
        const initialDescription = isEditMode ? (initialRecipe.description || initialRecipe.fullDescription || '') : '';
        const initialCuisine = isEditMode ? (initialRecipe.cuisine || '') : '';
        const initialIngredients = isEditMode ? (initialRecipe.ingredients || []) : [];
        const initialSteps = isEditMode ? (initialRecipe.steps || []) : [];
        const initialImageDataUrl = isEditMode ? (initialRecipe.imageDataUrl || '') : '';

        modal.innerHTML = `
            <div class="add-recipe-modal-header">
                <h3 id="recipe-editor-modal-title">${isEditMode ? 'Edit Recipe' : 'Add Recipe'}</h3>
                <button class="add-recipe-close-btn" id="recipe-editor-close-btn" aria-label="Close">×</button>
            </div>
            <div class="add-recipe-modal-body">
                <form id="recipe-editor-form">
                    <div class="add-recipe-field">
                        <label for="recipe-title-input">Title <span class="required">*</span></label>
                        <input type="text" id="recipe-title-input" class="add-recipe-input" required placeholder="e.g., Chocolate Chip Cookies" value="${UI.escape(initialTitle)}">
                    </div>

                    <div class="add-recipe-field">
                        <label for="recipe-description-input">Description</label>
                        <textarea id="recipe-description-input" class="add-recipe-textarea" rows="3" placeholder="Optional description...">${UI.escape(initialDescription)}</textarea>
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
                            <button type="button" id="recipe-image-select-btn" class="add-recipe-image-btn">${initialImageDataUrl ? 'Replace Picture' : 'Choose Picture'}</button>
                            <div id="recipe-image-preview-wrapper" class="add-recipe-image-preview-wrapper ${initialImageDataUrl ? '' : 'hidden'}">
                                <img id="recipe-image-preview" class="add-recipe-image-preview" alt="Recipe preview" src="${initialImageDataUrl ? UI.escape(initialImageDataUrl) : ''}">
                                <button type="button" id="recipe-image-remove-btn" class="add-recipe-image-remove-btn" aria-label="Remove picture">×</button>
                            </div>
                        </div>
                    </div>

                    <div class="add-recipe-modal-actions">
                        ${isEditMode && onDelete ? `
                            <button type="button" id="recipe-editor-delete-btn" class="add-recipe-btn add-recipe-btn-danger">Delete Recipe</button>
                        ` : ''}
                        <button type="button" id="recipe-editor-cancel-btn" class="add-recipe-btn add-recipe-btn-secondary">Cancel</button>
                        <button type="submit" id="recipe-editor-submit-btn" class="add-recipe-btn add-recipe-btn-primary">${isEditMode ? 'Save Changes' : 'Save Recipe'}</button>
                    </div>
                </form>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // State for ingredients and steps (pre-filled in edit mode)
        const ingredients = [...initialIngredients];
        const steps = [...initialSteps];
        
        // State for image handling
        let selectedImageFile = null;
        let removeImageFlag = false;

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

        // Initial render of lists for edit mode
        if (isEditMode) {
            renderList('ingredients-list', ingredients, (index) => {
                ingredients.splice(index, 1);
                renderList('ingredients-list', ingredients, () => {});
            });
            renderList('steps-list', steps, (index) => {
                steps.splice(index, 1);
                renderList('steps-list', steps, () => {});
            });
        }

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

        if (addIngredientBtn) {
            addIngredientBtn.addEventListener('click', addIngredient);
        }
        if (ingredientInput) {
            ingredientInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addIngredient();
                }
            });
        }

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

        if (addStepBtn) {
            addStepBtn.addEventListener('click', addStep);
        }
        if (stepInput) {
            stepInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addStep();
                }
            });
        }

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
                removeImageFlag = false; // New file selected, don't remove

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
            removeImageFlag = true; // Mark for removal
            imageInput.value = '';
            imagePreviewWrapper.classList.add('hidden');
            imagePreview.src = '';
        });

        // Form submission
        const form = document.getElementById('recipe-editor-form');
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
                if (ingredientInput) ingredientInput.focus();
                return;
            }

            if (steps.length === 0) {
                alert('Please add at least one step.');
                if (stepInput) stepInput.focus();
                return;
            }

            // Get file from input (ensure we have the actual File object)
            const fileFromInput = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
            const imageFileToUse = fileFromInput || selectedImageFile || null;

            // Build recipe object (for edit mode, preserve id and isUserCreated)
            const recipeObj = {
                title: title,
                description: description || '',
                fullDescription: description || '',
                ingredients: ingredients,
                steps: steps,
                cuisine: cuisine || '',
                time: isEditMode ? (initialRecipe.time || 'N/A') : 'N/A',
                servings: isEditMode ? (initialRecipe.servings || 'N/A') : 'N/A',
                difficulty: isEditMode ? (initialRecipe.difficulty || 'N/A') : 'N/A',
                imageType: 'photo',
                photo: '',
                illustration: ''
            };

            // Preserve id and isUserCreated in edit mode
            if (isEditMode) {
                recipeObj.id = initialRecipe.id;
                recipeObj.isUserCreated = initialRecipe.isUserCreated !== undefined ? initialRecipe.isUserCreated : true;
            }

            if (onSave) {
                onSave(recipeObj, imageFileToUse, removeImageFlag);
            }
        });

        // Delete handler (only in edit mode)
        if (isEditMode && onDelete) {
            const deleteBtn = document.getElementById('recipe-editor-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
                        onDelete(initialRecipe.id);
                    }
                });
            }
        }

        // Close handlers
        const closeBtn = document.getElementById('recipe-editor-close-btn');
        const cancelBtn = document.getElementById('recipe-editor-cancel-btn');
        
        const closeModal = () => {
            if (onClose) {
                onClose();
            }
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // Focus first input
        setTimeout(() => {
            const titleInput = document.getElementById('recipe-title-input');
            if (titleInput) titleInput.focus();
        }, 100);
    };

    /**
     * Legacy wrapper for backward compatibility
     * @param {Object} options - Configuration object
     */
    window.renderAddRecipeModal = function(options) {
        if (!options) return;
        const { onClose, onSubmit, ingredientSuggestions = [] } = options;
        window.renderRecipeEditorModal({
            mode: 'create',
            initialRecipe: null,
            ingredientSuggestions: ingredientSuggestions,
            onClose: onClose,
            onSave: (recipeObj, imageFile, removeImage) => {
                recipeObj.imageFile = imageFile;
                if (onSubmit) onSubmit(recipeObj);
            },
            onDelete: null
        });
    };

    /**
     * Close recipe editor modal
     */
    window.closeRecipeEditorModal = function() {
        const overlay = document.getElementById('recipe-editor-overlay');
        if (overlay) {
            overlay.remove();
        }
    };

    /**
     * Legacy wrapper for backward compatibility
     */
    window.closeAddRecipeModal = function() {
        window.closeRecipeEditorModal();
    };
})();
