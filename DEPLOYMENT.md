# The Stat Method — Deployment Runbook

This is the final owner/operator runbook for the first public deployment.

## 1. GitHub

Create or confirm the production repository. Keep `main` protected if you want pull requests to be the only path to production.

Recommended CI gate:

```bash
npm ci
npx playwright install --with-deps chromium
npm run qa:calculators
npm run qa:ui
npm test
npm run build
npm run check:placeholders
npm run citations -- lint
npm run audit
npm run qa:growth
```

The included GitHub Actions workflow runs this verification on pushes to `main` and on pull requests.

## 2. Production values

Set these values only after the real brand/domain/legal decisions are final:

```text
PUBLIC_SITE_URL=https://your-real-domain.com
STATMETHOD_GITHUB_HANDLE=your-real-github-handle
STATMETHOD_LEGAL_STATE=California
STATMETHOD_CONTACT_EMAIL=hello@your-real-domain.com
```

`PUBLIC_SITE_URL` must be the canonical HTTPS origin without a path/query/fragment. The others must be real values; do not commit secrets.

Run:

```bash
npm run qa:production
```

## 3. Cloudflare Pages

For the current static Astro build use:

- Production branch: `main`
- Build command: `npm run build`
- Build directory: `dist`
- Node: 22
- Environment: set `PUBLIC_SITE_URL` plus the owner-specific values above

Connect the Pages project to the GitHub repository rather than manually uploading build output, so future commits create deployments and preview builds.

## 4. Domain

Attach the real custom domain and verify HTTPS before enabling HSTS.

Confirm:

- `https://your-domain/`
- `https://your-domain/robots.txt`
- `https://your-domain/sitemap-index.xml`
- `https://your-domain/manifest.webmanifest`

## 5. Search Console

Use a Google Search Console **Domain property** for the root domain. Domain-property verification is DNS-based and covers the domain's protocols and subdomains. After verification, submit the site's `sitemap-index.xml` URL and inspect the five priority calculator URLs.

## 6. Analytics

Use Cloudflare Web Analytics for the first release unless there is a deliberate reason to choose another provider. On Cloudflare Pages it can be enabled from the project dashboard. If enabled, update `/privacy/` and confirm the CSP remains appropriate for the selected analytics mode.

Do not send calculator inputs, health measurements, or other entered values to analytics.

## 7. Security headers

`public/_headers` is already included. Verify the deployed response contains the baseline headers. Enable HSTS only after the custom domain is stable and HTTPS-only.

## 8. Final smoke test

After deployment manually test:

- homepage and primary CTA
- one calculator from each major category
- article index + representative article
- methodology
- privacy / terms / ad disclosure
- 404 behavior
- robots and sitemap
- mobile navigation
- browser console for errors

## 9. Rollback

If a deployment introduces a regression, revert the Git commit and let the Git-connected Pages project redeploy the previous known-good revision. Keep the last successful launch build tagged in Git.
