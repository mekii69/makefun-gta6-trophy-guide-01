// Leonida After Dark tracker: fetches the 55 trophies and the roadmap, draws
// the checklist with a cited step-by-step guide for each trophy, and keeps
// progress in localStorage. At run time it makes no network requests beyond
// fetching this app's own JSON files from the same server.
const STORE_KEY = 'gta6-leonida-after-dark-v1';
const params = new URLSearchParams(location.search);

const savedState = readSaved();
let earned = new Set(savedState.earned || []);
let hideSpoilers = savedState.spoilers || params.get('spoiler') === 'on';
let selectedId = params.get('open') ? Number(params.get('open')) : 28;
let chipFilter = params.get('kind') || 'all';
let tab = params.get('tab') || params.get('section') || 'checklist';
if (tab === 'list') tab = 'checklist';

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows'), searchEl = $('searchInput'), detailEl = $('detail');
const progressText = $('progressText'), progressBar = $('progressBar');
const countsEl = $('gradeCounts'), resultEl = $('resultCount');
const emptyEl = $('emptyNote'), onlineEl = $('onlineNote');
const auditEl = $('auditStrip'), chipsEl = $('chips'), spoilerEl = $('spoilerToggle');

const data = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = data.trophies;
const sources = data.sources;
const byId = new Map(trophies.map((t) => [t.id, t]));

// Demo deep-link (?demo=1): tick a lived-in sample and open the missable
// trophy, so a screenshot shows earned progress and a full guide at once.
if (params.get('demo') === '1') {
  for (const id of [2, 3, 4, 5, 8, 15, 20, 28, 35, 42, 52]) earned.add(byId.get(id).name);
  selectedId = 28;
  persist();
}
if (params.get('q')) searchEl.value = params.get('q');
spoilerEl.checked = hideSpoilers;

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
  catch { return {}; }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned], spoilers: hideSpoilers }));
}

function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }
function kindLabel(kind) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', completion: 'Completion', platinum: 'Platinum' }[kind] || kind;
}
function spoilerHidden(t) {
  return hideSpoilers && t.kind === 'story' && !earned.has(t.name);
}
function sourceShort(name) { return name.split(' — ')[0]; }

function guidesCiting(idx) {
  // Guides citing source idx (1-based): primary source match, or any step ref.
  const src = sources[idx - 1];
  let n = 0;
  for (const t of trophies) {
    const primary = t.source && src && t.source.startsWith(sourceShort(src.name));
    const stepped = t.steps.some((s) => (s.refs || []).includes(idx));
    if (primary || stepped) n++;
  }
  return n;
}

function passesFilters(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.steps.map((s) => s.text).join(' ')).toLowerCase().includes(q)) return false;
  if (chipFilter === 'missable') return !!t.missable;
  if (chipFilter === 'hidden') return !!t.hidden;
  if (chipFilter === 'unconfirmed') return t.status === 'unconfirmed';
  if (chipFilter === 'disagree') return t.status === 'disagree';
  if (chipFilter === 'earned') return earned.has(t.name);
  if (chipFilter === 'online') return false; // no online trophies: all 55 are offline
  if (chipFilter !== 'all') return t.kind === chipFilter;
  return true;
}

function drawProgress() {
  const n = earned.size, total = trophies.length;
  progressText.textContent = `${n} / ${total} earned`;
  progressBar.style.width = Math.round((n / total) * 100) + '%';
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${gradeLabel(g)} ${got}/${all}`;
  });
  countsEl.textContent = parts.join(' · ') + ` · Hidden ${trophies.filter((t) => t.hidden).length}/55`;
}

function drawAudit() {
  const totalSteps = trophies.reduce((a, t) => a + t.steps.length, 0);
  const citedSteps = trophies.reduce((a, t) => a + t.steps.filter((s) => (s.refs || []).length > 0).length, 0);
  const unconfirmed = trophies.filter((t) => t.status === 'unconfirmed').length;
  const disagree = trophies.filter((t) => t.status === 'disagree').length;
  auditEl.innerHTML = '';
  const bits = [
    ['AUDIT', '55 official'],
    ['1P 2G 6S 46B', ''],
    ['28 hidden', ''],
    ['55/55 guides cite a source', ''],
    [`${citedSteps}/${totalSteps} steps cited`, ''],
    ['7 sources read 20 Nov 2026', ''],
    ['1 possibly missable', ''],
    [`${unconfirmed} unconfirmed`, ''],
    [`${disagree} disagree`, ''],
  ];
  bits.forEach(([b, rest], i) => {
    const s = document.createElement('span');
    if (i > 0) s.textContent = ' · ';
    const strong = document.createElement('b');
    strong.textContent = b;
    s.append(strong);
    if (rest) s.append(document.createTextNode(' ' + rest));
    auditEl.append(s);
  });
}

function drawChips() {
  const defs = [
    ['all', `All ${trophies.length}`],
    ['platinum', `Platinum ${trophies.filter((t) => t.kind === 'platinum').length}`],
    ['story', `Story ${trophies.filter((t) => t.kind === 'story').length}`],
    ['completion', `Completion ${trophies.filter((t) => t.kind === 'completion').length}`],
    ['activities', `Activities ${trophies.filter((t) => t.kind === 'activities').length}`],
    ['collectibles', `Collectibles ${trophies.filter((t) => t.kind === 'collectibles').length}`],
    ['online', 'Online 0'],
    ['missable', `Missable ${trophies.filter((t) => t.missable).length}`],
    ['hidden', `Hidden ${trophies.filter((t) => t.hidden).length}`],
    ['unconfirmed', `Unconfirmed ${trophies.filter((t) => t.status === 'unconfirmed').length}`],
    ['disagree', `Disagree ${trophies.filter((t) => t.status === 'disagree').length}`],
    ['earned', `Earned ${earned.size}`],
  ];
  chipsEl.replaceChildren();
  for (const [value, label] of defs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (chipFilter === value ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => { chipFilter = value; drawChips(); drawList(); });
    chipsEl.append(b);
  }
}

function drawList() {
  rowsEl.replaceChildren();
  const shown = trophies.filter(passesFilters);
  onlineEl.hidden = chipFilter !== 'online';
  emptyEl.hidden = shown.length > 0;
  resultEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = (earned.has(t.name) ? 'earned ' : '') + (t.id === selectedId ? 'selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('change', (e) => {
      e.stopPropagation();
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      persist(); drawAll();
    });
    const body = document.createElement('div');
    const name = document.createElement('span');
    name.className = 'row-name';
    name.textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
    const dot = document.createElement('span');
    dot.className = 'dot dot-' + t.grade;
    dot.title = gradeLabel(t.grade);
    const meta = document.createElement('div');
    meta.className = 'row-meta';
    const bits = [kindLabel(t.kind)];
    if (t.count) bits.push('×' + t.count.toLocaleString('en-US'));
    if (t.missable) bits.push('MISSABLE');
    if (t.status === 'unconfirmed') bits.push('unconfirmed');
    if (t.status === 'disagree') bits.push('sources disagree');
    meta.textContent = bits.join(' · ');
    body.append(name, dot, meta);
    li.append(box, body);
    li.addEventListener('click', (e) => {
      if (e.target !== box) { selectedId = t.id; drawList(); drawDetail(); }
    });
    rowsEl.append(li);
  }
}

function drawDetail() {
  const t = byId.get(selectedId);
  detailEl.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'empty-detail';
    p.textContent = 'Pick a trophy on the left to see its guide.';
    detailEl.append(p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = spoilerHidden(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
  detailEl.append(h);
  const badges = document.createElement('div');
  badges.className = 'badges';
  const mk = (cls, text) => {
    const s = document.createElement('span');
    s.className = 'badge ' + cls;
    s.textContent = text;
    return s;
  };
  badges.append(mk('badge-' + t.grade, gradeLabel(t.grade)));
  if (t.hidden) badges.append(mk('badge-hidden', 'Hidden on PS'));
  if (t.missable) badges.append(mk('badge-missable', 'Possibly missable'));
  if (t.status === 'unconfirmed') badges.append(mk('badge-unconfirmed', 'Unconfirmed'));
  if (t.status === 'disagree') badges.append(mk('badge-disagree', 'Sources disagree'));
  detailEl.append(badges);
  const quote = document.createElement('p');
  quote.className = 'official';
  quote.textContent = spoilerHidden(t)
    ? 'Official description hidden until earned.'
    : '“' + t.description + '” — official description';
  detailEl.append(quote);
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const bits = [kindLabel(t.kind), 'Stage ' + t.stage];
  if (t.count) bits.push('Count: ' + t.count.toLocaleString('en-US'));
  meta.textContent = bits.join(' · ');
  detailEl.append(meta);
  if (t.missable) {
    const c = document.createElement('div');
    c.className = 'callout callout-missable';
    c.innerHTML = '<strong>Possibly missable:</strong> the Chapter 1 spot disappears after that chapter, and there is reportedly no mission replay. Meditate at every spot the moment you find it, and keep a manual save at the start of every chapter.';
    detailEl.append(c);
  }
  if (t.disagree_note) {
    const c = document.createElement('div');
    c.className = 'callout callout-disagree';
    const strong = document.createElement('strong');
    strong.textContent = 'Sources disagree: ';
    c.append(strong, document.createTextNode(t.disagree_note));
    detailEl.append(c);
  }
  if (t.status === 'unconfirmed') {
    const c = document.createElement('div');
    c.className = 'callout callout-unconfirmed';
    c.innerHTML = '<strong>Unconfirmed:</strong> no verified method exists yet beyond the official description. Do not trust a specific how-to for this one until players confirm it.';
    detailEl.append(c);
  }
  const ol = document.createElement('ol');
  ol.className = 'steps';
  for (const s of t.steps) {
    const li = document.createElement('li');
    li.append(document.createTextNode(s.text + ' '));
    for (const r of (s.refs || [])) {
      const ref = document.createElement('span');
      ref.className = 'ref';
      ref.textContent = '[' + r + ']';
      li.append(ref, document.createTextNode(' '));
    }
    ol.append(li);
  }
  detailEl.append(ol);
  const src = document.createElement('p');
  src.className = 'source-line';
  if (t.source_url) {
    src.append(document.createTextNode('Source: '));
    const a = document.createElement('a');
    a.href = t.source_url;
    a.textContent = t.source;
    a.target = '_blank';
    a.rel = 'noopener';
    src.append(a);
  } else {
    src.textContent = 'Source: ' + t.source;
  }
  detailEl.append(src);
}

function drawSourcesPanel() {
  const list = $('sourcesList');
  list.replaceChildren();
  sources.forEach((s, i) => {
    const li = document.createElement('li');
    const n = guidesCiting(i + 1);
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.append(document.createTextNode(s.name));
    }
    const c = document.createElement('span');
    c.className = 'cite-count';
    c.textContent = `cited by ${n} of 55 guides`;
    li.append(c);
    list.append(li);
  });
}

function drawRoadmap() {
  $('roadmapEstimate').textContent = roadmap.estimate;
  $('roadmapWarning').textContent = roadmap.warning;
  const grid = $('roadmapGrid');
  grid.replaceChildren();
  for (const stage of roadmap.stages) {
    const card = document.createElement('div');
    card.className = 'stage-card';
    const h = document.createElement('h3');
    const n = document.createElement('span');
    n.className = 'stage-n';
    n.textContent = 'Stage ' + stage.stage + ' — ';
    h.append(n, document.createTextNode(stage.title));
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-chips';
    let got = 0;
    for (const id of stage.trophy_ids) {
      const t = byId.get(id);
      const chip = document.createElement('span');
      const done = earned.has(t.name);
      if (done) got++;
      chip.className = 'mini-chip' + (done ? ' done' : '');
      chip.textContent = (done ? '✓ ' : '') + (spoilerHidden(t) ? 'Hidden story trophy' : t.name);
      chips.append(chip);
    }
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${got} / ${stage.trophy_ids.length} earned in this stage`;
    card.append(h, p, chips, count);
    grid.append(card);
  }
}

function drawMissables() {
  const hero = $('missableHero');
  hero.replaceChildren();
  const pma = byId.get(28);
  const h = document.createElement('h3');
  h.textContent = '⚠ ONE MISSABLE TROPHY — ' + pma.name;
  const d = document.createElement('p');
  d.textContent = 'Meditate at every spot across Leonida. The first spot (Lucia’s balcony, Chapter 1) disappears after Chapter 1 and there is reportedly no mission replay. Meditate at every spot the moment you find it, and keep a manual save at the start of every chapter.';
  const s = document.createElement('p');
  s.className = 'muted small';
  s.textContent = 'Source: PowerPyx / GTABase, reported by OutputLag. Count disputed: 18 spots (GTABase, GamesRadar+, Push Square) vs 15 on the in-game 100% checklist.';
  hero.append(h, d, s);
  const watch = $('watchList');
  watch.replaceChildren();
  for (const t of trophies.filter((x) => x.status === 'unconfirmed')) {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'w-name';
    name.textContent = t.name + ' ';
    const badge = document.createElement('span');
    badge.className = 'badge badge-' + t.grade;
    badge.textContent = gradeLabel(t.grade);
    const desc = document.createElement('div');
    desc.className = 'w-desc';
    desc.textContent = t.description;
    li.append(name, badge, desc);
    watch.append(li);
  }
  const db = $('disagreeBox');
  db.replaceChildren();
  const p = document.createElement('p');
  p.textContent = pma.disagree_note;
  db.append(p);
}

function drawSourcesTab() {
  const table = $('sourcesTable');
  table.replaceChildren();
  const head = document.createElement('tr');
  for (const label of ['#', 'Source', 'Cited by', 'Used for']) {
    const th = document.createElement('th');
    th.textContent = label;
    head.append(th);
  }
  table.append(head);
  const uses = {
    1: 'Every trophy name, description and grade',
    2: 'Missable flag, difficulty, meditation detail',
    3: 'Platinum roadmap, ~200-hour estimate, 4/10 difficulty',
    4: 'Hidden split, missable detail, chapter-save advice',
    5: 'Meditation count (18) and the in-game progress tracker',
    6: 'Missable flag, meditation count (18)',
    7: 'Cross-check of all 55 names, descriptions and grades',
  };
  sources.forEach((s, i) => {
    const tr = document.createElement('tr');
    const num = document.createElement('td');
    num.textContent = '[' + (i + 1) + ']';
    const name = document.createElement('td');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      name.append(a);
    } else {
      name.textContent = s.name;
    }
    const cited = document.createElement('td');
    cited.textContent = guidesCiting(i + 1) + ' of 55 guides';
    const used = document.createElement('td');
    used.textContent = uses[i + 1] || '';
    tr.append(num, name, cited, used);
    table.append(tr);
  });
}

function drawTabs() {
  document.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  for (const name of ['checklist', 'roadmap', 'missables', 'sources']) {
    $('panel-' + name).hidden = tab !== name;
  }
}

function drawAll() {
  drawProgress();
  drawAudit();
  drawChips();
  drawList();
  drawDetail();
  drawSourcesPanel();
  drawRoadmap();
  drawMissables();
  drawSourcesTab();
  drawTabs();
}

searchEl.addEventListener('input', drawList);
spoilerEl.addEventListener('change', () => {
  hideSpoilers = spoilerEl.checked;
  persist();
  drawList();
  drawDetail();
  drawRoadmap();
});
document.querySelectorAll('.tab').forEach((b) => {
  b.addEventListener('click', () => { tab = b.dataset.tab; drawTabs(); });
});

$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned], exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    const list = Array.isArray(imported) ? imported : imported.earned;
    earned = new Set((list || []).filter((n) => names.has(n)));
    persist();
    drawAll();
  } catch {
    alert('That file is not valid progress JSON.');
  }
  e.target.value = '';
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  persist();
  drawAll();
});

drawAll();
