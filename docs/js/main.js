document.addEventListener('DOMContentLoaded', () => {
    // 1. Alerta solo en la página principal (index.html)
    const esPaginaPrincipal = window.location.pathname.endsWith('index.html') || 
                              window.location.pathname === '/' || 
                              window.location.pathname.endsWith('/');
    if (esPaginaPrincipal) {
        alert('¡Bienvenido a PostWork!');
    }

    // Llamada a funciones principales
    iniciarReloj();
    iniciarModoOscuro();
    iniciarValidaciones();
    iniciarMenues();
    inicializarAcordeon();
    iniciarGaleria();
    iniciarResumenFormulario();
});

// Punto 2: Validar inputs requeridos y mostrar mensaje
function iniciarValidaciones() {
    // Se omiten los formularios gestionados por el flujo de resumen para evitar duplicar alertas de error
    const formularios = document.querySelectorAll('form:not(.form-con-resumen):not(#form-resumen)');

    formularios.forEach(form => {
        form.addEventListener('submit', (e) => {
            let hayError = validarCamposFormulario(form);
            if (hayError) {
                e.preventDefault();
            }
        });
    });
}

// Función auxiliar reutilizable para validar campos de cualquier formulario
function validarCamposFormulario(form) {
    let hayError = false;

    // Limpia mensajes de error anteriores
    form.querySelectorAll('.error-texto').forEach(el => el.textContent = '');

    const campos = form.querySelectorAll('input[required], select[required], textarea[required]');

    campos.forEach(campo => {
        let mensaje = '';

        if (!campo.value.trim()) {
            mensaje = 'Este campo no puede estar vacío.';
        } else if (campo.type === 'email') {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(campo.value.trim())) {
                mensaje = 'Ingrese un correo válido.';
            }
        }

        if (mensaje) {
            hayError = true;
            let span = campo.parentNode.querySelector('.error-texto');
            
            if (!span) {
                span = document.createElement('span');
                span.className = 'error-texto';
                span.style.color = '#dc2626';
                span.style.fontSize = '12px';
                span.style.display = 'block';
                span.style.marginTop = '4px';
                campo.parentNode.appendChild(span);
            }
            
            span.textContent = mensaje;
        }
    });

    return hayError;
}

// Reloj en tiempo real
function iniciarReloj() {
    const reloj = document.getElementById('reloj-tiempo-real');
    if (!reloj) return;

    setInterval(() => {
        const ahora = new Date();
        reloj.textContent = ahora.toLocaleTimeString('es-AR');
    }, 1000);
}

// Toggle de modo oscuro y guardado en localStorage
function iniciarModoOscuro() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    const btnTema = document.getElementById('btn-modo-oscuro');
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const esOscuro = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', esOscuro ? 'dark' : 'light');
        });
    }
}

// Ocultar y mostrar secciones
function iniciarMenues() {
    const botones = document.querySelectorAll('.toggle-seccion-btn');

    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            const idTarget = btn.getAttribute('data-target');
            const seccion = document.getElementById(idTarget);

            if (seccion) {
                const estaOculto = window.getComputedStyle(seccion).display === 'none';
                seccion.style.display = estaOculto ? 'block' : 'none';
            }
        });
    });
}

// Galería de imágenes
const listaImagenes = [
    { src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', alt: 'Imagen 1' },
    { src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', alt: 'Imagen 2' },
    { src: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800', alt: 'Imagen 3' }
];

let indiceActual = 0;

function iniciarGaleria() {
    const img = document.getElementById('galeria-img');
    const btnAnt = document.getElementById('galeria-prev');
    const btnSig = document.getElementById('galeria-next');

    if (!img) return;

    function actualizar() {
        img.src = listaImagenes[indiceActual].src;
        img.alt = listaImagenes[indiceActual].alt;
    }

    if (btnAnt && btnSig) {
        btnAnt.addEventListener('click', () => {
            indiceActual = (indiceActual - 1 + listaImagenes.length) % listaImagenes.length;
            actualizar();
        });

        btnSig.addEventListener('click', () => {
            indiceActual = (indiceActual + 1) % listaImagenes.length;
            actualizar();
        });
    }

    img.addEventListener('click', () => {
        const modal = document.getElementById('modal-galeria');
        const modalImg = document.getElementById('modal-img');
        if (modal && modalImg) {
            modalImg.src = img.src;
            modal.style.display = 'flex';
        }
    });

    const modal = document.getElementById('modal-galeria');
    if (modal) {
        modal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

// Punto 7: Resumen de datos antes del envío (Multipágina)
function iniciarResumenFormulario() {
    // Busca formularios por clase o por IDs de las 3 páginas
    const formulariosConResumen = document.querySelectorAll(
        '.form-con-resumen, #form-resumen, #form-publicar-empleo, #form-perfil, #form-registro'
    );

    formulariosConResumen.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Validar primero antes de mostrar el resumen
            const hayError = validarCamposFormulario(form);
            if (hayError) return;

            // 2. Obtener o crear contenedor del resumen
            let contenedorResumen = form.parentNode.querySelector('.resumen-contenedor');
            if (!contenedorResumen) {
                contenedorResumen = document.createElement('div');
                contenedorResumen.className = 'resumen-contenedor card margin-top-medium';
                form.parentNode.insertBefore(contenedorResumen, form.nextSibling);
            }

            // 3. Recopilar datos del formulario
            const elementos = form.querySelectorAll('input, select, textarea');
            let htmlCampos = '';

            elementos.forEach(el => {
                // Ignorar botones y campos sin valor o sin tipo submit/button
                if (['submit', 'button', 'reset'].includes(el.type) || !el.value.trim()) return;

                // Buscar etiqueta visual o usar atributo 'name' / 'placeholder'
                let etiqueta = el.name || el.id;
                const label = form.querySelector(`label[for="${el.id}"]`);
                if (label) {
                    etiqueta = label.textContent.replace(':', '').trim();
                } else if (el.placeholder) {
                    etiqueta = el.placeholder;
                }

                // Manejo de archivos (CV / Imágenes)
                let valor = el.value;
                if (el.type === 'file' && el.files.length > 0) {
                    valor = el.files[0].name;
                }

                htmlCampos += `<li><strong>${etiqueta}:</strong> ${valor}</li>`;
            });

            // 4. Renderizar panel de revisión
            contenedorResumen.innerHTML = `
                <h3>Revisión de datos antes de enviar</h3>
                <ul style="margin: 12px 0; padding-left: 20px;">
                    ${htmlCampos}
                </ul>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button type="button" class="btn-confirmar-envio btn-primary">Confirmar y Enviar</button>
                    <button type="button" class="btn-editar-datos btn-secondary">Modificar datos</button>
                </div>
            `;

            // Ocultar formulario y mostrar resumen
            form.style.display = 'none';
            contenedorResumen.style.display = 'block';

            // 5. Asignar eventos a los botones del resumen
            const btnConfirmar = contenedorResumen.querySelector('.btn-confirmar-envio');
            const btnEditar = contenedorResumen.querySelector('.btn-editar-datos');

            btnEditar.addEventListener('click', () => {
                contenedorResumen.style.display = 'none';
                form.style.display = 'block';
            });

            btnConfirmar.addEventListener('click', () => {
                alert('¡Formulario enviado con éxito!');
                form.reset();
                contenedorResumen.style.display = 'none';
                form.style.display = 'block';
            });
        });
    });
}

// Funcionalidad de Acordeón / Mostrar y Ocultar (Punto 4)
function inicializarAcordeon() {
    const botonesFaq = document.querySelectorAll('.btn-faq-toggle');
    
    botonesFaq.forEach(boton => {
        boton.addEventListener('click', () => {
            const respuesta = boton.nextElementSibling;
            const icono = boton.querySelector('.icono');
            
            if (respuesta) {
                const estaVisible = respuesta.style.display === 'block';
                respuesta.style.display = estaVisible ? 'none' : 'block';
                
                if (icono) {
                    icono.textContent = estaVisible ? '+' : '−';
                }
            }
        });
    });
}