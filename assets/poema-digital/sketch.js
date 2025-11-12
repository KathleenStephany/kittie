let table;
let osc;
let canvas;

let colores = {
  "Dp23p": [30, 144, 255],   // azul
  "Dbp7p": [215, 48, 39],    // rojo
  "Dbp7pMb": [255, 215, 0],  // amarillo
  "Dbp7pMr": [255, 20, 147], // rosa
  "Dbp7pMm": [106, 90, 205]  // morado
};

let grupos = {}; 
let maxDia, maxPeso;

let puntos = [];
let totalCurvas = 135; // 27 ciclos x 5 tratamientos
let curvasHechas = 0;
let currentGrupo, currentRows, currentRowIndex;
let startX, startY, direccion;

function preload() {
  // Ruta relativa al HTML (poema-digital.html)
  table = loadTable("assets/poema-digital/sonificacion_data.csv", "csv", "header");
}

function setup() {
  // buscamos el contenedor del poema
  const holder = document.getElementById("poema-digital-container");
  const w = holder ? holder.offsetWidth : windowWidth;
  const h = holder ? holder.offsetHeight : windowHeight;

  canvas = createCanvas(w, h);
  if (holder) {
    canvas.parent("poema-digital-container");
  }

  background(0);
  userStartAudio();

  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0.15);

  maxDia = max(table.getColumn("dia").map(Number));
  maxPeso = max(table.getColumn("mean").map(Number));

  // agrupar por dieta
  let dietas = [...new Set(table.getColumn("dieta"))];
  for (let d of dietas) {
    grupos[d] = table.findRows(d, "dieta");
  }

  frameRate(27);
  nuevaCurva();
}

function nuevaCurva() {
  // elegir dieta random
  let dietas = Object.keys(grupos);
  currentGrupo = random(dietas);
  currentRows = grupos[currentGrupo];
  currentRowIndex = 0;

  // punto inicial random
  startX = random(100, width - 100);
  startY = random(100, height - 100);

  // dirección random
  direccion = floor(random(5));

  puntos = [];
}

function draw() {
  // si ya hicimos las 135 curvas
  if (curvasHechas >= totalCurvas) {
    curvasHechas = 0;   // reiniciar contador
    background(0);      // limpiar pantalla
    nuevaCurva();       // empezar otra vez
  }

  if (currentRowIndex >= currentRows.length) {
    curvasHechas++;
    nuevaCurva();
    return;
  }

  let r = currentRows[currentRowIndex];
  let dia = r.getNum("dia");
  let mean = r.getNum("mean");
  let freq = r.getNum("freq");
  let c = colores[currentGrupo];

  osc.freq(freq);

  let margen = 100;
  let x, y;

  if (direccion === 0) { 
    // abajo → arriba
    x = startX + map(dia, 1, maxDia, -200, 200);
    y = map(mean, 0, maxPeso, height - margen, margen);
  } else if (direccion === 1) { 
    // arriba → abajo
    x = startX + map(dia, 1, maxDia, -200, 200);
    y = map(mean, 0, maxPeso, margen, height - margen);
  } else if (direccion === 2) { 
    // izquierda → derecha
    x = map(mean, 0, maxPeso, margen, width - margen);
    y = startY + map(dia, 1, maxDia, -200, 200);
  } else if (direccion === 3) { 
    // derecha → izquierda
    x = map(mean, 0, maxPeso, width - margen, margen);
    y = startY + map(dia, 1, maxDia, -200, 200);
  } else { 
    // desde el centro
    x = startX + map(dia, 1, maxDia, -200, 200);
    y = startY + map(mean, 0, maxPeso, -200, 200);
  }

  puntos.push({x: x, y: y, c: c});

  noFill();
  stroke(c[0], c[1], c[2]);
  strokeWeight(2.5);
  beginShape();
  for (let p of puntos) {
    stroke(p.c[0], p.c[1], p.c[2], 200);
    vertex(p.x, p.y);
  }
  endShape();

  currentRowIndex++;
}

function windowResized() {
  const holder = document.getElementById("poema-digital-container");
  if (holder) {
    const w = holder.offsetWidth;
    const h = holder.offsetHeight;
    resizeCanvas(w, h);
    background(0);
  } else {
    resizeCanvas(windowWidth, windowHeight);
    background(0);
  }
}
