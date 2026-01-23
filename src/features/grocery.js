/************************************
 * GROCERY/SHOPPING LIST MODULE
 * Handles shopping list functionality
 ************************************/

window.Melory = window.Melory || {};

// Dependencies: $ from app.js (will be available globally)
// getProfileShoppingList, setProfileShoppingList, addShoppingItem, removeShoppingItem, saveState from state.js
// renderApp from app.js (will be available globally)

const ShoppingList = {
    init() {
        $('#add-grocery-btn').addEventListener('click', () => this.addItem());
        $('#grocery-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        $('#clear-list-btn').addEventListener('click', () => this.clearAll());
        $('#reset-demo-btn').addEventListener('click', () => this.resetDemoData());

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

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked;
            checkbox.addEventListener('change', () => this.toggleItem(item.id));

            const textSpan = document.createElement('span');
            textSpan.className = 'grocery-text';
            textSpan.textContent = item.text;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => this.removeItem(item.id));

            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(removeBtn);

            listContainer.appendChild(li);
        });
    }
};

// Expose via global namespace
window.Melory.ShoppingList = ShoppingList;
