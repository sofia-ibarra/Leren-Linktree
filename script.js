// Contraseña hardcodeada para el panel de administración
const ADMIN_PASSWORD = 'leren2026';

// ========== SISTEMA DE NOTIFICACIONES ==========

// Mostrar notificación personalizada
function showNotification(message, type = 'info') {
    // Tipos: 'success', 'error', 'info', 'warning'
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Iconos según el tipo
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            break;
        case 'error':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            break;
        case 'warning':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            break;
        default:
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    // Auto-eliminar después de 4 segundos (o 6 para errores)
    const duration = type === 'error' ? 6000 : 4000;
    setTimeout(() => {
        notification.classList.remove('notification-show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Cargar botones solo desde data/buttons.json
async function loadData() {
    try {
        const res = await fetch('data/buttons.json');
        if (res.ok) {
            const data = await res.json();
            const buttons = Array.isArray(data.buttons) ? data.buttons : (Array.isArray(data) ? data : []);
            saveButtonsToStorage(buttons); // para que el panel admin pueda mostrarlos
            generateButtons(buttons);
            return;
        }
    } catch (e) {
        // ignore
    }
    saveButtonsToStorage([]);
    generateButtons([]);
}

// Guardar botones en localStorage (solo para la sesión del panel admin; la fuente de verdad es data/buttons.json)
function saveButtons(buttons) {
    saveButtonsToStorage(buttons);
}

// Obtener botones desde localStorage
function getButtonsFromStorage() {
    const stored = localStorage.getItem('lerenButtons');
    return stored ? JSON.parse(stored) : null;
}

// Guardar botones en localStorage
function saveButtonsToStorage(buttons) {
    localStorage.setItem('lerenButtons', JSON.stringify(buttons));
}

// Generar botones dinámicamente
function generateButtons(buttons) {
    const container = document.getElementById('buttonsContainer');
    container.innerHTML = ''; // Limpiar contenedor
    
    if (!buttons || buttons.length === 0) {
        return;
    }
    
    buttons.forEach(button => {
        const buttonElement = document.createElement('a');
        buttonElement.href = button.link;
        buttonElement.className = 'button';
        buttonElement.textContent = button.title;
        buttonElement.target = '_blank';
        buttonElement.rel = 'noopener noreferrer';
        container.appendChild(buttonElement);
    });
}

// Inicializar cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Inicializar panel de administración (oculto por defecto)
    const adminLoginPanel = document.getElementById('adminLoginPanel');
    const adminPanel = document.getElementById('adminPanel');
    if (adminLoginPanel) adminLoginPanel.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // Configurar event listeners del panel de administración
    setupAdminEventListeners();
    setupAdminAccessFromUrl();
    
    initCarousel();
});

// Inicializar carrusel con Swiper
function initCarousel() {
    const swiper = new Swiper('.carousel-swiper', {
        slidesPerView: 3,
        spaceBetween: 5,
        loop: true,
        speed: 3000,
        allowTouchMove: false,
        autoplay: {
            delay: 1,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
        },
        breakpoints: {
            768: {
                slidesPerView: 7,
                spaceBetween: 10,
                loopedSlides: 9,
            }
        }
    });

    // Forzar movimiento continuo cada 100ms para fluidez
    setInterval(() => {
        swiper.slideNext();
    }, 100);
}

// ========== PANEL DE ADMINISTRACIÓN ==========

// Acceso al panel: /admin en la URL abre el modal de login
function isAdminPath() {
    const p = window.location.pathname;
    return p === '/admin' || p === '/admin/';
}

function setupAdminAccessFromUrl() {
    if (isAdminPath()) {
        const loginPanel = document.getElementById('adminLoginPanel');
        if (loginPanel) {
            loginPanel.style.display = 'flex';
            setTimeout(() => {
                const passwordInput = document.getElementById('adminPassword');
                if (passwordInput) passwordInput.focus();
            }, 100);
        }
    }
}

// Mostrar/ocultar panel de login
function toggleAdminLogin() {
    const loginPanel = document.getElementById('adminLoginPanel');
    if (loginPanel.style.display === 'none' || loginPanel.style.display === '') {
        loginPanel.style.display = 'flex';
        // Focus en el input de contraseña
        setTimeout(() => {
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput) passwordInput.focus();
        }, 100);
    } else {
        loginPanel.style.display = 'none';
    }
}

// Verificar contraseña y mostrar panel de administración
function loginAdmin() {
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        // Ocultar panel de login
        document.getElementById('adminLoginPanel').style.display = 'none';
        // Mostrar panel de administración
        document.getElementById('adminPanel').style.display = 'flex';
        // Limpiar input
        passwordInput.value = '';
        // Cargar lista de botones
        loadAdminButtons();
        // Mostrar notificación de éxito
        showNotification('Acceso concedido', 'success');
    } else {
        showNotification('Contraseña incorrecta', 'error');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Cerrar panel de administración
function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminLoginPanel').style.display = 'none';
    // Si estábamos en /admin, limpiar la URL al cerrar
    if (isAdminPath()) {
        history.replaceState(null, '', '/');
    }
}

// Cargar botones en el panel de administración
function loadAdminButtons() {
    const buttons = getButtonsFromStorage() || [];
    const adminList = document.getElementById('adminButtonsList');
    adminList.innerHTML = '';
    
    if (buttons.length === 0) {
        adminList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No hay botones. Agrega uno nuevo.</p>';
        return;
    }
    
    buttons.forEach((button, index) => {
        const item = document.createElement('div');
        item.className = 'admin-button-item';
        const canMoveUp = index > 0;
        const canMoveDown = index < buttons.length - 1;
        item.innerHTML = `
            <div class="admin-button-info">
                <strong>${button.title}</strong>
                <span>${button.link}</span>
            </div>
            <div class="admin-button-actions">
                ${(canMoveUp || canMoveDown) ? `
                <div class="admin-button-order">
                    ${canMoveUp ? `<button type="button" onclick="moveButtonUp(${index})" class="btn-move" title="Subir" aria-label="Subir">↑</button>` : ''}
                    ${canMoveDown ? `<button type="button" onclick="moveButtonDown(${index})" class="btn-move" title="Bajar" aria-label="Bajar">↓</button>` : ''}
                </div>
                ` : ''}
                <button type="button" onclick="editButton(${index})" class="btn-edit">Editar</button>
                <button type="button" onclick="deleteButton(${index})" class="btn-delete">Eliminar</button>
            </div>
        `;
        adminList.appendChild(item);
    });
}

// Subir botón en la lista
async function moveButtonUp(index) {
    if (index <= 0) return;
    try {
        const buttons = getButtonsFromStorage() || [];
        [buttons[index - 1], buttons[index]] = [buttons[index], buttons[index - 1]];
        saveButtons(buttons);
        cancelEditIfActive();
        loadAdminButtons();
        generateButtons(buttons);
        showNotification('Orden actualizado', 'success');
    } catch (err) {
        console.error('Error al cambiar orden:', err);
        showNotification('Error al cambiar orden. Intenta nuevamente.', 'error');
    }
}

// Bajar botón en la lista
async function moveButtonDown(index) {
    const buttons = getButtonsFromStorage() || [];
    if (index >= buttons.length - 1) return;
    try {
        [buttons[index], buttons[index + 1]] = [buttons[index + 1], buttons[index]];
        saveButtons(buttons);
        cancelEditIfActive();
        loadAdminButtons();
        generateButtons(buttons);
        showNotification('Orden actualizado', 'success');
    } catch (err) {
        console.error('Error al cambiar orden:', err);
        showNotification('Error al cambiar orden. Intenta nuevamente.', 'error');
    }
}

// Agregar nuevo botón
async function addButton() {
    const titleInput = document.getElementById('newButtonTitle');
    const linkInput = document.getElementById('newButtonLink');
    
    const title = titleInput.value.trim();
    const link = linkInput.value.trim();
    
    if (!title || !link) {
        showNotification('Por favor completa todos los campos', 'warning');
        return;
    }
    
    // Validar que el link tenga http:// o https://
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        showNotification('El link debe comenzar con http:// o https://', 'warning');
        return;
    }
    
    try {
        const buttons = getButtonsFromStorage() || [];
        buttons.push({ title, link });
        
        // Guardar en localStorage
        saveButtons(buttons);
        
        // Limpiar inputs
        titleInput.value = '';
        linkInput.value = '';
        
        // Recargar lista y botones principales
        loadAdminButtons();
        generateButtons(buttons);
        
        // Mostrar notificación de éxito
        showNotification('Botón agregado correctamente', 'success');
    } catch (error) {
        console.error('Error agregando botón:', error);
        showNotification('Error al agregar botón. Intenta nuevamente.', 'error');
    }
}

// Editar botón
let editingIndex = -1;

function editButton(index) {
    const buttons = getButtonsFromStorage() || [];
    const button = buttons[index];
    
    // Llenar formulario con datos del botón
    document.getElementById('newButtonTitle').value = button.title;
    document.getElementById('newButtonLink').value = button.link;
    
    // Cambiar título y botón de agregar a guardar
    document.getElementById('adminFormTitle').textContent = 'Editar Botón';
    const addButton = document.getElementById('addButtonBtn');
    addButton.textContent = 'Guardar Cambios';
    addButton.onclick = () => saveButtonEdit(index);
    
    // Scroll al formulario
    document.getElementById('newButtonTitle').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('newButtonTitle').focus();
    
    editingIndex = index;
}

// Guardar edición de botón
async function saveButtonEdit(index) {
    const titleInput = document.getElementById('newButtonTitle');
    const linkInput = document.getElementById('newButtonLink');
    
    const title = titleInput.value.trim();
    const link = linkInput.value.trim();
    
    if (!title || !link) {
        showNotification('Por favor completa todos los campos', 'warning');
        return;
    }
    
    // Validar que el link tenga http:// o https://
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        showNotification('El link debe comenzar con http:// o https://', 'warning');
        return;
    }
    
    try {
        const buttons = getButtonsFromStorage() || [];
        buttons[index] = { title, link };
        
        // Guardar en localStorage
        saveButtons(buttons);
        
        // Limpiar formulario y resetear botón
        titleInput.value = '';
        linkInput.value = '';
        document.getElementById('adminFormTitle').textContent = 'Agregar Nuevo Botón';
        const addButton = document.getElementById('addButtonBtn');
        addButton.textContent = 'Agregar Botón';
        addButton.onclick = addButton;
        editingIndex = -1;
        
        // Recargar lista y botones principales
        loadAdminButtons();
        generateButtons(buttons);
        
        // Mostrar notificación de éxito
        showNotification('Botón actualizado correctamente', 'success');
    } catch (error) {
        console.error('Error actualizando botón:', error);
        showNotification('Error al actualizar botón. Intenta nuevamente.', 'error');
    }
}

// Eliminar botón
async function deleteButton(index) {
    // Crear confirmación personalizada
    const confirmed = confirm('¿Estás seguro de que quieres eliminar este botón?');
    if (!confirmed) {
        return;
    }
    
    try {
        const buttons = getButtonsFromStorage() || [];
        buttons.splice(index, 1);
        
        // Guardar en localStorage
        saveButtons(buttons);
        
        // Recargar lista y botones principales
        loadAdminButtons();
        generateButtons(buttons);
        
        // Mostrar notificación de éxito
        showNotification('Botón eliminado correctamente', 'success');
    } catch (error) {
        console.error('Error eliminando botón:', error);
        showNotification('Error al eliminar botón. Intenta nuevamente.', 'error');
    }
}

// Cancelar modo edición al reordenar (evita guardar sobre el botón equivocado)
function cancelEditIfActive() {
    if (editingIndex < 0) return;
    editingIndex = -1;
    document.getElementById('newButtonTitle').value = '';
    document.getElementById('newButtonLink').value = '';
    document.getElementById('adminFormTitle').textContent = 'Agregar Nuevo Botón';
    const addBtn = document.getElementById('addButtonBtn');
    addBtn.textContent = 'Agregar Botón';
    addBtn.onclick = addButton;
}

// Configurar event listeners para Enter
function setupAdminEventListeners() {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginAdmin();
            }
        });
    }
    
    const newButtonTitle = document.getElementById('newButtonTitle');
    const newButtonLink = document.getElementById('newButtonLink');
    if (newButtonTitle && newButtonLink) {
        newButtonLink.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (editingIndex >= 0) {
                    saveButtonEdit(editingIndex);
                } else {
                    addButton();
                }
            }
        });
    }
}

