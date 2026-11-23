// Ember Duel — bootstrap, game loop and screenshot hooks.
// ?shot=title|play|won|lost&seed=N jumps straight to a staged state
// (a debug hook the game itself provides, for screenshots and tests).
// ?seed=N starts a normal game from a fixed shuffle.
import { newGame, playCard, checkEnd, startTurn, rivalIntent, drawCards } from './state.js';
import { runRivalTurn } from './ai.js';
import { render, W, H } from './render.js';
import { attachInput } from './input.js';
import { playTone } from './audio.js';

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || '1') || 1;
const shot = params.get('shot') || '';
// In screenshot mode the page is exactly the canvas: no hint line below it.
if (shot) {
  const hint = document.querySelector('.hint');
  if (hint) hint.remove();
  document.querySelector('main').style.padding = '0';
}

const canvas = document.getElementById('game');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');

let g = newGame(seed);
const ui = { hover: -1, cards: [], endTurn: null };

function refresh() {
  if (g.phase === 'play') g.intent = rivalIntent(g);
  render(ctx, g, ui);
}

function startGame() {
  g = newGame(seed);
  g.phase = 'play';
  playTone(660, 0.08);
  refresh();
}

const hooks = {
  start: startGame,
  restart: startGame,
  endTurn() {
    if (g.phase !== 'play') return;
    playTone(440, 0.08);
    runRivalTurn(g, refresh, () => {
      if (g.phase === 'won' || g.phase === 'lost') { refresh(); return; }
      startTurn(g);
      refresh();
    });
    refresh();
  },
  playCard(i) {
    if (g.phase !== 'play') return;
    const card = g.player.hand[i];
    if (!card) return;
    if (card.cost > g.player.energy) {
      g.message = 'Not enough energy for that card.';
      refresh();
      return;
    }
    g.selected = i;
    playCard(g, g.player, g.rival, card, true);
    g.selected = -1;
    playTone(card.kind === 'strike' ? 220 : 520, 0.1);
    if (checkEnd(g)) { refresh(); return; }
    refresh();
  },
};

attachInput(canvas, g, ui, hooks);

// Staged states for screenshots / quick checks.
if (shot === 'title') {
  g.phase = 'title';
} else if (shot === 'play') {
  g.phase = 'play';
  // Stage a lively mid-game: a few cards already played.
  const p = g.player, r = g.rival;
  p.hp = 24; r.hp = 19; p.shield = 4; r.shield = 2;
  p.energy = 3;
  g.turn = 4;
  g.lastPlay = { by: 'rival', card: r.hand[0], note: 'Rival: Ember Lash hits for 6! Element advantage (+2).' };
  g.log.push('You: Bubble Wall: +5 shield.');
} else if (shot === 'won') {
  g.phase = 'play';
  g.rival.hp = 2;
  const finisher = g.player.hand.find((c) => c.kind === 'strike') || g.player.hand[0];
  playCard(g, g.player, g.rival, finisher, true);
  checkEnd(g);
} else if (shot === 'lost') {
  g.phase = 'play';
  g.player.hp = 3;
  g.player.shield = 0;
  const finisher = g.rival.hand.find((c) => c.kind === 'strike') || g.rival.hand[0];
  playCard(g, g.rival, g.player, finisher, false);
  checkEnd(g);
}

refresh();
requestAnimationFrame(function loop() {
  if (g.phase === 'title') refresh(); // title pulse
  requestAnimationFrame(loop);
});
