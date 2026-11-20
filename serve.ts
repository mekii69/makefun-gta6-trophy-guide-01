// A small static server for the guide's app/ folder (Node 22, standard
// library only). Run `node serve.ts` and open http://localhost:8080; pass
// `--port <n>` for a different port. It only serves files inside app/, sends
// the right MIME type for each, and says 404 for anything else. A local
// development convenience — not a server for the open internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

function pickPort() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--port');
  const n = i === -1 ? NaN : Number(args[i + 1]);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8080;
}

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  const file = resolve(join(appRoot, normalize(path).replace(/^(\.\.(\/|\\|$))+/, '')));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  const target = file === appRoot ? join(appRoot, 'index.html') : file;
  let info;
  try {
    info = statSync(target);
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  if (!info.isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES.get(extname(target)) || 'application/octet-stream' });
  createReadStream(target).pipe(res);
});

const port = pickPort();
server.listen(port, () => {
  console.log(`Leonida After Dark serving app/ on http://localhost:${port}`);
});
