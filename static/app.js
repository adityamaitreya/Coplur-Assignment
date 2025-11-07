// API Base URL
const API_URL = '/api';

// Current user state
let currentUser = null;

// Initialize app
async function initApp() {
    try {
        const response = await fetch(`${API_URL}/current-user`, {
            credentials: 'include'
        });
        if (response.ok) {
            currentUser = await response.json();
        }
    } catch (error) {
        console.error('Init error:', error);
    }
}

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/current-user`, {
            credentials: 'include'
        });
        if (response.ok) {
            currentUser = await response.json();
            return currentUser;
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
    
    // Not authenticated
    if (!window.location.pathname.endsWith('index.html') && 
        !window.location.pathname.endsWith('register.html') &&
        !window.location.pathname.endsWith('/')) {
        window.location.href = 'index.html';
    }
    return null;
}

// Check admin role
async function checkAdmin() {
    const user = await checkAuth();
    console.log('Current user:', user);
    if (!user) {
        alert('Please login first');
        window.location.href = 'index.html';
        return false;
    }
    if (user.role !== 'admin') {
        alert('Access Denied: Admin only');
        window.location.href = 'student.html';
        return false;
    }
    return true;
}

// Login handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error');
        
        if (!username || !password) {
            errorDiv.textContent = 'Please fill all fields';
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const user = await response.json();
                currentUser = user;
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'student.html';
                }
            } else {
                const error = await response.json();
                errorDiv.textContent = error.error;
            }
        } catch (error) {
            errorDiv.textContent = 'Connection error. Please try again.';
        }
    });
}

// Register handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('error');
        
        if (!username || !password || !confirmPassword) {
            errorDiv.textContent = 'Please fill all fields';
            return;
        }
        
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                alert('Registration successful! Please login.');
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                errorDiv.textContent = error.error;
            }
        } catch (error) {
            errorDiv.textContent = 'Connection error. Please try again.';
        }
    });
}

// Student dashboard
if (document.getElementById('studentDashboard')) {
    (async function() {
        const user = await checkAuth();
        if (user) {
            document.getElementById('welcomeUser').textContent = user.username;
            
            document.getElementById('logoutBtn').addEventListener('click', async function() {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
                currentUser = null;
                window.location.href = 'index.html';
            });
            
            document.getElementById('changePasswordBtn').addEventListener('click', function() {
                document.getElementById('changePasswordModal').classList.add('active');
            });
            
            document.querySelector('.close').addEventListener('click', function() {
                document.getElementById('changePasswordModal').classList.remove('active');
            });
            
            document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                const errorDiv = document.getElementById('passwordError');
                
                if (newPassword !== confirmNewPassword) {
                    errorDiv.textContent = 'New passwords do not match';
                    return;
                }
                
                try {
                    const response = await fetch(`${API_URL}/change-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                    
                    if (response.ok) {
                        alert('Password changed successfully!');
                        document.getElementById('changePasswordModal').classList.remove('active');
                        document.getElementById('changePasswordForm').reset();
                        errorDiv.textContent = '';
                    } else {
                        const error = await response.json();
                        errorDiv.textContent = error.error;
                    }
                } catch (error) {
                    errorDiv.textContent = 'Connection error. Please try again.';
                }
            });
        }
    })();
}

// Admin dashboard
if (document.getElementById('adminDashboard')) {
    (async function() {
        await checkAdmin();
        const user = await checkAuth();
        
        if (user) {
            document.getElementById('welcomeUser').textContent = user.username;
            await loadUsers();
            
            document.getElementById('logoutBtn').addEventListener('click', async function() {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
                currentUser = null;
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
            
            document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                const errorDiv = document.getElementById('passwordError');
                
                if (newPassword !== confirmNewPassword) {
                    errorDiv.textContent = 'New passwords do not match';
                    return;
                }
                
                try {
                    const response = await fetch(`${API_URL}/change-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                    
                    if (response.ok) {
                        alert('Password changed successfully!');
                        document.getElementById('changePasswordModal').classList.remove('active');
                        document.getElementById('changePasswordForm').reset();
                        errorDiv.textContent = '';
                    } else {
                        const error = await response.json();
                        errorDiv.textContent = error.error;
                    }
                } catch (error) {
                    errorDiv.textContent = 'Connection error. Please try again.';
                }
            });
            
            document.getElementById('addUserForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const username = document.getElementById('newUsername').value.trim();
                const password = document.getElementById('newPassword').value;
                const role = document.getElementById('newRole').value;
                const errorDiv = document.getElementById('addUserError');
                
                try {
                    const response = await fetch(`${API_URL}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ username, password, role })
                    });
                    
                    if (response.ok) {
                        alert('User created successfully!');
                        document.getElementById('addUserModal').classList.remove('active');
                        document.getElementById('addUserForm').reset();
                        errorDiv.textContent = '';
                        await loadUsers();
                    } else {
                        const error = await response.json();
                        errorDiv.textContent = error.error;
                    }
                } catch (error) {
                    errorDiv.textContent = 'Connection error. Please try again.';
                }
            });
        }
    })();
}

// Load users table
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const users = await response.json();
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
    } catch (error) {
        console.error('Load users error:', error);
    }
}

// Delete user
async function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
        try {
            const response = await fetch(`${API_URL}/users/${username}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                alert('User deleted successfully!');
                await loadUsers();
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            alert('Connection error. Please try again.');
        }
    }
}
