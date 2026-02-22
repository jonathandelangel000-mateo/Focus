// 1. CONFIGURACIÓN INICIAL Y FECHA
document.addEventListener('DOMContentLoaded', () => {
    history.replaceState({ pantallaId: 'pantalla-inicio' }, "", "");
    
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    const hoy = new Date().toLocaleDateString('es-MX', opciones);
    const elemFecha = document.getElementById('fecha-actual');
    if(elemFecha) elemFecha.innerText = hoy;
});

// 2. NAVEGACIÓN
function irA(idPantalla, saltarHistorial = false) {
    document.querySelectorAll('.pantalla').forEach(p => p.style.display = 'none');
    document.getElementById(idPantalla).style.display = 'block';

    if (!saltarHistorial) {
        history.pushState({ pantallaId: idPantalla }, "", "");
    }

    if(idPantalla === 'pantalla-notas') mostrarNotas();
}

window.onpopstate = function(event) {
    if (event.state && event.state.pantallaId) {
        irA(event.state.pantallaId, true);
    } else {
        irA('pantalla-inicio', true);
    }
};

// 3. LÓGICA DE NOTAS
function guardarNota() {
    const titulo = document.getElementById('titulo-nota').value;
    const texto = document.getElementById('texto-nota').value;

    if(!titulo || !texto) return;

    const notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    notas.push({ titulo, texto, id: Date.now() });
    localStorage.setItem('mis-notas', JSON.stringify(notas));

    document.getElementById('titulo-nota').value = "";
    document.getElementById('texto-nota').value = "";
    mostrarNotas();
}

function mostrarNotas() {
    const contenedor = document.getElementById('lista-notas');
    if(!contenedor) return;
    const notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    
    contenedor.innerHTML = notas.reverse().map(n => `
        <div class="nota-item" onclick="leerNota(${n.id})">
            <div class="opciones-nota">
                <button class="btn-puntos" onclick="event.stopPropagation(); toggleMenu(${n.id})">⋮</button>
                <div id="menu-${n.id}" class="menu-desplegable">
                    <button onclick="event.stopPropagation(); prepararEdicion(${n.id})">✏️ Editar</button>
                    <button onclick="event.stopPropagation(); compartirNota(${n.id})">🔗 Compartir</button>
                    <button style="color:#ff4444" onclick="event.stopPropagation(); borrarNota(event, ${n.id})">🗑 Borrar</button>
                </div>
            </div>
            <h3>${n.titulo}</h3>
            <p>${n.texto}</p>
        </div>
    `).join('');
}

function leerNota(id) {
    const notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    const nota = notas.find(n => n.id === id);
    if (nota) {
        document.getElementById('leer-titulo').innerText = nota.titulo;
        document.getElementById('leer-texto').innerText = nota.texto;
        irA('pantalla-lectura');
    }
}

// 4. FUNCIONES DEL MENÚ
function toggleMenu(id) {
    document.querySelectorAll('.menu-desplegable').forEach(menu => {
        if(menu.id !== `menu-${id}`) menu.style.display = 'none';
    });
    const menu = document.getElementById(`menu-${id}`);
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function borrarNota(e, id) {
    // Detenemos cualquier acción del navegador antes de la alerta
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const menu = document.getElementById(`menu-${id}`);
    if (menu) menu.style.display = 'none';

    // El retraso de 200ms asegura que el evento "touch" termine antes de que confirm() congele la pantalla
    setTimeout(() => {
        if(window.confirm("¿Eliminar esta nota?")) {
            let notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
            notas = notas.filter(n => n.id !== id);
            localStorage.setItem('mis-notas', JSON.stringify(notas));
            mostrarNotas();
        }
    }, 200);
}

function prepararEdicion(id) {
    const notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    const nota = notas.find(n => n.id === id);
    if (nota) {
        document.getElementById('edit-id').value = nota.id;
        document.getElementById('edit-titulo').value = nota.titulo;
        document.getElementById('edit-texto').value = nota.texto;
        irA('pantalla-editar');
    }
}

function actualizarNota() {
    const id = parseInt(document.getElementById('edit-id').value);
    const titulo = document.getElementById('edit-titulo').value;
    const texto = document.getElementById('edit-texto').value;

    if(!titulo || !texto) return;

    let notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    notas = notas.map(n => n.id === id ? { ...n, titulo, texto } : n);
    localStorage.setItem('mis-notas', JSON.stringify(notas));
    
    window.history.back();
    setTimeout(mostrarNotas, 150); 
}

async function compartirNota(id) {
    const notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    const nota = notas.find(n => n.id === id);
    if (navigator.share) {
        try {
            await navigator.share({ title: nota.titulo, text: `${nota.titulo}\n\n${nota.texto}` });
        } catch (err) { console.log(err); }
    } else {
        alert("Tu dispositivo no soporta compartir.");
    }
}

window.onclick = function(event) {
    if (!event.target.matches('.btn-puntos')) {
        document.querySelectorAll('.menu-desplegable').forEach(m => m.style.display = 'none');
    }
}
function mostrarNotas() {
    const contenedor = document.getElementById('lista-notas');
    if(!contenedor) return;
    const notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
    
    contenedor.innerHTML = notas.reverse().map(n => `
        <div class="nota-item" id="nota-${n.id}" onclick="leerNota(${n.id})">
            <div class="opciones-nota">
                <button class="btn-puntos" onclick="event.stopPropagation(); toggleMenu(${n.id})">⋮</button>
                <div id="menu-${n.id}" class="menu-desplegable">
                    <button onclick="event.stopPropagation(); prepararEdicion(${n.id})">✏️ Editar</button>
                    <button onclick="event.stopPropagation(); compartirNota(${n.id})">🔗 Compartir</button>
                    <button style="color:#ff4444" onclick="borrarNotaRapido(event, ${n.id})">🗑 Borrar</button>
                </div>
            </div>
            <h3>${n.titulo}</h3>
            <p>${n.texto}</p>
        </div>
    `).join('');
}

function borrarNotaRapido(e, id) {
    // 1. Detener el evento inmediatamente
    e.preventDefault();
    e.stopPropagation();

    // 2. Cerrar el menú
    document.getElementById(`menu-${id}`).style.display = 'none';

    // 3. Bloquear clics en toda la lista de notas temporalmente
    const lista = document.getElementById('lista-notas');
    lista.style.pointerEvents = 'none';

    // 4. Preguntar
    setTimeout(() => {
        if (confirm("¿Eliminar esta nota?")) {
            let notas = JSON.parse(localStorage.getItem('mis-notas')) || [];
            notas = notas.filter(n => n.id !== id);
            localStorage.setItem('mis-notas', JSON.stringify(notas));
            mostrarNotas();
        }
        // 5. Desbloquear clics
        lista.style.pointerEvents = 'auto';
    }, 100);
}