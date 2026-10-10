// =========================================
// NAVBAR: OCULTAR/MOSTRAR AL HACER SCROLL
// Oculta la navbar al bajar, la muestra al subir
// =========================================
const navbar = document.getElementById('navbar');

if (navbar) {

    let ultimaPosicion = window.scrollY || document.documentElement.scrollTop;

    window.addEventListener('scroll', function () {

        const posicionActual = window.scrollY || document.documentElement.scrollTop;

        // Mostrar: cuando subimos o estamos arriba del todo
        if (ultimaPosicion >= posicionActual || posicionActual <= 0) {
            navbar.classList.remove('navbar-oculta');
        } else {
            // Ocultar: cuando bajamos
            navbar.classList.add('navbar-oculta');
        }

        ultimaPosicion = posicionActual;
    });
}

// =========================================
// NAVBAR: MENÚ SÁNDWICH (VISTA MÓVIL)
// Abre/cierra el dropdown de navegación
// al pulsar la hamburguesa
// =========================================
document.addEventListener('DOMContentLoaded', function () {

    const btnHamburguesa = document.getElementById('navbar-hamburguesa');
    const menuDerecha = document.getElementById('navbar-derecha');

    // Solo se ejecuta si ambos elementos existen en el HTML
    if (btnHamburguesa && menuDerecha) {

        // -------------------------------------
        // Función auxiliar: abre o cierra el menú
        // y sincroniza el atributo aria-expanded
        // -------------------------------------
        function cerrarMenu() {
            btnHamburguesa.classList.remove('abierto');
            menuDerecha.classList.remove('menu-activo');
            btnHamburguesa.setAttribute('aria-expanded', 'false');
            btnHamburguesa.setAttribute('aria-label', 'Abrir menú');
        }

        // -------------------------------------
        // Toggle al pulsar el botón
        // -------------------------------------
        btnHamburguesa.addEventListener('click', function (e) {
            e.stopPropagation();
            const abierto = btnHamburguesa.classList.toggle('abierto');
            menuDerecha.classList.toggle('menu-activo', abierto);
            btnHamburguesa.setAttribute('aria-expanded', abierto ? 'true' : 'false');
            btnHamburguesa.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });

        // -------------------------------------
        // Cerrar el menú al pulsar cualquier pestaña
        // -------------------------------------
        const enlacesMenu = menuDerecha.querySelectorAll('.navbar-pestana');
        enlacesMenu.forEach(function (enlace) {
            enlace.addEventListener('click', cerrarMenu);
        });

        // -------------------------------------
        // Cerrar el menú al hacer clic fuera de él
        // -------------------------------------
        document.addEventListener('click', function (e) {
            const clicFueraDelMenu = !menuDerecha.contains(e.target);
            const clicFueraDelBoton = !btnHamburguesa.contains(e.target);
            if (clicFueraDelMenu && clicFueraDelBoton) {
                cerrarMenu();
            }
        });

        // -------------------------------------
        // Cerrar el menú si la ventana se agranda a desktop
        // (evita que quede abierto al rotar tablet o redimensionar)
        // -------------------------------------
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                cerrarMenu();
            }
        });
    }
});

// =========================================
// CARRUSEL DE CARDS (infinito, 1x1)
// - Desktop: 3 cards visibles
// - Móvil: 1 card visible
// - Avanza/retrocede de 1 en 1 card
// - Infinito: se logra con 3 clones al inicio
//   y 3 clones al final (suficiente para desktop,
//   que es el caso más ancho)
// =========================================
document.addEventListener('DOMContentLoaded', function () {

    const track = document.getElementById('carrusel-track');
    if (!track) return;

    const btnIzq = document.getElementById('carrusel-flecha-izq');
    const btnDer = document.getElementById('carrusel-flecha-der');

    // -------------------------------------
    // 1. Clonado: 3 clones antes + 3 después
    // -------------------------------------
    const originales = Array.from(track.children);
    const totalOriginales = originales.length;
    const CLONES = 3;

    // Clones al inicio: copia de las últimas N cards
    // (para poder retroceder desde la primera)
    originales.slice(-CLONES).forEach(card => {
        track.insertBefore(card.cloneNode(true), originales[0]);
    });

    // Clones al final: copia de las primeras N cards
    // (para poder avanzar desde la última)
    originales.slice(0, CLONES).forEach(card => {
        track.appendChild(card.cloneNode(true));
    });

    // -------------------------------------
    // 2. Estado del carrusel
    // -------------------------------------
    // El índice empieza en CLONES → apunta a la primera
    // card ORIGINAL (después de los clones de inicio).
    let indice = CLONES;
    let animando = false;

    // -------------------------------------
    // 3. Utilidades
    // -------------------------------------
    // Ancho de un "paso" = ancho de card + gap.
    // Se calcula dinámicamente para que responda al
    // cambio de layout entre desktop (1/3) y móvil (100%).
    function getStep() {
        const all = track.children;
        if (all.length < 2) return 0;
        const r0 = all[0].getBoundingClientRect();
        const r1 = all[1].getBoundingClientRect();
        return r1.left - r0.left;
    }

    // Aplica la posición según el índice actual
    function posicionar(conAnimacion) {
        const step = getStep();
        track.style.transition = conAnimacion ? 'transform 0.5s ease' : 'none';
        track.style.transform = `translateX(-${indice * step}px)`;
    }

    // Si el índice llegó a un clon, salta al original
    // equivalente SIN animación (efecto infinito).
    function corregirClon() {
        // Pasamos del bloque de clones-final al bloque original
        if (indice >= CLONES + totalOriginales) {
            indice = CLONES;
            posicionar(false);
        }
        // Pasamos del bloque de clones-inicio al bloque original
        else if (indice <= 0) {
            indice = totalOriginales;
            posicionar(false);
        }
    }

    // -------------------------------------
    // 4. Acción principal: avanzar 1 card
    // -------------------------------------
    function mover(direccion) {
        if (animando) return;
        animando = true;
        indice += direccion;
        posicionar(true);
    }

    // -------------------------------------
    // 5. Al terminar la transición: corregir clon
    //    y liberar el bloqueo
    // -------------------------------------
    track.addEventListener('transitionend', function (e) {
        if (e.target !== track || e.propertyName !== 'transform') return;
        animando = false;
        corregirClon();
    });

    // -------------------------------------
    // 6. Listeners de las flechas
    // -------------------------------------
    if (btnDer) btnDer.addEventListener('click', () => mover(1));
    if (btnIzq) btnIzq.addEventListener('click', () => mover(-1));

    // -------------------------------------
    // 7. Posición inicial (sin animación)
    // -------------------------------------
    posicionar(false);

    // -------------------------------------
    // 8. Recalcular posición en resize (con debounce)
    //    por si el usuario cambia entre desktop/móvil
    // -------------------------------------
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            posicionar(false);
        }, 100);
    });
});