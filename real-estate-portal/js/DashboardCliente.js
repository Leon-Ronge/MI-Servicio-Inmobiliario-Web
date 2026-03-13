// Inicializar drag-scroll para servicios grid
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.servicios-grid');
    if (slider) {
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
    }
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
if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
        modalChecklist.style.display = 'flex';
    });
}

if (closeChecklist) {
    closeChecklist.addEventListener('click', () => {
        modalChecklist.style.display = 'none';
    });
}

if (modalChecklist) {
    window.addEventListener('click', (e) => {
        if (e.target == modalChecklist) modalChecklist.style.display = 'none';
    });
}

/* --- GENERACIÓN Y EDICIÓN DE CARDS --- */
if (btnGuardarServicios) {
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

        if (modalChecklist) {
            modalChecklist.style.display = 'none';
        }
    });
}

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
const infoAlquiler = document.getElementById('infoAlquiler');
const infoExpensas = document.getElementById('infoExpensas');

function actualizarInmueble(seleccionado) {
    const datos = datosInmuebles[seleccionado];
    if (datos) {
        infoDireccion.textContent = datos.direccion;
        infoEdificio.textContent = datos.edificio;
        infoDepto.textContent = datos.depto;
        infoPropietario.textContent = datos.propietario;

        // Cargar alquiler guardado por el admin desde localStorage
        const alquilerGuardado = localStorage.getItem('alquiler_' + seleccionado);
        if (infoAlquiler) {
            infoAlquiler.textContent = alquilerGuardado ? `$${alquilerGuardado}` : '$0';
        }

        // ── Cargar archivos adjuntos (Alquiler y Expensas) ──
        const gridArchivos = document.getElementById('gridArchivos');
        if (gridArchivos) {
            gridArchivos.innerHTML = ''; // Limpiar la grid
            
            let archivosEncontrados = false;
            
            // Buscar en localStorage todos los archivos para este inmueble
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // Buscar archivos de documento - formato: documento_archivo_[inmueble]_[timestamp]_[idx]
                if (key.startsWith('documento_archivo_' + seleccionado + '_')) {
                    try {
                        const archivoData = JSON.parse(localStorage.getItem(key));
                        
                        // Crear card del archivo
                        const archivoCard = document.createElement('div');
                        archivoCard.className = 'archivo-card';
                        
                        archivoCard.innerHTML = `
                            <div class="archivo-card-header">
                                <span class="archivo-card-fecha">${archivoData.fecha || 'Sin fecha'}</span>
                            </div>
                            <div class="archivo-card-body">
                                <div class="archivo-item">
                                    <div class="archivo-info">
                                        <i class="fas fa-file-alt archivo-icon"></i>
                                        <span class="archivo-nombre">${archivoData.nombre}</span>
                                    </div>
                                    <button class="btn-ver-archivo" data-key="${key}">
                                        <i class="fas fa-download"></i> Descargar
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        gridArchivos.appendChild(archivoCard);
                        archivosEncontrados = true;
                    } catch (e) {
                        console.error('Error al procesar archivo:', e);
                    }
                }
            }
            
            // Si no hay archivos, mostrar mensaje vacío
            if (!archivosEncontrados) {
                gridArchivos.innerHTML = '<div class="empty-state">No hay archivos adjuntos.</div>';
            }
        }
        
        // Cargar expensas guardadas por el admin desde localStorage o usar default ──
        const expensasGuardadas = localStorage.getItem('expensas_' + seleccionado);
        if (infoExpensas) {
            infoExpensas.textContent = expensasGuardadas ? `$${expensasGuardadas}` : datos.expensas_default;
        }

        // ── Alerta de aumento de alquiler ──
        const alertaAlquilerEl = document.getElementById('alquilerAlerta');
        const alertaAlquilerDetalleEl = document.getElementById('alquilerAlertaDetalle');
        const alertaAlquilerKey = 'alquiler_alerta_' + seleccionado;
        const alertaAlquilerData = localStorage.getItem(alertaAlquilerKey);

        if (alertaAlquilerEl && alertaAlquilerData) {
            const alerta = JSON.parse(alertaAlquilerData);
            alertaAlquilerDetalleEl.innerHTML =
                `<span class="alerta-monto-ant">$${alerta.anterior}</span>
                 <i class="fas fa-long-arrow-alt-right"></i>
                 <span class="alerta-monto-nuevo">$${alerta.nuevo}</span>
                 <span class="alerta-fecha">${alerta.fecha}</span>`;
            alertaAlquilerEl.style.display = 'flex';
            // Animación de entrada
            alertaAlquilerEl.classList.remove('alerta-visible');
            void alertaAlquilerEl.offsetWidth; // reflow para reiniciar animación
            alertaAlquilerEl.classList.add('alerta-visible');
        } else if (alertaAlquilerEl) {
            alertaAlquilerEl.style.display = 'none';
            alertaAlquilerEl.classList.remove('alerta-visible');
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

    // Botón cerrar alerta alquiler
    const btnCerrarAlquiler = document.getElementById('btnCerrarAlertaAlquiler');
    if (btnCerrarAlquiler) {
        btnCerrarAlquiler.addEventListener('click', () => {
            const inmuebleActual = selectorInmueble ? selectorInmueble.value : null;
            if (inmuebleActual) {
                localStorage.removeItem('alquiler_alerta_' + inmuebleActual);
            }
            const alertaEl = document.getElementById('alquilerAlerta');
            if (alertaEl) {
                alertaEl.classList.remove('alerta-visible');
                setTimeout(() => { alertaEl.style.display = 'none'; }, 300);
            }
        });
    }
});

// 3. Evento de cambio y cargar estado inicial
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('selectorInmueble');
    if (selector) {
        // Registrar evento de cambio
        selector.addEventListener('change', (e) => {
            actualizarInmueble(e.target.value);
        });
        
        // Cargar estado inicial
        actualizarInmueble(selector.value);
    }
    
    // Usar event delegation para descargas de archivos (una sola vez)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-ver-archivo')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-ver-archivo');
            const key = btn.getAttribute('data-key');
            const archivoData = JSON.parse(localStorage.getItem(key));
            
            if (archivoData && archivoData.base64) {
                // Convertir base64 a Blob y descargar
                const base64Data = archivoData.base64.includes(',') 
                    ? archivoData.base64.split(',')[1] 
                    : archivoData.base64;
                const mimeType = archivoData.tipo || 'application/octet-stream';
                
                try {
                    const byteChars = atob(base64Data);
                    const byteArray = new Uint8Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteArray[i] = byteChars.charCodeAt(i);
                    }
                    const blob = new Blob([byteArray], { type: mimeType });
                    const blobUrl = URL.createObjectURL(blob);
                    
                    // Crear un link temporal para descargar
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = archivoData.nombre || 'descarga';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                } catch (err) {
                    console.error('Error descargando archivo:', err);
                }
            }
        }
    });
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