// =====================
//  AUDIO TIPO CONSOLA 🎮
// =====================
let audioCtx = null;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playBeep(freq = 440, durationMs = 150) {
  ensureAudioContext();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square"; // sonido retro
  osc.frequency.value = freq;
  gain.gain.value = 0.2; // volumen

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
  }, durationMs);
}

document.addEventListener("DOMContentLoaded", () => {
  // 👉 Puedes cambiar esto por las frecuencias reales de tus ratones
  const frecsRatones = [220, 247, 262, 294, 330, 349, 392];

  // Tomamos:
  // - links del menú principal
  // - TODOS los .a--back (volver al inicio)
  // - cualquier cosa con clase .boton-sonido
  const sonidoBtns = document.querySelectorAll(
    ".hero__nav a, .a--back, .boton-sonido"
  );

  sonidoBtns.forEach((btn, i) => {
    const freq = frecsRatones[i % frecsRatones.length];

    btn.addEventListener("click", (e) => {
      // que primero suene
      e.preventDefault();
      playBeep(freq, 180);

      // decidir a dónde navega
      const href = btn.getAttribute("href") || btn.dataset.href;
      if (href) {
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      }
    });
  });
});

