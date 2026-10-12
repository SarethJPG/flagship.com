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

// =========================================
// FORMULARIO DE CONTACTO: VALIDACIONES
// =========================================
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("form-contacto");

    // Solo se ejecuta si la página actual tiene el formulario
    if (!form) return;

    // -----------------------------------------
    // Función auxiliar: sanitiza el texto eliminando
    // caracteres peligrosos para evitar inyección HTML/JS
    // -----------------------------------------
    function sanitizar(texto) {
        return texto
            .replace(/[<>]/g, "")         // Elimina < y >
            .replace(/javascript:/gi, "") // Elimina intentos de inyección javascript:
            .replace(/on\w+=/gi, "")      // Elimina eventos inline (onclick=, onerror=, etc.)
            .trim();
    }

    // -----------------------------------------
    // Función auxiliar: capitaliza el nombre
    // (Primera letra de cada palabra en mayúscula, resto minúscula)
    // -----------------------------------------
    function capitalizarNombre(texto) {
        return texto
            .toLowerCase()
            .split(" ")
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(" ");
    }

    // -----------------------------------------
    // Función auxiliar: valida un campo y muestra su error
    // El mensaje de error se busca con la clase .form-error
    // -----------------------------------------
    function validarCampo(id, reglas) {
        const input = document.getElementById(id);
        const errorMsg = input.parentElement.querySelector(".form-error");

        // 1. Sanitizamos SIEMPRE
        let valor = sanitizar(input.value);

        // 2. Aplicamos transformaciones específicas (si las hay)
        if (reglas.transform) {
            valor = reglas.transform(valor);
        }

        // 3. Devolvemos el valor limpio al input
        input.value = valor;

        // 4. Evaluamos las reglas
        let valido = true;

        if (reglas.required && valor === "") {
            valido = false;
        }

        if (reglas.regex && !reglas.regex.test(valor)) {
            valido = false;
        }

        if (reglas.minLength && valor.length < reglas.minLength) {
            valido = false;
        }

        if (reglas.maxLength && valor.length > reglas.maxLength) {
            valido = false;
        }

        // 5. Aplicamos feedback visual
        if (errorMsg) {
            errorMsg.style.display = valido ? "none" : "block";
        }

        if (valido) {
            input.style.boxShadow = "0 0.125rem 0.5rem rgba(0, 0, 0, 0.06)";
        } else {
            input.style.boxShadow = "0 0.125rem 0.5rem rgba(255, 0, 0, 0.4)";
        }

        return valido;
    }

    // -----------------------------------------
    // Envío del formulario
    // -----------------------------------------
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let formValido = true;

        // --- Nombre: solo letras/espacios, mín 2 letras, sin números ---
        const nombreValido = validarCampo("nombre", {
            required: true,
            regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/,
            transform: capitalizarNombre
        });
        if (!nombreValido) formValido = false;

        // --- Ciudad: cualquier texto, máx 50 caracteres ---
        const ciudadValido = validarCampo("ciudad", {
            required: true,
            maxLength: 50
        });
        if (!ciudadValido) formValido = false;

        // --- Teléfono: solo números y espacios ---
        const telefonoValido = validarCampo("telefono", {
            required: true,
            regex: /^[0-9\s]+$/
        });
        if (!telefonoValido) formValido = false;

        // --- Correo: válido con @ y extensión ---
        const correoValido = validarCampo("correo", {
            required: true,
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        });
        if (!correoValido) formValido = false;

        // --- Mensaje: cualquier texto, máx 500 caracteres ---
        const mensajeValido = validarCampo("mensaje", {
            required: true,
            maxLength: 500
        });
        if (!mensajeValido) formValido = false;

        // -----------------------------------------
        // Si TODO es válido → Enviar al servidor PHP
        // -----------------------------------------
        if (formValido) {
            const datosFormulario = {
                nombre:   document.getElementById("nombre").value,
                ciudad:   document.getElementById("ciudad").value,
                telefono: document.getElementById("telefono").value,
                correo:   document.getElementById("correo").value,
                mensaje:  document.getElementById("mensaje").value
            };

            fetch('enviar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosFormulario)
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    alert("¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.");
                    form.reset();

                    // Quitamos el feedback visual de todos los campos
                    form.querySelectorAll(".form-input, .form-textarea").forEach(function (campo) {
                        campo.style.boxShadow = "";
                    });
                } else {
                    alert("Ocurrió un error: " + (data.error || "Inténtalo de nuevo."));
                    console.error("Error del servidor:", data);
                }
            })
            .catch(function (error) {
                alert("Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.");
                console.error("FAILED...", error);
            });
        }
    });
});