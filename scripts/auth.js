// Auth Logic
const currentUser = localStorage.getItem('currentUser');
const path = window.location.pathname;

// Simple simulation of user database - In a real app this comes from a server
// Simple simulation of user database - In a real app this comes from a server
const getUsers = () => JSON.parse(localStorage.getItem('registeredUsers')) || [];

// Initialize default admin if no users exist
// Initialize default admin if no Admin exists
const users = getUsers();
const adminExists = users.some(u => u.role === 'admin');

if (!adminExists) {
    const defaultAdmin = {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin', // Very insecure, for demo only
        role: 'admin'
    };
    users.push(defaultAdmin);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    console.log('Default admin created because none existed: admin@example.com / admin');
}

const saveUsers = (users) => localStorage.setItem('registeredUsers', JSON.stringify(users));

const addUser = (user) => {
    const users = getUsers();
    // Default role is 'user' if not specified
    if (!user.role) user.role = 'user';
    users.push(user);
    saveUsers(users);
};

const findUser = (email) => getUsers().find(u => u.email === email);

const updateUser = (email, newData) => {
    const users = getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
        users[index] = { ...users[index], ...newData };
        saveUsers(users);
        // If current user is updated, update session if needed
        const currentUserEmail = localStorage.getItem('currentUserEmail'); // We should start tracking email for session
        if (currentUserEmail === email && newData.name) {
            localStorage.setItem('currentUser', newData.name);
        }
        return true;
    }
    return false;
};

// Make these available globally for the Admin Panel
window.authSystem = {
    getUsers,
    addUser,
    updateUser,
    findUser
};

// Path handling
const isDashboard = path.endsWith('dashboard.html');
const isLogin = path.endsWith('index.html') || path.endsWith('/');

// Redirect logic
if (isDashboard && !currentUser) {
    window.location.href = 'index.html';
} else if (isLogin && currentUser) {
    // Only redirect if NOT expecting to login again? 
    // Usually standard behavior is to redirect to dashboard if session exists
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

    // Toggle Function
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

    // Handle Submit
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (isRegisterMode) {
            // Register Flow
            const name = nameInput.value.trim();
            if (findUser(email)) {
                errorMsg.textContent = 'Diese E-Mail wird bereits verwendet.';
                return;
            }
            if (password.length < 4) {
                errorMsg.textContent = 'Passwort muss mindestens 4 Zeichen lang sein.';
                return;
            }

            addUser({ name, email, password, role: 'user' }); // In real app: Hash password!
            localStorage.setItem('currentUser', name);
            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('currentUserRole', 'user');
            window.location.href = 'dashboard.html';

        } else {
            // Login Flow
            const user = findUser(email);
            if (user && user.password === password) {
                localStorage.setItem('currentUser', user.name);
                localStorage.setItem('currentUserEmail', user.email); // Store email for unique ID
                localStorage.setItem('currentUserRole', user.role || 'user'); // Store role
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = 'E-Mail oder Passwort falsch.';
            }
        }
    });
}

// Logout Function
window.logout = function () {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserRole');
    localStorage.setItem('justLoggedOut', 'true');
    window.location.href = 'index.html';
};

// Display User Name on Dashboard
if (isDashboard && currentUser) {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = currentUser;
    }
}
