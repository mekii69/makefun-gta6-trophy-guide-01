# Leonida After Dark — GTA VI Trophy Guide &amp; Tracker

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/mekii69/makefun-gta6-trophy-guide-01/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/mekii69/makefun-gta6-trophy-guide-01/reward.svg)

A dark-mode offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01).

## What you get

- **All 55 trophies, exactly as listed**: the official name, description and grade for each, from the Exophase list cross-checked against six other guides (28 hidden, 27 visible). The game launched 19 November 2026; the sources were read 20 November 2026.
- **A real guide per trophy, in numbered steps, each step cited**: 148 steps across the 55 guides, every one citing its source by number (Exophase, PowerPyx, KeenGamer, OutputLag, Push Square, GTABase, PlanetGTA6). Where no verified method exists yet, the guide admits it — 9 trophies carry the UNCONFIRMED label instead of invented locations or steps.
- **Disagreements shown, not smoothed over**: the sources disagree on the meditation count — 18 spots (GTABase, GamesRadar+, Push Square) against 15 on the in-game 100% checklist. Both numbers appear, with the tracker path to check it yourself.
- **A tracker**: tick trophies off, progress saved in localStorage, export to a file and import it back, reset for a fresh run. Checklist, guide detail and sources sit side by side, so the guide is always one click from the trophy.
- **Filters**: story, activities, collectibles, completion, missable, hidden, unconfirmed, disagree, earned, online (there are none — all 55 are offline single-player) — plus a search box.
- **Spoiler setting**: hides the names and descriptions of story trophies until you earn them.
- **Road to the platinum**: six stages in order, each with its trophy chips and an earned count for the stage, and the one missable trophy flagged loud — **Positive Mental Attitude** (meditate at every spot; the Chapter 1 spot disappears after that chapter).
- **Fully offline**: static files under `app/`, no build step, nothing fetched over the network at run time. No Rockstar logo or official artwork — the look is original.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/dossier.json plus copies of app/ and screenshots/
```

## Sources

- [Exophase — Grand Theft Auto VI Trophies (PS5)](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- PowerPyx trophy guide (cited by name in the guides)
- [KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/)
- [OutputLag — GTA 6 Trophy List](https://outputlag.com/guides/gta-6-trophy-list/)
- [Push Square — GTA 6 Trophy Guide & Roadmap](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap)
- GTABase trophy coverage (cited by name in the guides)
- [PlanetGTA6 — GTA 6 Trophies: All 55 trophies and Xbox achievements](https://www.planetgta6.com/en/gta-6-trophies/)

Original fan guide. Not affiliated with Rockstar Games or PlayStation.
