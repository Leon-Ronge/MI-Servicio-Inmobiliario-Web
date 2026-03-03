document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  ALERTA PERSONALIZADA
    // ============================================================
    const caOverlay = document.getElementById('customAlertOverlay');
    const caBox = document.getElementById('customAlertBox');
    const caIcon = document.getElementById('customAlertIcon');
    const caMsg = document.getElementById('customAlertMsg');
    const caBtn = document.getElementById('customAlertBtn');

    const TIPOS = {
        warning: { clase: 'ca-warning', icon: 'fas fa-exclamation-triangle' },
        error: { clase: 'ca-error', icon: 'fas fa-times-circle' },
        info: { clase: 'ca-info', icon: 'fas fa-info-circle' }
    };

    function mostrarAlerta(mensaje, tipo = 'warning') {
        const t = TIPOS[tipo] || TIPOS.warning;
        caBox.className = 'custom-alert-box ' + t.clase;
        caIcon.className = 'custom-alert-icon ' + t.icon;
        caMsg.textContent = mensaje;
        caOverlay.classList.add('active');
    }

    if (caBtn) {
        caBtn.addEventListener('click', () => caOverlay.classList.remove('active'));
    }
    if (caOverlay) {
        caOverlay.addEventListener('click', (e) => {
            if (e.target === caOverlay) caOverlay.classList.remove('active');
        });
    }

    // ============================================================
    //  BASE DE DATOS DE CLIENTES E INMUEBLES (GLOBAL)
    // ============================================================
    const clientesData = {
        leon: { nombre: 'León Rongé', inmuebles: [{ key: 'fragueiro', label: 'Mariano Fragueiro 185' }, { key: 'urquiza', label: 'Justo J. de Urquiza 184' }] },
        martin: { nombre: 'Martín Guerrero', inmuebles: [{ key: 'oroño_1245', label: 'Bv. Oroño 1245' }] },
        valeria: { nombre: 'Valeria Suárez', inmuebles: [{ key: 'san_martin_78', label: 'San Martín 78' }, { key: 'pellegrini_310', label: 'Pellegrini 310, 3°B' }] },
        carlos: { nombre: 'Carlos Ibáñez', inmuebles: [{ key: 'mitre_560', label: 'Bartolomé Mitre 560' }] },
        lucia: { nombre: 'Lucía Ferreyra', inmuebles: [{ key: 'alvear_90', label: 'Marcelo T. de Alvear 90' }, { key: 'rioja_412', label: 'La Rioja 412, PB' }, { key: 'catamarca_88', label: 'Catamarca 88' }] },
        diego: { nombre: 'Diego Romero', inmuebles: [{ key: 'cordoba_1700', label: 'Av. Córdoba 1700, 5°A' }] },
        florencia: { nombre: 'Florencia Méndez', inmuebles: [{ key: 'italia_233', label: 'Italia 233' }, { key: 'tucuman_850', label: 'Tucumán 850, 2°C' }] },
        roberto: { nombre: 'Roberto Acosta', inmuebles: [{ key: 'sarmiento_1010', label: 'Sarmiento 1010' }] },
        ana: { nombre: 'Ana Paula Vega', inmuebles: [{ key: 'belgrano_455', label: 'Belgrano 455, 1°A' }, { key: 'ayacucho_22', label: 'Ayacucho 22' }] },
        javier: { nombre: 'Javier Domínguez', inmuebles: [{ key: 'maipu_640', label: 'Maipú 640' }, { key: 'rioja_99', label: 'La Rioja 99, 4°B' }, { key: 'moreno_300', label: 'Moreno 300' }] }
    };

    // Estado global
    let selectedClienteKey = null;
    let selectedExpInmueble = null; // { key, label } para expensas
    let selectedMsgInmueble = null; // { key, label } para mensajes

    // Cards
    const cardExpensas = document.getElementById('cardExpensas');
    const cardMensajes = document.getElementById('cardMensajes');

    // ============================================================
    //  HELPER: AUTOCOMPLETE GENERICO
    //  Crea un autocomplete reutilizable para cliente e inmueble
    // ============================================================
    function crearAutocomplete({ inputEl, dropdownEl, chevronEl, getItems, onSelect, searchable = true }) {
        let focusedIdx = -1;

        function highlight(text, q) {
            if (!q || !searchable) return text;
            const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(re, '<mark>$1</mark>');
        }

        function renderItems(query) {
            const q = query.trim().toLowerCase();
            const items = getItems().filter(it =>
                !searchable || it.label.toLowerCase().includes(q)
            );
            if (items.length === 0) {
                dropdownEl.innerHTML = '<div class="autocomplete-empty">Sin resultados</div>';
            } else {
                dropdownEl.innerHTML = items.map((it, i) =>
                    `<div class="autocomplete-option" data-key="${it.key}" data-label="${it.label}" data-idx="${i}">
                        <i class="fas ${it.icon || 'fa-home'}"></i> ${highlight(it.label, q)}
                    </div>`
                ).join('');
                dropdownEl.querySelectorAll('.autocomplete-option').forEach(opt => {
                    opt.addEventListener('mousedown', e => {
                        e.preventDefault();
                        onSelect(opt.dataset.key, opt.dataset.label);
                        cerrar();
                    });
                });
            }
            focusedIdx = -1;
            dropdownEl.classList.add('open');
            if (chevronEl) chevronEl.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }

        function cerrar() {
            dropdownEl.classList.remove('open');
            if (chevronEl) chevronEl.classList.replace('fa-chevron-up', 'fa-chevron-down');
            focusedIdx = -1;
        }

        inputEl.addEventListener('input', () => renderItems(inputEl.value));
        inputEl.addEventListener('focus', () => renderItems(inputEl.value));
        inputEl.addEventListener('blur', () => setTimeout(cerrar, 150));
        inputEl.addEventListener('keydown', e => {
            const opts = dropdownEl.querySelectorAll('.autocomplete-option');
            if (!opts.length) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); focusedIdx = Math.min(focusedIdx + 1, opts.length - 1); opts.forEach((o, i) => o.classList.toggle('focused', i === focusedIdx)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); focusedIdx = Math.max(focusedIdx - 1, 0); opts.forEach((o, i) => o.classList.toggle('focused', i === focusedIdx)); }
            else if (e.key === 'Enter' && focusedIdx >= 0) { e.preventDefault(); const opt = opts[focusedIdx]; onSelect(opt.dataset.key, opt.dataset.label); cerrar(); }
            else if (e.key === 'Escape') cerrar();
        });

        return { renderItems, cerrar };
    }

    // ============================================================
    //  AUTOCOMPLETE — CLIENTE (global)
    // ============================================================
    const clienteInput = document.getElementById('clienteInput');
    const clienteDropdown = document.getElementById('clienteDropdown');
    const clienteChevron = document.getElementById('clienteChevron');

    crearAutocomplete({
        inputEl: clienteInput,
        dropdownEl: clienteDropdown,
        chevronEl: clienteChevron,
        searchable: true,
        getItems: () => Object.entries(clientesData).map(([key, d]) => ({ key, label: d.nombre, icon: 'fa-user' })),
        onSelect: (key, label) => {
            clienteInput.value = label;
            if (selectedClienteKey !== key) {
                selectedClienteKey = key;
                alSeleccionarCliente(key);
            }
        }
    });

    // Si se borra el texto → resetear todo
    clienteInput.addEventListener('input', () => {
        const match = Object.entries(clientesData).find(([, d]) => d.nombre === clienteInput.value);
        if (!match) {
            selectedClienteKey = null;
            resetTodo();
        }
    });
    clienteInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (!selectedClienteKey) { clienteInput.value = ''; resetTodo(); }
        }, 200);
    });

    // ============================================================
    //  AUTOCOMPLETE — INMUEBLE EXPENSAS
    // ============================================================
    const expInmuebleInput = document.getElementById('expInmuebleInput');
    const expInmuebleDropdown = document.getElementById('expInmuebleDropdown');
    const expInmuebleChevron = document.getElementById('expInmuebleChevron');
    const montoExpensas = document.getElementById('montoExpensas');
    const btnGuardarExpensas = document.getElementById('btnGuardarExpensas');
    const successMsgExpensas = document.getElementById('successMsgExpensas');

    // ── Helpers de formateo estilo argentino (1.234.567,89) ──────────────
    function formatearMonto(valor) {
        // Recibe un número o string numérico, devuelve string formateado
        const num = parseFloat(String(valor).replace(',', '.'));
        if (isNaN(num)) return '';
        return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function parsearMonto(str) {
        // Convierte "1.234.567,89" → 1234567.89
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    }

    // Formateo en tiempo real mientras el usuario escribe
    montoExpensas.addEventListener('input', () => {
        const raw = montoExpensas.value;
        // Extraer solo dígitos y una coma (parte decimal)
        const onlyDigits = raw.replace(/[^0-9,]/g, '');
        const parts = onlyDigits.split(',');
        const intPart = parts[0].replace(/^0+(?=\d)/, '') || '0';
        const decPart = parts.length > 1 ? parts[1].slice(0, 2) : null;

        // Formatear parte entera con puntos de miles
        const intFormatted = Number(intPart).toLocaleString('es-AR');

        // Reconstruir valor
        montoExpensas.value = decPart !== null
            ? intFormatted + ',' + decPart
            : intFormatted === '0' ? '' : intFormatted;
    });

    // Bloquear teclas no permitidas
    montoExpensas.addEventListener('keydown', (e) => {
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End', 'F5'];
        const isDigit = /^[0-9]$/.test(e.key);
        const isComa = e.key === ',';
        const hasComa = montoExpensas.value.includes(',');
        if (!isDigit && !isComa && !allowed.includes(e.key)) e.preventDefault();
        if (isComa && hasComa) e.preventDefault();
    });

    crearAutocomplete({
        inputEl: expInmuebleInput,
        dropdownEl: expInmuebleDropdown,
        chevronEl: expInmuebleChevron,
        searchable: false, // pocos items, no necesita filtro
        getItems: () => {
            if (!selectedClienteKey) return [];
            return clientesData[selectedClienteKey].inmuebles.map(inm => ({ key: inm.key, label: inm.label, icon: 'fa-home' }));
        },
        onSelect: (key, label) => {
            expInmuebleInput.value = label;
            selectedExpInmueble = { key, label };
            // Cargar monto guardado para ese inmueble (ya guardado con formato es-AR)
            const monto = localStorage.getItem('expensas_' + key);
            montoExpensas.value = monto || '';
            // Cargar archivo si ya fue subido previamente
            const archivoGuardado = localStorage.getItem('expensas_archivo_' + key);
            if (archivoGuardado) {
                const datos = JSON.parse(archivoGuardado);
                mostrarChipArchivo(datos.nombre);
            } else {
                limpiarArchivo();
            }
        }
    });

    btnGuardarExpensas.addEventListener('click', () => {
        if (!selectedExpInmueble) { mostrarAlerta('Seleccioná un inmueble primero.', 'warning'); return; }
        const rawMonto = montoExpensas.value.trim();
        const montoNuevo = parsearMonto(rawMonto);
        if (!rawMonto || isNaN(montoNuevo) || montoNuevo < 0) { mostrarAlerta('Por favor ingresá un monto válido.', 'error'); return; }

        const storageKey = 'expensas_' + selectedExpInmueble.key;
        const montoAnteriorStr = localStorage.getItem(storageKey);

        // Convertir el monto anterior guardado (formato "52.000,00") a número
        let montoAnterior = 0;
        if (montoAnteriorStr) {
            montoAnterior = parsearMonto(montoAnteriorStr);
        }

        const montoFormat = formatearMonto(montoNuevo);
        localStorage.setItem(storageKey, montoFormat);

        // Si el monto AUMENTÓ, guardar alerta para el cliente
        if (montoNuevo > montoAnterior && montoAnterior > 0) {
            const alertaKey = 'expensas_alerta_' + selectedExpInmueble.key;
            const alerta = {
                anterior: montoAnteriorStr,
                nuevo: montoFormat,
                inmLabel: selectedExpInmueble.label,
                fecha: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
            };
            localStorage.setItem(alertaKey, JSON.stringify(alerta));
        }

        mostrarToast(successMsgExpensas);
    });

    // ============================================================
    //  MENSAJES
    // ============================================================
    const inmueblePreview = document.getElementById('inmueblePreview');
    const previewItems = document.getElementById('previewItems');
    const msgTextGroup = document.getElementById('msgTextGroup');
    const msgTexto = document.getElementById('msgTexto');
    const btnEnviarMsg = document.getElementById('btnEnviarMsg');
    const successMsgNotif = document.getElementById('successMsgNotif');
    const msgHistory = document.getElementById('msgHistory');
    const msgList = document.getElementById('msgList');

    // ── UPLOAD DE ARCHIVO ──────────────────────────────────────────
    const uploadZone = document.getElementById('uploadZone');
    const archivoInput = document.getElementById('archivoInput');
    const uploadZoneContent = document.getElementById('uploadZoneContent');
    const uploadFileChip = document.getElementById('uploadFileChip');
    const chipFileName = document.getElementById('chipFileName');
    const btnRemoveFile = document.getElementById('btnRemoveFile');
    const msgArchivoGroup = document.getElementById('msgArchivoGroup');

    function mostrarChipArchivo(nombre) {
        chipFileName.textContent = nombre;
        uploadZoneContent.style.display = 'none';
        uploadFileChip.style.display = 'flex';
        uploadZone.classList.add('has-file');
    }

    function limpiarArchivo() {
        archivoInput.value = '';
        chipFileName.textContent = '';
        uploadFileChip.style.display = 'none';
        uploadZoneContent.style.display = 'flex';
        uploadZone.classList.remove('has-file', 'drag-over');
    }

    function guardarArchivoEnStorage(file) {
        if (!selectedExpInmueble) {
            mostrarAlerta('Seleccioná un inmueble en la sección de Expensas antes de adjuntar un archivo.', 'warning');
            limpiarArchivo();
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const datos = {
                nombre: file.name,
                tipo: file.type,
                base64: e.target.result
            };
            localStorage.setItem('expensas_archivo_' + selectedExpInmueble.key, JSON.stringify(datos));
            mostrarChipArchivo(file.name);
        };
        reader.readAsDataURL(file);
    }

    archivoInput.addEventListener('change', () => {
        if (archivoInput.files.length > 0) {
            guardarArchivoEnStorage(archivoInput.files[0]);
        }
    });

    btnRemoveFile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedExpInmueble) {
            localStorage.removeItem('expensas_archivo_' + selectedExpInmueble.key);
        }
        limpiarArchivo();
    });

    // Drag & drop visual
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!uploadZone.classList.contains('has-file')) {
            uploadZone.classList.add('drag-over');
        }
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        if (uploadZone.classList.contains('has-file')) return;
        const file = e.dataTransfer?.files?.[0];
        if (file) guardarArchivoEnStorage(file);
    });

    btnEnviarMsg.addEventListener('click', () => {
        const texto = msgTexto.value.trim();
        if (!selectedMsgInmueble) { mostrarAlerta('Seleccioná un inmueble antes de enviar.', 'warning'); return; }
        if (!texto) { mostrarAlerta('Escribí un mensaje antes de enviar.', 'warning'); return; }

        const nuevoMsg = {
            id: Date.now(),
            texto,
            inmueble: selectedMsgInmueble.key,
            inmLabel: selectedMsgInmueble.label,
            remitente: 'Mariela (Administración)',
            fecha: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
            leido: false
        };

        const storageKey = `msgs_${selectedClienteKey}`;
        const msgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        msgs.unshift(nuevoMsg);
        localStorage.setItem(storageKey, JSON.stringify(msgs));
        msgTexto.value = '';
        renderMsgHistory(selectedClienteKey);
        mostrarToast(successMsgNotif);
    });

    function renderMsgHistory(clienteKey) {
        const msgs = JSON.parse(localStorage.getItem(`msgs_${clienteKey}`) || '[]');
        if (msgs.length === 0) {
            msgList.innerHTML = '<div class="no-msgs">No hay mensajes enviados aún.</div>';
            return;
        }
        msgList.innerHTML = msgs.map(m => `
            <div class="msg-item" id="msg-${m.id}">
                <div>${m.texto}</div>
                <div class="msg-item-meta">
                    <span class="msg-item-inmueble"><i class="fas fa-home"></i> ${m.inmLabel}</span>
                    <span style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:0.72rem;color:#aaa;"><i class="fas fa-user-shield" style="color:var(--color-orange);margin-right:3px;"></i>${m.remitente || 'Administración'}</span>
                        <span>${m.fecha}</span>
                        <button class="btn-del-msg" onclick="eliminarMsg('${clienteKey}', ${m.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </span>
                </div>
            </div>`).join('');
    }

    window.eliminarMsg = (clienteKey, msgId) => {
        const storageKey = `msgs_${clienteKey}`;
        let msgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify(msgs.filter(m => m.id !== msgId)));
        renderMsgHistory(selectedClienteKey || clienteKey);
    };

    // ============================================================
    //  AL SELECCIONAR CLIENTE — desbloquea ambas cards
    // ============================================================
    function alSeleccionarCliente(key) {
        // Desbloquear cards
        cardExpensas.classList.remove('card-bloqueada');
        cardMensajes.classList.remove('card-bloqueada');

        // Actualizar título con nombre del cliente
        const tituloSpan = document.getElementById('tituloClienteMensaje');
        if (tituloSpan) tituloSpan.textContent = clientesData[key].nombre;

        // Reset expensas
        selectedExpInmueble = null;
        expInmuebleInput.value = '';
        montoExpensas.value = '';

        // Reset mensajes
        selectedMsgInmueble = null;
        previewItems.innerHTML = '';
        msgTextGroup.style.display = 'none';
        btnEnviarMsg.style.display = 'none';
        msgHistory.style.display = 'none';

        // Poblar botones de inmueble para mensajes
        const cliente = clientesData[key];
        const crearBtnInm = (inmKey, label, iconClass) => {
            const btn = document.createElement('button');
            btn.className = 'preview-badge' + (iconClass === 'fa-globe' ? ' general-badge' : '');
            btn.innerHTML = `<i class="fas ${iconClass}"></i> ${label}`;
            btn.addEventListener('click', () => {
                document.querySelectorAll('#previewItems .preview-badge').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedMsgInmueble = { key: inmKey, label };
            });
            previewItems.appendChild(btn);
        };
        cliente.inmuebles.forEach(inm => crearBtnInm(inm.key, inm.label, 'fa-home'));
        crearBtnInm('general', 'General', 'fa-globe');
        inmueblePreview.classList.add('visible');
        msgTextGroup.style.display = 'flex';
        msgArchivoGroup.style.display = 'flex';
        btnEnviarMsg.style.display = 'flex';
        limpiarArchivo();
        renderMsgHistory(key);
        msgHistory.style.display = 'block';
    }

    function resetTodo() {
        cardExpensas.classList.add('card-bloqueada');
        cardMensajes.classList.add('card-bloqueada');
        const tituloSpan = document.getElementById('tituloClienteMensaje');
        if (tituloSpan) tituloSpan.textContent = '';
        selectedExpInmueble = null;
        selectedMsgInmueble = null;
        expInmuebleInput.value = '';
        montoExpensas.value = '';
        previewItems.innerHTML = '';
        inmueblePreview.classList.remove('visible');
        msgTextGroup.style.display = 'none';
        msgArchivoGroup.style.display = 'none';
        limpiarArchivo();
        btnEnviarMsg.style.display = 'none';
        msgHistory.style.display = 'none';
    }

    // Helper toast
    function mostrarToast(el) {
        el.classList.add('visible');
        setTimeout(() => el.classList.remove('visible'), 3500);
    }
});
