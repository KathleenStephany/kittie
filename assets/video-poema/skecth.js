
// ============================================================
// 🎢 VIDEOPOEMA — con voz femenina suave en video 4
// ============================================================
let secuencias = [
  { videoFile: "video_1.mp4", audioFile: "audio_1.mp3", frases: ["piel", "semilla", "jardin trasero"] },
  { videoFile: "video_2.mp4", audioFile: "audio_2.mp3", frases: [], voz: "duende" },
  { videoFile: "video_3.mp4", audioFile: "audio_3.mp3", frases: ["vida", "en el", "silencio"], efecto: "randomRotar" },
  { 
    videoFile: "video_4ok.mp4", 
    audioFile: "audio_4ok.mp3", 
    frases: ["mente de flujos latentes", "solamente con el sostén,", "de memorias en el cuerpo."],
    efecto: "verticalRojo",
    voz: "poemaFemenina"   // 🩰 voz femenina
  },
  { videoFile: "video_5ok.mp4", audioFile: "audio_5.mp3", frases: [] },
  { videoFile: "video_6.mp4", audioFile: "audio_6.mp3", frases: [] },
  { videoFile: "video_7.mp4", audioFile: "audio_7.mp3", frases: [] },
  { videoFile: "video_8.mp4", audioFile: "audio_7.mp3", frases: [] },
  { videoFile: "video_9.mp4", audioFile: "audio_7.mp3", frases: [] },
  { videoFile: "video_10.mp4", audioFile: "audio_10.mp3", frases: [] },
  { videoFile: "video_11.mp4", audioFile: "audio_11.mp3", frases: [] },
  { videoFile: "video_12.mp4", audioFile: "audio_12.mp3", frases: [] }
];

let video;
let audio;
let posiciones = [];
let velocidad = 3;
let indiceActual = 0;
let mostrarDuende = false;
let duendePos;
let duendeTam = 60;

function preload() {
  for (let s of secuencias) s.audioObj = loadSound(s.audioFile);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio();          // 🔊 importante para que deje sonar
  cargarSecuencia(indiceActual);
}

function cargarSecuencia(i) {
  if (video) video.remove();

  let sec = secuencias[i];
  video = createVideo(sec.videoFile, () => {
    video.volume(0);
    startCycle(sec);
  });
  video.hide();

  if (i >= 7 && i <= 8) audio = secuencias[6].audioObj;
  else audio = sec.audioObj;

  video.onended(() => {
    if (i === 8 && audio && audio.isPlaying()) audio.stop();
    if (!(i >= 6 && i <= 7) && i !== 8 && i !== 9 && i !== 10 && i !== 11) {
      if (audio && audio.isPlaying()) audio.stop();
    }
    speechSynthesis.cancel();
    indiceActual++;
    if (indiceActual < secuencias.length) cargarSecuencia(indiceActual);
  });

  resetPalabras(sec.frases, sec.efecto);
  duendePos = createVector(width - 100, height - 50);
}

function startCycle(sec) {
  video.play();

  if (indiceActual >= 3 && indiceActual <= 5) audio.loop();
  else if (indiceActual === 6) audio.loop();
  else if (indiceActual === 9) {
    audio.loop();
    video.onended(() => {
      if (audio.isPlaying()) audio.stop();
      speechSynthesis.cancel();
      indiceActual++;
      if (indiceActual < secuencias.length) cargarSecuencia(indiceActual);
    });
  } else if (indiceActual === 10) {
    audio.play(0);
    video.onended(() => {
      if (audio.isPlaying()) audio.stop();
      speechSynthesis.cancel();
      indiceActual++;
      if (indiceActual < secuencias.length) cargarSecuencia(indiceActual);
    });
  } else if (indiceActual === 11) {
    audio.loop();
    video.onended(() => {
      if (audio.isPlaying()) audio.stop();
      speechSynthesis.cancel();
    });
  } else {
    audio.play(0);
    audio.onended(() => {
      if (video && !video.elt.ended) video.stop();
    });
  }

  // 🎙️ activar voz correspondiente
  if (sec.voz === "poemaFemenina") {
    setTimeout(() => { hablarPoemaFemenina(); }, 2000);
  } else if (sec.voz === "duende") {
    setTimeout(() => { mostrarDuende = true; hablarDuende(); }, 2000);
  }
}

// 👁️ voz duende
function hablarDuende() {
  let msg = new SpeechSynthesisUtterance("duende");
  msg.lang = "es-ES";
  msg.pitch = 0.6;
  msg.rate = 0.7;
  speechSynthesis.speak(msg);
}

// 🌬️ voz femenina suave (es-ES preferiblemente)
function hablarPoemaFemenina() {
  let texto = "Mente de flujos latentes. Solamente con el sostén. De memorias en el cuerpo.";
  let msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-ES";
  msg.pitch = 1.3;    // tono femenino
  msg.rate = 0.85;    // pausado
  msg.volume = 0.8;   // suave
  let voces = speechSynthesis.getVoices();
  let femenina = voces.find(v => /female|mujer|Google español/.test(v.name.toLowerCase()));
  if (femenina) msg.voice = femenina;
  speechSynthesis.speak(msg);
}

function resetPalabras(frases, efecto = null) {
  posiciones = [];
  if (!frases || frases.length === 0) return;
  for (let i = 0; i < frases.length; i++) {
    posiciones.push({
      palabra: frases[i],
      x: random(100, width - 100),
      y: random(100, height - 100),
      angulo: random(TWO_PI),
      velocidadRot: random(0.02, 0.05),
      velocidadX: random(-2, 2),
      velocidadY: random(-2, 2),
      efecto: efecto
    });
  }
}

function draw() {
  background(0);
  if (video) image(video, 0, 0, width, height);

  // 🔴 VIDEO 1 — texto rojo que sube
  if (posiciones.length > 0 && indiceActual === 0) {
    fill(255, 50, 50);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(40);
    for (let p of posiciones) {
      push();
      translate(p.x, p.y);
      rotate(-HALF_PI);
      text(p.palabra, 0, 0);
      pop();
      p.y -= velocidad;
      if (p.y < -200) p.y = height + 100;
    }
  }

  // ✨ VIDEO 2 — duende interactivo
  if (mostrarDuende && indiceActual === 1) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(duendeTam);
    let offsetX = random(-3, 3);
    let offsetY = random(-3, 3);
    text("duende", duendePos.x + offsetX, duendePos.y + offsetY);
    let d = dist(mouseX, mouseY, duendePos.x, duendePos.y);
    if (d < duendeTam) {
      duendePos.x = random(100, width - 100);
      duendePos.y = random(100, height - 100);
    }
  }

  // ⚪ VIDEO 3 — palabras rotando
  if (posiciones.length > 0 && indiceActual === 2) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(50);
    for (let p of posiciones) {
      push();
      translate(p.x, p.y);
      rotate(p.angulo);
      text(p.palabra, 0, 0);
      pop();
      p.angulo += p.velocidadRot;
      p.x += p.velocidadX;
      p.y += p.velocidadY;
      if (p.x < 50 || p.x > width - 50) p.velocidadX *= -1;
      if (p.y < 50 || p.y > height - 50) p.velocidadY *= -1;
    }
  }

  // ❤️ VIDEO 4 — versos verticales rojos, con espacio real entre renglones y voz femenina
if (indiceActual === 3) {
  fill(255, 0, 0);
  noStroke();
  textAlign(CENTER, CENTER);

  // 🫀 palpitar
  let t = millis() * 0.004;
  let tam = 28 + sin(t) * 3;
  textSize(tam);

  // texto del poema
  let versos = [
    "mente de flujos latentes",
    "solamente con el sostén,",
    "de memorias en el cuerpo."
  ];

  // función auxiliar para dibujar palabra por palabra en vertical
  function textoVertical(x, yInicio, verso, invertido = false) {
    let palabras = verso.split(" ");
    for (let i = 0; i < palabras.length; i++) {
      push();
      translate(x, yInicio + i * 40); // espacio entre líneas (40 px)
      rotate(invertido ? HALF_PI : -HALF_PI);
      text(palabras[i], 0, 0);
      pop();
    }
  }

  // 🔺 izquierda (de arriba a abajo)
  let yBaseIzq = height * 0.25;
  for (let i = 0; i < versos.length; i++) {
    textoVertical(width * 0.18, yBaseIzq + i * 180, versos[i], false);
  }

  // 🔻 derecha (de abajo a arriba)
  let yBaseDer = height * 0.75;
  for (let i = 0; i < versos.length; i++) {
    textoVertical(width * 0.82, yBaseDer - i * 180, versos[i], true);
  }
}

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


/* cd OneDrive\Documentos\2025-2\NOBOOKS\ACT2> python -m http.server 8000 */