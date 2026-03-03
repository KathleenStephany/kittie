window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("maizCanvas");
  const btnRespawn = document.getElementById("btnRespawn");

  if (!canvas) {
    console.error("No existe #maizCanvas en el HTML.");
    return;
  }
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resize();
  window.addEventListener("resize", () => {
    resize();
    draw();
  });

  function randomDNA(n) {
    const b = ["A", "C", "G", "T"];
    let s = "";
    for (let i = 0; i < n; i++) s += b[(Math.random() * 4) | 0];
    return s;
  }

  let sequence = randomDNA(10000);
  let seqOffset = 0;

  // 0 = transparente
  // 1 = negro (contorno)
  // 2 = verde oscuro
  // 3 = verde claro
  // 4 = amarillo
  // 5 = amarillo fuerte
  const SPRITE = [
    "00000000000011111110000000000000",
    "00000000000144444444100000000000",
    "00000000001444444444410000000000",
    "00000000014444444444441000000000",
    "00000000114444555554444110000000",
    "00000000144445555555444410000000",
    "00000001144445555555444411000000",
    "01111111444445555555444411111110",
    "13333331444445555555444413333331",
    "03333331444445555555444413333330",
    "01133331444445555555444413333110",
    "00013333314444444444441333333100",
    "00013333333333333333333333333100",
    "00001133333333333333333333311000",
    "00000011111111111111111111100000",
    "00000000000111111111000000000000",
    "00000000000133333331000000000000",
    "00000000000011111100000000000000"
  ];

  const COLORS = {
    1: "#000000",
    2: "#5c7a2f",
    3: "#7fb047",
    4: "#f6d54a",
    5: "#e1aa1f"
  };

  function shade(hex, amt) {
    const h = hex.replace("#", "");
    const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + amt));
    return `rgb(${r},${g},${b})`;
  }

  function drawNeonBackground() {
    const W = canvas.width;
    const H = canvas.height;

    const glow = ctx.createRadialGradient(
      W * 0.5, H * 0.35, 50,
      W * 0.5, H * 0.35, H * 0.9
    );

    glow.addColorStop(0, "rgba(255, 77, 216, 0.22)");
    glow.addColorStop(0.45, "rgba(120, 0, 150, 0.14)");
    glow.addColorStop(1, "#1a0026");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNeonBackground();

    const rows = SPRITE.length;
    const cols = SPRITE[0].length;

    const maxW = canvas.width * 0.75;
    const maxH = canvas.height * 0.75;

    const cell = Math.floor(Math.min(maxW / cols, maxH / rows));
    const startX = Math.floor((canvas.width - cols * cell) / 2);
    const startY = Math.floor((canvas.height - rows * cell) / 2);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.floor(cell * 0.85)}px VT323`;

    let k = 0;

    for (let y = 0; y < rows; y++) {
      const row = SPRITE[y];

      for (let x = 0; x < cols; x++) {
        const code = row.charCodeAt(x) - 48;
        if (code === 0) continue;

        const px = startX + x * cell;
        const py = startY + y * cell;

        let base = COLORS[code];

        // ===== Grano uniforme tipo sprite (rejilla + cruces) =====
        if (code === 4 || code === 5) {
          const fill = "#f6d54a";
          const grid = "#e1aa1f";
          const cross = "#d99a12";
          const cellSize = 4;
          const lineW = 1;

          const onV = (x % cellSize) < lineW;
          const onH = (y % cellSize) < lineW;

          const atCross =
            (x % cellSize === 0) &&
            (y % cellSize === 0) &&
            (((x / cellSize + y / cellSize) % 2) === 0);

          if (atCross) base = cross;
          else if (onV || onH) base = grid;
          else base = fill;
        }

        // ===== Sombreado hojas =====
        if (code === 2 || code === 3) {
          if (x > cols / 2 && y > rows / 2) base = "#5c7a2f";
          else base = "#7fb047";
        }

        // aura sutil
        ctx.shadowColor = "rgba(255, 120, 255, 0.18)";
        ctx.shadowBlur = 4;

        ctx.fillStyle = base;
        ctx.fillRect(px, py, cell, cell);

        ctx.shadowBlur = 0;

        // bisel en contorno
        if (code === 1) {
          const getCode = (xx, yy) => {
            if (yy < 0 || yy >= rows || xx < 0 || xx >= cols) return 0;
            return SPRITE[yy].charCodeAt(xx) - 48;
          };

          const n = getCode(x, y - 1);
          const s = getCode(x, y + 1);
          const w = getCode(x - 1, y);
          const e = getCode(x + 1, y);

          const nearColor = (c) => (c === 2 || c === 3 || c === 4 || c === 5);

          if (nearColor(n) || nearColor(s) || nearColor(w) || nearColor(e)) {
            ctx.save();
            ctx.globalAlpha = 0.30;
            ctx.fillStyle = "rgba(255,255,255,0.16)";
            const pad = Math.max(1, Math.floor(cell * 0.18));
            ctx.fillRect(px + pad, py + pad, cell - pad * 2, cell - pad * 2);
            ctx.restore();
          }
        }

        const ch = sequence[(seqOffset + k) % sequence.length];
        const letterColor = (code === 1)
          ? "rgba(240,240,255,0.85)"
          : shade(base, -70);

        ctx.fillStyle = letterColor;
        ctx.fillText(ch, px + cell / 2, py + cell / 2);

        k++;
      }
    }
  }

  draw();

  btnRespawn?.addEventListener("click", () => {
    seqOffset = (seqOffset + 97) % sequence.length;
    draw();
  });
});