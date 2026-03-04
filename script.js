/* ============================================
   JUEGO DEL NÚMERO MÁGICO 1.0
   Lógica principal en JavaScript

   El jugador debe adivinar un número aleatorio
   entre 1 y 100 en un máximo de 10 intentos.
   ============================================ */

// ============================================
// CONFIGURACIÓN DEL JUEGO (personalizable)
// ============================================
let maxIntentos = 10;    // Número máximo de intentos (personalizable)
const RANGO_MIN = 1;     // Límite inferior del rango (fijo)
let rangoMax = 100;      // Límite superior del rango (personalizable)

// ============================================
// REFERENCIAS A ELEMENTOS DEL DOM
// Almacenamos referencias para evitar
// búsquedas repetidas en el documento.
// ============================================
const guessInput = document.getElementById("guess-input");
const guessBtn = document.getElementById("guess-btn");
const feedbackMsg = document.getElementById("feedback-message");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const barFill = document.getElementById("bar-fill");
const attemptsCounter = document.getElementById("attempts-counter");
const restartBtn = document.getElementById("restart-btn");
const cheatBtn = document.getElementById("cheat-btn");

// Elementos del panel de configuración
const settingsToggle  = document.getElementById('settings-toggle');
const settingsPanel   = document.getElementById('settings-panel');
const rangeSlider     = document.getElementById('range-slider');
const rangeValue      = document.getElementById('range-value');
const attemptsSlider  = document.getElementById('attempts-slider');
const attemptsValue   = document.getElementById('attempts-value');
const applySettingsBtn = document.getElementById('apply-settings-btn');
const subtitleMax     = document.getElementById('subtitle-max');

// ============================================
// VARIABLES DE ESTADO DEL JUEGO
// Se reinician cada vez que se inicia una
// nueva partida.
// ============================================
let numeroSecreto; // Número que el jugador debe adivinar
let intentoActual; // Contador del intento actual (comienza en 1)
let juegoTerminado; // Bandera que indica si el juego acabó
let historialIntentos; // Array con los números ya intentados

// ============================================
// INICIALIZACIÓN DEL JUEGO
// Genera un nuevo número aleatorio y
// reinicia todo el estado y la interfaz.
// ============================================
function iniciarJuego() {
  // Generar número aleatorio entre RANGO_MIN y rangoMax
  numeroSecreto =
    Math.floor(Math.random() * (rangoMax - RANGO_MIN + 1)) + RANGO_MIN;

  // Actualizar el subtítulo y el input con el rango actual
  subtitleMax.textContent = rangoMax;
  guessInput.max = rangoMax;

  // Reiniciar estado
  intentoActual = 1;
  juegoTerminado = false;
  historialIntentos = [];

  // Reiniciar interfaz
  guessInput.value = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.focus();

  // Mensaje inicial
  feedbackMsg.textContent =
    "¡Buena suerte! Tienes " + maxIntentos + " intentos para adivinar.";
  feedbackMsg.className = "";

  // Limpiar historial visual
  historyList.innerHTML = "";
  const emptyMsg = document.createElement("p");
  emptyMsg.id = "history-empty";
  emptyMsg.className = "empty-msg";
  emptyMsg.textContent = "Aún no hay intentos.";
  historyList.appendChild(emptyMsg);

  // Reiniciar barra de intentos
  actualizarBarra();

  // Ocultar botón de reinicio
  restartBtn.classList.add("hidden");

  // Reiniciar botón secreto
  cheatBtn.textContent = '·';
  cheatBtn.classList.remove('revealed');

  // Eliminar confeti si existe
  const confettiCanvas = document.getElementById("confetti-canvas");
  if (confettiCanvas) confettiCanvas.remove();
}

// ============================================
// ACTUALIZAR BARRA DE PROGRESO
// Muestra visualmente los intentos restantes.
// ============================================
function actualizarBarra() {
  const restantes = maxIntentos - intentoActual + 1;
  const porcentaje = (restantes / maxIntentos) * 100;

  // Actualizar ancho de la barra
  barFill.style.width = porcentaje + "%";

  // Actualizar texto del contador
  attemptsCounter.textContent = restantes + " / " + maxIntentos;

  // Cambiar color según intentos restantes
  barFill.classList.remove("low", "critical");
  if (restantes <= 2) {
    barFill.classList.add("critical");
  } else if (restantes <= 4) {
    barFill.classList.add("low");
  }
}

// ============================================
// AGREGAR CHIP AL HISTORIAL
// Crea un elemento visual (chip) que muestra
// el número intentado y una flecha indicadora.
// ============================================
function agregarChipHistorial(numero, tipo) {
  // Eliminar el mensaje "Aún no hay intentos" si existe
  const emptyMsg = document.getElementById("history-empty");
  if (emptyMsg) emptyMsg.remove();

  // Crear el chip
  const chip = document.createElement("span");
  chip.className = "history-chip";

  // Determinar clase y flecha según el tipo de resultado
  if (tipo === "higher") {
    // El número secreto es MAYOR que la conjetura
    chip.classList.add("chip-higher");
    chip.innerHTML = numero + ' <span class="chip-arrow">⬆</span>';
  } else if (tipo === "lower") {
    // El número secreto es MENOR que la conjetura
    chip.classList.add("chip-lower");
    chip.innerHTML = numero + ' <span class="chip-arrow">⬇</span>';
  } else {
    // El jugador acertó
    chip.classList.add("chip-correct");
    chip.innerHTML = numero + ' <span class="chip-arrow">✓</span>';
  }

  // Pequeño retraso para la animación
  chip.style.animationDelay = "0.05s";
  historyList.appendChild(chip);
}

// ============================================
// DESHABILITAR ENTRADA
// Se llama cuando el juego termina (ganar o
// agotar intentos). Bloquea el input y botón.
// ============================================
function deshabilitarEntrada() {
  guessInput.disabled = true;
  guessBtn.disabled = true;
  juegoTerminado = true;

  // Mostrar botón de reinicio con animación
  restartBtn.classList.remove("hidden");
}

// ============================================
// EFECTO DE CONFETI (Celebración)
// Dibuja confeti animado cuando el jugador
// adivina correctamente el número.
// ============================================
function lanzarConfeti() {
  // Crear canvas para el confeti
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Ajustar tamaño al viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Colores del confeti
  const colores = [
    "#a78bfa",
    "#c4b5fd",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#60a5fa",
    "#f472b6",
  ];

  // Crear partículas de confeti
  const particulas = [];
  for (let i = 0; i < 120; i++) {
    particulas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colores[Math.floor(Math.random() * colores.length)],
      velocidadY: Math.random() * 3 + 2,
      velocidadX: (Math.random() - 0.5) * 2,
      rotacion: Math.random() * 360,
      velocidadRotacion: (Math.random() - 0.5) * 8,
      opacidad: 1,
    });
  }

  let fotogramas = 0;
  const maxFotogramas = 180; // ~3 segundos

  // Bucle de animación del confeti
  function animar() {
    fotogramas++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particulas.forEach((p) => {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate((p.rotacion * Math.PI) / 180);
      ctx.globalAlpha = p.opacidad;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      // Actualizar posición
      p.y += p.velocidadY;
      p.x += p.velocidadX;
      p.rotacion += p.velocidadRotacion;

      // Desvanecer al final
      if (fotogramas > maxFotogramas - 60) {
        p.opacidad -= 0.016;
        if (p.opacidad < 0) p.opacidad = 0;
      }
    });

    // Continuar o limpiar
    if (fotogramas < maxFotogramas) {
      requestAnimationFrame(animar);
    } else {
      canvas.remove();
    }
  }

  animar();
}

// ============================================
// PROCESAR CONJETURA
// Lógica principal que evalúa el número
// ingresado por el jugador.
// ============================================
function procesarConjetura() {
  // Evitar acciones si el juego terminó
  if (juegoTerminado) return;

  // Obtener y validar el valor ingresado
  const valorInput = guessInput.value.trim();
  const conjetura = parseInt(valorInput, 10);

  // Validar que sea un número válido dentro del rango
  if (isNaN(conjetura) || conjetura < RANGO_MIN || conjetura > rangoMax) {
    feedbackMsg.textContent =
      "⚠️ Por favor, ingresa un número entre " +
      RANGO_MIN +
      " y " +
      rangoMax +
      ".";
    feedbackMsg.className = "feedback-gameover";
    guessInput.classList.add("shake");
    setTimeout(() => guessInput.classList.remove("shake"), 400);
    return;
  }

  // Verificar si ya intentó este número
  if (historialIntentos.includes(conjetura)) {
    feedbackMsg.textContent =
      "🔁 Ya intentaste el número " + conjetura + ". Prueba con otro.";
    feedbackMsg.className = "feedback-higher";
    guessInput.value = "";
    guessInput.focus();
    return;
  }

  // Registrar el intento
  historialIntentos.push(conjetura);

  // ---- CASO 1: El jugador acierta ----
  if (conjetura === numeroSecreto) {
    feedbackMsg.textContent =
      "🎉 ¡Felicidades! Adivinaste el número " +
      numeroSecreto +
      " en " +
      intentoActual +
      (intentoActual === 1 ? " intento!" : " intentos!");
    feedbackMsg.className = "feedback-correct celebrate";
    agregarChipHistorial(conjetura, "correct");
    deshabilitarEntrada();
    lanzarConfeti();

    // ---- CASO 2: Falló pero le quedan intentos ----
  } else if (intentoActual < maxIntentos) {
    const esMAYOR = numeroSecreto > conjetura;
    if (esMAYOR) {
      feedbackMsg.textContent =
        "📈 El número secreto es MAYOR que " + conjetura + ".";
      feedbackMsg.className = "feedback-higher";
      agregarChipHistorial(conjetura, "higher");
    } else {
      feedbackMsg.textContent =
        "📉 El número secreto es MENOR que " + conjetura + ".";
      feedbackMsg.className = "feedback-lower";
      agregarChipHistorial(conjetura, "lower");
    }

    // Incrementar el intento
    intentoActual++;
    actualizarBarra();

    // Animación de sacudida en el feedback
    feedbackMsg.classList.add("shake");
    setTimeout(() => feedbackMsg.classList.remove("shake"), 400);

    // ---- CASO 3: Se acabaron los intentos ----
  } else {
    feedbackMsg.textContent =
      "💀 ¡Se acabaron tus intentos! El número era " + numeroSecreto + ".";
    feedbackMsg.className = "feedback-gameover";
    agregarChipHistorial(
      conjetura,
      numeroSecreto > conjetura ? "higher" : "lower",
    );
    deshabilitarEntrada();

    // Actualizar barra a 0
    barFill.style.width = "0%";
    attemptsCounter.textContent = "0 / " + maxIntentos;
  }

  // Limpiar input y reenfocar
  guessInput.value = "";
  if (!juegoTerminado) guessInput.focus();
}

// ============================================
// EVENTOS
// Conectamos los botones y teclas con las
// funciones del juego.
// ============================================

// Clic en el botón "Adivinar"
guessBtn.addEventListener("click", procesarConjetura);

// Presionar Enter en el campo de entrada
guessInput.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    procesarConjetura();
  }
});

// Clic en el botón "Jugar de nuevo"
restartBtn.addEventListener("click", iniciarJuego);

// Clic en el botón secreto: revela el número
cheatBtn.addEventListener('click', function () {
  if (!cheatBtn.classList.contains('revealed')) {
    cheatBtn.textContent = '🔑 ' + numeroSecreto;
    cheatBtn.classList.add('revealed');
  }
});

// ============================================
// CONFIGURACIÓN — EVENTOS DEL PANEL
// ============================================

// Abrir / cerrar el panel de configuración
settingsToggle.addEventListener('click', function () {
  settingsPanel.classList.toggle('hidden');
  settingsToggle.classList.toggle('active');
});

// Actualizar la etiqueta al mover el slider de rango
rangeSlider.addEventListener('input', function () {
  rangeValue.textContent = rangeSlider.value;
});

// Actualizar la etiqueta al mover el slider de intentos
attemptsSlider.addEventListener('input', function () {
  attemptsValue.textContent = attemptsSlider.value;
});

// Aplicar configuración y reiniciar el juego
applySettingsBtn.addEventListener('click', function () {
  // Leer valores de los sliders
  rangoMax = parseInt(rangeSlider.value, 10);
  maxIntentos = parseInt(attemptsSlider.value, 10);

  // Cerrar el panel de configuración
  settingsPanel.classList.add('hidden');
  settingsToggle.classList.remove('active');

  // Reiniciar el juego con la nueva configuración
  iniciarJuego();
});

// ============================================
// ARRANQUE INICIAL
// Iniciamos el juego al cargar la página.
// ============================================
iniciarJuego();
