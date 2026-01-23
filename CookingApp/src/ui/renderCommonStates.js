/**
 * Common State Rendering - Loading, Error, Empty states
 */
(function() {
    'use strict';

    /**
     * Render loading state
     * @param {Element} containerEl - Container element
     * @param {string} message - Loading message (default: "Searching...")
     */
    window.renderLoading = function(containerEl, message) {
        if (!containerEl) return;
        message = message || 'Searching...';
        containerEl.innerHTML = '<div class="recipe-loading">' + UI.escape(message) + '</div>';
    };

    /**
     * Render error state
     * @param {Element} containerEl - Container element
     * @param {string} message - Error message (default: "Online search unavailable.")
     */
    window.renderError = function(containerEl, message) {
        if (!containerEl) return;
        message = message || 'Online search unavailable.';
        containerEl.innerHTML = '<div class="recipe-error">' + UI.escape(message) + '</div>';
    };

    /**
     * Render empty state
     * @param {Element} containerEl - Container element
     * @param {string} message - Empty message (default: "No recipes found.")
     */
    window.renderEmpty = function(containerEl, message) {
        if (!containerEl) return;
        message = message || 'No recipes found.';
        containerEl.innerHTML = '<div class="recipe-empty">' + UI.escape(message) + '</div>';
    };
})();
