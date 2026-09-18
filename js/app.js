/*
  Tattoo Ink Ingredient Decoder — App Logic
  Poli International | 2026
  Depends on: pigment-data.js
*/

// ─── DOM refs ────────────────────────────────────────────────────
const tabBtns       = document.querySelectorAll('.tab-btn');
const tabPanels     = document.querySelectorAll('.tab-panel');

const searchInput   = document.getElementById('search-input');
const searchBtn     = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

const bulkInput     = document.getElementById('bulk-input');
const bulkScanBtn   = document.getElementById('bulk-scan-btn');
const bulkClearBtn  = document.getElementById('bulk-clear-btn');
const bulkResults   = document.getElementById('bulk-results');

// ─── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  banned:     { icon: '🚫', cls: 'danger',  label: 'Banned' },
  restricted: { icon: '⚠️', cls: 'warning', label: 'Restricted' },
  watch:      { icon: '👁️', cls: 'watch',   label: 'Under Review' },
  svhc:       { icon: '⚗️', cls: 'danger',  label: 'SVHC' },
  safe:       { icon: '✅', cls: 'safe',    label: 'No restriction' },
};

// ─── Tab switching ───────────────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === target));
    tabPanels.forEach(p => p.classList.toggle('active', p.id === `panel-${target}`));
  });
});

// ─── Search ──────────────────────────────────────────────────────
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
searchBtn.addEventListener('click', runSearch);

function runSearch() {
  const q = searchInput.value.trim();
  searchResults.innerHTML = '';
  if (!q) return;

  const match = findPigmentByQuery(q);
  if (match) {
    searchResults.appendChild(buildResultCard(match, q, 'name'));
    searchResults.querySelector('.result-card').classList.add('expanded');
  } else {
    searchResults.appendChild(buildNotFoundCard(q));
  }
}

// ─── Bulk scan ────────────────────────────────────────────────────
bulkScanBtn.addEventListener('click', runBulkScan);
bulkClearBtn.addEventListener('click', () => {
  bulkInput.value = '';
  bulkResults.innerHTML = renderIdle('Paste an ingredient list above and click Decode.');
});

function runBulkScan() {
  const text = bulkInput.value.trim();
  if (!text) {
    bulkResults.innerHTML = renderIdle('Please paste an ingredient list first.');
    return;
  }

  const hits = parseInkIngredients(text);
  bulkResults.innerHTML = '';

  if (hits.length === 0) {
    bulkResults.innerHTML = renderIdle('No recognizable ingredients detected. Try including CAS numbers (e.g. 147-14-8) or CI numbers (e.g. CI 74160).');
    return;
  }

  const flagged    = hits.filter(h => h.substance && (h.substance.status === 'banned' || h.substance.status === 'svhc'));
  const restricted = hits.filter(h => h.substance && h.substance.status === 'restricted');
  const watch      = hits.filter(h => h.substance && h.substance.status === 'watch');
  const unknown    = hits.filter(h => !h.substance);

  // Stats bar
  const statsEl = document.createElement('div');
  statsEl.className = 'scan-stats';
  statsEl.innerHTML = `
    <div class="stat-item">
      <span class="stat-dot stat-dot--danger"></span>
      <span class="stat-count">${flagged.length}</span>
      <span class="stat-label">Banned / SVHC</span>
    </div>
    <div class="stat-item">
      <span class="stat-dot stat-dot--warning"></span>
      <span class="stat-count">${restricted.length}</span>
      <span class="stat-label">Restricted</span>
    </div>
    <div class="stat-item">
      <span class="stat-dot stat-dot--watch"></span>
      <span class="stat-count">${watch.length}</span>
      <span class="stat-label">Under review</span>
    </div>
    <div class="stat-item" style="color:var(--text-muted);font-size:0.78rem;margin-left:auto">
      ${hits.length} ingredient${hits.length !== 1 ? 's' : ''} decoded
    </div>
  `;
  bulkResults.appendChild(statsEl);

  // Alert
  if (flagged.length > 0) {
    const alertEl = document.createElement('div');
    alertEl.className = 'alert-banner alert-banner--danger';
    alertEl.textContent = `🚫 ${flagged.length} banned/SVHC substance${flagged.length !== 1 ? 's' : ''} detected under EU 2020/2081. This formulation is non-compliant for EU market.`;
    bulkResults.appendChild(alertEl);
  } else if (restricted.length > 0 || watch.length > 0) {
    const alertEl = document.createElement('div');
    alertEl.className = 'alert-banner alert-banner--warning';
    alertEl.textContent = `⚠️ No banned substances detected, but ${restricted.length + watch.length} ingredient${restricted.length + watch.length !== 1 ? 's' : ''} require concentration verification or regulatory monitoring.`;
    bulkResults.appendChild(alertEl);
  } else if (hits.length > unknown.length) {
    const alertEl = document.createElement('div');
    alertEl.className = 'alert-banner alert-banner--info';
    alertEl.textContent = '✅ No banned or restricted pigments detected in the scanned ingredients. Verify with your supplier\'s EU 2020/2081 compliance certificate.';
    bulkResults.appendChild(alertEl);
  }

  // Sections
  renderSection(bulkResults, flagged, `Banned / SVHC (${flagged.length})`, flagged.length > 0);
  renderSection(bulkResults, restricted, `Restricted — concentration limits apply (${restricted.length})`, false);
  renderSection(bulkResults, watch, `Under regulatory review (${watch.length})`, false);
  renderSection(bulkResults, unknown, `Not in database (${unknown.length})`, false, true);
}

function renderSection(container, hits, title, autoExpand, isUnknown = false) {
  if (hits.length === 0) return;
  const hdr = document.createElement('div');
  hdr.className = 'results-header';
  hdr.style.marginTop = '1rem';
  hdr.innerHTML = `<span class="results-title">${escHtml(title)}</span>`;
  container.appendChild(hdr);

  const section = document.createElement('div');
  section.className = 'results-section';
  hits.forEach((h, i) => {
    const card = isUnknown
      ? buildNotFoundCard(h.query)
      : buildResultCard(h.substance, h.query, h.type);
    if (autoExpand && i === 0) card.classList && card.classList.add('expanded');
    section.appendChild(card);
  });
  container.appendChild(section);
}

// ─── Card builders ────────────────────────────────────────────────

function buildResultCard(pigment, query, matchType) {
  const cfg = STATUS_CONFIG[pigment.status] || STATUS_CONFIG.safe;
  const card = document.createElement('div');
  card.className = `result-card result-card--${cfg.cls === 'danger' ? 'flagged' : cfg.cls === 'warning' ? 'restricted' : 'watch'}`;

  const limitText = pigment.limit_ppm != null
    ? `<span class="badge badge--warning">Max ${pigment.limit_ppm} µg/g</span>`
    : '';

  const casDisplay = pigment.cas.join(', ');
  const matchNote = matchType === 'cas'
    ? `CAS match: <code>${escHtml(query)}</code>`
    : matchType === 'ci'
    ? `CI number match: <code>${escHtml(query)}</code>`
    : `Name match`;

  const foundInTags = (pigment.found_in || []).map(f =>
    `<span class="detail-tag">${escHtml(f)}</span>`
  ).join('');

  const alsoKnownAs = (pigment.also_known_as || []).map(a =>
    `<span class="detail-tag">${escHtml(a)}</span>`
  ).join('') || '<span class="detail-tag" style="color:var(--text-muted)">—</span>';

  const regulationBadge = pigment.regulation
    ? `<span class="badge badge--info">${escHtml(pigment.regulation)}</span>`
    : '';

  const ciLine = pigment.ci ? `<div class="card-name-sub">CI ${escHtml(pigment.ci)} · CAS ${escHtml(casDisplay)}</div>` : `<div class="card-name-sub">CAS ${escHtml(casDisplay)}</div>`;

  card.innerHTML = `
    <div class="card-header" onclick="toggleCard(this)">
      <span class="card-status-icon">${cfg.icon}</span>
      <div class="card-title-block">
        <div class="card-name">${escHtml(pigment.name)}</div>
        ${ciLine}
      </div>
      <div class="card-badges">
        <span class="badge badge--${cfg.cls === 'danger' ? 'danger' : cfg.cls === 'warning' ? 'warning' : 'watch'}">${escHtml(cfg.label)}</span>
        ${limitText}
        ${regulationBadge}
      </div>
      <span class="card-chevron">▼</span>
    </div>
    <div class="card-body">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span class="detail-value">${escHtml(pigment.status_label || cfg.label)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Colour group</span>
          <span class="detail-value" style="text-transform:capitalize">${escHtml((pigment.color_group || '').replace('_', ' '))}</span>
        </div>
        <div class="detail-item" style="grid-column:1/-1">
          <span class="detail-label">Regulatory notes</span>
          <span class="detail-value" style="font-size:0.82rem">${escHtml(pigment.notes || '—')}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Match method</span>
          <span class="detail-value" style="font-size:0.78rem;color:var(--text-muted)">${matchNote}</span>
        </div>
      </div>
      <div style="margin-top:0.75rem">
        <span class="detail-label">Found in</span>
        <div class="detail-tags" style="margin-top:0.35rem">${foundInTags || '<span class="detail-tag" style="color:var(--text-muted)">—</span>'}</div>
      </div>
      <div style="margin-top:0.75rem">
        <span class="detail-label">Also known as</span>
        <div class="detail-tags" style="margin-top:0.35rem">${alsoKnownAs}</div>
      </div>
      <div class="card-action-row">
        <a href="${escHtml(pigment.echa_url)}" target="_blank" rel="noopener noreferrer">🔗 ECHA Registry</a>
        <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R2081" target="_blank" rel="noopener noreferrer">📜 EU 2020/2081</a>
      </div>
    </div>
  `;
  return card;
}

function buildNotFoundCard(query) {
  const div = document.createElement('div');
  div.className = 'not-found-card';
  div.innerHTML = `
    <span class="nf-icon">🔎</span>
    <div class="nf-text">
      <div class="nf-name">${escHtml(query)}</div>
      <div class="nf-sub">Not found in restricted pigments database — may be compliant or not a recognized pigment identifier</div>
    </div>
  `;
  return div;
}

// ─── Helpers ─────────────────────────────────────────────────────

function toggleCard(headerEl) {
  headerEl.closest('.result-card').classList.toggle('expanded');
}

function renderIdle(msg) {
  return `<div class="idle-state">
    <div class="idle-state__icon">🎨</div>
    <div class="idle-state__text">${escHtml(msg)}</div>
  </div>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  searchResults.innerHTML = renderIdle('Enter a pigment name, CAS number, or CI number above.');
  bulkResults.innerHTML   = renderIdle('Paste an ingredient list above and click Decode.');
});
