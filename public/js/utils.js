/**
 * Update UI based on authentication status
 */
function updateAuthenticationUI() {
    // Check if auth module is available
    if (!window.Auth) return;
    
    const isAuthenticated = window.Auth.isAuthenticated();
    const loginButtons = document.querySelectorAll('.login-button');
    const logoutButtons = document.querySelectorAll('.logout-button');
    const userMenus = document.querySelectorAll('.user-menu');
    
    if (isAuthenticated) {
        // User is logged in
        const user = window.Auth.getUserInfo();
        
        // Hide login buttons, show logout and user menu
        loginButtons.forEach(btn => btn.classList.add('hidden'));
        logoutButtons.forEach(btn => btn.classList.remove('hidden'));
        
        userMenus.forEach(menu => {
            menu.classList.remove('hidden');
            const nameElem = menu.querySelector('.user-name');
            if (nameElem && user) {
                nameElem.textContent = user.name || user.email;
            }
        });
    } else {
        // User is logged out
        loginButtons.forEach(btn => btn.classList.remove('hidden'));
        logoutButtons.forEach(btn => btn.classList.add('hidden'));
        userMenus.forEach(menu => menu.classList.add('hidden'));
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const errorContainer = document.getElementById('error-message') || createErrorContainer();
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 5000);
}

/**
 * Create error container if it doesn't exist
 */
function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'error-message';
    container.className = 'fixed top-4 right-4 bg-red-900 text-red-100 px-4 py-3 rounded shadow-lg z-50 hidden';
    document.body.appendChild(container);
    return container;
}

/**
 * HTML escaping helper function
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Expose necessary functions globally
window.showError = showError;
window.updateAuthenticationUI = updateAuthenticationUI;
