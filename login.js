// ================= LOGIN SYSTEM =================
const LOGIN_STORAGE_KEY = "campus_sync_login_state";
const USERS_STORAGE_KEY = "campus_sync_users";

// ================= INITIALIZE =================
function initializeLogin() {
    console.log("Login system initialized");
    
    // Load users from storage
    loadUsers();
    
    // Setup event listeners
    setupLoginEventListeners();
    
    // Check if user is already logged in
    checkLoginState();
    
    // Auto-focus username field
    setTimeout(() => {
        document.getElementById('username').focus();
    }, 100);
}

// ================= USER MANAGEMENT =================
function loadUsers() {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    
    // Create default admin user if no users exist
    if (!savedUsers) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                nim: '0000000000',
                name: 'Administrator',
                email: 'admin@campussync.edu',
                jurusan: 'Teknik Informatika',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'student',
                password: 'student123',
                nim: '241011402645',
                name: 'Tria Hapifah',
                email: 'triahpfh@student.edu',
                jurusan: 'Data Science',
                role: 'student',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
        console.log("Default users created");
    }
}

function getUsers() {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function validateRegistration(data) {
    const errors = [];
    
    if (!data.nim || data.nim.length < 10) {
        errors.push("NIM harus minimal 10 digit");
    }
    
    if (!data.name || data.name.length < 3) {
        errors.push("Nama harus minimal 3 karakter");
    }
    
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.push("Email tidak valid");
    }
    
    if (!data.password || data.password.length < 8) {
        errors.push("Password harus minimal 8 karakter");
    }
    
    if (data.password !== data.confirmPassword) {
        errors.push("Password tidak cocok");
    }
    
    if (!data.jurusan) {
        errors.push("Pilih jurusan");
    }
    
    // Check duplicate NIM
    const users = getUsers();
    if (users.some(user => user.nim === data.nim)) {
        errors.push("NIM sudah terdaftar");
    }
    
    // Check duplicate username
    if (users.some(user => user.username === data.nim)) {
        errors.push("Username sudah digunakan");
    }
    
    // Check duplicate email
    if (users.some(user => user.email === data.email)) {
        errors.push("Email sudah terdaftar");
    }
    
    return errors;
}

// ================= LOGIN FUNCTIONS =================
function checkLoginState() {
    const loginState = localStorage.getItem(LOGIN_STORAGE_KEY);
    
    if (loginState) {
        try {
            const state = JSON.parse(loginState);
            const now = new Date().getTime();
            
            // Check if token is still valid (24 hours)
            if (state.timestamp && (now - state.timestamp < 24 * 60 * 60 * 1000)) {
                // Auto-redirect to main page
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            // Invalid token, clear it
            localStorage.removeItem(LOGIN_STORAGE_KEY);
        }
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validate inputs
    if (!username || !password) {
        showToast("Username dan password harus diisi", "error");
        return;
    }
    
    // Find user
    const users = getUsers();
    const user = users.find(u => 
        u.username === username || u.nim === username || u.email === username
    );
    
    if (!user) {
        showToast("User tidak ditemukan", "error");
        return;
    }
    
    // Check password
    if (user.password !== password) {
        showToast("Password salah", "error");
        return;
    }
    
    // Successful login
    const loginState = {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        jurusan: user.jurusan,
        timestamp: new Date().getTime(),
        remember: remember
    };
    
    localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(loginState));
    
    // Show success message
    showToast(`Login berhasil! Selamat datang, ${user.name}`, "success");
    
    // Redirect to main page after delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function handleRegister(event) {
    event.preventDefault();
    
    const data = {
        nim: document.getElementById('regNIM').value.trim(),
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value,
        jurusan: document.getElementById('regJurusan').value
    };
    
    // Validate
    const errors = validateRegistration(data);
    
    if (errors.length > 0) {
        errors.forEach(error => showToast(error, "error"));
        return;
    }
    
    // Create new user
    const users = getUsers();
    const newUser = {
        id: users.length + 1,
        username: data.nim, // Use NIM as username
        password: data.password,
        nim: data.nim,
        name: data.name,
        email: data.email,
        jurusan: data.jurusan,
        role: 'student',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Close modal and show success
    closeModal('registerModal');
    showToast("Registrasi berhasil! Silakan login dengan NIM Anda.", "success");
    
    // Clear form
    document.getElementById('registerForm').reset();
}

function handlePasswordReset() {
    const identifier = document.getElementById('resetIdentifier').value.trim();
    
    if (!identifier) {
        showToast("Masukkan email atau NIM", "error");
        return;
    }
    
    // Simulate sending reset email
    showToast(`Link reset password telah dikirim ke ${identifier}`, "success");
    closeModal('forgotModal');
    
    // Clear field
    document.getElementById('resetIdentifier').value = '';
}

// ================= MODAL FUNCTIONS =================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function closeAllModals() {
    closeModal('forgotModal');
    closeModal('registerModal');
}

// ================= UTILITY FUNCTIONS =================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function showToast(message, type = "success") {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div>${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ================= EVENT LISTENERS =================
function setupLoginEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Toggle password visibility
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePasswordVisibility);
    }
    
    // Forgot password
    const forgotPasswordBtn = document.getElementById('forgotPassword');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('forgotModal');
        });
    }
    
    // Show register modal
    const showRegisterBtn = document.getElementById('showRegister');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('registerModal');
        });
    }
    
    // Modal close buttons
    const closeButtons = [
        ['closeForgotModal', 'forgotModal'],
        ['closeRegisterModal', 'registerModal'],
        ['cancelRegister', 'registerModal'],
        ['btnCancelReset', 'forgotModal']
    ];
    
    closeButtons.forEach(([btnId, modalId]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => closeModal(modalId));
        }
    });
    
    // Reset password button
    const resetPasswordBtn = document.getElementById('btnResetPassword');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', handlePasswordReset);
    }
    
    // Close modals on outside click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Enter key in password field
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl + / to focus search
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            document.getElementById('username').focus();
        }
    });
}

// ================= INITIALIZE ON LOAD =================
document.addEventListener('DOMContentLoaded', initializeLogin);