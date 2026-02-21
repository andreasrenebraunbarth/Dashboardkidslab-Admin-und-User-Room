// Auth Logic
const currentUser = localStorage.getItem('currentUser');
const authToken = localStorage.getItem('authToken');
const path = window.location.pathname;

<<<<<<< HEAD
const API_BASE = '/api';

// Redirect logic
=======
// Helper to make authenticated requests
window.apiCall = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (localStorage.getItem('authToken')) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
    }

    try {
        const response = await fetch(`${API_URL}/api${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (response.status === 401) {
            window.logout();
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Network error' };
    }
};

window.authSystem = {
    getUsers: async () => {
        const users = await window.apiCall('/users');
        return users || [];
    },
    // We don't expose full addUser/updateUser to client directly in the same way, 
    // but we can map them to API calls
    addUser: async (userData) => {
        return await window.apiCall('/auth/register', 'POST', userData);
    },
    updateUser: async (email, data) => {
        // Not fully implemented in backend yet for update, but placeholder
        console.warn('Update user via API not fully implemented yet');
        return true;
    },
    findUser: () => { console.warn('findUser not available in API mode (async)'); return null; }
};

// Path handling
>>>>>>> d3ae95957e06bf503998994c7fea4394acb73a52
const isDashboard = path.endsWith('dashboard.html');
const isLogin = path.endsWith('index.html') || path.endsWith('/');

if (isDashboard && !currentUser) {
    window.location.href = 'index.html';
} else if (isLogin && currentUser) {
    if (!localStorage.getItem('justLoggedOut')) {
        window.location.href = 'dashboard.html';
    } else {
        localStorage.removeItem('justLoggedOut');
    }
}

// Logic for Login/Register Page
const authForm = document.getElementById('authForm');
if (authForm) {
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');

    let isRegisterMode = false;

    const toggleMode = (register) => {
        isRegisterMode = register;
        errorMsg.textContent = '';
        authForm.reset();

        if (isRegisterMode) {
            showRegisterBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
            nameGroup.style.display = 'block';
            nameInput.required = true;
            submitBtn.innerHTML = `<span>Registrieren</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`;
        } else {
            showLoginBtn.classList.add('active');
            showRegisterBtn.classList.remove('active');
            nameGroup.style.display = 'none';
            nameInput.required = false;
            submitBtn.innerHTML = `<span>Anmelden</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`;
        }
    };

    showLoginBtn.addEventListener('click', () => toggleMode(false));
    showRegisterBtn.addEventListener('click', () => toggleMode(true));

<<<<<<< HEAD
=======
    // Handle Submit
>>>>>>> d3ae95957e06bf503998994c7fea4394acb73a52
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

<<<<<<< HEAD
        try {
            if (isRegisterMode) {
                const name = nameInput.value.trim();
                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');

                localStorage.setItem('currentUser', data.user.name);
                localStorage.setItem('currentUserEmail', data.user.email);
                localStorage.setItem('currentUserRole', data.user.role);
                window.location.href = 'dashboard.html';

            } else {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Login fehlgeschlagen');

                localStorage.setItem('currentUser', data.name);
                localStorage.setItem('currentUserEmail', data.email);
                localStorage.setItem('currentUserRole', data.role);
                window.location.href = 'dashboard.html';
=======
        if (isRegisterMode) {
            // Register Flow
            const name = nameInput.value.trim();
            if (password.length < 4) {
                errorMsg.textContent = 'Passwort muss mindestens 4 Zeichen lang sein.';
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'user' })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Serverfehler');
                }

                const data = await res.json();

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', data.user.name);
                localStorage.setItem('currentUserEmail', data.user.email);
                localStorage.setItem('currentUserRole', data.user.role);
                localStorage.setItem('currentUserId', data.user.id);
                window.location.href = 'dashboard.html';
            } catch (err) {
                errorMsg.textContent = err.message;
            }

        } else {
            // Login Flow
            try {
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Login fehlgeschlagen');
                }

                const data = await res.json();

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', data.user.name);
                localStorage.setItem('currentUserEmail', data.user.email);
                localStorage.setItem('currentUserRole', data.user.role);
                localStorage.setItem('currentUserId', data.user.id);
                window.location.href = 'dashboard.html';
            } catch (err) {
                errorMsg.textContent = err.message;
>>>>>>> d3ae95957e06bf503998994c7fea4394acb73a52
            }
        } catch (err) {
            errorMsg.textContent = err.message;
        }
    });
}

window.logout = function () {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    localStorage.setItem('justLoggedOut', 'true');
    window.location.href = 'index.html';
};

if (isDashboard && currentUser) {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = currentUser;
    }
}

