/************************************
 * GROCERY/SHOPPING LIST MODULE
 * Handles shopping list functionality
 ************************************/

window.Melory = window.Melory || {};

// Dependencies: $ from app.js (will be available globally)
// getProfileShoppingList, setProfileShoppingList, addShoppingItem, removeShoppingItem, saveState from state.js
// renderApp from app.js (will be available globally)

const ShoppingList = {
    _listenersAttached: false,

    init() {
        // Attach static listeners only once
        if (!this._listenersAttached) {
            $('#add-grocery-btn').addEventListener('click', () => this.addItem());
            $('#grocery-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addItem();
            });
            $('#clear-list-btn').addEventListener('click', () => this.clearAll());
            $('#reset-demo-btn').addEventListener('click', () => this.resetDemoData());

            // Use event delegation for dynamic items (checkboxes and remove buttons)
            const listContainer = $('#grocery-list');
            if (listContainer) {
                listContainer.addEventListener('change', (e) => {
                    if (e.target.type === 'checkbox' && e.target.closest('.grocery-item')) {
                        const itemId = parseInt(e.target.closest('.grocery-item').getAttribute('data-item-id'));
                        if (itemId) {
                            this.toggleItem(itemId);
                        }
                    }
                });
                listContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('remove-btn')) {
                        const itemId = parseInt(e.target.closest('.grocery-item').getAttribute('data-item-id'));
                        if (itemId) {
                            this.removeItem(itemId);
                        }
                    }
                });
            }
            this._listenersAttached = true;
        }

        this.render();
    },

    save() {
        if (typeof window.Melory.saveState === 'function') {
            window.Melory.saveState();
        }
    },

    addItem() {
        const input = $('#grocery-input');
        const item = input.value.trim();
        if (!item) return;

        if (typeof window.Melory.addShoppingItem === 'function') {
            window.Melory.addShoppingItem(item);
        }
        input.value = '';
        this.save();
        if (typeof renderApp === 'function') {
            renderApp();
        }
    },

    removeItem(id) {
        if (typeof window.Melory.removeShoppingItem === 'function') {
            window.Melory.removeShoppingItem(id);
        }
        this.save();
        if (typeof renderApp === 'function') {
            renderApp();
        }
    },

    toggleItem(id) {
        const getProfileShoppingList = window.Melory.getProfileShoppingList;
        if (!getProfileShoppingList) return;
        
        const shoppingList = getProfileShoppingList();
        const item = shoppingList.find(i => i.id === id);
        if (!item) return;

        item.checked = !item.checked;
        this.save();
        if (typeof renderApp === 'function') {
            renderApp();
        }
    },

    clearAll() {
        if (!confirm('Are you sure you want to clear all items?')) return;

        const setProfileShoppingList = window.Melory.setProfileShoppingList;
        if (setProfileShoppingList) {
            setProfileShoppingList([]);
        }
        this.save();
        if (typeof renderApp === 'function') {
            renderApp();
        }
    },

    resetDemoData() {
        if (!confirm('Reset all demo data? This will clear your shopping list and refresh the forecast.')) return;

        const setProfileShoppingList = window.Melory.setProfileShoppingList;
        if (setProfileShoppingList) {
            setProfileShoppingList([]);
        }

        // Refresh UI
        if (typeof renderApp === 'function') {
            renderApp();
        }
    },

    render() {
        const listContainer = $('#grocery-list');
        listContainer.innerHTML = '';

        const getProfileShoppingList = window.Melory.getProfileShoppingList;
        if (!getProfileShoppingList) return;
        
        const shoppingList = getProfileShoppingList();
        if (shoppingList.length === 0) {
            listContainer.innerHTML = '<li class="empty-message">Your shopping list is empty. Add items to get started!</li>';
            return;
        }

        shoppingList.forEach(item => {
            const li = document.createElement('li');
            li.className = `grocery-item ${item.checked ? 'checked' : ''}`;
            li.setAttribute('data-item-id', item.id); // Add data attribute for event delegation

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked;
            // No addEventListener - handled by event delegation in init()

            const textSpan = document.createElement('span');
            textSpan.className = 'grocery-text';
            textSpan.textContent = item.text;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            // No addEventListener - handled by event delegation in init()

            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(removeBtn);

            listContainer.appendChild(li);
        });
    }
};

// Expose via global namespace
window.Melory.ShoppingList = ShoppingList;
