/**
 * Add Recipe FAB - Floating action button for adding recipes
 */
(function() {
    'use strict';

    /**
     * Render add recipe floating action button
     * @param {Object} options - Configuration object
     * @param {Function} options.onClick - Callback when FAB is clicked
     */
    window.renderAddRecipeFab = function(options) {
        if (!options || !options.onClick) return;

        // Remove existing FAB if present
        const existing = document.getElementById('add-recipe-fab');
        if (existing) {
            existing.remove();
        }

        // Create FAB
        const fab = document.createElement('button');
        fab.className = 'add-recipe-fab';
        fab.id = 'add-recipe-fab';
        fab.setAttribute('aria-label', 'Add recipe');
        fab.innerHTML = '<span class="add-recipe-fab-icon">🥘</span>';
        
        // Attach click handler
        fab.addEventListener('click', (e) => {
            e.stopPropagation();
            options.onClick();
        });

        document.body.appendChild(fab);
    };
})();
