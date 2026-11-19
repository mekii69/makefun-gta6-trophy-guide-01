# Leonida Legend — GTA VI Trophy Guide & Tracker

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/mekii69/makefun-gta6-trophy-guide-01/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/mekii69/makefun-gta6-trophy-guide-01/reward.svg)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, exactly as listed**: official name, description and grade for all 55, from the Exophase / PSNProfiles-linked list (28 hidden, 27 visible).
- **A real guide for each trophy, in our own words**: what to do, where and how, when it can be missed — with the source named beside every guide (Exophase, KeenGamer, OutputLag, PowerPyx / GTABase, Rockstar's Trailer 2). Where no verified method exists yet, the guide says so instead of inventing locations or steps. The game launches 19 November 2026.
- **A tracker**: tick trophies off, progress saved in localStorage, export to a file and import it back, reset when you want a fresh run.
- **Filters**: story, missable, collectibles, activities, online (there are none — all 55 are offline single-player), 100% completion — plus grade, earned state, and a search box.
- **Spoiler setting**: hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum**: five stages in order, with the trophy chips for each stage, and the one missable trophy flagged loud — **Positive Mental Attitude** (meditate at every spot; the Chapter 1 spot disappears after that chapter).
- **Fully offline**: static files under `app/`, no build step, no network requests at run time. No Rockstar logo or official artwork — the look is original.

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
- [KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/)
- [OutputLag — GTA 6 Trophy List](https://outputlag.com/guides/gta-6-trophy-list/)
- PowerPyx trophy guide and GTABase (cited by name in the guides)
- Rockstar Games — GTA VI Trailer 2 (Leonida setting)

Original fan guide. Not affiliated with Rockstar Games or PlayStation.
