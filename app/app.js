// Leonida Legend tracker: loads the 55 trophies and the roadmap, renders the
// checklist, and saves progress in localStorage. No network at run time beyond
// fetching this app's own JSON files from the same server.
const STORE_KEY = 'gta6-leonida-legend-v1';
const params = new URLSearchParams(location.search);

const saved = loadSaved();
let earned = new Set(saved.earned || []);
let hideSpoilers = saved.spoilers || params.get('spoiler') === 'on';
let openId = params.get('open') ? Number(params.get('open')) : null;

const rowsEl = document.getElementById('rows');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedEl = document.getElementById('earnedFilter');
const spoilerEl = document.getElementById('spoilers');
const progressEl = document.getElementById('progress');
const barEl = document.getElementById('bar');
const countsEl = document.getElementById('gradeCounts');
const resultEl = document.getElementById('resultCount');
const emptyEl = document.getElementById('emptyNote');
const onlineEl = document.getElementById('onlineNote');

const data = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// Demo deep-link (?demo=1): tick a small sample and open one guide, so a
// screenshot can show earned state and an open guide at once.
if (params.get('demo') === '1') {
  for (const id of [2, 3, 15, 20, 35]) earned.add(byId.get(id).name);
  openId = 17;
  save();
}
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('q')) searchEl.value = params.get('q');
spoilerEl.checked = hideSpoilers;

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
  catch { return {}; }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned], spoilers: hideSpoilers }));
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', completion: 'Completion', platinum: 'Platinum' }[kind] || kind;
}

function isSpoilerHidden(t) {
  return hideSpoilers && t.kind === 'story' && !earned.has(t.name);
}

function matchesFilters(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
  const kind = kindEl.value;
  if (kind === 'missable' && !t.missable) return false;
  else if (kind === 'online') return false; // no online trophies: all 55 are offline
  else if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedEl.value === 'earned' && !earned.has(t.name)) return false;
  if (earnedEl.value === 'unearned' && earned.has(t.name)) return false;
  return true;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  const pct = Math.round((n / total) * 100);
  progressEl.textContent = `${n} of ${total} earned · ${pct}%`;
  barEl.style.width = pct + '%';
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${gradeLabel({ grade: g })} ${got}/${all}`;
  });
  countsEl.textContent = parts.join(' · ') + ` · Hidden ${trophies.filter((t) => t.hidden).length}/55`;
}

function renderRoadmap() {
  document.getElementById('roadmapEstimate').textContent = roadmap.estimate;
  document.getElementById('roadmapWarning').textContent = roadmap.warning;
  const list = document.getElementById('roadmapStages');
  list.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('p');
    chips.className = 'chips';
    for (const id of stage.trophy_ids) {
      const t = byId.get(id);
      const chip = document.createElement('span');
      chip.className = 'chip' + (earned.has(t.name) ? ' done' : '');
      chip.textContent = (earned.has(t.name) ? '✓ ' : '') + (isSpoilerHidden(t) ? 'Hidden story trophy' : t.name);
      chips.append(chip);
    }
    li.append(h, p, chips);
    list.append(li);
  }
}

function renderList() {
  rowsEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  onlineEl.hidden = kindEl.value !== 'online';
  emptyEl.hidden = shown.length > 0;
  resultEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  for (const t of shown) {
    const li = document.createElement('li');
    li.id = 'trophy-' + t.id;
    li.className = 'trophy grade-' + t.grade + (earned.has(t.name) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderAll();
    });
    const body = document.createElement('div');
    body.className = 'trophy-body';
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = isSpoilerHidden(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
    const badge = document.createElement('span');
    badge.className = 'badge badge-' + t.grade;
    badge.textContent = gradeLabel(t);
    head.append(name, badge);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge badge-missable';
      m.textContent = '⚠ MISSABLE';
      head.append(m);
    }
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'badge badge-hidden';
      h.textContent = 'Hidden on PS';
      head.append(h);
    }
    const desc = document.createElement('p');
    desc.className = 'official';
    desc.textContent = isSpoilerHidden(t)
      ? 'Official description hidden until earned.'
      : 'Official: ' + t.description;
    const meta = document.createElement('p');
    meta.className = 'meta';
    const bits = [kindLabel(t.kind)];
    if (t.count) bits.push('Count: ' + t.count.toLocaleString('en-US'));
    meta.textContent = bits.join(' · ');
    const details = document.createElement('details');
    if (openId === t.id) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    const src = document.createElement('p');
    src.className = 'source';
    if (t.source_url) {
      const a = document.createElement('a');
      a.href = t.source_url;
      a.textContent = 'Source: ' + t.source;
      a.target = '_blank';
      a.rel = 'noopener';
      src.append(a);
    } else {
      src.textContent = 'Source: ' + t.source;
    }
    details.append(summary, guide, src);
    body.append(head, desc, meta, details);
    li.append(box, body);
    rowsEl.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
}

searchEl.addEventListener('input', renderList);
kindEl.addEventListener('change', renderList);
gradeEl.addEventListener('change', renderList);
earnedEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => {
  hideSpoilers = spoilerEl.checked;
  save();
  renderList();
});

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned], exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    const list = Array.isArray(imported) ? imported : imported.earned;
    earned = new Set((list || []).filter((n) => names.has(n)));
    save();
    renderAll();
  } catch {
    alert('That file is not valid progress JSON.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  save();
  renderAll();
});

renderAll();

// Deep links: ?open=<id> jumps to that trophy's guide, ?section=roadmap
// jumps to the roadmap. Both are ordinary shareable links into the guide.
if (params.get('section') === 'roadmap') {
  document.getElementById('roadmap').scrollIntoView({ block: 'start' });
} else if (params.get('section') === 'list') {
  document.getElementById('listHeading').scrollIntoView({ block: 'start' });
} else if (openId && document.getElementById('trophy-' + openId)) {
  document.getElementById('trophy-' + openId).scrollIntoView({ block: 'start' });
}
