// Leonida After Dark — the hand-in program for the GTA VI trophy guide entry.
//
// The entry is two folders: app/ (the static guide) and screenshots/ (four
// real renders of it). This script copies both into the grader's /output and
// writes dossier.json there, using the vendored make.fun library. The scorer
// rebuilds the dossier with its own copy of that library and requires the
// two to match byte for byte, so vendor/makefun-frontend.ts stays untouched.
//
// The guide needs no build step: index.html, app.js, style.css and the data
// JSON files under app/ are served as-is by any static server, and nothing
// is fetched over the network while it runs. Outside the grader, point
// MAKEFUN_OUTPUT_DIR at a scratch folder:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const dest = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Gate caps from the competition: dossier text at most 160 KiB, at most 4
// screenshots of at most 256 KiB each, and the app's file/size caps.
const OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(dest, { recursive: true });
// Wipe any previous run's output first, so nothing stale can ride along.
for (const name of ['app', 'screenshots']) {
  rmSync(join(dest, name), { recursive: true, force: true });
  const src = join(here, name);
  if (existsSync(src)) cpSync(src, join(dest, name), { recursive: true });
}
writeFileSync(join(dest, 'dossier.json'), buildDossier(dest, OPTIONS));
