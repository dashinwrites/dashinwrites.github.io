(() => {
  // only run on the heatmap page
  const mount = document.getElementById('heatmap-months');
  if (!mount) return;

  const summaryEl = document.getElementById('hm-summary');

  const yearWrap = document.getElementById('hm-years');
  const metricWrap = document.getElementById('hm-metric');
  const catWrap = document.getElementById('hm-category');

  const state = {
    year: null,              // number|null (null = all)
    metric: 'words',         // 'words' | 'sessions'
    categories: new Set(),   // empty = all
    allYears: [],            // available years
  };

  fetch(`https://opensheet.elk.sh/${sheetID}/Writing`)
    .then(r => r.json())
    .then(writingData => {
      const entries = (writingData || []).map(row => ({
        Date: row.Date,
        ISODate: toISODate(row.Date),
        Words: Number(row.Words || 0),
        Category: String(row.Category || '').trim().toLowerCase()
      })).filter(e => e.ISODate);

      // ---- build year menu (inject under the existing "all") ----
      const years = [...new Set(entries.map(e => e.ISODate.slice(0, 4)))]
        .filter(Boolean)
        .map(Number)
        .sort((a, b) => b - a);

      state.allYears = years;

      if (yearWrap) {
        // remove previously injected year labels (keep the first "all" label)
        const keepAll = yearWrap.querySelector('label.all');
        yearWrap.innerHTML = '';
        if (keepAll) yearWrap.appendChild(keepAll);

        years.forEach(y => {
          yearWrap.insertAdjacentHTML(
            'beforeend',
            `<label><span><input type="checkbox" value="${y}"></span><b>${escapeHtml(String(y))}</b></label>`
          );
        });
      }

      // ---- initialize default selections ----
      // default year = newest year in data
      state.year = years.length ? years[0] : new Date().getFullYear();
      if (yearWrap) setSingleChoice(yearWrap, String(state.year));

      // metric default already checked in your HTML, but we normalize anyway
      if (metricWrap) setSingleChoice(metricWrap, 'words', { hasAll: false });

      // category default = all (your HTML already has it checked)
      if (catWrap) {
        state.categories.clear();
        setAllChecked(catWrap);
      }

      // ---- bind events ----
      if (yearWrap) {
        yearWrap.addEventListener('change', (e) => {
          const input = e.target.closest('input[type="checkbox"]');
          if (!input) return;

          if (input.classList.contains('all')) {
            // all years
            setSingleChoice(yearWrap, '');
            state.year = null;
          } else {
            setSingleChoice(yearWrap, input.value);
            state.year = Number(input.value);
          }

          render(entries);
        });
      }

      if (metricWrap) {
        metricWrap.addEventListener('change', (e) => {
          const input = e.target.closest('input[type="checkbox"]');
          if (!input) return;

          setSingleChoice(metricWrap, input.value, { hasAll: false });
            state.metric = input.value === 'posts' ? 'posts' : 'words';

            render(entries);
        });
      }

      if (catWrap) {
        catWrap.addEventListener('change', (e) => {
          const input = e.target.closest('input[type="checkbox"]');
          if (!input) return;

          if (input.classList.contains('all')) {
            if (input.checked) {
              // clear others
              catWrap.querySelectorAll('input[type="checkbox"]:not(.all)')
                .forEach(i => (i.checked = false));
              state.categories.clear();
            } else {
              // keep all checked if nothing else selected
              input.checked = true;
            }
          } else {
            // uncheck all if any selected
            const all = catWrap.querySelector('input.all');
            if (all) all.checked = false;

            state.categories.clear();
            catWrap.querySelectorAll('input[type="checkbox"]:checked:not(.all)')
              .forEach(i => state.categories.add(String(i.value || '').trim().toLowerCase()));

            // if none selected, revert to all
            if (!state.categories.size) {
              setAllChecked(catWrap);
            }
          }

          syncCheckedLabels(catWrap);
          render(entries);
        });
      }

      // initial label sync
      if (yearWrap) syncCheckedLabels(yearWrap);
      if (metricWrap) syncCheckedLabels(metricWrap);
      if (catWrap) syncCheckedLabels(catWrap);

      // ---- initial render ----
      render(entries);

      // ---- build category menu (inject under the existing "all") ----
        const cats = [...new Set(entries.map(e => e.Category).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

            if (catWrap) {
                // keep the first "all" label, replace the rest
                const keepAll = catWrap.querySelector('label.all');
                catWrap.innerHTML = '';
                if (keepAll) catWrap.appendChild(keepAll);

            cats.forEach(c => {
                catWrap.insertAdjacentHTML(
                'beforeend',
                `<label><span><input type="checkbox" value="${escapeHtml(c)}"></span><b>${escapeHtml(formatCategoryLabel(c))}</b></label>`
                );
            });
        }

    })
    .catch(err => {
      console.error('Heatmap load failed:', err);
      if (summaryEl) summaryEl.textContent = 'Failed to load heatmap.';
    });

  function render(entries) {
    // filter rows first
    const filtered = (entries || []).filter(e => {
      if (state.year && !String(e.ISODate).startsWith(String(state.year))) return false;

      // category filter values should be like "rp", "dnd", "hobby"
      // entries.Category is lowercased already
      if (state.categories.size && !state.categories.has(e.Category)) return false;

      return true;
    });

    // pick year for rendering
    const yearToRender = state.year ?? inferNewestYear(filtered, entries) ?? new Date().getFullYear();

    // metric -> we need to transform entries before rendering:
    // - words: use Words as-is
    // - sessions: treat each row as 1 session (Words = 1) so aggregation works
    const metricEntries = filtered.map(e => ({
      ...e,
      Words: state.metric === 'posts' ? 1 : (Number(e.Words) || 0)
    }));

    renderMonthlyHeatmap(metricEntries, { 
        year: yearToRender,
        metricLabel: state.metric === 'posts' ? 'posts' : 'words' 
});

    if (summaryEl) {
      const total = metricEntries
        .filter(e => String(e.ISODate).startsWith(String(yearToRender)))
        .reduce((acc, e) => acc + (Number(e.Words) || 0), 0);

      summaryEl.textContent =
        state.metric === 'posts'
          ? `${yearToRender} • ${total.toLocaleString()} posts`
          : `${yearToRender} • ${total.toLocaleString()} words`;
    }
  }

  function inferNewestYear(filtered, all) {
    const arr = (filtered && filtered.length) ? filtered : all;
    const years = arr.map(e => Number(String(e.ISODate || '').slice(0, 4))).filter(Boolean);
    return years.length ? Math.max(...years) : null;
  }

  function setAllChecked(groupEl) {
    const all = groupEl.querySelector('input.all');
    if (all) all.checked = true;
    groupEl.querySelectorAll('label').forEach(l => l.classList.remove('is-checked'));
    if (all) all.closest('label')?.classList.add('is-checked');
  }

  // single-select checkbox group helper
  function setSingleChoice(groupEl, value, { hasAll = true } = {}) {
    const all = hasAll ? groupEl.querySelector('input.all') : null;

    groupEl.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));

    if (hasAll && (!value || value === '')) {
      if (all) all.checked = true;
    } else {
      const match = [...groupEl.querySelectorAll('input[type="checkbox"]')]
        .find(i => i.value === value);
      if (match) match.checked = true;
    }

    syncCheckedLabels(groupEl);
  }

  function syncCheckedLabels(groupEl) {
    groupEl.querySelectorAll('label').forEach(l => l.classList.remove('is-checked'));
    groupEl.querySelectorAll('input[type="checkbox"]:checked').forEach(i => {
      i.closest('label')?.classList.add('is-checked');
    });
  }
})();

function formatCategoryLabel(c) {
  if (c === 'dnd' || c === 'd&d') return 'D&D';
  return c.replace(/\b\w/g, ch => ch.toUpperCase());
}

function renderMonthlyHeatmap(entries, {
  mountId = 'heatmap-months',
  year = new Date().getFullYear(),
  weekStartsOnSunday = true, 
  metricLabel= 'words'
} = {}) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  // --- build { "YYYY-MM-DD": totalWords } for the target year ---
  const dayTotals = Object.create(null);

  (entries || []).forEach(e => {
    const iso = (e.ISODate || toISODate(e.Date) || '').trim();
    if (!iso || !iso.startsWith(String(year))) return;

    const w = Number(e.Words || 0);
    if (!Number.isFinite(w) || w <= 0) return;

    dayTotals[iso] = (dayTotals[iso] || 0) + w;
  });

  // --- scale: determine max for coloring ---
  const max = Math.max(0, ...Object.values(dayTotals));
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // --- render 12 months ---
  mount.innerHTML = monthNames.map((name, monthIndex) => {

    const weekdayRow = `
        <div class="hm-month__weekdays" aria-hidden="true">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
    `;

    const gridCells = buildMonthCells(year, monthIndex, dayTotals, {
      weekStartsOnSunday
    }).map(cell => {
      if (cell.type === 'pad') {
        return `<div class="hm-day is-pad" aria-hidden="true"></div>`;
      }

      const words = cell.words;
      const intensity = computeIntensity(words, max); // 0..5
      const bg = heatColor(intensity); // returns a CSS color string

      // optional tooltip
      const title = `${cell.iso} • ${words.toLocaleString()} ${metricLabel}`;

      return `
        <div class="hm-day"
             data-words="${words}"
             style="background:${bg}"
             title="${escapeHtml(title)}"></div>
      `;
    }).join('');

    return `
      <article class="hm-month">
        <div class="hm-month__title">${name}</div>
        ${weekdayRow}
        <div class="hm-month__grid">${gridCells}</div>
      </article>
    `;
  }).join('');
}

/* ---------- helpers ---------- */

// build a flat array of 7*n cells including leading/trailing pads
function buildMonthCells(year, monthIndex, dayTotals, { weekStartsOnSunday } = {}) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const daysInMonth = last.getDate();

  // JS: getDay() => 0 Sun .. 6 Sat
  let startDow = first.getDay();

  // if you ever want Mon-start:
  if (!weekStartsOnSunday) {
    startDow = (startDow + 6) % 7; // shift so Mon=0
  }

  const cells = [];

  // leading pads
  for (let i = 0; i < startDow; i++) cells.push({ type: 'pad' });

  // actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const words = dayTotals[iso] || 0;
    cells.push({ type: 'day', iso, words });
  }

  // trailing pads to complete the final week
  while (cells.length % 7 !== 0) cells.push({ type: 'pad' });

  return cells;
}

function sumMonth(dayTotals, year, monthIndex) {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
  return Object.keys(dayTotals)
    .filter(k => k.startsWith(prefix))
    .reduce((acc, k) => acc + (dayTotals[k] || 0), 0);
}

// 0..5 buckets
function computeIntensity(words, max) {
  if (!max || words <= 0) return 0;
  const ratio = words / max;
  if (ratio <= 0.05) return 1;
  if (ratio <= 0.20) return 2;
  if (ratio <= 0.40) return 3;
  if (ratio <= 0.70) return 4;
  return 5;
}

// pick colors that fit your red/black/gold vibe (tweak freely)
function heatColor(level) {
  switch (level) {
    case 0: return 'rgba(255,255,255,0.04)';
    case 1: return 'rgba(120, 40, 40, 0.25)';
    case 2: return 'rgba(140, 50, 50, 0.45)';
    case 3: return 'rgba(170, 60, 60, 0.65)';
    case 4: return 'rgba(200, 80, 80, 0.85)';
    case 5: return 'rgba(218, 165, 32, 0.9)';
    default: return 'rgba(255,255,255,0.04)';
  }
}

function toISODate(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [m, d, y] = s.split('/').map(n => parseInt(n, 10));
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  return '';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}