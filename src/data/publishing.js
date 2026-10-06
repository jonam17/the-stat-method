/**
 * The publishing rule, with no Astro dependency so it can be tested directly.
 * An article is live when it is not a draft and its date has arrived (UTC).
 */
export const isPublished = (data, now = new Date()) =>
  !data.draft && data.published.getTime() <= now.getTime();

/** 'draft' | 'scheduled' | 'live' — what the local preview banner says. */
export const articleStatus = (data, now = new Date()) =>
  data.draft ? 'draft' : isPublished(data, now) ? 'live' : 'scheduled';

/**
 * Local preview. With `preview` on, drafts and future-dated articles are shown
 * too, so a reviewer can read them in `npm run dev` without editing dates.
 * It is turned on ONLY by `import.meta.env.DEV` (see articles.js), which is
 * false in every `npm run build` — the build that deploys — so the live site
 * follows isPublished() exactly. The Library's drafts work the same way
 * (nutrients.js).
 */
export const isVisible = (data, now = new Date(), preview = false) =>
  preview || isPublished(data, now);
