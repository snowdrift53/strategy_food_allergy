/************************************
 * PROFILES MODULE
 * Handles user profiles and profile logs
 ************************************/

window.Melory = window.Melory || {};

// Dependencies: state, saveState, Id, Text, normalizeUserAllergies, fileToCompressedDataUrl, renderApp, Recipes, $, $$ from app.js (will be available globally)

function ensureDefaultProfile() {
    // Migration: ensure all profiles have avatarDataUrl field
    state.userProfiles.forEach(profile => {
        if (profile.avatarDataUrl === undefined) {
            profile.avatarDataUrl = null;
        }
    });
    
    if (state.userProfiles.length === 0) {
        const defaultProfile = {
            id: Id.uid(),
            name: 'Default',
            allergies: [],
            avatarDataUrl: null
        };
        state.userProfiles.push(defaultProfile);
        state.userActiveProfileId = defaultProfile.id;
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = defaultProfile.id;
        // Create corresponding profile-owned state with fresh empty arrays
        if (!state.profiles[defaultProfile.id]) {
            state.profiles[defaultProfile.id] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        saveState();
    } else if (!state.userActiveProfileId || !state.userProfiles.find(p => p.id === state.userActiveProfileId)) {
        state.userActiveProfileId = state.userProfiles[0].id;
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = state.userProfiles[0].id;
        // Ensure profile-owned state exists
        if (!state.profiles[state.userProfiles[0].id]) {
            state.profiles[state.userProfiles[0].id] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        saveState();
    } else {
        // Ensure current active profile has profile-owned state
        if (!state.profiles[state.userActiveProfileId]) {
            state.profiles[state.userActiveProfileId] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        // Sync state.activeProfileId with state.userActiveProfileId
        state.activeProfileId = state.userActiveProfileId;
    }
}

const Profiles = {
    init() {
        ensureDefaultProfile();
        this.createWidget();
        this.attachEvents();
        this.render();
    },

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'profile-widget';
        widget.innerHTML = `
            <div class="profile-card">
                <div class="profile-card-header">
                    <div class="profile-avatar" id="profile-avatar" role="button" tabindex="0" aria-label="Profile avatar"></div>
                    <div class="profile-info">
                        <h3 class="profile-name" id="profile-name">Default</h3>
                        <p class="profile-subtitle">Profile</p>
                    </div>
                </div>
                <button class="profile-settings-btn" id="profile-settings-btn" aria-expanded="false" aria-controls="profile-settings-body">
                    <span>Settings</span>
                    <span class="profile-settings-chevron">▼</span>
                </button>
                <div class="profile-settings-body collapsed" id="profile-settings-body" role="region" aria-labelledby="profile-settings-btn">
                    <div class="profile-section">
                        <label for="profile-select">Active profile</label>
                        <select id="profile-select" class="profile-select"></select>
                    </div>
                    <div class="profile-section">
                        <label>Profile picture</label>
                        <div class="profile-avatar-actions">
                            <button id="profile-avatar-change-btn" class="profile-btn profile-btn-secondary">Change picture</button>
                            <button id="profile-avatar-remove-btn" class="profile-btn profile-btn-secondary" style="display: none;">Remove picture</button>
                        </div>
                        <input type="file" id="profile-avatar-input" accept="image/*" style="display: none;">
                    </div>
                    <div class="profile-section">
                        <label for="profile-name-input">New profile</label>
                        <div class="profile-add-section">
                            <input type="text" id="profile-name-input" class="profile-input" placeholder="Enter name...">
                            <button id="profile-add-btn" class="profile-btn">Add</button>
                        </div>
                    </div>
                    <div class="profile-section">
                        <label for="profile-allergies-input">Allergies</label>
                        <div class="profile-allergies-input-wrapper">
                            <input type="text" id="profile-allergies-input" class="profile-input" placeholder="e.g., milk, eggs, nuts">
                            <button id="profile-allergies-clear-btn" class="profile-allergies-clear-btn" title="Clear allergies" style="display: none;">Clear</button>
                        </div>
                    </div>
                    <div class="profile-section">
                        <button id="profile-delete-btn" class="profile-delete-btn">Delete Active Profile</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    },

    attachEvents() {
        $('#profile-settings-btn').addEventListener('click', () => this.toggleWidget());
        $('#profile-settings-btn').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleWidget();
            }
        });
        $('#profile-select').addEventListener('change', (e) => this.switchProfile(e.target.value));
        $('#profile-add-btn').addEventListener('click', () => this.addProfile());
        $('#profile-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProfile();
        });
        $('#profile-delete-btn').addEventListener('click', () => this.deleteProfile());
        
        // Avatar upload handlers
        const avatarInput = $('#profile-avatar-input');
        const avatarChangeBtn = $('#profile-avatar-change-btn');
        const avatarRemoveBtn = $('#profile-avatar-remove-btn');
        
        if (avatarChangeBtn && avatarInput) {
            avatarChangeBtn.addEventListener('click', () => {
                avatarInput.click();
            });
        }
        
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                // Ensure we get the actual File object from input
                const file = avatarInput.files && avatarInput.files[0] ? avatarInput.files[0] : null;
                
                // Debug logging
                const AVATAR_DEBUG = new URLSearchParams(location.search).has("avatarDebug");
                if (AVATAR_DEBUG) {
                    console.log("[AVATAR] file:", file?.name, file?.size, file?.type);
                }
                
                if (file) {
                    await this.handleAvatarUpload(file);
                }
            });
        }
        
        if (avatarRemoveBtn) {
            avatarRemoveBtn.addEventListener('click', () => {
                this.removeAvatar();
            });
        }
        
        const allergiesInput = $('#profile-allergies-input');
        const clearBtn = $('#profile-allergies-clear-btn');
        
        if (allergiesInput) {
            // Update clear button visibility on input change
            const updateClearButton = () => {
                if (clearBtn) {
                    clearBtn.style.display = allergiesInput.value.trim().length > 0 ? 'block' : 'none';
                }
            };

            allergiesInput.addEventListener('input', updateClearButton);
            allergiesInput.addEventListener('blur', () => {
                this.saveAllergies();
                updateClearButton();
            });

            // Clear button click handler
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
                    if (activeProfile) {
                        activeProfile.allergies = [];
                        allergiesInput.value = '';
                        saveState();
                        updateClearButton();
                        renderApp();
                    }
                });
            }

            // Initial state
            updateClearButton();
        }
    },

    toggleWidget() {
        const body = $('#profile-settings-body');
        const btn = $('#profile-settings-btn');
        const isCollapsed = body.classList.contains('collapsed');
        if (isCollapsed) {
            body.classList.remove('collapsed');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            body.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
        }
    },

    switchProfile(profileId) {
        state.userActiveProfileId = profileId;
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = profileId;
        // Ensure profile-owned state exists for this profile
        if (!state.profiles[profileId]) {
            state.profiles[profileId] = {
                localRecipes: [],
                shoppingList: [],
                allergyFilters: [],
                symptomLog: []
            };
        }
        saveState();
        
        // Refresh recipe view after profile change to update liked recipes and cancel stale requests
        if (typeof Recipes !== 'undefined' && Recipes.refreshViewAfterProfileChange) {
            Recipes.refreshViewAfterProfileChange();
        }
        
        renderApp();
    },

    addProfile() {
        const input = $('#profile-name-input');
        const name = input.value.trim();
        if (!name) return;

        const newProfile = {
            id: Id.uid(),
            name: name,
            allergies: [],
            avatarDataUrl: null
        };
        state.userProfiles.push(newProfile);
        state.userActiveProfileId = newProfile.id;
        
        // Sync profile-owned state activeProfileId with user profile ID
        state.activeProfileId = newProfile.id;
        // Create corresponding profile-owned state with fresh empty arrays (not shared by reference)
        state.profiles[newProfile.id] = {
            localRecipes: [],
            shoppingList: [],
            allergyFilters: [],
            symptomLog: []
        };
        
        saveState();
        input.value = '';
        renderApp();
    },

    saveAllergies() {
        const input = $('#profile-allergies-input');
        const allergiesText = input.value.trim();
        const rawAllergies = Text.splitList(allergiesText);
        const allergies = normalizeUserAllergies(rawAllergies);

        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
        if (activeProfile) {
            activeProfile.allergies = allergies;
            saveState();
            renderApp();
        }
    },

    deleteProfile() {
        if (state.userProfiles.length <= 1) {
            alert('Cannot delete the last remaining profile.');
            return;
        }

        if (!confirm('Are you sure you want to delete this profile?')) return;

        const deletedProfileId = state.userActiveProfileId;
        state.userProfiles = state.userProfiles.filter(p => p.id !== state.userActiveProfileId);
        
        // Delete corresponding profile-owned state
        if (state.profiles[deletedProfileId]) {
            delete state.profiles[deletedProfileId];
        }
        
        if (state.userProfiles.length > 0) {
            state.userActiveProfileId = state.userProfiles[0].id;
            // Sync profile-owned state activeProfileId with user profile ID
            state.activeProfileId = state.userProfiles[0].id;
            // Ensure profile-owned state exists
            if (!state.profiles[state.userProfiles[0].id]) {
                state.profiles[state.userProfiles[0].id] = {
                    localRecipes: [],
                    shoppingList: [],
                    allergyFilters: [],
                    symptomLog: []
                };
            }
        } else {
            state.userActiveProfileId = null;
            state.activeProfileId = 'default';
        }

        saveState();
        renderApp();
    },

    render() {
        const select = $('#profile-select');
        const allergiesInput = $('#profile-allergies-input');
        const profileNameEl = $('#profile-name');
        const profileAvatar = $('#profile-avatar');

        select.innerHTML = '';
        state.userProfiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            if (profile.id === state.userActiveProfileId) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        const activeProfile = state.userProfiles.find(p => p.id === state.userActiveProfileId);
        const clearBtn = $('#profile-allergies-clear-btn');
        
        if (activeProfile) {
            allergiesInput.value = activeProfile.allergies.join(', ');
            if (profileNameEl) {
                profileNameEl.textContent = activeProfile.name;
            }
            if (profileAvatar) {
                // Show avatar image if available, else show initial
                if (activeProfile.avatarDataUrl && activeProfile.avatarDataUrl.trim() !== '') {
                    const escapeHtml = (typeof window.UI !== 'undefined' && window.UI.escape) ? window.UI.escape : (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
                    profileAvatar.innerHTML = `<img src="${escapeHtml(activeProfile.avatarDataUrl)}" alt="${escapeHtml(activeProfile.name)}" class="profile-avatar-img">`;
                    profileAvatar.classList.add('has-avatar');
                } else {
                    const initial = activeProfile.name.charAt(0).toUpperCase();
                    profileAvatar.textContent = initial;
                    profileAvatar.classList.remove('has-avatar');
                }
            }
            
            // Update avatar remove button visibility
            const avatarRemoveBtn = $('#profile-avatar-remove-btn');
            if (avatarRemoveBtn) {
                avatarRemoveBtn.style.display = (activeProfile.avatarDataUrl && activeProfile.avatarDataUrl.trim() !== '') ? 'inline-block' : 'none';
            }
        } else {
            allergiesInput.value = '';
            if (profileNameEl) {
                profileNameEl.textContent = 'Default';
            }
            if (profileAvatar) {
                profileAvatar.textContent = 'D';
                profileAvatar.classList.remove('has-avatar');
            }
            
            const avatarRemoveBtn = $('#profile-avatar-remove-btn');
            if (avatarRemoveBtn) {
                avatarRemoveBtn.style.display = 'none';
            }
        }

        // Update clear button visibility
        if (clearBtn) {
            clearBtn.style.display = allergiesInput.value.trim().length > 0 ? 'block' : 'none';
        }

        const deleteBtn = $('#profile-delete-btn');
        if (state.userProfiles.length <= 1) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
        } else {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.style.cursor = 'pointer';
        }
    },

    /**
     * Handle avatar upload for active profile
     * @param {File} file - Image file
     */
    async handleAvatarUpload(file) {
        // Debug flag
        const AVATAR_DEBUG = new URLSearchParams(location.search).has("avatarDebug");
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Get active profile ID before any async operations
        const activeProfileId = state.userActiveProfileId;
        if (!activeProfileId) {
            alert('No active profile found.');
            return;
        }

        if (AVATAR_DEBUG) {
            console.log("[AVATAR] Starting upload for profile id:", activeProfileId);
        }

        try {
            // Compress with strict settings for avatars - MUST await completion
            const avatarDataUrl = await fileToCompressedDataUrl(file, {
                maxDimension: 256,
                quality: 0.7,
                maxSize: 200000 // ~150KB in base64 chars (approximately 200KB raw)
            });

            if (AVATAR_DEBUG) {
                console.log("[AVATAR] dataUrl length:", avatarDataUrl?.length);
            }

            // Find and update the correct profile in the profiles array
            // Get reference to the actual profiles array
            const profiles = state.userProfiles;
            const profileIndex = profiles.findIndex(p => p.id === activeProfileId);
            
            if (profileIndex < 0) {
                alert('Profile not found.');
                return;
            }

            // Update the profile object directly in the array
            profiles[profileIndex].avatarDataUrl = avatarDataUrl;
            
            // Explicitly update state.userProfiles to ensure consistency
            state.userProfiles = profiles;

            if (AVATAR_DEBUG) {
                console.log("[AVATAR] updated profile id:", activeProfileId);
                console.log("[AVATAR] profile has avatarDataUrl:", !!profiles[profileIndex].avatarDataUrl);
                console.log("[AVATAR] profile index:", profileIndex);
            }

            // Persist to LocalStorage using the same mechanism as other profile edits
            try {
                saveState();
                
                // Verify storage immediately after save
                if (AVATAR_DEBUG) {
                    // Re-read from storage to verify
                    const storedProfiles = state.userProfiles;
                    const storedProfile = storedProfiles ? storedProfiles.find(p => p.id === activeProfileId) : null;
                    console.log("[AVATAR] stored?", !!storedProfile?.avatarDataUrl);
                    if (storedProfile?.avatarDataUrl) {
                        console.log("[AVATAR] stored dataUrl length:", storedProfile.avatarDataUrl.length);
                    }
                }
            } catch (error) {
                // Check if it's a quota error
                if (error.name === 'QuotaExceededError' || error.code === 22) {
                    alert('Storage quota exceeded. Please remove some recipes or images to free up space.');
                } else {
                    alert('Failed to save avatar: ' + (error.message || 'Please try again.'));
                }
                console.error('Avatar save error:', error);
                return;
            }

            // Re-render profile widget immediately (no refresh needed)
            this.render();

            // Reset file input
            const avatarInput = $('#profile-avatar-input');
            if (avatarInput) {
                avatarInput.value = '';
            }
        } catch (error) {
            alert('Failed to process avatar: ' + (error.message || 'Please try a different image.'));
            console.error('Avatar upload error:', error);
        }
    },

    /**
     * Remove avatar from active profile
     */
    removeAvatar() {
        const activeProfileId = state.userActiveProfileId;
        if (!activeProfileId) {
            alert('No active profile found.');
            return;
        }

        if (!confirm('Remove profile picture?')) {
            return;
        }

        // Find and update the correct profile in the profiles array
        const profiles = state.userProfiles;
        const profileIndex = profiles.findIndex(p => p.id === activeProfileId);
        
        if (profileIndex < 0) {
            alert('Profile not found.');
            return;
        }

        // Set avatarDataUrl to null
        profiles[profileIndex].avatarDataUrl = null;
        
        // Explicitly update state.userProfiles to ensure consistency
        state.userProfiles = profiles;

        // Persist to LocalStorage
        try {
            saveState();
        } catch (error) {
            alert('Failed to remove avatar: ' + (error.message || 'Please try again.'));
            console.error('Avatar remove error:', error);
            return;
        }

        // Re-render profile widget immediately
        this.render();
    }
};

const Log = {
    isOpen: false,
    _listenersAttached: false,

    init() {
        this.createWidget();
        this.attachEvents();
        this.render();
    },

    createWidget() {
        // Create floating action button
        const fab = document.createElement('button');
        fab.className = 'log-fab';
        fab.id = 'log-fab';
        fab.setAttribute('aria-label', 'Open log');
        fab.innerHTML = `
            <span class="log-fab-icon">📜</span>
            <span class="log-fab-indicator hidden" id="log-fab-indicator" aria-hidden="true"></span>
        `;
        document.body.appendChild(fab);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'log-overlay hidden';
        overlay.id = 'log-overlay';
        document.body.appendChild(overlay);

        // Create drawer panel
        const panel = document.createElement('div');
        panel.className = 'log-panel hidden';
        panel.id = 'log-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'log-panel-title');
        panel.innerHTML = `
            <div class="log-panel-header">
                <h3 id="log-panel-title">Log</h3>
                <button class="log-close-btn" id="log-close-btn" aria-label="Close log">×</button>
            </div>
            <div class="log-panel-body">
                <div class="log-entry-section">
                    <textarea id="log-textarea" class="log-textarea" placeholder="Write a note..."></textarea>
                    <button id="log-save-btn" class="log-btn">Save</button>
                </div>
                <div class="log-entries" id="log-entries">
                    <!-- Log entries will be rendered here -->
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    },

    attachEvents() {
        // Attach static listeners only once
        if (this._listenersAttached) return;

        const fab = $('#log-fab');
        const overlay = $('#log-overlay');
        const panel = $('#log-panel');
        const closeBtn = $('#log-close-btn');

        // FAB click to open
        fab.addEventListener('click', () => this.openPanel());

        // Close button
        closeBtn.addEventListener('click', () => this.closePanel());

        // Overlay click to close
        overlay.addEventListener('click', () => this.closePanel());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });

        // Save entry
        $('#log-save-btn').addEventListener('click', () => this.saveEntry());
        $('#log-textarea').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.saveEntry();
            }
        });

        // Use event delegation for dynamic delete buttons
        const entriesContainer = $('#log-entries');
        if (entriesContainer) {
            entriesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('log-delete-btn')) {
                    const entryId = e.target.getAttribute('data-entry-id');
                    if (entryId) {
                        this.deleteEntry(entryId);
                    }
                }
            });
        }

        this._listenersAttached = true;
    },

    openPanel() {
        this.isOpen = true;
        $('#log-overlay').classList.remove('hidden');
        $('#log-panel').classList.remove('hidden');
        $('#log-fab').classList.add('hidden');
        // Focus textarea for better UX
        setTimeout(() => $('#log-textarea').focus(), 100);
    },

    closePanel() {
        this.isOpen = false;
        $('#log-overlay').classList.add('hidden');
        $('#log-panel').classList.add('hidden');
        $('#log-fab').classList.remove('hidden');
    },

    getProfileLogs(profileId) {
        if (!profileId) return [];
        if (!state.profileLogs[profileId]) {
            state.profileLogs[profileId] = [];
        }
        return state.profileLogs[profileId];
    },

    saveEntry() {
        const textarea = $('#log-textarea');
        const text = textarea.value.trim();
        if (!text) return;

        const profileId = state.userActiveProfileId;
        if (!profileId) return;

        const logs = this.getProfileLogs(profileId);
        const entry = {
            id: Id.uid(),
            ts: Date.now(),
            text: text
        };
        logs.push(entry);
        state.profileLogs[profileId] = logs;
        saveState();

        textarea.value = '';
        renderApp();
    },

    deleteEntry(entryId) {
        const profileId = state.userActiveProfileId;
        if (!profileId || !state.profileLogs[profileId]) return;

        state.profileLogs[profileId] = state.profileLogs[profileId].filter(entry => entry.id !== entryId);
        saveState();
        renderApp();
    },

    formatTimestamp(ts) {
        const date = new Date(ts);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    render() {
        const entriesContainer = $('#log-entries');
        const profileId = state.userActiveProfileId;
        const indicator = $('#log-fab-indicator');

        if (!profileId) {
            entriesContainer.innerHTML = '<div class="log-empty">No active profile</div>';
            if (indicator) indicator.classList.add('hidden');
            return;
        }

        const logs = this.getProfileLogs(profileId);

        // Update indicator visibility based on log entries
        if (indicator) {
            if (logs.length > 0) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }

        if (logs.length === 0) {
            entriesContainer.innerHTML = '<div class="log-empty">No entries yet</div>';
            return;
        }

        // Render newest-last (most recent at bottom)
        const sortedLogs = [...logs].sort((a, b) => a.ts - b.ts);
        
        entriesContainer.innerHTML = sortedLogs.map(entry => `
            <div class="log-entry">
                <div class="log-entry-content">
                    <div class="log-entry-text">${this.escapeHtml(entry.text)}</div>
                    <div class="log-entry-time">${this.formatTimestamp(entry.ts)}</div>
                </div>
                <button class="log-delete-btn" data-entry-id="${entry.id}">×</button>
            </div>
        `).join('');

        // No need to attach delete handlers - handled by event delegation in attachEvents()
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Expose via global namespace
window.Melory.Profiles = Profiles;
window.Melory.Log = Log;
window.Melory.ensureDefaultProfile = ensureDefaultProfile;
