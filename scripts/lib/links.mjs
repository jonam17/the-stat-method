/**
 * External link checking (roadmap item 24). Pure logic, kept apart from the
 * command-line wrapper (scripts/link-check.mjs) so it can be tested without
 * the network: every function that talks to a server takes `fetch` as an
 * argument.
 *
 * Three outcomes, and only one of them is a problem:
 *   ok        — the server answered with the page (2xx, after redirects).
 *   broken    — the page is gone (404, 410) or the domain does not exist.
 *   unchecked — the server refused or did not answer (401, 403, 429, 5xx,
 *               timeout). Publishers often block automated requests, so this
 *               says nothing about the link itself and is never counted as
 *               broken.
 *
 * DOIs are checked at doi.org's handle API rather than by following the
 * redirect to the publisher: the API says whether the DOI exists, and does not
 * depend on a publisher letting a script in.
 */

export const OWN_HOSTS = ['thestatmethod.com', 'www.thestatmethod.com'];
export const USER_AGENT =
  'TheStatMethodLinkCheck/1.0 (+https://thestatmethod.com; weekly check of cited links)';

const ENTITIES = { '&amp;': '&', '&#38;': '&', '&#x26;': '&', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };
const decode = s => s.replace(/&(amp|#38|#x26|quot|#39|#x27);/g, m => ENTITIES[m]);

/** Every external http(s) link in an HTML document's <a href>, fragment removed. */
export function extractLinks(html) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?\shref\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    const raw = decode((m[2] ?? m[3] ?? '').trim());
    if (!/^https?:\/\//i.test(raw)) continue;
    let url;
    try { url = new URL(raw); } catch { continue; }
    if (OWN_HOSTS.includes(url.hostname.toLowerCase())) continue;
    url.hash = '';
    out.add(url.href);
  }
  return [...out];
}

/** Map of url -> pages that link to it, from [{ page, html }]. */
export function collectLinks(pages) {
  const map = new Map();
  for (const { page, html } of pages) {
    for (const url of extractLinks(html)) {
      if (!map.has(url)) map.set(url, []);
      map.get(url).push(page);
    }
  }
  return map;
}

/** The DOI in a doi.org link, or null. */
export function doiOf(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (!/^(dx\.)?doi\.org$/i.test(u.hostname)) return null;
  const doi = decodeURIComponent(u.pathname.replace(/^\//, ''));
  return /^10\.\d{4,9}\/\S+$/.test(doi) ? doi : null;
}

/** Outcome for a final HTTP status. */
export function outcomeForStatus(status) {
  if (status >= 200 && status < 300) return 'ok';
  if (status === 404 || status === 410) return 'broken';
  return 'unchecked';
}

const NO_SUCH_HOST = new Set(['ENOTFOUND', 'EAI_NONAME']);
function errorCode(err) {
  return err?.cause?.code ?? err?.code ?? (err?.name === 'AbortError' || err?.name === 'TimeoutError' ? 'TIMEOUT' : 'ERROR');
}

async function request(fetchImpl, url, method, timeoutMs) {
  const res = await fetchImpl(url, {
    method,
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  // Only the status matters; do not download the page.
  try { await res.body?.cancel(); } catch { /* already closed */ }
  return res.status;
}

/**
 * Can this machine reach the internet at all? Checked once before any link, so
 * a runner with no network reports that instead of calling every link broken.
 * doi.org is used because most of the site's links depend on it anyway.
 */
export async function networkReachable({ fetch: fetchImpl = globalThis.fetch, timeoutMs = 20000 } = {}) {
  for (const url of ['https://doi.org/', 'https://www.google.com/']) {
    try { await request(fetchImpl, url, 'HEAD', timeoutMs); return true; } catch { /* try the next */ }
  }
  return false;
}

/**
 * Check one URL. Returns { outcome, status, detail }.
 * A HEAD request first; servers that refuse HEAD (403, 405, 501 and the like)
 * get one GET, since many reject HEAD but serve GET normally.
 */
export async function checkUrl(url, { fetch: fetchImpl = globalThis.fetch, timeoutMs = 20000, retryDelayMs = 3000 } = {}) {
  const first = await checkOnce(url, fetchImpl, timeoutMs);
  if (first.outcome !== 'broken' || first.status) return first;
  // "No such domain" can be a passing DNS hiccup: ask again before calling it broken.
  await new Promise(r => setTimeout(r, retryDelayMs));
  return checkOnce(url, fetchImpl, timeoutMs);
}

async function checkOnce(url, fetchImpl, timeoutMs) {
  const doi = doiOf(url);
  if (doi) {
    try {
      const status = await request(fetchImpl, `https://doi.org/api/handles/${encodeURI(doi)}`, 'GET', timeoutMs);
      if (status === 200) return { outcome: 'ok', status, detail: 'DOI registered' };
      if (status === 404) return { outcome: 'broken', status, detail: 'DOI not found at doi.org' };
      return { outcome: 'unchecked', status, detail: `doi.org answered ${status}` };
    } catch (err) {
      return { outcome: 'unchecked', status: null, detail: errorCode(err) };
    }
  }

  let status;
  try {
    status = await request(fetchImpl, url, 'HEAD', timeoutMs);
    if (outcomeForStatus(status) === 'ok' || status === 404 || status === 410) {
      return { outcome: outcomeForStatus(status), status, detail: '' };
    }
  } catch (err) {
    const code = errorCode(err);
    if (NO_SUCH_HOST.has(code)) return { outcome: 'broken', status: null, detail: 'domain does not exist' };
    // Fall through to GET: some servers drop HEAD connections.
  }
  try {
    status = await request(fetchImpl, url, 'GET', timeoutMs);
    return { outcome: outcomeForStatus(status), status, detail: '' };
  } catch (err) {
    const code = errorCode(err);
    if (NO_SUCH_HOST.has(code)) return { outcome: 'broken', status: null, detail: 'domain does not exist' };
    return { outcome: 'unchecked', status: status ?? null, detail: code };
  }
}

/**
 * Check many URLs politely: one request at a time per site, with a pause
 * between requests to the same site, and a few sites at once.
 */
export async function checkAll(urls, {
  fetch: fetchImpl = globalThis.fetch, timeoutMs = 20000, perHostDelayMs = 400, sites = 6, retryDelayMs = 3000, onResult,
} = {}) {
  const byHost = new Map();
  for (const url of urls) {
    const host = doiOf(url) ? 'doi.org' : new URL(url).hostname.toLowerCase();
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(url);
  }
  const queues = [...byHost.values()];
  const results = new Map();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function worker() {
    for (let q = queues.shift(); q; q = queues.shift()) {
      for (let i = 0; i < q.length; i++) {
        if (i) await sleep(perHostDelayMs);
        const r = await checkUrl(q[i], { fetch: fetchImpl, timeoutMs, retryDelayMs });
        results.set(q[i], r);
        onResult?.(q[i], r);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(sites, queues.length) }, worker));
  return results;
}

/** Markdown report. Broken first, then unchecked, then a count of OK. */
export function report(linkMap, results, { when = new Date() } = {}) {
  const rows = [...results].map(([url, r]) => ({ url, ...r, pages: linkMap.get(url) ?? [] }));
  const broken = rows.filter(r => r.outcome === 'broken');
  const unchecked = rows.filter(r => r.outcome === 'unchecked');
  const ok = rows.filter(r => r.outcome === 'ok');
  const where = pages => pages.slice(0, 3).join(', ') + (pages.length > 3 ? ` (+${pages.length - 3} more)` : '');
  const code = r => (r.status ? String(r.status) : '') + (r.detail ? (r.status ? ' · ' : '') + r.detail : '');
  const lines = [
    '## External link check',
    '',
    `${when.toISOString().slice(0, 10)} · ${rows.length} links · **${broken.length} broken** · ` +
      `${unchecked.length} couldn't check · ${ok.length} OK`,
    '',
  ];
  if (broken.length) {
    lines.push('### Broken — fix these', '', '| Link | Result | On |', '|---|---|---|');
    for (const r of broken) lines.push(`| ${r.url} | ${code(r)} | ${where(r.pages)} |`);
    lines.push('');
  } else {
    lines.push('No broken links.', '');
  }
  if (unchecked.length) {
    lines.push("### Couldn't check — not counted as broken",
      '', 'The site refused or did not answer an automated request. Open one by hand only if it keeps appearing.',
      '', '| Link | Result | On |', '|---|---|---|');
    for (const r of unchecked) lines.push(`| ${r.url} | ${code(r)} | ${where(r.pages)} |`);
    lines.push('');
  }
  return { markdown: lines.join('\n'), broken: broken.length, unchecked: unchecked.length, ok: ok.length };
}
