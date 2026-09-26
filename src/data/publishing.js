/**
 * The publishing rule, with no Astro dependency so it can be tested directly.
 * An article is live when it is not a draft and its date has arrived (UTC).
 */
export const isPublished = (data, now = new Date()) =>
  !data.draft && data.published.getTime() <= now.getTime();
