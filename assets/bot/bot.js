// ========== HYDRA ==========

// inicializa hydra con audio detectado
const hydra = new Hydra({ detectAudio: true });

// pide permiso para el micrófono
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    hydra.setResolution(window.innerWidth, window.innerHeight);
    // visual que responde a la voz
    osc(8, 0.05, 1)
      .modulate(noise(3, 0.3).color(1, 0.3, 0.8), () => a.fft[0] * 0.3)
      .color(1.2, 0.3, 0.9)
      .kaleid(5)
      .rotate(0.3, 0.05)
      .blend(o0, 0.5)
      .contrast(1.4)
      .out();
  })
  .catch(err => {
    console.warn("micrófono bloqueado:", err);
    // fallback: aura normal sin mic
    osc(10, 0.02, 0.5)
      .color(1.2, 0.3, 0.8)
      .kaleid(4)
      .rotate(0.2, 0.05)
      .out();
  });

// dummy para que no truene la llamada desde generarPoema()
function auraRosa() {
  // si luego quieres cambiar el visual cada vez, lo haces aquí
}



// ========== TRACERY + POEMA ==========

const tracery = {
  createGrammar: function (rules) {
    return {
      rules,
      flatten: function (rule) {
        const expand = s =>
          s.replace(/#(.*?)#/g, (_, key) => {
            const ruleName = key.split(".")[0];
            let result = this.select(ruleName);
            return result ? expand(result) : "";
          });
        return expand(this.select(rule));
      },
      select: function (key) {
        const r = this.rules[key];
        return Array.isArray(r)
          ? r[Math.floor(Math.random() * r.length)]
          : r;
      }
    };
  }
};

const grammarSource = {
  origin: ["#b1#\n\n#b2#\n\n#b3#\n\n#final#"],
  b1: [
    "Hoy te volví a ver #presencia#, frente al #emocion#, sobre #espacio#.",
    "Cayendo en el borde, #figura# se esconde como #compañero# fiel."
  ],
  b2: [
    "Recordé el estado de no saber, ese vacío #paralizante# y #amigable#.",
    "En medio de la #escena#, no había peligro, pero sí culpa."
  ],
  b3: [
    "Toca la lengua en tus manos, desahoga al juez una y otra vez.",
    "Nunca conocí el espacio de no ser criticada, solo el eco de #entorno#."
  ],
  final: [
    "El sufrimiento era mi espacio seguro, pero ahora aprendo a respirar sin él.",
    "Reconocer mi dolor no me condena, me devuelve a casa.",
    "El fuego rosa arde, pero no quema: limpia lo que ya no soy."
  ],
  presencia: ["en la coronilla", "en la voz", "en los ojos"],
  emocion: ["pánico inmovilizante", "eco del juicio", "miedo heredado"],
  espacio: ["hielo delgado", "cuarto sin techo", "borde del abismo"],
  figura: ["la sombra", "el reflejo", "el bulto de ropa"],
  compañero: ["un amigo", "un espectro", "un eco"],
  juez: ["una voz interna", "una herencia", "una culpa vieja"],
  paralizante: ["frío", "dulce", "denso"],
  amigable: ["lejano", "habitual", "conocido"],
  escena: ["mesa de juego", "habitación iluminada", "rincón del alma"],
  entorno: ["la familia", "el cuerpo", "el silencio", "los otros"]
};

function generarPoema() {
  const grammar = tracery.createGrammar(grammarSource);
  const poema = grammar.flatten("origin");
  const output = document.getElementById("output");
  const footer = document.querySelector("footer");

  output.innerText = poema;
  output.style.opacity = 1;
  footer.style.opacity = 1;

  auraRosa();
}

// ========== EVENTOS ==========

window.addEventListener("DOMContentLoaded", () => {
  const fondo = document.getElementById("fondo");
  fondo.volume = 0.4;

  document.getElementById("iniciarBtn").addEventListener("click", () => {
    document.getElementById("inicioContainer").style.display = "none";
    document.getElementById("contenido").style.display = "block";
    fondo.play();
    generarPoema();
  });

  document.getElementById("boton").addEventListener("click", generarPoema);
});
