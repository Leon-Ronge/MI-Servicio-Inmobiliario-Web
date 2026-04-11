// Sistema de filtrado de propiedades

let propiedadesOriginales = [];

document.addEventListener('DOMContentLoaded', function() {
    // Guardar propiedades originales
    propiedadesOriginales = Array.from(document.querySelectorAll('.property-card'));
    
    // Configurar event listeners para filtros
    const selectores = document.querySelectorAll('.filter-form select');
    const btnBuscar = document.querySelector('.btn-search');
    
    selectores.forEach(select => {
        select.addEventListener('change', aplicarFiltros);
    });
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }
});

function aplicarFiltros() {
    const tipo = document.querySelector('.filter-form select:nth-child(1) select')?.value || 
                 document.querySelectorAll('.filter-form select')[0]?.value || '';
    
    const ciudad = document.querySelectorAll('.filter-form select')[1]?.value || '';
    const barrio = document.querySelectorAll('.filter-form select')[2]?.value || '';
    const precioMin = document.querySelectorAll('.price-inputs input')[0]?.value || '';
    const precioMax = document.querySelectorAll('.price-inputs input')[1]?.value || '';
    const superficieMin = document.querySelectorAll('.price-inputs input')[2]?.value || '';
    const superficieMax = document.querySelectorAll('.price-inputs input')[3]?.value || '';
    
    // Filtrar propiedades
    propiedadesOriginales.forEach(card => {
        let mostrar = true;
        
        // Filtro por tipo
        if (tipo && tipo !== '') {
            const tipoCard = card.querySelector('.property-type')?.textContent.toLowerCase() || '';
            const tipoMap = {
                'apartment': 'departamento',
                'house': 'casa',
                'commercial': 'comercial',
                'office': 'oficina',
                'land': 'terreno'
            };
            if (!tipoCard.includes(tipoMap[tipo] || tipo)) {
                mostrar = false;
            }
        }
        
        // Filtro por barrio
        if (barrio && barrio !== '') {
            const barrioCard = card.querySelector('.property-location')?.textContent.toLowerCase() || '';
            // Obtener el nombre del barrio del dataset (si existe) o del valor del select
            let nombreBarrio = barrio;
            const selectBarrio = document.querySelectorAll('.filter-form select')[2];
            if (selectBarrio && selectBarrio.selectedOptions[0]) {
                nombreBarrio = selectBarrio.selectedOptions[0].dataset.nombreBarrio || barrio;
            }
            if (!barrioCard.includes(nombreBarrio.toLowerCase())) {
                mostrar = false;
            }
        }
        
        // Mostrar u ocultar tarjeta
        card.style.display = mostrar ? '' : 'none';
    });
    
    // Mostrar mensaje si no hay resultados
    mostrarMensajeResultados();
}

function mostrarMensajeResultados() {
    const grid = document.querySelector('.property-grid');
    const tarjetasVisibles = grid.querySelectorAll('.property-card[style=""]').length +
                             grid.querySelectorAll('.property-card:not([style*="display: none"])').length;
    
    // Eliminar mensaje previo si existe
    const mensajeAnterior = grid.parentElement.querySelector('.sin-resultados');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    if (tarjetasVisibles === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'sin-resultados';
        mensaje.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p style="font-size: 18px; margin: 10px 0;">No se encontraron propiedades</p>
                <p style="font-size: 14px; color: #999;">Intenta modificar los filtros</p>
            </div>
        `;
        grid.parentElement.appendChild(mensaje);
    }
}
