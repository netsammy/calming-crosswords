/**
 * TOAST UTILITY
 * Shows floating feedback messages
 */
export function showToast(message, type = 'found') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Remove after animation ends (~1.8s)
  setTimeout(() => toast.remove(), 1900);
}

/**
 * CONFETTI
 * Burst of colored confetti particles
 */
export function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const colors = ['#f5c842','#4db8ff','#66e6a3','#ff7f7f','#b48ef7','#ff9f5a'];
  const pieces = Array.from({ length: 80 }, () => ({
    x:    Math.random() * canvas.width,
    y:    -20 - Math.random() * 100,
    r:    3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx:   (Math.random() - 0.5) * 4,
    vy:   2 + Math.random() * 4,
    rot:  Math.random() * 360,
    vr:   (Math.random() - 0.5) * 8,
    alpha: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of pieces) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.vr;
      p.alpha = Math.max(0, p.alpha - 0.008);
      if (p.alpha <= 0) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }
    if (alive > 0) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
  setTimeout(() => cancelAnimationFrame(frame), 4000);
}
