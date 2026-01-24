/**
 * DOM Utilities - Safe helpers for DOM manipulation
 */
(function() {
    'use strict';

    window.UI = window.UI || {};

    /**
     * Query selector (safe)
     * @param {string} sel - CSS selector
     * @param {Element} root - Root element (default: document)
     * @returns {Element|null} Found element or null
     */
    UI.qs = function(sel, root) {
        root = root || document;
        return root.querySelector(sel);
    };

    /**
     * Query selector all (safe, returns array)
     * @param {string} sel - CSS selector
     * @param {Element} root - Root element (default: document)
     * @returns {Array<Element>} Array of found elements
     */
    UI.qsa = function(sel, root) {
        root = root || document;
        return Array.from(root.querySelectorAll(sel));
    };

    /**
     * Set innerHTML safely
     * @param {Element} el - Element to set HTML on
     * @param {string} html - HTML string
     * @returns {Element} The element
     */
    UI.setHTML = function(el, html) {
        if (el) {
            el.innerHTML = html;
        }
        return el;
    };

    /**
     * Show element (remove display:none)
     * @param {Element} el - Element to show
     */
    UI.show = function(el) {
        if (el) {
            el.style.display = '';
        }
    };

    /**
     * Hide element (set display:none)
     * @param {Element} el - Element to hide
     */
    UI.hide = function(el) {
        if (el) {
            el.style.display = 'none';
        }
    };

    /**
     * Escape HTML entities
     * @param {string} s - String to escape
     * @returns {string} Escaped string
     */
    UI.escape = function(s) {
        const str = String(s ?? '');
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return str.replace(/[&<>"']/g, function(m) {
            return map[m];
        });
    };

    /**
     * Get recipe image source URL
     * Prioritizes user-uploaded images, then falls back to various recipe image fields
     * @param {Object} recipe - Recipe object
     * @returns {string|null} Image URL or null if no image found
     */
    window.getRecipeImageSrc = function(recipe) {
        if (!recipe) return null;
        
        // Priority 1: User-uploaded image (data URL)
        if (recipe.imageDataUrl && recipe.imageDataUrl.trim() !== '') {
            return recipe.imageDataUrl;
        }
        
        // Priority 2: Generic imageUrl field
        if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
            return recipe.imageUrl;
        }
        
        // Priority 3: Online recipe API fields
        if (recipe.strMealThumb && recipe.strMealThumb.trim() !== '') {
            return recipe.strMealThumb;
        }
        if (recipe.image && recipe.image.trim() !== '') {
            return recipe.image;
        }
        
        // Priority 4: Type-based selection (illustration vs photo)
        if (recipe.imageType === 'illustration' && recipe.illustration && recipe.illustration.trim() !== '') {
            return recipe.illustration;
        }
        if (recipe.photo && recipe.photo.trim() !== '') {
            return recipe.photo;
        }
        
        return null;
    };

    /**
     * Get recipe image alt text
     * @param {Object} recipe - Recipe object
     * @returns {string} Alt text for the image
     */
    window.getRecipeImageAlt = function(recipe) {
        if (!recipe) return 'Recipe image';
        return recipe.title || recipe.name || recipe.strMeal || 'Recipe image';
    };
})();
