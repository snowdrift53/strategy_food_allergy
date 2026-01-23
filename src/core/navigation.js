/************************************
 * NAVIGATION MODULE
 * Handles view switching and navigation
 ************************************/

window.Melory = window.Melory || {};

// Dependencies: $, $$ from app.js (will be available globally)
// Forecast from app.js (will be available globally)

const Navigation = {
    init() {
        const navButtons = $$('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchView(view);

                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },

    switchView(viewName) {
        $$('.view-section').forEach(view => view.classList.add('hidden'));

        const targetView = $(`#${viewName}-view`);
        if (targetView) targetView.classList.remove('hidden');

        if (viewName === 'forecast') {
            if (typeof Forecast !== 'undefined' && Forecast.render) {
                Forecast.render();
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Expose via global namespace
window.Melory.Navigation = Navigation;
