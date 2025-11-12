const lines = document.querySelectorAll('[data-glitch]');

if (lines.length > 0) {
  let idx = 0;
  lines[0].classList.add('active');

  setInterval(() => {
    lines.forEach((line, i) => {
      const intensity = Math.abs(Math.sin(Date.now() / 600 + i));
      line.style.opacity = 0.7 + intensity * 0.3;
    });

    lines[idx].classList.remove('active');
    idx = (idx + 1) % lines.length;
    lines[idx].classList.add('active');
  }, 2000);
}

window.addEventListener('keydown', () => {
  document.body.classList.toggle('invert');
});
