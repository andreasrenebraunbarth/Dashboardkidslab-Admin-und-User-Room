// App Logic - Handles Dashboard Navigation and Admin/Settings Features

document.addEventListener('DOMContentLoaded', () => {
    const currentUserRole = localStorage.getItem('currentUserRole');
    const currentUserEmail = localStorage.getItem('currentUserEmail');

    // Display User Role
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    if (userRoleDisplay) {
        userRoleDisplay.textContent = currentUserRole === 'admin' ? 'Administrator' : 'Benutzer';
        userRoleDisplay.classList.add(currentUserRole === 'admin' ? 'role-admin' : 'role-user');
    }

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');
    const adminLink = document.getElementById('adminLink');

    // Show Admin Link if user is admin
    if (currentUserRole === 'admin') {
        adminLink.style.display = 'flex';
        const adminAddRoomSection = document.getElementById('adminAddRoomSection');
        if (adminAddRoomSection) adminAddRoomSection.style.display = 'block';
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.dataset.view;
            if (!targetView) return;

            // Security Check for Admin Panel
            if (targetView === 'admin' && currentUserRole !== 'admin') {
                alert('Zugriff verweigert!');
                return;
            }

            // Update Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show Target View
            views.forEach(view => {
                view.style.display = view.id === `view-${targetView}` ? 'block' : 'none';
            });

            // Refresh data if switching to Admin
            if (targetView === 'admin') {
                renderUserTable();
            } else if (targetView === 'rooms') {
                if (window.roomSystem && window.roomSystem.renderRooms) {
                    window.roomSystem.renderRooms();
                }
            }
        });
    });

    // --- Admin Panel Logic ---
    const adminAddUserForm = document.getElementById('adminAddUserForm');
    const userTableBody = document.getElementById('userTableBody');

    function renderUserTable() {
        if (!userTableBody) return;
        const users = window.authSystem.getUsers();
        userTableBody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select styled-select-small" onchange="updateUserRole('${user.email}', this.value)" ${user.email === currentUserEmail ? 'disabled' : ''}>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    ${user.email !== currentUserEmail ? `<button class="btn-sm btn-danger" onclick="deleteUser('${user.email}')">Löschen</button>` : '<span class="text-muted">Du selbst</span>'}
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // Expose global functions for inline events
    window.updateUserRole = (email, newRole) => {
        if (confirm(`Rolle von ${email} auf ${newRole} ändern?`)) {
            window.authSystem.updateUser(email, { role: newRole });
            // If we changed our own role (shouldn't be possible via UI but good safety), reload
            if (email === currentUserEmail) {
                localStorage.setItem('currentUserRole', newRole);
                window.location.reload();
            }
        } else {
            renderUserTable(); // Revert selection
        }
    };

    window.deleteUser = (email) => {
        if (confirm(`Benutzer ${email} wirklich löschen?`)) {
            // Delete logic needs to be added to authSystem or done here manually for now
            // For now, simpler to just modify the list and save using authSystem internals if exposed?
            // Actually authSystem doesn't expose delete. Let's add hacky delete for now or update authSystem.
            // Let's implement a simple delete by filtering
            let users = window.authSystem.getUsers();
            users = users.filter(u => u.email !== email);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            renderUserTable();
        }
    };

    if (adminAddUserForm) {
        adminAddUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('adminName').value;
            const email = document.getElementById('adminEmail').value.toLowerCase();
            const password = document.getElementById('adminPassword').value;
            const role = document.getElementById('adminRole').value;

            if (window.authSystem.findUser(email)) {
                alert('User exists!');
                return;
            }

            window.authSystem.addUser({ name, email, password, role });
            adminAddUserForm.reset();
            renderUserTable();
            alert('Benutzer angelegt.');
        });
    }


    // --- Settings Logic ---
    const settingsForm = document.getElementById('settingsForm');
    const settingsMsg = document.getElementById('settingsMsg');

    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('settingsName').value.trim();
            const newPassword = document.getElementById('settingsPassword').value.trim();

            if (!newName && !newPassword) return;

            const updates = {};
            if (newName) updates.name = newName;
            if (newPassword) updates.password = newPassword; // In real app: validate complexity

            if (window.authSystem.updateUser(currentUserEmail, updates)) {
                settingsMsg.textContent = 'Profil erfolgreich aktualisiert.';
                if (newName) {
                    document.getElementById('userDisplay').textContent = newName;
                }
                setTimeout(() => settingsMsg.textContent = '', 3000);
            } else {
                alert('Fehler beim Speichern.');
            }
        });
    }

});
