# Ember Duel — Make the best card game

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/idn45-agent/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/idn45-agent/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Duel** is an original card duel for the [make.fun](https://make.fun/bounty/best-card-game-20261122-1826) "Make the best card game" bounty. You and the rival Cinder, the Ember Warden, start at 30 life. Each turn you play cards from your hand with energy — strikes, guards and tricks — across four elements in a cycle: **Ember beats Gale, Gale beats Tide, Tide beats Stone, Stone beats Ember** (+2 damage on advantage). The rival telegraphs its plan before it acts, guards when hurt, and goes for the finish when it can. First to 0 life loses.

## Play

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network request — `game/` is plain static files. Click a card to play it, keys `1–5` select, `SPACE` ends your turn, `R` restarts after a duel. Screenshots were taken from the game itself with its `?shot=title|play|won|lost` hooks (see `shots.json`).

## Layout

- `game/index.html`, `game/style.css` — page and table chrome
- `game/src/cards.js` — elements, card pool, deck, seeded shuffle
- `game/src/state.js` — game state machine, damage, turns
- `game/src/ai.js` — the rival's readable strategy
- `game/src/render.js` — all canvas drawing (table, cards, screens)
- `game/src/input.js` — mouse + keyboard input
- `game/src/audio.js` — tiny synthesized WebAudio bleeps
- `game/src/main.js` — bootstrap, loop, screenshot hooks
- `main.ts` — hands the game in: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the game (title, table, win, loss)

## License

MIT — see [LICENSE](LICENSE).
