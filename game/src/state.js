// Ember Duel — game state machine. Pure logic, no drawing here.
import { buildDeck, shuffle, mulberry32, elementAdvantage, ELEMENTS } from './cards.js';

export const MAX_HP = 30;
export const HAND_LIMIT = 7;

export function newSide(seed) {
  const rand = mulberry32(seed);
  const deck = shuffle(buildDeck(), rand);
  const hand = deck.splice(0, 5);
  return { hp: MAX_HP, shield: 0, energy: 3, maxEnergy: 3, deck, hand, discard: [], rand };
}

export function newGame(seed = 1) {
  const player = newSide(seed * 7919 + 11);
  const rival = newSide(seed * 104729 + 7);
  return {
    seed,
    turn: 1,
    phase: 'title', // title | play | rival | won | lost
    player,
    rival,
    log: ['The duel begins. Ember, Tide, Gale, Stone — pick your cards well.'],
    selected: -1,
    message: 'Your turn — play a card, then end your turn.',
    lastPlay: null, // {by, card, amount, note} for the floating banner
    shake: 0,
  };
}

export function maxEnergyForTurn(turn) {
  return Math.min(3 + Math.floor((turn - 1) / 2), 5);
}

export function startTurn(g) {
  g.turn += 1;
  const p = g.player;
  p.maxEnergy = maxEnergyForTurn(g.turn);
  p.energy = p.maxEnergy;
  drawCards(p, 2);
  g.phase = 'play';
  g.selected = -1;
  g.message = `Turn ${g.turn} — play cards, then end your turn.`;
}

export function drawCards(side, n) {
  for (let i = 0; i < n; i++) {
    if (side.hand.length >= HAND_LIMIT) break;
    if (side.deck.length === 0) {
      side.deck = shuffle(side.discard, side.rand);
      side.discard = [];
      if (side.deck.length === 0) break;
    }
    side.hand.push(side.deck.shift());
  }
}

function dealDamage(target, amount) {
  let left = amount;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, left);
    target.shield -= absorbed;
    left -= absorbed;
  }
  target.hp = Math.max(0, target.hp - left);
  return amount;
}

// Apply one card. `attacker` plays it on `defender`. Returns a note line.
export function playCard(g, attacker, defender, card, byPlayer) {
  const hand = attacker.hand;
  const idx = hand.indexOf(card);
  if (idx < 0 || attacker.energy < card.cost) return null;
  attacker.energy -= card.cost;
  hand.splice(idx, 1);
  attacker.discard.push(card);
  let note = '';
  if (card.kind === 'strike') {
    const adv = elementAdvantage(card.element, defenderTopElement(defender));
    const dmg = Math.max(1, card.power + adv);
    dealDamage(defender, dmg);
    note = adv > 0
      ? `${card.name} hits for ${dmg}! Element advantage (+${adv}).`
      : adv < 0
        ? `${card.name} hits for ${dmg}. Resisted (−1).`
        : `${card.name} hits for ${dmg}.`;
  } else if (card.kind === 'guard') {
    attacker.shield += card.power;
    note = `${card.name}: +${card.power} shield.`;
  } else if (card.kind === 'trick') {
    if (card.name === 'Kindle') { drawCards(attacker, 2); note = 'Kindle: drew 2 cards.'; }
    else if (card.name === 'Spring Rain') {
      attacker.hp = Math.min(MAX_HP, attacker.hp + card.power);
      note = `Spring Rain: healed ${card.power} life.`;
    } else if (card.name === 'Tailwind') {
      attacker.energy += card.power;
      note = `Tailwind: +${card.power} energy.`;
    } else if (card.name === 'Quarry Drain') {
      dealDamage(defender, card.power);
      attacker.hp = Math.min(MAX_HP, attacker.hp + card.power);
      note = `Quarry Drain: dealt ${card.power}, healed ${card.power}.`;
    }
  }
  g.lastPlay = { by: byPlayer ? 'you' : 'rival', card, note };
  g.log.push((byPlayer ? 'You: ' : 'Rival: ') + note);
  if (g.log.length > 6) g.log.shift();
  return note;
}

// The defender's "attuned" element is the element of its most recent
// played card (shown on the table), defaulting to its last guard/strike.
export function defenderTopElement(side) {
  const last = side.discard[side.discard.length - 1];
  return last ? last.element : null;
}

export function checkEnd(g) {
  if (g.rival.hp <= 0) { g.phase = 'won'; g.message = 'Victory!'; return 'won'; }
  if (g.player.hp <= 0) { g.phase = 'lost'; g.message = 'Defeat…'; return 'lost'; }
  return null;
}

export function rivalIntent(g) {
  // Readable AI: its plan is telegraphed on the table before it acts.
  const r = g.rival;
  const p = g.player;
  if (r.hp <= 10 && r.hand.some((c) => c.kind === 'guard')) return 'guard';
  if (p.hp <= 8 && r.hand.some((c) => c.kind === 'strike')) return 'attack';
  if (r.hand.some((c) => c.kind === 'trick')) return 'trick';
  return 'attack';
}

export const INTENT_LABEL = {
  attack: 'Rival plans: ATTACK — big strikes coming',
  guard: 'Rival plans: GUARD — it is scared, press on',
  trick: 'Rival plans: a TRICK — watch your hand',
};
