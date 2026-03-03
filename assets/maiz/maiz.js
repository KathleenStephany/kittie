window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("maizCanvas");
  const tooltip = document.getElementById("tooltip");

  const btnRespawn = document.getElementById("btnRespawn");
  const palTrad = document.getElementById("palTrad");
  const palRosa = document.getElementById("palRosa");
  const palMorado = document.getElementById("palMorado");

  if (!canvas) {
    console.error("Falta #maizCanvas en el HTML.");
    return;
  }

  const ctx = canvas.getContext("2d");

  // ===== Metadata (tu info SRA) =====
  const MAIZ_META = {
    project: "PRJNA1345371",
    title: "Diversity within a Mexican maize: Olotillo",
    objective: "Characterize the genetic diversity within a Mexican maize race.",
    institute: "UNAM, Instituto de Biología",
    relevance: "Agricultural",
    data_volume_gbases: 1,
    data_volume_mbytes: 288
  };

  // ===== SPRITE (0=transp, 1=negro, 2=verde oscuro, 3=verde claro, 4/5=grano) =====
  const SPRITE = [ 
  "00000000000011111110000000000000", 
  "00000000000144444444100000000000", 
  "00000000001444444444410000000000", 
  "00000000014444444444441000000000", 
  "00000000114444555554444110000000",
  "00000000144445555555444410000000", 
  "00000001144445555555444411000000", 
  "00001001144445555555444411000000", 
  "00133100114444555555544441100000", 
  "01333314444455555554444111111100", 
  "13333331444445555555444413333331", 
  "13333331444445555555444413333310", 
  "01133331444445555555444413331100", 
  "00013333314444444444441333310000", 
  "00013333331444444444413333310000", 
  "00001133333144444444133331100000", 
  "00000013333311444411333310000000", 
  "00000001333331111113333100000000", 
  "00000000133333313333331000000000", 
  "00000000013333133333310000000000", 
  "00000000001331333332100000000000", 
  "00000000000113333231000000000000", 
  "00000000000013332310000000000000", 
  "00000000000001111100000000000000" ];

  const rows = SPRITE.length;
  const cols = SPRITE[0].length;

  // ===== Secuencia DNA =====
  function randomDNA(n) {
    const b = ["A", "C", "G", "T"];
    let s = "";
    for (let i = 0; i < n; i++) s += b[(Math.random() * 4) | 0];
    return s;
  }

  let sequence = randomDNA(12000);
  let seqOffset = 0;

  // ===== Paletas (solo afectan granos 4/5) =====
  const PALETTES = {
    tradicional: { fill: "#f6d54a", grid: "#e1aa1f", cross: "#d99a12" },
    rosa:        { fill: "#ff7adf", grid: "#ff4dd8", cross: "#a31977" },
    morado:      { fill: "#b794ff", grid: "#7c3aed", cross: "#4c1d95" }
  };

  let paletteMode = "tradicional";

  // ===== Layout cache para hover y render rápido =====
  // cells: {x,y,w,h, code, kIndex, spriteX, spriteY}
  let layout = {
    cell: 14,
    startX: 0,
    startY: 0,
    cells: []
  };

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildLayout();
  }

  window.addEventListener("resize", () => {
    resize();
  });

  function buildLayout() {
    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    // escala del sprite en canvas (centrado)
    const maxW = W * 0.78;
    const maxH = H * 0.78;
    const cell = Math.floor(Math.min(maxW / cols, maxH / rows));

    const startX = Math.floor((W - cols * cell) / 2);
    const startY = Math.floor((H - rows * cell) / 2);

    const cells = [];
    let kIndex = 0;

    for (let sy = 0; sy < rows; sy++) {
      const row = SPRITE[sy];
      for (let sx = 0; sx < cols; sx++) {
        const code = row.charCodeAt(sx) - 48;
        if (code === 0) continue;

        const x = startX + sx * cell;
        const y = startY + sy * cell;

        cells.push({ x, y, w: cell, h: cell, code, kIndex, spriteX: sx, spriteY: sy });
        kIndex++;
      }
    }

    layout = { cell, startX, startY, cells };
  }

  // ===== Helpers color =====
  function shade(hex, amt) {
    const h = hex.replace("#", "");
    const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + amt));
    return `rgb(${r},${g},${b})`;
  }

  function grainColor(spriteX, spriteY, pal) {
    // patrón “rejilla + cruces” homogéneo tipo ícono
    const cellSize = 4;
    const lineW = 1;
    const onV = (spriteX % cellSize) < lineW;
    const onH = (spriteY % cellSize) < lineW;
    const atCross =
      (spriteX % cellSize === 0) &&
      (spriteY % cellSize === 0) &&
      (((spriteX / cellSize + spriteY / cellSize) % 2) === 0);

    if (atCross) return pal.cross;
    if (onV || onH) return pal.grid;
    return pal.fill;
  }

  function leafColor(code, spriteX, spriteY) {
    // hojas con sombra simple
    if (code === 2) return "#5c7a2f";
    if (code === 3) {
      if (spriteX > cols / 2 && spriteY > rows / 2) return "#5c7a2f";
      return "#7fb047";
    }
    return "#7fb047";
  }

  // ===== Fondo pulsante =====
  function drawPulsingBackground(t) {
    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    const pulse = 0.12 + 0.10 * Math.sin(t * 0.9); // 0.02..0.22 aprox
    const pulse2 = 0.12 + 0.08 * Math.sin(t * 0.6 + 1.2);

    const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 40, W * 0.5, H * 0.35, H * 0.95);
    g.addColorStop(0, `rgba(255,77,216,${pulse})`);
    g.addColorStop(0.45, `rgba(120,0,150,${pulse2})`);
    g.addColorStop(1, "#1a0026");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // ===== Render (incluye “respirar”) =====
  let hoveredCell = null;

  function render() {
    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    const t = performance.now() * 0.001;

    ctx.clearRect(0, 0, W, H);
    drawPulsingBackground(t);

    // HUD
    ctx.save();
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = "rgba(244,233,255,0.85)";
    //ctx.fillText("MAÍZ CRIOLLO // ANTOCIANINAS", 18, 34);
    ctx.restore();

    // “respirar” = offset suave global + micro wobble
    const breathe = 1.4 * Math.sin(t * 1.4);  // amplitud pix
    const breatheY = 1.0 * Math.cos(t * 1.2);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.floor(layout.cell * 0.82)}px VT323`;

    const pal = PALETTES[paletteMode] || PALETTES.tradicional;

    for (const c of layout.cells) {
      const px = c.x + breathe;
      const py = c.y + breatheY;

      // base color por tipo
      let base;
      if (c.code === 1) base = "#000000";
      else if (c.code === 2 || c.code === 3) base = leafColor(c.code, c.spriteX, c.spriteY);
      else base = grainColor(c.spriteX, c.spriteY, pal);

      // highlight hover
      const isHover = hoveredCell && hoveredCell.kIndex === c.kIndex;

      // brillo suave general
      ctx.shadowColor = isHover ? "rgba(255,77,216,0.45)" : "rgba(255,120,255,0.12)";
      ctx.shadowBlur = isHover ? 10 : 4;

      ctx.fillStyle = base;
      ctx.fillRect(px, py, c.w, c.h);

      ctx.shadowBlur = 0;

      // letra
      const ch = sequence[(seqOffset + c.kIndex) % sequence.length];

      const letterColor = (c.code === 1)
        ? "rgba(240,240,255,0.90)"
        : shade(base, -70);

      ctx.fillStyle = isHover ? "rgba(255,240,255,0.95)" : letterColor;
      ctx.fillText(ch, px + c.w / 2, py + c.h / 2);
    }

    requestAnimationFrame(render);
  }

  // ===== Hover tooltip =====
  function showTooltip(cell, evt) {
    const base = sequence[(seqOffset + cell.kIndex) % sequence.length];
    const pos = (seqOffset + cell.kIndex) + 1;

    tooltip.innerHTML = `
      <div><b>${base}</b> <span style="opacity:.85">pos ${pos}</span></div>
      <div style="margin-top:.45rem; opacity:.95">
        <div><b>Proyecto:</b> ${MAIZ_META.project}</div>
        <div><b>Título:</b> ${MAIZ_META.title}</div>
        <div><b>Institución:</b> ${MAIZ_META.institute}</div>
        <div><b>Relevancia:</b> ${MAIZ_META.relevance}</div>
        <div><b>Volumen:</b> ${MAIZ_META.data_volume_gbases} Gbases (${MAIZ_META.data_volume_mbytes} MB)</div>
        <div><b>Maíz:</b> ${paletteMode}</div>
      </div>
    `;

    tooltip.style.display = "block";
    const stageRect = canvas.parentElement.getBoundingClientRect();
    tooltip.style.left = (evt.clientX - stageRect.left) + "px";
    tooltip.style.top = (evt.clientY - stageRect.top) + "px";
  }

  function hideTooltip() {
    tooltip.style.display = "none";
  }

  function getMouse(evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  function hitTest(mx, my) {
    // convertir mouse a coordenadas de celda del sprite
    const sx = Math.floor((mx - layout.startX) / layout.cell);
    const sy = Math.floor((my - layout.startY) / layout.cell);
    if (sx < 0 || sx >= cols || sy < 0 || sy >= rows) return null;

    const code = SPRITE[sy].charCodeAt(sx) - 48;
    if (code === 0) return null;

    // buscar la celda exacta (muy pocas celdas; esto va rápido)
    // opcional: indexado por mapa, pero aquí sobra.
    let best = null;
    for (const c of layout.cells) {
      if (c.spriteX === sx && c.spriteY === sy) { best = c; break; }
    }
    return best;
  }

  canvas.addEventListener("mousemove", (evt) => {
    const { x, y } = getMouse(evt);
    const cell = hitTest(x, y);
    hoveredCell = cell;

    if (cell) showTooltip(cell, evt);
    else hideTooltip();
  });

  canvas.addEventListener("mouseleave", () => {
    hoveredCell = null;
    hideTooltip();
  });

  // ===== Controles =====
  btnRespawn?.addEventListener("click", () => {
    seqOffset = (seqOffset + 97) % sequence.length;
  });

  palTrad?.addEventListener("click", () => { paletteMode = "tradicional"; });
  palRosa?.addEventListener("click", () => { paletteMode = "rosa"; });
  palMorado?.addEventListener("click", () => { paletteMode = "morado"; });

  // init
  resize();
  render();
});