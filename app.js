// Initialize app with admin user
function initApp() {
    if (!localStorage.getItem('users')) {
        const users = [
            { username: 'admin', password: 'Admin@123', role: 'admin' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Check authentication
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        if (!window.location.pathname.endsWith('index.html') && 
            !window.location.pathname.endsWith('register.html') &&
            !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
        return null;
    }
    return JSON.parse(currentUser);
}

// Check admin role
function checkAdmin() {
    const user = checkAuth();
    if (!user || user.role !== 'admin') {
        alert('Access Denied: Admin only');
        window.location.href = 'student.html';
        return false;
    }
    return true;
}

// Login handler
if (document.getElementById('loginForm')) {
    initApp();
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error');
        
        if (!username || !password) {
            errorDiv.textContent = 'Please fill all fields';
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'student.html';
            }
        } else {
            errorDiv.textContent = 'Invalid username or password';
        }
    });
}

// Register handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('error');
        
        if (!username || !password || !confirmPassword) {
            errorDiv.textContent = 'Please fill all fields';
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            return;
        }
        
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            errorDiv.textContent = 'Password must contain uppercase, lowercase and number';
            return;
        }
        
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users.find(u => u.username === username)) {
            errorDiv.textContent = 'Username already exists';
            return;
        }
        
        users.push({ username, password, role: 'student' });
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Registration successful! Please login.');
        window.location.href = 'index.html';
    });
}

// Student dashboard
if (document.getElementById('studentDashboard')) {
    const user = checkAuth();
    if (user) {
        document.getElementById('welcomeUser').textContent = user.username;
        
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
        
        document.getElementById('changePasswordBtn').addEventListener('click', function() {
            document.getElementById('changePasswordModal').classList.add('active');
        });
        
        document.querySelector('.close').addEventListener('click', function() {
            document.getElementById('changePasswordModal').classList.remove('active');
        });
        
        document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const errorDiv = document.getElementById('passwordError');
            
            if (currentPassword !== user.password) {
                errorDiv.textContent = 'Current password is incorrect';
                return;
            }
            
            if (newPassword.length < 6) {
                errorDiv.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                errorDiv.textContent = 'Password must contain uppercase, lowercase and number';
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                errorDiv.textContent = 'New passwords do not match';
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.username === user.username);
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            
            user.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            alert('Password changed successfully!');
            document.getElementById('changePasswordModal').classList.remove('active');
            document.getElementById('changePasswordForm').reset();
        });
    }
}

// Admin dashboard
if (document.getElementById('adminDashboard')) {
    checkAdmin();
    const user = checkAuth();
    
    if (user) {
        document.getElementById('welcomeUser').textContent = user.username;
        loadUsers();
        
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
        
        document.getElementById('changePasswordBtn').addEventListener('click', function() {
            document.getElementById('changePasswordModal').classList.add('active');
        });
        
        document.getElementById('addUserBtn').addEventListener('click', function() {
            document.getElementById('addUserModal').classList.add('active');
        });
        
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').classList.remove('active');
            });
        });
        
        document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const errorDiv = document.getElementById('passwordError');
            
            if (currentPassword !== user.password) {
                errorDiv.textContent = 'Current password is incorrect';
                return;
            }
            
            if (newPassword.length < 6) {
                errorDiv.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                errorDiv.textContent = 'Password must contain uppercase, lowercase and number';
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                errorDiv.textContent = 'New passwords do not match';
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.username === user.username);
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            
            user.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            alert('Password changed successfully!');
            document.getElementById('changePasswordModal').classList.remove('active');
            document.getElementById('changePasswordForm').reset();
        });
        
        document.getElementById('addUserForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value;
            const role = document.getElementById('newRole').value;
            const errorDiv = document.getElementById('addUserError');
            
            if (!username || !password) {
                errorDiv.textContent = 'Please fill all fields';
                return;
            }
            
            if (password.length < 6) {
                errorDiv.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                errorDiv.textContent = 'Password must contain uppercase, lowercase and number';
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users'));
            
            if (users.find(u => u.username === username)) {
                errorDiv.textContent = 'Username already exists';
                return;
            }
            
            users.push({ username, password, role });
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('User created successfully!');
            document.getElementById('addUserModal').classList.remove('active');
            document.getElementById('addUserForm').reset();
            loadUsers();
        });
    }
}

// Load users table
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users'));
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                ${user.username !== 'admin' ? 
                    `<button class="btn btn-danger" onclick="deleteUser('${user.username}')">Delete</button>` : 
                    '<span style="color: #999;">Protected</span>'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete user
function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
        let users = JSON.parse(localStorage.getItem('users'));
        users = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        alert('User deleted successfully!');
    }
}
