// Cargar barrios del GeoJSON y popular el selector
async function cargarBarrios() {
    try {
        // Cargar el archivo GeoJSON
        const response = await fetch('geojson.json');
        const data = await response.json();
        
        // Extraer nombres únicos de barrios
        const barrios = data.features.map(feature => ({
            nombre: feature.properties.n,
            id: feature.properties.relOID || feature.properties.Name
        }));
        
        // Ordenar alfabéticamente
        barrios.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Llenar todos los selectores de barrio en la página
        const selectores = document.querySelectorAll('select.barrio-select');
        
        selectores.forEach(select => {
            // Limpiar opciones previas (excepto la primera que es "Todos")
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Agregar opciones de barrios
            barrios.forEach(barrio => {
                const option = document.createElement('option');
                option.value = barrio.nombre.toLowerCase().replace(/\s+/g, '-');
                option.textContent = barrio.nombre;
                option.dataset.nombreBarrio = barrio.nombre;
                select.appendChild(option);
            });
        });
        
        console.log(`✓ ${barrios.length} barrios cargados exitosamente`);
        return barrios;
    } catch (error) {
        console.error('Error cargando barrios:', error);
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarBarrios);
