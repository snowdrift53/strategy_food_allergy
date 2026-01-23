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
})();
