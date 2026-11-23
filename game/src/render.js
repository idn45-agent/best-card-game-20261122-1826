// Ember Duel — all canvas drawing. One screen, one job per function.
import { ELEMENTS, ELEMENT_ORDER } from './cards.js';
import { MAX_HP, INTENT_LABEL } from './state.js';

export const W = 1280;
export const H = 720;
export const CARD_W = 150;
export const CARD_H = 208;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawElementShape(ctx, el, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.12;
  ctx.lineJoin = 'round';
  if (el === 'ember') {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.7, -s * 0.3, s * 0.75, s * 0.45, s * 0.35, s * 0.75);
    ctx.bezierCurveTo(s * 0.15, s * 0.9, -s * 0.15, s * 0.9, -s * 0.35, s * 0.75);
    ctx.bezierCurveTo(-s * 0.75, s * 0.45, -s * 0.7, -s * 0.3, 0, -s);
    ctx.fill();
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.25);
    ctx.bezierCurveTo(s * 0.32, s * 0.1, s * 0.3, s * 0.5, 0, s * 0.6);
    ctx.bezierCurveTo(-s * 0.3, s * 0.5, -s * 0.32, s * 0.1, 0, -s * 0.25);
    ctx.fill();
  } else if (el === 'tide') {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.8, -s * 0.1, s * 0.7, s * 0.75, 0, s * 0.8);
    ctx.bezierCurveTo(-s * 0.7, s * 0.75, -s * 0.8, -s * 0.1, 0, -s);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(-s * 0.25, s * 0.1, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (el === 'gale') {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.85, s * 0.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.1, -s * 0.45, s * 0.6, s * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.55);
    ctx.quadraticCurveTo(0, s * 0.95, s * 0.8, s * 0.5);
    ctx.quadraticCurveTo(0, s * 0.6, -s * 0.7, s * 0.55);
    ctx.fill();
  } else { // stone
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.75, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.75, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(s * 0.4, 0);
    ctx.lineTo(0, s * 0.55);
    ctx.lineTo(-s * 0.4, 0);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function drawTable(ctx) {
  const grad = ctx.createRadialGradient(640, 340, 80, 640, 360, 760);
  grad.addColorStop(0, '#2e6b4f');
  grad.addColorStop(0.7, '#1d4a35');
  grad.addColorStop(1, '#0f2c1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 6;
  rr(ctx, 14, 14, W - 28, H - 28, 26);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,39,0.35)';
  ctx.lineWidth = 2;
  rr(ctx, 28, 28, W - 56, H - 56, 20);
  ctx.stroke();
}

function drawBar(ctx, x, y, w, h, frac, fill, label) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = fill;
    rr(ctx, x + 2, y + 2, Math.max(8, (w - 4) * Math.min(1, frac)), h - 4, (h - 4) / 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${h - 6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
}

function drawEnergy(ctx, x, y, energy, max) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Energy', x, y);
  for (let i = 0; i < max; i++) {
    ctx.beginPath();
    ctx.arc(x + 82 + i * 26, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = i < energy ? '#ffd23e' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = '#8a6d00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.fillStyle = '#5b2d8e';
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  rr(ctx, x + 3, y + 3, w - 6, h - 6, 10);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  rr(ctx, x + 12, y + 12, w - 24, h - 24, 8);
  ctx.stroke();
  drawElementShape(ctx, 'ember', x + w / 2, y + h / 2, 22, '#ffb199');
}

export function drawCard(ctx, card, x, y, w, h, opts = {}) {
  const el = ELEMENTS[card.element];
  const lift = opts.lift || 0;
  const selected = !!opts.selected;
  const dim = !!opts.dim;
  y -= lift;
  ctx.save();
  if (dim) ctx.globalAlpha = 0.45;
  ctx.shadowColor = selected ? '#ffd23e' : 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = selected ? 22 : 10;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.save();
  if (dim) ctx.globalAlpha = 0.45;
  // Element header band.
  ctx.fillStyle = el.color;
  rr(ctx, x + 4, y + 4, w - 8, 44, 9);
  ctx.fill();
  ctx.fillRect(x + 4, y + 30, w - 8, 18);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.name.toUpperCase(), x + 12, y + 27);
  // Cost pips, top right.
  for (let i = 0; i < card.cost; i++) {
    ctx.beginPath();
    ctx.arc(x + w - 16 - i * 24, y + 26, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd23e';
    ctx.fill();
    ctx.strokeStyle = '#7a5c00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (card.cost === 0) {
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('FREE', x + w - 10, y + 26);
  }
  // Big element shape + power number.
  drawElementShape(ctx, card.element, x + w / 2, y + 96, 30, el.color);
  ctx.fillStyle = '#222';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(card.power), x + w / 2, y + 158);
  ctx.fillStyle = '#555';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(card.kind.toUpperCase(), x + w / 2, y + 178);
  // Name + rules text.
  ctx.fillStyle = '#222';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(card.name, x + w / 2, y + 62);
  ctx.fillStyle = '#444';
  ctx.font = '13px sans-serif';
  ctx.fillText(card.text, x + w / 2, y + 194);
  if (selected) {
    ctx.strokeStyle = '#ffd23e';
    ctx.lineWidth = 4;
    rr(ctx, x - 2, y - 2, w + 4, h + 4, 14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSidePanel(ctx, label, side, x, y, alignRight) {
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(label, x, y);
  const barX = alignRight ? x - 260 : x;
  drawBar(ctx, barX, y + 10, 260, 26, side.hp / MAX_HP,
    side.hp > 10 ? '#e8491d' : '#ff2222', `♥ ${side.hp} / ${MAX_HP}`);
  if (side.shield > 0) {
    ctx.fillStyle = '#7fd4ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`🛡 ${side.shield}`, alignRight ? x - 270 : x + 270, y + 30);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '15px sans-serif';
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.fillText(`Deck ${side.deck.length}  ·  Discard ${side.discard.length}`,
    x, y + 62);
}

export function render(ctx, g, ui) {
  ctx.clearRect(0, 0, W, H);
  drawTable(ctx);
  if (g.phase === 'title') { renderTitle(ctx, g); return; }
  if (g.phase === 'won' || g.phase === 'lost') {
    renderTable(ctx, g, ui, true);
    renderEnd(ctx, g);
    return;
  }
  renderTable(ctx, g, ui, false);
}

function renderTitle(ctx, g) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 92px Georgia, serif';
  ctx.fillText('EMBER DUEL', 640, 180);
  ctx.fillStyle = '#fff';
  ctx.font = '28px Georgia, serif';
  ctx.fillText('A duel of four elements — outplay the rival, card by card.', 640, 235);
  // Element cycle diagram.
  const cy = 330;
  ELEMENT_ORDER.forEach((el, i) => {
    const cx = 640 + (i - 1.5) * 190;
    drawElementShape(ctx, el, cx, cy, 42, ELEMENTS[el].color);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(ELEMENTS[el].name, cx, cy + 70);
    if (i < 3) {
      ctx.fillStyle = '#ffd23e';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('›', cx + 95, cy + 8);
    }
  });
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '18px sans-serif';
  ctx.fillText('Ember beats Gale · Gale beats Tide · Tide beats Stone · Stone beats Ember  (+2 damage)', 640, 440);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Click a card to play it · Keys 1–5 select · SPACE ends your turn', 640, 500);
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 34px sans-serif';
  const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  ctx.fillText('— PRESS ENTER OR CLICK TO PLAY —', 640, 575);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '17px sans-serif';
  ctx.fillText('First to 0 life loses. Both duelists start at 30 life.', 640, 630);
}

function renderTable(ctx, g, ui, ended) {
  const p = g.player;
  const r = g.rival;
  // Rival area.
  drawSidePanel(ctx, 'RIVAL — Cinder, the Ember Warden', r, 60, 66, false);
  drawEnergy(ctx, 60, 150, r.energy, r.maxEnergy);
  // Rival hand, face down.
  const rw = 96, rh = 132;
  const rTotal = r.hand.length * (rw + 8);
  let rx = 640 - rTotal / 2;
  r.hand.forEach(() => { drawCardBack(ctx, rx, 96, rw, rh); rx += rw + 8; });
  if (!ended) {
    // Rival intent banner.
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    rr(ctx, 380, 248, 520, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 19px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const intent = g.phase === 'rival' ? 'Rival is playing…' : INTENT_LABEL[g.intent || 'attack'];
    ctx.fillText(intent, 640, 269);
    // Last play banner.
    if (g.lastPlay) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      rr(ctx, 330, 300, 620, 34, 9);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '17px sans-serif';
      ctx.fillText(g.lastPlay.note, 640, 318);
    }
  }
  // Player area.
  drawSidePanel(ctx, 'YOU', p, 60, 560, false);
  drawEnergy(ctx, 60, 640, p.energy, p.maxEnergy);
  // End Turn button (hidden once the duel is over).
  const endX = 1050, endY = 610, endW = 180, endH = 56;
  const canEnd = g.phase === 'play';
  ui.endTurn = ended ? null : { x: endX, y: endY, w: endW, h: endH };
  if (!ended) {
    ctx.fillStyle = canEnd ? '#e8491d' : 'rgba(255,255,255,0.2)';
    rr(ctx, endX, endY, endW, endH, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd23e';
    ctx.lineWidth = 2;
    rr(ctx, endX, endY, endW, endH, 12);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(canEnd ? 'END TURN ⏎' : 'RIVAL…', endX + endW / 2, endY + endH / 2 + 1);
  }
  // Player hand, fanned.
  const n = p.hand.length;
  const overlap = n > 5 ? 132 : 158;
  const totalW = CARD_W + (n - 1) * overlap;
  let hx = 640 - totalW / 2;
  ui.cards = [];
  p.hand.forEach((card, i) => {
    const hovered = ui.hover === i;
    const selected = g.selected === i;
    const lift = selected ? 34 : hovered ? 18 : 0;
    const afford = card.cost <= p.energy && g.phase === 'play';
    drawCard(ctx, card, hx, 470, CARD_W, CARD_H, { lift, selected, dim: !afford });
    ui.cards.push({ x: hx, y: 470 - lift, w: CARD_W, h: CARD_H, index: i });
    hx += overlap;
  });
  // Turn + message line.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '17px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Turn ${g.turn}   ·   ${g.message}`, 640, 694);
}

function renderEnd(ctx, g) {
  const won = g.phase === 'won';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);
  if (won) {
    // Confetti sparks.
    for (let i = 0; i < 40; i++) {
      const a = (i * 137.5) % 360;
      const rad = (a * Math.PI) / 180;
      const d = 60 + ((i * 53) % 260);
      ctx.fillStyle = ['#ffd23e', '#e8491d', '#1d7fe8', '#2fae5f'][i % 4];
      ctx.beginPath();
      ctx.arc(640 + Math.cos(rad) * d, 300 + Math.sin(rad) * d * 0.6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd23e' : '#ff6b5e';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText(won ? 'VICTORY!' : 'DEFEAT', 640, 300);
  ctx.fillStyle = '#fff';
  ctx.font = '26px Georgia, serif';
  ctx.fillText(
    won ? 'Cinder falls. The embers are yours — 30 life to 0.' : 'Cinder takes the duel. Your ember fades… for now.',
    640, 360);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`Final score — You ${g.player.hp} life · Rival ${g.rival.hp} life · ${g.turn} ${g.turn === 1 ? 'turn' : 'turns'}`, 640, 410);
  ctx.fillStyle = '#e8491d';
  rr(ctx, 520, 460, 240, 60, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffd23e';
  ctx.lineWidth = 2;
  rr(ctx, 520, 460, 240, 60, 12);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('PLAY AGAIN (R)', 640, 498);
}
