// ===================================
// MODERN REGISTRATION APP - JAVASCRIPT
// TransGlobal Solutions
// ===================================

// === STATE MANAGEMENT ===
let currentUser = null;
let registrations = [];

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    showSection('landing-section'); // Start with landing page
});

// === DATA PERSISTENCE ===
function loadData() {
    const savedRegistrations = localStorage.getItem('registrations');
    if (savedRegistrations) {
        registrations = JSON.parse(savedRegistrations);
    }
}

function saveData() {
    localStorage.setItem('registrations', JSON.stringify(registrations));
}

// === NAVIGATION ===
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// === EVENT LISTENERS ===
function initializeEventListeners() {
    console.log('Initializing event listeners...');

    // Landing page access button
    const accessBtn = document.getElementById('access-system-btn');
    console.log('Access button found:', accessBtn);

    if (accessBtn) {
        accessBtn.addEventListener('click', () => {
            console.log('Access button clicked!');
            showSection('login-section');
        });
        console.log('Event listener attached to access button');
    } else {
        console.error('Access button NOT found in DOM');
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password Toggle
    const togglePasswordBtn = document.getElementById('toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Visitor form
    const visitorForm = document.getElementById('visitor-form');
    if (visitorForm) {
        visitorForm.addEventListener('submit', handleVisitorSubmit);
    }

    // Logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);

    // Filter tabs
    const filterTabs = document.querySelectorAll('.tab-btn');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.dataset.filter;
            filterRegistrations(filter);
        });
    });

    // Set default dates
    setDefaultDates();
}

// === LOGIN HANDLING ===
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Simple authentication (in production, use proper backend authentication)
    if (username === 'admin' && password === 'admin') {
        currentUser = {
            username: 'admin',
            role: 'admin',
            displayName: 'Administrador'
        };
        showToast('¡Bienvenido, Administrador!', 'success');
        showAdminDashboard();
    } else if (username === 'usuario' && password === '1234') {
        currentUser = {
            username: 'usuario',
            role: 'user',
            displayName: 'Usuario'
        };
        showToast('¡Bienvenido!', 'success');
        showRegistrationForm();
    } else {
        showToast('Credenciales incorrectas', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    showSection('landing-section'); // Return to landing page
    document.getElementById('login-form').reset();
    showToast('Sesión cerrada', 'info');
}

// === SHOW SECTIONS BASED ON ROLE ===
function showRegistrationForm() {
    showSection('registration-section');
    document.getElementById('current-user-name').textContent = currentUser.displayName;
    displayUserSubmissions();
}

function showAdminDashboard() {
    showSection('admin-section');
    document.getElementById('admin-user-name').textContent = currentUser.displayName;
    updateStats();
    filterRegistrations('pending');
}

// === VISITOR FORM HANDLING ===
function handleVisitorSubmit(e) {
    e.preventDefault();

    const formData = {
        id: Date.now(),
        submittedBy: currentUser.username,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        name: document.getElementById('visitor-name').value.trim(),
        cedula: document.getElementById('visitor-cedula').value.trim(),
        arrivalDate: document.getElementById('arrival-date').value,
        departureDate: document.getElementById('departure-date').value,
        visitReason: document.getElementById('visit-reason').value,
        personToVisit: document.getElementById('person-to-visit').value.trim()
    };

    // Validate dates
    if (new Date(formData.departureDate) <= new Date(formData.arrivalDate)) {
        showToast('La fecha de salida debe ser posterior a la fecha de llegada', 'error');
        return;
    }

    registrations.push(formData);
    saveData();

    showToast('Registro enviado exitosamente. Pendiente de aprobación.', 'success');
    e.target.reset();
    setDefaultDates();
    displayUserSubmissions();
}

// === DISPLAY USER SUBMISSIONS ===
function displayUserSubmissions() {
    const container = document.getElementById('user-submissions');
    const userRegistrations = registrations.filter(r => r.submittedBy === currentUser.username);

    if (userRegistrations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p class="empty-state-text">No tienes registros aún</p>
            </div>
        `;
        return;
    }

    container.innerHTML = userRegistrations.map(reg => `
        <div class="submission-item">
            <div class="submission-header">
                <span class="submission-name">${reg.name}</span>
                <span class="status-badge status-${reg.status}">
                    ${getStatusText(reg.status)}
                </span>
            </div>
            <div class="submission-details">
                <div><strong>Cédula:</strong> ${reg.cedula}</div>
                <div><strong>Llegada:</strong> ${formatDateTime(reg.arrivalDate)}</div>
                <div><strong>Salida:</strong> ${formatDateTime(reg.departureDate)}</div>
                <div><strong>Motivo:</strong> ${reg.visitReason}</div>
                <div><strong>Visita a:</strong> ${reg.personToVisit}</div>
                <div><strong>Enviado:</strong> ${formatDateTime(reg.submittedAt)}</div>
            </div>
        </div>
    `).join('');
}

// === ADMIN DASHBOARD ===
function updateStats() {
    const pending = registrations.filter(r => r.status === 'pending').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;

    document.getElementById('pending-count').textContent = pending;
    document.getElementById('approved-count').textContent = approved;
    document.getElementById('rejected-count').textContent = rejected;
}

function filterRegistrations(filter) {
    const container = document.getElementById('registrations-list');

    let filtered = registrations;
    if (filter !== 'all') {
        filtered = registrations.filter(r => r.status === filter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p class="empty-state-text">No hay registros ${filter !== 'all' ? getStatusText(filter).toLowerCase() : ''}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(reg => `
        <div class="registration-card">
            <div class="registration-header">
                <div>
                    <h3 class="registration-title">${reg.name}</h3>
                    <small style="color: var(--text-muted);">Enviado por: ${reg.submittedBy}</small>
                </div>
                <span class="status-badge status-${reg.status}">
                    ${getStatusText(reg.status)}
                </span>
            </div>
            
            <div class="registration-body">
                <div class="registration-field">
                    <span class="field-label">🆔 Cédula</span>
                    <span class="field-value">${reg.cedula}</span>
                </div>
                <div class="registration-field">
                    <span class="field-label">📅 Fecha de Llegada</span>
                    <span class="field-value">${formatDateTime(reg.arrivalDate)}</span>
                </div>
                <div class="registration-field">
                    <span class="field-label">📅 Fecha de Salida</span>
                    <span class="field-value">${formatDateTime(reg.departureDate)}</span>
                </div>
                <div class="registration-field">
                    <span class="field-label">📝 Motivo de Visita</span>
                    <span class="field-value">${reg.visitReason}</span>
                </div>
                <div class="registration-field">
                    <span class="field-label">🏢 A Quién Visita</span>
                    <span class="field-value">${reg.personToVisit}</span>
                </div>
                <div class="registration-field">
                    <span class="field-label">⏰ Fecha de Envío</span>
                    <span class="field-value">${formatDateTime(reg.submittedAt)}</span>
                </div>
            </div>
            
            ${reg.status === 'pending' ? `
                <div class="registration-actions">
                    <button class="btn-approve" onclick="approveRegistration(${reg.id})">
                        ✓ Aprobar
                    </button>
                    <button class="btn-reject" onclick="rejectRegistration(${reg.id})">
                        ✗ Rechazar
                    </button>
                </div>
            ` : ''}
            
            ${reg.status === 'approved' ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; color: var(--success-color);">
                    ✓ Aprobado el ${formatDateTime(reg.processedAt)}
                </div>
            ` : ''}
            
            ${reg.status === 'rejected' ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; color: var(--danger-color);">
                    ✗ Rechazado el ${formatDateTime(reg.processedAt)}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// === APPROVAL ACTIONS ===
function approveRegistration(id) {
    const registration = registrations.find(r => r.id === id);
    if (registration) {
        registration.status = 'approved';
        registration.processedAt = new Date().toISOString();
        registration.processedBy = currentUser.username;
        saveData();
        updateStats();
        filterRegistrations(document.querySelector('.tab-btn.active').dataset.filter);
        showToast('Registro aprobado exitosamente', 'success');
    }
}

function rejectRegistration(id) {
    const registration = registrations.find(r => r.id === id);
    if (registration) {
        registration.status = 'rejected';
        registration.processedAt = new Date().toISOString();
        registration.processedBy = currentUser.username;
        saveData();
        updateStats();
        filterRegistrations(document.querySelector('.tab-btn.active').dataset.filter);
        showToast('Registro rechazado', 'info');
    }
}

// === UTILITY FUNCTIONS ===
function getStatusText(status) {
    const statusMap = {
        'pending': '⏳ Pendiente',
        'approved': '✅ Aprobado',
        'rejected': '❌ Rechazado'
    };
    return statusMap[status] || status;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

function setDefaultDates() {
    const now = new Date();
    const arrivalInput = document.getElementById('arrival-date');
    const departureInput = document.getElementById('departure-date');

    if (arrivalInput) {
        // Set arrival to current time
        const arrivalDate = new Date(now);
        arrivalInput.value = formatDateTimeLocal(arrivalDate);
    }

    if (departureInput) {
        // Set departure to 2 hours from now
        const departureDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        departureInput.value = formatDateTimeLocal(departureDate);
    }
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    // Trigger reflow to restart animation
    void toast.offsetWidth;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// === PASSWORD TOGGLE ===
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
    }
}

// === MAKE FUNCTIONS GLOBAL FOR ONCLICK ===
window.approveRegistration = approveRegistration;
window.rejectRegistration = rejectRegistration;
window.showSection = showSection;
