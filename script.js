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

// Cargar datos desde Firestore (o localStorage como fallback)
async function loadData() {
    // Intentar cargar desde Firestore primero
    if (window.firebaseDb && window.firebaseFunctions) {
        try {
            await loadFromFirestore();
            // Escuchar cambios en tiempo real
            setupFirestoreListener();
            return;
        } catch (error) {
            console.warn('Error cargando desde Firestore, usando localStorage:', error);
        }
    }
    
    // Fallback: cargar desde localStorage
    let buttons = getButtonsFromStorage();
    
    // Si no hay datos en localStorage, array vacío
    if (!buttons || buttons.length === 0) {
        buttons = [];
    }
    
    // Generar botones
    generateButtons(buttons);
}

// Cargar desde Firestore
async function loadFromFirestore() {
    if (!window.firebaseDb || !window.firebaseFunctions) return;
    
    const { doc, getDoc } = window.firebaseFunctions;
    const buttonsRef = doc(window.firebaseDb, 'config', 'buttons');
    
    try {
        const docSnap = await getDoc(buttonsRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const buttons = data.buttons || [];
            generateButtons(buttons);
            // También guardar en localStorage como cache
            saveButtonsToStorage(buttons);
        } else {
            // Si no existe, crear con datos de localStorage si existen
            const defaultButtons = getButtonsFromStorage() || [];
            if (defaultButtons.length > 0) {
                await saveToFirestore(defaultButtons);
                generateButtons(defaultButtons);
            } else {
                // Si no hay datos, crear documento vacío
                await saveToFirestore([]);
                generateButtons([]);
            }
        }
    } catch (error) {
        console.error('Error cargando desde Firestore:', error);
        throw error;
    }
}

// Guardar en Firestore
async function saveToFirestore(buttons) {
    if (!window.firebaseDb || !window.firebaseFunctions) {
        // Fallback a localStorage si Firebase no está disponible
        saveButtonsToStorage(buttons);
        return;
    }
    
    const { doc, setDoc } = window.firebaseFunctions;
    const buttonsRef = doc(window.firebaseDb, 'config', 'buttons');
    
    try {
        await setDoc(buttonsRef, { buttons: buttons });
        // También guardar en localStorage como cache
        saveButtonsToStorage(buttons);
    } catch (error) {
        console.error('Error guardando en Firestore:', error);
        // Fallback a localStorage
        saveButtonsToStorage(buttons);
        throw error;
    }
}

// Escuchar cambios en tiempo real desde Firestore
function setupFirestoreListener() {
    if (!window.firebaseDb || !window.firebaseFunctions) return;
    
    const { doc, onSnapshot } = window.firebaseFunctions;
    const buttonsRef = doc(window.firebaseDb, 'config', 'buttons');
    
    onSnapshot(buttonsRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const buttons = data.buttons || [];
            generateButtons(buttons);
            // Actualizar cache en localStorage
            saveButtonsToStorage(buttons);
        }
    }, (error) => {
        console.error('Error en listener de Firestore:', error);
    });
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
    setupLogoAdminAccess();
    
    // Esperar a que Splide esté disponible
    if (typeof Splide !== 'undefined') {
        initCarousel();
    } else {
        // Si Splide no está cargado, esperar un poco más
        setTimeout(() => {
            if (typeof Splide !== 'undefined') {
                initCarousel();
            } else {
                console.error('Splide no está disponible');
            }
        }, 100);
    }
});

// Inicializar carrusel con Splide
function initCarousel() {
    const element = document.querySelector('#carousel-splide');
    if (!element) {
        console.error('Elemento del carrusel no encontrado');
        return;
    }
    
    const splide = new Splide('#carousel-splide', {
        type: 'loop',
        perPage: 9,
        perMove: 1,
        gap: '10px',
        autoplay: true,
        interval: 1100, 
        speed: 12000,
        pauseOnHover: false,
        pauseOnFocus: false,
        drag: 'free',
        arrows: false,
        pagination: false,
        wheel: false,
        breakpoints: {
            768: {
                perPage: 3,
                gap: '10px',
            }
        }
    });
    
    splide.mount();
}

// ========== PANEL DE ADMINISTRACIÓN ==========

// Acceso secreto: doble click/toque o toque largo en el logo
let logoClickCount = 0;
let logoClickTimer = null;
let longPressTimer = null;
let isLongPress = false;

function setupLogoAdminAccess() {
    const logo = document.getElementById('logoAdminAccess');
    if (!logo) return;
    
    // Función para manejar doble click/toque
    const handleDoubleTap = () => {
        logoClickCount++;
        
        // Resetear contador después de 500ms
        clearTimeout(logoClickTimer);
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
        }, 500);
        
        // Si se hace doble click/toque, abrir panel
        if (logoClickCount === 2) {
            logoClickCount = 0;
            clearTimeout(logoClickTimer);
            toggleAdminLogin();
        }
    };
    
    // Evento para desktop (click)
    logo.addEventListener('click', (e) => {
        // Solo si no fue un toque largo
        if (!isLongPress) {
            handleDoubleTap();
        }
        isLongPress = false;
    });
    
    // Eventos para móvil (touch)
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    
    logo.addEventListener('touchstart', (e) => {
        isLongPress = false;
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        // Iniciar timer para toque largo (1 segundo)
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            toggleAdminLogin();
        }, 1000);
    }, { passive: true });
    
    logo.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimer);
        
        // Si no fue un toque largo, verificar si fue doble toque
        if (!isLongPress) {
            const touchDuration = Date.now() - touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Si el toque fue corto y no se movió mucho, contar como toque
            if (touchDuration < 300 && 
                Math.abs(touchEndX - touchStartX) < 10 && 
                Math.abs(touchEndY - touchStartY) < 10) {
                handleDoubleTap();
            }
        }
        
        isLongPress = false;
    }, { passive: true });
    
    logo.addEventListener('touchmove', (e) => {
        // Si se mueve el dedo, cancelar toque largo
        clearTimeout(longPressTimer);
    }, { passive: true });
    
    // Prevenir el menú contextual en toque largo
    logo.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
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
        item.innerHTML = `
            <div class="admin-button-info">
                <strong>${button.title}</strong>
                <span>${button.link}</span>
            </div>
            <div class="admin-button-actions">
                <button onclick="editButton(${index})" class="btn-edit">Editar</button>
                <button onclick="deleteButton(${index})" class="btn-delete">Eliminar</button>
            </div>
        `;
        adminList.appendChild(item);
    });
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
        
        // Guardar en Firestore (o localStorage como fallback)
        await saveToFirestore(buttons);
        
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
        
        // Guardar en Firestore (o localStorage como fallback)
        await saveToFirestore(buttons);
        
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
        
        // Guardar en Firestore (o localStorage como fallback)
        await saveToFirestore(buttons);
        
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

