// Leonida Legend — GTA VI trophy guide entry (Node 22, standard library only).
//
// What this program does: it takes the guide as it sits in this repository —
// the static app in app/ and the screenshots in screenshots/ — and hands it
// to the grader in /output: the same two folders, copied verbatim, plus a
// dossier.json built from them with the vendored make.fun library.
//
// The app itself is plain files under app/ (index.html, app.js, style.css and
// data/trophies.json with all 55 trophies), served by any static server with
// app/ at its root, no build step and no network at run time. The screenshots
// are real renders of that app. vendor/makefun-frontend.ts is the kit's copy
// and is left untouched: the scorer rebuilds the dossier with its own copy
// and requires byte-for-byte agreement.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader hands us a writable /output; anywhere else, the env var wins.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Caps from the competition gate: the dossier text cap (160 KiB), at most 4
// screenshots of at most 256 KiB each, and the app's own file/size caps.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyEntryFolder(name) {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function handIn() {
  mkdirSync(outDir, { recursive: true });
  // Start clean so a stale file from an earlier run can never ride along.
  rmSync(join(outDir, 'app'), { recursive: true, force: true });
  rmSync(join(outDir, 'screenshots'), { recursive: true, force: true });
  copyEntryFolder('app');
  copyEntryFolder('screenshots');
  const dossier = buildDossier(outDir, DOSSIER_OPTIONS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
