// Ember Duel — mouse + keyboard input. Hit-testing lives on ui,
// which render() refills every frame.
export function inside(pt, box) {
  return box && pt.x >= box.x && pt.x <= box.x + box.w && pt.y >= box.y && pt.y <= box.y + box.h;
}

export function attachInput(canvas, g, ui, hooks) {
  function scalePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 720,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const pt = scalePos(e);
    ui.hover = -1;
    (ui.cards || []).forEach((box) => {
      if (inside(pt, box)) ui.hover = box.index;
    });
  });

  canvas.addEventListener('click', (e) => {
    const pt = scalePos(e);
    if (g.phase === 'title') { hooks.start(); return; }
    if (g.phase === 'won' || g.phase === 'lost') { hooks.restart(); return; }
    if (g.phase !== 'play') return;
    if (inside(pt, ui.endTurn)) { hooks.endTurn(); return; }
    let hit = -1;
    (ui.cards || []).forEach((box) => {
      if (inside(pt, box)) hit = box.index;
    });
    if (hit >= 0) hooks.playCard(hit);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (g.phase === 'title') hooks.start();
      else if (g.phase === 'play') hooks.endTurn();
      else if (g.phase === 'won' || g.phase === 'lost') hooks.restart();
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      if (g.phase === 'won' || g.phase === 'lost') hooks.restart();
      return;
    }
    if (g.phase !== 'play') return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= g.player.hand.length) hooks.playCard(n - 1);
  });
}
