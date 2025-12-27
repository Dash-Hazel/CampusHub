// auth-system.js - Authentication and Role Management
console.log('🔐 Auth System Loading...');

// Global auth state
let currentUser = null;
let userRole = 'user';

// Initialize auth system
function initAuthSystem() {
    console.log('🔐 Initializing auth system...');
    
    // Create auth UI container in header
    createAuthUIContainer();
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
        console.log('🔐 Auth state changed:', user ? user.email : 'No user');
        
        if (user) {
            currentUser = user;
            await ensureUserInDatabase(user);
            userRole = await getUserRole(user.uid);
            updateUIForLoggedInUser(user, userRole);
            updateNavigationForRole(userRole);
        } else {
            currentUser = null;
            userRole = 'user';
            updateUIForLoggedOutUser();
            resetNavigation();
        }
    });
}

// Create auth UI container in header
function createAuthUIContainer() {
    // Check if container already exists
    if (document.getElementById('authContainer')) return;
    
    const authContainer = document.createElement('div');
    authContainer.id = 'authContainer';
    authContainer.className = 'auth-container';
    
    // Find header container and insert before nav
    const headerContainer = document.querySelector('header .container');
    const nav = document.querySelector('nav');
    
    if (headerContainer && nav) {
        headerContainer.insertBefore(authContainer, nav);
    }
    
    // Add CSS styles
    addAuthStyles();
}

// Add auth CSS styles
function addAuthStyles() {
    const styleId = 'auth-styles';
    if (document.getElementById(styleId)) return;
    
    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
        /* Auth Container */
        .auth-container {
            margin-left: auto;
            display: flex;
            gap: 10px;
            align-items: center;
            padding: 0 20px;
        }
        
        .auth-btn {
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
            font-size: 14px;
        }
        
        .login-btn {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .register-btn {
            background: #3498db;
            color: white;
            border: 1px solid #2980b9;
        }
        
        .auth-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* User Info */
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .user-greeting {
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }
        
        .user-menu-btn {
            background: none;
            border: 1px solid #ddd;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .user-dropdown {
            position: relative;
        }
        
        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: white;
            min-width: 200px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            border-radius: 8px;
            z-index: 1000;
            padding: 10px 0;
        }
        
        .user-dropdown:hover .dropdown-content {
            display: block;
        }
        
        .dropdown-item {
            display: block;
            padding: 10px 20px;
            text-decoration: none;
            color: #333;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
        }
        
        .dropdown-item:hover {
            background: #f8f9fa;
        }
        
        .dropdown-content hr {
            margin: 10px 0;
            border: none;
            border-top: 1px solid #eee;
        }
        
        /* Auth Modal */
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            position: relative;
        }
        
        .close-modal {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .modal-content h2 {
            margin-top: 0;
            margin-bottom: 20px;
            color: #333;
        }
        
        .modal-content form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .modal-content input {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
        }
        
        .modal-content .btn {
            background: #3498db;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .auth-switch {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
        
        .auth-switch a {
            color: #3498db;
            text-decoration: none;
        }
        
        /* Role badges */
        .role-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
        }
        
        .role-user { background: #e3f2fd; color: #1565c0; }
        .role-redactor { background: #fff3e0; color: #e65100; }
        .role-admin { background: #f3e5f5; color: #7b1fa2; }
    `;
    
    document.head.appendChild(styles);
}

// Ensure user exists in database
async function ensureUserInDatabase(user) {
    try {
        const userRef = db.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            // Create user profile
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                role: 'user',
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                articlesSubmitted: 0,
                articlesPublished: 0,
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
            console.log('✅ User profile created');
        } else {
            // Update last login
            await userRef.update({
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
        }
    } catch (error) {
        console.error('❌ Error ensuring user in database:', error);
    }
}

// Get user role
async function getUserRole(uid) {
    try {
        const snapshot = await db.ref(`users/${uid}/role`).once('value');
        return snapshot.val() || 'user';
    } catch (error) {
        console.error('❌ Error getting user role:', error);
        return 'user';
    }
}

// Register new user
async function registerUser(email, password, displayName) {
    try {
        // Create auth user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name if provided
        if (displayName) {
            await user.updateProfile({ displayName: displayName });
        }
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user, role) {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;
    
    const roleBadge = getRoleBadge(role);
    
    authContainer.innerHTML = `
        <div class="user-info">
            <span class="user-greeting">Здравей, ${user.displayName || user.email.split('@')[0]}</span>
            <span class="role-badge role-${role}">${role}</span>
            <div class="user-dropdown">
                <button class="user-menu-btn">👤</button>
                <div class="dropdown-content">
                    <a href="user-dashboard.html" class="dropdown-item">📝 Моите статии</a>
                    <a href="submit-article.html" class="dropdown-item">✏️ Напиши статия</a>
                    ${role === 'redactor' ? '<a href="redactor-dashboard.html" class="dropdown-item">📋 Редакторски панел</a>' : ''}
                    ${role === 'admin' ? '<a href="admin.html" class="dropdown-item">⚙️ Админ панел</a>' : ''}
                    <hr>
                    <button class="dropdown-item logout-btn">🚪 Изход</button>
                </div>
            </div>
        </div>
    `;
    
    // Add logout functionality
    authContainer.querySelector('.logout-btn').addEventListener('click', async () => {
        await logoutUser();
        window.location.reload();
    });
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;
    
    authContainer.innerHTML = `
        <button class="auth-btn login-btn">Вход</button>
        <button class="auth-btn register-btn">Регистрация</button>
    `;
    
    // Add event listeners
    authContainer.querySelector('.login-btn').addEventListener('click', showLoginModal);
    authContainer.querySelector('.register-btn').addEventListener('click', showRegisterModal);
}

// Get role badge
function getRoleBadge(role) {
    const roles = {
        'user': { text: 'Потребител', class: 'role-user' },
        'redactor': { text: 'Редактор', class: 'role-redactor' },
        'admin': { text: 'Админ', class: 'role-admin' }
    };
    return roles[role] || roles.user;
}

// Update navigation based on role
function updateNavigationForRole(role) {
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    
    // Remove existing role-based links
    document.querySelectorAll('.role-nav-item').forEach(item => item.remove());
    
    // Add role-specific links
    if (role === 'redactor' || role === 'admin') {
        const redactorLi = document.createElement('li');
        redactorLi.className = 'role-nav-item';
        redactorLi.innerHTML = `<a href="redactor-dashboard.html">📋 Редактор</a>`;
        nav.appendChild(redactorLi);
    }
}

function resetNavigation() {
    document.querySelectorAll('.role-nav-item').forEach(item => item.remove());
}

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">×</button>
            <h2>Вход в системата</h2>
            <form id="loginForm">
                <input type="email" placeholder="Имейл" required>
                <input type="password" placeholder="Парола" required>
                <button type="submit" class="btn">Вход</button>
            </form>
            <p class="auth-switch">Нямате профил? <a href="#" class="switch-to-register">Регистрирайте се</a></p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Login form submission
    modal.querySelector('#loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const submitBtn = form.querySelector('button');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Влизане...';
        
        const result = await loginUser(email, password);
        
        if (result.success) {
            modal.remove();
        } else {
            alert(`Грешка при вход: ${result.error}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Вход';
        }
    });
    
    // Switch to register
    modal.querySelector('.switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        modal.remove();
        showRegisterModal();
    });
}

// Show register modal
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">×</button>
            <h2>Регистрация</h2>
            <form id="registerForm">
                <input type="text" placeholder="Име и фамилия" required>
                <input type="email" placeholder="Имейл" required>
                <input type="password" placeholder="Парола" minlength="6" required>
                <button type="submit" class="btn">Регистрация</button>
            </form>
            <p class="auth-switch">Вече имате профил? <a href="#" class="switch-to-login">Влезте</a></p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Register form submission
    modal.querySelector('#registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const displayName = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const submitBtn = form.querySelector('button');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Регистриране...';
        
        const result = await registerUser(email, password, displayName);
        
        if (result.success) {
            modal.remove();
            alert('✅ Успешна регистрация! Вече сте влязли в системата.');
        } else {
            alert(`❌ Грешка при регистрация: ${result.error}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Регистрация';
        }
    });
    
    // Switch to login
    modal.querySelector('.switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        modal.remove();
        showLoginModal();
    });
}

// Check if user has required role
async function checkUserRole(requiredRole) {
    const user = auth.currentUser;
    if (!user) return false;
    
    const role = await getUserRole(user.uid);
    return role === requiredRole || role === 'admin';
}

// Protect route - use this at top of admin/redactor pages
async function protectRoute(requiredRole, redirectUrl = 'index.html') {
    const user = auth.currentUser;
    
    if (!user) {
        alert('Моля, влезте в системата за достъп до тази страница.');
        window.location.href = redirectUrl;
        return false;
    }
    
    const role = await getUserRole(user.uid);
    
    if (role !== requiredRole && role !== 'admin') {
        alert('Нямате необходимите права за достъп до тази страница.');
        window.location.href = redirectUrl;
        return false;
    }
    
    return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing auth system...');
    initAuthSystem();
});

// Export functions for use in other files
window.authSystem = {
    getCurrentUser: () => currentUser,
    getUserRole: () => userRole,
    checkUserRole: (requiredRole) => checkUserRole(requiredRole),
    protectRoute: (requiredRole, redirectUrl) => protectRoute(requiredRole, redirectUrl),
    logout: logoutUser
};