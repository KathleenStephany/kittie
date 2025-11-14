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
  gain.gain.value = 0.2;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
  }, durationMs);
}

document.addEventListener("DOMContentLoaded", () => {
  // 👉 cámbialas luego por las frecuencias de tus ratones si quieres
  const frecsRatones = [220, 247, 262, 294, 330, 349, 392];

  // Links del menú + botones volver + cualquier boton-sonido
  const sonidoBtns = document.querySelectorAll(
    ".hero__nav a, .a--back, .boton-sonido"
  );

  sonidoBtns.forEach((btn, i) => {
    const freq = frecsRatones[i % frecsRatones.length];

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      playBeep(freq, 180);

      // href normal o data-href si en algún momento usas <button>
      const href = btn.getAttribute("href") || btn.dataset.href;
      if (href) {
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      }
    });
  });
});
