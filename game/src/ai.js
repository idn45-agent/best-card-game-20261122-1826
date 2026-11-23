// Ember Duel — the rival AI. Deliberate and readable: it telegraphs its
// intent, guards when hurt, and spends energy on its best strikes first.
import { elementAdvantage } from './cards.js';
import { playCard, checkEnd, defenderTopElement, drawCards } from './state.js';

function strikeValue(g, card) {
  const adv = elementAdvantage(card.element, defenderTopElement(g.player));
  return card.power + adv;
}

// Pick the AI's next card, or null when it should stop.
export function chooseRivalCard(g) {
  const r = g.rival;
  const p = g.player;
  const affordable = r.hand.filter((c) => c.cost <= r.energy);
  if (affordable.length === 0) return null;

  // Hurt? Guard first if a guard is affordable.
  if (r.hp <= 12) {
    const guard = affordable.filter((c) => c.kind === 'guard')
      .sort((a, b) => b.power - a.power)[0];
    if (guard) return guard;
  }
  // Heal when badly hurt.
  if (r.hp <= 10) {
    const heal = affordable.find((c) => c.name === 'Spring Rain');
    if (heal) return heal;
  }
  // Finish the player when a strike can end it.
  const lethal = affordable.filter((c) => c.kind === 'strike' && strikeValue(g, c) >= p.hp + p.shield)
    .sort((a, b) => strikeValue(g, b) - strikeValue(g, a))[0];
  if (lethal) return lethal;
  // Best strike by value per energy.
  const strikes = affordable.filter((c) => c.kind === 'strike')
    .sort((a, b) => strikeValue(g, b) / b.cost - strikeValue(g, a) / a.cost);
  if (strikes.length > 0 && (r.hp > 12 || strikes[0].cost <= 1)) return strikes[0];
  // Tricks when the hand is clogged or energy is spare.
  const trick = affordable.find((c) => c.kind === 'trick');
  if (trick && (r.hand.length >= 5 || r.energy >= 3)) return trick;
  const guard = affordable.filter((c) => c.kind === 'guard')
    .sort((a, b) => b.power - a.power)[0];
  if (guard && r.shield < 6) return guard;
  return strikes.length > 0 ? strikes[0] : (trick || guard || null);
}

// Run the rival's whole turn with a small delay between cards so the
// player can follow it. `onStep` is called after each card; `onDone`
// starts the player's next turn.
export function runRivalTurn(g, onStep, onDone) {
  g.phase = 'rival';
  g.rival.maxEnergy = Math.min(3 + Math.floor((g.turn - 1) / 2), 5);
  g.rival.energy = g.rival.maxEnergy;
  drawCards(g.rival, 2);
  const step = () => {
    if (checkEnd(g)) { onDone(); return; }
    const card = chooseRivalCard(g);
    if (!card) { onDone(); return; }
    playCard(g, g.rival, g.player, card, false);
    g.shake = 6;
    onStep();
    if (checkEnd(g)) { onDone(); return; }
    setTimeout(step, 650);
  };
  setTimeout(step, 500);
}
