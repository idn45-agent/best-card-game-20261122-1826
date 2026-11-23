// Ember Duel — card definitions, elements and decks.
// Four elements in a cycle: Ember beats Gale, Gale beats Tide,
// Tide beats Stone, Stone beats Ember. Advantage adds +2 damage.
export const ELEMENTS = {
  ember: { name: 'Ember', color: '#e8491d', dark: '#8f1d05', light: '#ffb199', beats: 'gale' },
  tide:  { name: 'Tide',  color: '#1d7fe8', dark: '#0a3d7a', light: '#a8d2ff', beats: 'stone' },
  gale:  { name: 'Gale',  color: '#2fae5f', dark: '#0d5c2e', light: '#a9ecc2', beats: 'tide' },
  stone: { name: 'Stone', color: '#b07a2a', dark: '#5e3d0e', light: '#f0d3a0', beats: 'ember' },
};
export const ELEMENT_ORDER = ['ember', 'gale', 'tide', 'stone'];

export function elementAdvantage(att, def) {
  if (!att || !def) return 0;
  if (ELEMENTS[att].beats === def) return 2;
  if (ELEMENTS[def].beats === att) return -1;
  return 0;
}

// A card: { id, name, element, kind, cost, power, text }
// kind: 'strike' deals damage, 'guard' adds shield,
// 'trick' runs a special effect (power = effect strength).
let nextId = 1;
export function makeCard(name, element, kind, cost, power, text) {
  return { id: nextId++, name, element, kind, cost, power, text };
}

const CARD_POOL = [
  ['Ember Lash', 'ember', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Ember Lash', 'ember', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Cinder Burst', 'ember', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Cinder Burst', 'ember', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Wildfire', 'ember', 'strike', 3, 11, 'Deal 11 damage.'],
  ['Ash Shield', 'ember', 'guard', 1, 5, 'Gain 5 shield.'],
  ['Kindle', 'ember', 'trick', 1, 2, 'Draw 2 cards.'],
  ['Tide Slap', 'tide', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Tide Slap', 'tide', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Riptide', 'tide', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Riptide', 'tide', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Deep Surge', 'tide', 'strike', 3, 11, 'Deal 11 damage.'],
  ['Bubble Wall', 'tide', 'guard', 1, 5, 'Gain 5 shield.'],
  ['Bubble Wall', 'tide', 'guard', 2, 9, 'Gain 9 shield.'],
  ['Spring Rain', 'tide', 'trick', 1, 5, 'Heal 5 life.'],
  ['Gale Cut', 'gale', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Gale Cut', 'gale', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Cyclone', 'gale', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Cyclone', 'gale', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Storm Front', 'gale', 'strike', 3, 11, 'Deal 11 damage.'],
  ['Leaf Veil', 'gale', 'guard', 1, 5, 'Gain 5 shield.'],
  ['Tailwind', 'gale', 'trick', 0, 2, 'Gain 2 energy.'],
  ['Tailwind', 'gale', 'trick', 0, 2, 'Gain 2 energy.'],
  ['Stone Fist', 'stone', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Stone Fist', 'stone', 'strike', 1, 4, 'Deal 4 damage.'],
  ['Boulder Roll', 'stone', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Boulder Roll', 'stone', 'strike', 2, 7, 'Deal 7 damage.'],
  ['Avalanche', 'stone', 'strike', 3, 11, 'Deal 11 damage.'],
  ['Rock Hide', 'stone', 'guard', 1, 5, 'Gain 5 shield.'],
  ['Rock Hide', 'stone', 'guard', 2, 9, 'Gain 9 shield.'],
  ['Quarry Drain', 'stone', 'trick', 2, 4, 'Deal 4, heal 4.'],
];

export function buildDeck() {
  return CARD_POOL.map(([n, e, k, c, p, t]) => makeCard(n, e, k, c, p, t));
}

// Small seeded RNG so screenshots and play-tests are reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(deck, rand) {
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
