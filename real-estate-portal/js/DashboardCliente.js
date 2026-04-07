// ============================================================
//  DATOS Y CONFIGURACIÓN GLOBAL
// ============================================================

const CLIENTE_KEY = 'leon'; // Clave del cliente logueado

// Datos de servicios
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

// Base de datos de inmuebles
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

// Datos de inmuebles para notificaciones
const inmuebleLabels = {
    fragueiro: 'Mariano Fragueiro 185',
    urquiza: 'Justo J. de Urquiza 184',
    general: 'General'
};

// ============================================================
//  FUNCIONES DE SERVICIOS
// ============================================================

function crearCard(key, data) {
    const gridServicios = document.getElementById('gridServicios');
    if (!gridServicios) return;
    
    const card = document.createElement('div');
    card.className = 'service-card-simple';
    card.setAttribute('data-id', key);

    card.innerHTML = `
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
    `;

    gridServicios.appendChild(card);
}

function cargarServiciosDelAdmin(inmuebleKey) {
    const gridServicios = document.getElementById('gridServicios');
    if (!gridServicios) return;
    
    // Obtener servicios guardados por el admin para este inmueble
    const storageKey = 'servicios_' + CLIENTE_KEY + '_' + inmuebleKey;
    const serviciosGuardados = JSON.parse(localStorage.getItem(storageKey) || '["luz"]');
    
    // Limpiar grid
    gridServicios.innerHTML = '';
    
    if (serviciosGuardados.length === 0) {
        gridServicios.innerHTML = '<div class="empty-state">No hay servicios disponibles.</div>';
        return;
    }
    
    // Crear cards para cada servicio guardado
    serviciosGuardados.forEach(servicioKey => {
        const datosOriginales = datosServicios[servicioKey];
        if (!datosOriginales) return;
        
        // Obtener datos editados por el admin o usar los originales
        const storageKeyDatos = 'servicio_datos_' + CLIENTE_KEY + '_' + inmuebleKey + '_' + servicioKey;
        const datosEditados = JSON.parse(localStorage.getItem(storageKeyDatos) || 'null');
        const datos = datosEditados || datosOriginales;
        
        crearCard(servicioKey, datos);
    });
}

// ============================================================
//  FUNCIONES DE INMUEBLES
// ============================================================

function actualizarInmueble(seleccionado) {
    const selectorInmueble = document.getElementById('selectorInmueble');
    const infoDireccion = document.getElementById('infoDireccion');
    const infoEdificio = document.getElementById('infoEdificio');
    const infoDepto = document.getElementById('infoDepto');
    const infoPropietario = document.getElementById('infoPropietario');
    const infoAlquiler = document.getElementById('infoAlquiler');
    const infoExpensas = document.getElementById('infoExpensas');
    
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

        // Cargar archivos adjuntos
        const gridArchivos = document.getElementById('gridArchivos');
        if (gridArchivos) {
            gridArchivos.innerHTML = '';
            
            let archivosEncontrados = false;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key.startsWith('documento_archivo_' + seleccionado + '_')) {
                    try {
                        const archivoData = JSON.parse(localStorage.getItem(key));
                        
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
            
            if (!archivosEncontrados) {
                gridArchivos.innerHTML = '<div class="empty-state">No hay archivos adjuntos.</div>';
            }
        }
        
        // Cargar expensas
        const expensasGuardadas = localStorage.getItem('expensas_' + seleccionado);
        if (infoExpensas) {
            infoExpensas.textContent = expensasGuardadas ? `$${expensasGuardadas}` : datos.expensas_default;
        }

        // Alerta de aumento de alquiler
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
            alertaAlquilerEl.classList.remove('alerta-visible');
            void alertaAlquilerEl.offsetWidth;
            alertaAlquilerEl.classList.add('alerta-visible');
        } else if (alertaAlquilerEl) {
            alertaAlquilerEl.style.display = 'none';
            alertaAlquilerEl.classList.remove('alerta-visible');
        }

        // Alerta de aumento de expensas
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
            alertaEl.classList.remove('alerta-visible');
            void alertaEl.offsetWidth;
            alertaEl.classList.add('alerta-visible');
        } else if (alertaEl) {
            alertaEl.style.display = 'none';
            alertaEl.classList.remove('alerta-visible');
        }
    }
}

// ============================================================
//  INICIALIZACIÓN - ÚNICO LISTENER DE DOMC ONTENLOADED
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. DRAG-SCROLL para servicios grid
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

    // 2. SERVICIOS - Cargar desde admin
    // Se cargan cuando se selecciona un inmueble

    // 3. INMUEBLES - Selector y alertas
    const selectorInmueble = document.getElementById('selectorInmueble');
    if (selectorInmueble) {
        // Event listener para cambios de inmueble
        selectorInmueble.addEventListener('change', (e) => {
            actualizarInmueble(e.target.value);
            cargarServiciosDelAdmin(e.target.value);
        });
        
        // Cargar estado inicial
        const inmuebleInicial = selectorInmueble.value;
        actualizarInmueble(inmuebleInicial);
        cargarServiciosDelAdmin(inmuebleInicial);
    }

    // 4. BOTONES DE CERRAR ALERTAS
    const btnCerrarExpensas = document.getElementById('btnCerrarAlertaExpensas');
    if (btnCerrarExpensas) {
        btnCerrarExpensas.addEventListener('click', () => {
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

    // 5. DESCARGAS DE ARCHIVOS
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-ver-archivo')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-ver-archivo');
            const key = btn.getAttribute('data-key');
            const archivoData = JSON.parse(localStorage.getItem(key));
            
            if (archivoData && archivoData.base64) {
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