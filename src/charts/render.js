/**
 * Renders a chart definition to static HTML at build time. No JavaScript.
 *
 * Accessibility is built in rather than added: the SVG carries a title and a
 * description, and every chart ships a visually hidden data table, so a screen
 * reader gets the numbers rather than "image". Lines differ by dash pattern as
 * well as colour, so the chart survives colour blindness and black-and-white
 * printing.
 */
const W = 640, H = 340, M = { l: 58, r: 18, t: 14, b: 46 };
const DASH = ['', '7 4', '2 4', '10 4 2 4', '1 3'];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(6));
  return out;
}

export function renderChart(id, def) {
  const xs = def.x.values;
  const all = def.series.flatMap(s => s.values).filter(v => v != null);
  const yt = niceTicks(Math.min(...all), Math.max(...all));
  const [y0, y1] = [yt[0], yt.at(-1)];
  const pw = W - M.l - M.r, ph = H - M.t - M.b;
  const x = i => M.l + (i / (xs.length - 1)) * pw;
  const y = v => M.t + (1 - (v - y0) / (y1 - y0)) * ph;
  const xStep = Math.ceil(xs.length / 8);

  const grid = yt.map(v => `<line class="ch-grid" x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}"/>` +
    `<text class="ch-tick" x="${M.l - 8}" y="${y(v)}" text-anchor="end" dominant-baseline="middle">${v}</text>`).join('');
  const xTicks = xs.map((v, i) => (i % xStep === 0 || i === xs.length - 1)
    ? `<text class="ch-tick" x="${x(i)}" y="${H - M.b + 18}" text-anchor="middle">${esc(v)}</text>` : '').join('');

  const lines = def.series.map((s, si) => {
    let d = '', pen = false;
    s.values.forEach((v, i) => {
      if (v == null) { pen = false; return; }          // a formula outside its range: break the line
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`; pen = true;
    });
    return `<path class="ch-line ch-s${si}" d="${d}"${DASH[si] ? ` stroke-dasharray="${DASH[si]}"` : ''}/>`;
  }).join('');

  const tid = `ch-${id}-t`, did = `ch-${id}-d`;
  const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${tid} ${did}">` +
    `<title id="${tid}">${esc(def.title)}</title><desc id="${did}">${esc(def.desc)}</desc>` +
    grid + xTicks +
    `<line class="ch-axis" x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}"/>` +
    lines +
    `<text class="ch-label" x="${M.l + pw / 2}" y="${H - 6}" text-anchor="middle">${esc(def.x.label)}</text>` +
    `<text class="ch-label" transform="rotate(-90)" x="${-(M.t + ph / 2)}" y="15" text-anchor="middle">${esc(def.y.label)}</text>` +
    `</svg>`;

  const legend = `<ul class="chart-legend" aria-hidden="true">` + def.series.map((s, si) =>
    `<li><svg viewBox="0 0 28 8" width="28" height="8"><line class="ch-line ch-s${si}" x1="1" y1="4" x2="27" y2="4"` +
    `${DASH[si] ? ` stroke-dasharray="${DASH[si]}"` : ''}/></svg>${esc(s.name)}</li>`).join('') + `</ul>`;

  const table = `<table class="sr-only"><caption>${esc(def.title)}</caption>` +
    `<thead><tr><th scope="col">${esc(def.x.label)}</th>` +
    def.series.map(s => `<th scope="col">${esc(s.name)}</th>`).join('') + `</tr></thead><tbody>` +
    xs.map((v, i) => `<tr><th scope="row">${esc(v)}</th>` +
      def.series.map(s => `<td>${s.values[i] ?? '—'}</td>`).join('') + `</tr>`).join('') +
    `</tbody></table>`;

  const source = def.kind === 'engine'
    ? 'Computed from the same equations the calculator uses.'
    : `Recreated from figures reported in ${esc(def.source || 'the cited study')}.`;

  return `<figure class="chart-figure">` +
    `<div class="chart-title">${esc(def.title)}</div>` + svg + legend + table +
    `<figcaption>${esc(def.caption)} <span class="chart-source">${source}</span></figcaption>` +
    `</figure>`;
}
