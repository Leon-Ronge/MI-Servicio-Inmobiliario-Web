const slider = document.querySelector('.servicios-grid');

let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');

    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
});

slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
});

slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX);

    slider.scrollLeft = scrollLeft - walk;
});

const datosServicios = {
    luz: {
        nombre: 'Electricidad',
        proveedor: 'EPEC',
        icon: '⚡',
        url: 'https://www.epec.com.ar/'
    },
    gas: {
        nombre: 'Gas',
        proveedor: 'Ecogas',
        icon: '🔥',
        url: 'https://www.ecogas.com.ar/'
    },
    agua: {
        nombre: 'Agua',
        proveedor: 'Aguas Cordobesas',
        icon: '💧',
        url: 'https://www.aguascordobesas.com.ar/'
    },
    admin: {
        nombre: 'Administración',
        proveedor: 'Consorcio',
        icon: '🏢',
        url: 'https://www.google.com'
    },
    internet: {
        nombre: 'Internet',
        proveedor: '',
        icon: '🌐',
        url: ''
    }

};

/* --- ELEMENTOS DOM --- */
const modalChecklist = document.getElementById('modalChecklist');
const btnAgregar = document.getElementById('btnAgregarServicio');
const btnGuardarServicios = document.getElementById('btnGuardarServicios');
const gridServicios = document.getElementById('gridServicios');
const closeChecklist = document.querySelector('.close-checklist');

/* --- MANEJO DEL MODAL --- */
btnAgregar.addEventListener('click', () => {
    modalChecklist.style.display = 'flex';
});

closeChecklist.addEventListener('click', () => {
    modalChecklist.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modalChecklist) modalChecklist.style.display = 'none';
});

/* --- GENERACIÓN Y EDICIÓN DE CARDS --- */
btnGuardarServicios.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.checklist-container input[type="checkbox"]:checked');
    const checkedValues = Array.from(checkboxes).map(cb => cb.value);
    // 1. Eliminar cards no seleccionadas
    const currentCards = document.querySelectorAll('.service-card-simple');
    currentCards.forEach(card => {
        const id = card.getAttribute('data-id');
        if (!checkedValues.includes(id)) {
            card.remove();
        }
    });
    // 2. Mostrar mensaje si no hay servicios seleccionados
    if (checkedValues.length === 0) {
        gridServicios.innerHTML = '<div class="empty-state">No hay servicios seleccionados.</div>';
    } else {
        const emptyMsg = gridServicios.querySelector('.empty-state');
        if (emptyMsg) emptyMsg.remove();
    }
    // 3. Agregar nuevas cards seleccionadas
    checkboxes.forEach(chk => {
        const key = chk.value;
        const existingCard = gridServicios.querySelector(`.service-card-simple[data-id="${key}"]`);

        if (!existingCard) {
            const data = datosServicios[key];
            if (data) {
                crearCard(key, data);
            }
        }
    });

    modalChecklist.style.display = 'none';
});

function crearCard(key, data) {
    const card = document.createElement('div');
    card.className = 'service-card-simple';
    card.setAttribute('data-id', key);

    card.innerHTML = `
        <div class="card-actions">
            <button class="action-btn btn-toggle-edit" title="Editar">✏️</button>
        </div>

        <div class="view-mode-container">
            <div class="card-header-simple">
                <div class="service-icon">${data.icon}</div>
                <div class="service-titles">
                    <span class="service-name">${data.nombre}</span>
                    <span class="service-provider">${data.proveedor}</span>
                </div>
            </div>
            <a href="${data.url}" target="_blank" class="btn-ir-web">
                Ir al sitio
            </a>
        </div>

        <div class="edit-mode-container">
            <label style="font-size:0.75rem; font-weight:bold; color:#666;">Servicio:</label>
            <input type="text" class="edit-input input-name" value="${data.nombre}">
            
            <label style="font-size:0.75rem; font-weight:bold; color:#666;">Proveedor:</label>
            <input type="text" class="edit-input input-provider" value="${data.proveedor}">

            <label style="font-size:0.75rem; font-weight:bold; color:#666;">Enlace (URL):</label>
            <input type="text" class="edit-input input-url" value="${data.url}">
            
            <div class="edit-buttons">
                <button class="btn-save">Guardar</button>
                <button class="btn-cancel">Cancelar</button>
            </div>
        </div>
    `;

    gridServicios.appendChild(card);
    agregarLogicaEdicion(card);
}

function agregarLogicaEdicion(cardElement) {
    const btnEdit = cardElement.querySelector('.btn-toggle-edit');
    const btnSave = cardElement.querySelector('.btn-save');
    const btnCancel = cardElement.querySelector('.btn-cancel');

    // Elementos de Vista
    const viewName = cardElement.querySelector('.service-name');
    const viewProvider = cardElement.querySelector('.service-provider');
    const viewLink = cardElement.querySelector('.btn-ir-web');

    // Elementos de Input
    const inputName = cardElement.querySelector('.input-name');
    const inputProvider = cardElement.querySelector('.input-provider');
    const inputUrl = cardElement.querySelector('.input-url');

    // 1. Editar
    btnEdit.addEventListener('click', () => {
        cardElement.classList.add('is-editing');
        btnEdit.style.display = 'none';
    });

    // 2. Guardar
    btnSave.addEventListener('click', () => {
        viewName.textContent = inputName.value;
        viewProvider.textContent = inputProvider.value;
        viewLink.href = inputUrl.value;

        cardElement.classList.remove('is-editing');
        btnEdit.style.display = 'block';
    });

    // 3. Cancelar
    btnCancel.addEventListener('click', () => {
        inputName.value = viewName.textContent;
        inputProvider.value = viewProvider.textContent;
        inputUrl.value = viewLink.getAttribute('href');

        cardElement.classList.remove('is-editing');
        btnEdit.style.display = 'block';
    });
}

/* --- LOGICA DE INMUEBLES --- */

// 1. Base de datos de inmuebles
const datosInmuebles = {
    fragueiro: {
        direccion: "Mariano Fragueiro 185/187",
        edificio: "San Marcos",
        depto: "10 C",
        propietario: "León Rongé",
        expensas_default: "$45.000"
    },
    urquiza: {
        direccion: "Justo J. de Urquiza 184",
        edificio: "Torre Urquiza",
        depto: "4 A",
        propietario: "León Rongé",
        expensas_default: "$52.000"
    }
};

// 2. DOM
const selectorInmueble = document.getElementById('selectorInmueble');
const infoDireccion = document.getElementById('infoDireccion');
const infoEdificio = document.getElementById('infoEdificio');
const infoDepto = document.getElementById('infoDepto');
const infoPropietario = document.getElementById('infoPropietario');
const infoExpensas = document.getElementById('infoExpensas');

function actualizarInmueble(seleccionado) {
    const datos = datosInmuebles[seleccionado];
    if (datos) {
        infoDireccion.textContent = datos.direccion;
        infoEdificio.textContent = datos.edificio;
        infoDepto.textContent = datos.depto;
        infoPropietario.textContent = datos.propietario;

        // Cargar expensas guardadas por el admin desde localStorage o usar default
        const expensasGuardadas = localStorage.getItem('expensas_' + seleccionado);
        if (infoExpensas) {
            infoExpensas.textContent = expensasGuardadas ? `$${expensasGuardadas}` : datos.expensas_default;
        }

        // ── Alerta de aumento de expensas ──
        const alertaEl = document.getElementById('expensasAlerta');
        const alertaDetalleEl = document.getElementById('expensasAlertaDetalle');
        const alertaKey = 'expensas_alerta_' + seleccionado;
        const alertaData = localStorage.getItem(alertaKey);

        if (alertaEl && alertaData) {
            const alerta = JSON.parse(alertaData);
            alertaDetalleEl.innerHTML =
                `<span class="alerta-monto-ant">$${alerta.anterior}</span>
                 <i class="fas fa-long-arrow-alt-right"></i>
                 <span class="alerta-monto-nuevo">$${alerta.nuevo}</span>
                 <span class="alerta-fecha">${alerta.fecha}</span>`;
            alertaEl.style.display = 'flex';
            // Animación de entrada
            alertaEl.classList.remove('alerta-visible');
            void alertaEl.offsetWidth; // reflow para reiniciar animación
            alertaEl.classList.add('alerta-visible');
        } else if (alertaEl) {
            alertaEl.style.display = 'none';
            alertaEl.classList.remove('alerta-visible');
        }
    }
}

// Botón cerrar alerta expensas
document.addEventListener('DOMContentLoaded', () => {
    const btnCerrar = document.getElementById('btnCerrarAlertaExpensas');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            const inmuebleActual = selectorInmueble ? selectorInmueble.value : null;
            if (inmuebleActual) {
                localStorage.removeItem('expensas_alerta_' + inmuebleActual);
            }
            const alertaEl = document.getElementById('expensasAlerta');
            if (alertaEl) {
                alertaEl.classList.remove('alerta-visible');
                setTimeout(() => { alertaEl.style.display = 'none'; }, 300);
            }
        });
    }
});

// 3. Evento de cambio
selectorInmueble.addEventListener('change', (e) => {
    actualizarInmueble(e.target.value);
});

// Cargar estado inicial
document.addEventListener('DOMContentLoaded', () => {
    if (selectorInmueble) {
        actualizarInmueble(selectorInmueble.value);
    }
});

/* ===== NOTIFICACIONES DEL ADMIN ===== */
(function () {
    const CLIENTE_KEY = 'leon'; // Clave del cliente logueado
    const STORAGE_KEY = `msgs_${CLIENTE_KEY}`;

    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');
    const btnMarcar = document.getElementById('btnMarcarLeidos');

    // Datos de inmuebles para mostrar nombre completo
    const inmuebleLabels = {
        fragueiro: 'Mariano Fragueiro 185',
        urquiza: 'Justo J. de Urquiza 184',
        general: 'General'
    };

    function cargarNotifs() {
        const msgs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        const noLeidos = msgs.filter(m => !m.leido).length;
        notifBadge.textContent = noLeidos;
        notifBadge.className = 'notif-badge' + (noLeidos === 0 ? ' zero' : '');

        if (msgs.length === 0) {
            notifList.innerHTML = `
                <div class="notif-empty">
                    <i class="fas fa-inbox"></i>
                    No tenés notificaciones del administrador.
                </div>`;
            return;
        }

        notifList.innerHTML = msgs.map(m => {
            const label = inmuebleLabels[m.inmueble] || m.inmLabel || m.inmueble;
            const esGeneral = m.inmueble === 'general';
            const leidoClass = m.leido ? 'leido' : '';
            const dot = !m.leido ? '<span class="notif-unread-dot"></span>' : '';
            return `
                <div class="notif-item ${leidoClass}">
                    <div class="notif-item-text">${dot}${m.texto}</div>
                    <div class="notif-item-meta">
                        <span class="notif-prop-badge ${esGeneral ? 'general' : ''}">
                            <i class="fas fa-home"></i> ${label}
                        </span>
                        <span style="display:flex;align-items:center;gap:8px;">
                            <span class="notif-date" style="display:flex;align-items:center;gap:4px;">
                                <i class="fas fa-user-shield" style="color:var(--color-orange);font-size:0.7rem;"></i>
                                ${m.remitente || 'Administración'}
                            </span>
                            <span class="notif-date">${m.fecha}</span>
                        </span>
                    </div>
                </div>`;
        }).join('');
    }

    // Marcar todas como leídas
    btnMarcar.addEventListener('click', () => {
        const msgs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updated = msgs.map(m => ({ ...m, leido: true }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        cargarNotifs();
    });

    // Cargar al inicio
    cargarNotifs();

    // Escuchar cambios en localStorage (por si admin está abierto en otra pestaña)
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) cargarNotifs();
    });
})();