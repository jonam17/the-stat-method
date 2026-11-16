/**
 * The weekly external link check (scripts/link-check.mjs, roadmap item 24).
 * No network: requests go to a fake fetch, or to a local server for the end-to-end case.
 */
import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { createServer } from 'node:http';
import {
  extractLinks, collectLinks, doiOf, outcomeForStatus, checkUrl, checkAll, report, networkReachable,
} from '../../../scripts/lib/links.mjs';

const res = status => ({ status, body: { cancel: async () => {} } });
const netErr = code => Object.assign(new TypeError('fetch failed'), { cause: { code } });
/** A fake fetch: `routes` maps "METHOD url" (or "url") to a status or an error code. */
const fakeFetch = (routes, calls = []) => async (url, opts) => {
  calls.push(`${opts.method} ${url}`);
  const r = routes[`${opts.method} ${url}`] ?? routes[url];
  if (r === undefined) throw new Error(`unexpected request ${opts.method} ${url}`);
  if (typeof r === 'string') throw netErr(r);
  return res(r);
};

describe('extractLinks', () => {
  it('finds external <a href> links, decodes entities, drops fragments, duplicates and own links', () => {
    const html = `
      <a href="https://pubmed.ncbi.nlm.nih.gov/123/">x</a>
      <a class="c" href='https://example.org/a?x=1&amp;y=2#sec'>y</a>
      <a href="https://example.org/a?x=1&y=2">dup</a>
      <a href="/tools/">internal</a>
      <a href="https://thestatmethod.com/about/">own</a>
      <a href="mailto:hello@thestatmethod.com">mail</a>
      <link href="https://fonts.example.com/css">
      <img alt="" src="https://img.example.com/a.png">`;
    expect(extractLinks(html)).toEqual(['https://pubmed.ncbi.nlm.nih.gov/123/', 'https://example.org/a?x=1&y=2']);
  });

  it('collectLinks records every page that links to a URL', () => {
    const map = collectLinks([
      { page: '/a/', html: '<a href="https://x.org/1">' },
      { page: '/b/', html: '<a href="https://x.org/1"><a href="https://y.org/">' },
    ]);
    expect(map.get('https://x.org/1')).toEqual(['/a/', '/b/']);
    expect(map.get('https://y.org/')).toEqual(['/b/']);
  });
});

describe('outcomes', () => {
  it('only 404 and 410 count as broken; refusals and server errors are "couldn\'t check"', () => {
    expect(outcomeForStatus(200)).toBe('ok');
    expect(outcomeForStatus(404)).toBe('broken');
    expect(outcomeForStatus(410)).toBe('broken');
    for (const s of [401, 403, 405, 429, 500, 503]) expect(outcomeForStatus(s)).toBe('unchecked');
  });

  it('recognises DOI links', () => {
    expect(doiOf('https://doi.org/10.3389/fphys.2025.1611468')).toBe('10.3389/fphys.2025.1611468');
    expect(doiOf('https://dx.doi.org/10.1519/JSC.0000000000003089')).toBe('10.1519/JSC.0000000000003089');
    expect(doiOf('https://pubmed.ncbi.nlm.nih.gov/123/')).toBeNull();
    expect(doiOf('https://doi.org/not-a-doi')).toBeNull();
  });
});

describe('checkUrl', () => {
  const U = 'https://example.org/page';

  it('OK on 200 from HEAD, without a second request', async () => {
    const calls = [];
    expect((await checkUrl(U, { fetch: fakeFetch({ [`HEAD ${U}`]: 200 }, calls) })).outcome).toBe('ok');
    expect(calls).toEqual([`HEAD ${U}`]);
  });

  it('broken on 404 and 410', async () => {
    expect((await checkUrl(U, { fetch: fakeFetch({ [`HEAD ${U}`]: 404 }) })).outcome).toBe('broken');
    expect((await checkUrl(U, { fetch: fakeFetch({ [`HEAD ${U}`]: 410 }) })).outcome).toBe('broken');
  });

  it('retries with GET when HEAD is refused, and trusts the GET', async () => {
    const r = await checkUrl(U, { fetch: fakeFetch({ [`HEAD ${U}`]: 405, [`GET ${U}`]: 200 }) });
    expect(r.outcome).toBe('ok');
    const r2 = await checkUrl(U, { fetch: fakeFetch({ [`HEAD ${U}`]: 403, [`GET ${U}`]: 403 }) });
    expect(r2.outcome).toBe('unchecked');
  });

  it('a domain that does not exist is broken, but only after asking twice; a timeout is not', async () => {
    const calls = [];
    expect((await checkUrl(U, { retryDelayMs: 1, fetch: fakeFetch({ [U]: 'ENOTFOUND' }, calls) })).outcome).toBe('broken');
    expect(calls.length).toBe(2);
    // A DNS hiccup that clears on the second try is not reported.
    let n = 0;
    const flaky = async (url, opts) => { n += 1; if (n === 1) throw netErr('ENOTFOUND'); return res(200); };
    expect((await checkUrl(U, { retryDelayMs: 1, fetch: flaky })).outcome).toBe('ok');
    const t = await checkUrl(U, { fetch: fakeFetch({ [`HEAD ${U}`]: 'ECONNRESET', [`GET ${U}`]: 'UND_ERR_CONNECT_TIMEOUT' }) });
    expect(t.outcome).toBe('unchecked');
  });

  it('checks a DOI at doi.org, never at the publisher', async () => {
    const calls = [];
    const doi = 'https://doi.org/10.1000/abc';
    const api = 'https://doi.org/api/handles/10.1000/abc';
    expect((await checkUrl(doi, { fetch: fakeFetch({ [`GET ${api}`]: 200 }, calls) })).outcome).toBe('ok');
    expect(calls).toEqual([`GET ${api}`]);
    expect((await checkUrl(doi, { fetch: fakeFetch({ [`GET ${api}`]: 404 }) })).outcome).toBe('broken');
    expect((await checkUrl(doi, { fetch: fakeFetch({ [`GET ${api}`]: 503 }) })).outcome).toBe('unchecked');
  });
});

describe('networkReachable', () => {
  it('is false when nothing resolves, so an outage is never reported as broken links', async () => {
    expect(await networkReachable({ fetch: async () => { throw netErr('ENOTFOUND'); } })).toBe(false);
    expect(await networkReachable({ fetch: async () => res(403) })).toBe(true);
  });
});

describe('report', () => {
  it('lists broken links first with the pages they are on, and counts the rest', () => {
    const map = new Map([['https://a.org/', ['/x/', '/y/']], ['https://b.org/', ['/x/']], ['https://c.org/', ['/z/']]]);
    const results = new Map([
      ['https://a.org/', { outcome: 'broken', status: 404, detail: '' }],
      ['https://b.org/', { outcome: 'unchecked', status: 403, detail: '' }],
      ['https://c.org/', { outcome: 'ok', status: 200, detail: '' }],
    ]);
    const r = report(map, results, { when: new Date('2026-11-16T12:00:00Z') });
    expect([r.broken, r.unchecked, r.ok]).toEqual([1, 1, 1]);
    expect(r.markdown).toContain('2026-11-16 · 3 links · **1 broken** · 1 couldn\'t check · 1 OK');
    expect(r.markdown).toContain('| https://a.org/ | 404 | /x/, /y/ |');
    expect(r.markdown.indexOf('Broken')).toBeLessThan(r.markdown.indexOf("Couldn't check —"));
  });

  it('says so when nothing is broken', () => {
    const r = report(new Map([['https://c.org/', ['/']]]), new Map([['https://c.org/', { outcome: 'ok', status: 200, detail: '' }]]));
    expect(r.broken).toBe(0);
    expect(r.markdown).toContain('No broken links.');
  });
});

describe('end to end against a local server', () => {
  let server, base;
  const hits = [];
  beforeAll(async () => {
    server = createServer((req, resp) => {
      hits.push(`${req.method} ${req.url}`);
      const map = { '/ok': 200, '/gone': 404, '/removed': 410, '/blocked': 403, '/nohead': req.method === 'HEAD' ? 405 : 200 };
      if (req.url === '/moved') { resp.writeHead(301, { location: '/ok' }); return resp.end(); }
      resp.writeHead(map[req.url] ?? 500); resp.end('body');
    });
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => new Promise(r => server.close(r)));

  it('classifies real responses, follows redirects, and waits between requests to one site', async () => {
    const urls = ['/ok', '/gone', '/removed', '/blocked', '/nohead', '/moved'].map(p => base + p);
    const t0 = Date.now();
    const results = await checkAll(urls, { perHostDelayMs: 30, timeoutMs: 5000, retryDelayMs: 1 });
    expect(Date.now() - t0).toBeGreaterThanOrEqual(5 * 30);
    const o = Object.fromEntries([...results].map(([u, r]) => [u.replace(base, ''), r.outcome]));
    expect(o).toEqual({ '/ok': 'ok', '/gone': 'broken', '/removed': 'broken', '/blocked': 'unchecked', '/nohead': 'ok', '/moved': 'ok' });
    expect(hits).toContain('GET /nohead');
  });
});
