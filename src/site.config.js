/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FILL THESE IN BEFORE DEPLOYING.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every value below was previously hardcoded, and several were shipped as
 * template placeholders: `YOUR_NAME` appeared in the byline of all 18 article
 * pages, `YOUR_HANDLE` 102 times, and the site URL was flagged provisional in
 * robots.txt while feeding all 42 sitemap entries (audit F-019, F-021).
 *
 * They now live here, once. `npm run check:placeholders` fails the build while
 * any FILL_ME remains, so this file cannot be forgotten.
 */

const SITE_NAME = 'The Stat Method';

export const SITE = {
  /**
   * Production origin, no trailing slash. Feeds canonicals, sitemap, OG URLs.
   *
   * Left as a working placeholder so the site still builds and runs locally.
   * `npm run check:placeholders` FAILS while this remains unchanged, so it
   * cannot reach production unnoticed — but it will not block `npm run dev`.
   */
  url: process.env.PUBLIC_SITE_URL || 'https://thestatmethod.com',

  name: SITE_NAME,
  tagline: 'Evidence-based health, fitness & nutrition tools',
  description:
    'Evidence-based health, fitness and nutrition tools that show their working — every ' +
    'formula sourced, every limitation stated.',
  locale: 'en_US',
};

export const AUTHOR = {
  /**
   * Attribution type. 'organization' credits the site itself; 'person' credits a
   * named individual.
   *
   * This drives the schema.org `author` type in the JSON-LD, so it must match
   * reality: emitting a Person for content no individual is named on would
   * assert someone who does not exist.
   */
  type: 'organization',

  /** Rendered as "Written by ___". For 'organization', the site's own name. */
  name: SITE_NAME,

  /**
   * Credentials, if a named person is credited. Leave empty for organizational
   * attribution — and do NOT invent any on a health site. An honest byline with
   * no letters after it is worth more than an implied qualification.
   */
  credentials: '',

  /** Public source repository. The site claims "every calculator on GitHub";
   *  that claim should land on the code, not on a profile page. */
  repo: 'the-stat-method',

  /** Social / GitHub handle, without the @. */
  handle: process.env.STATMETHOD_GITHUB_HANDLE || 'jonam17',

  url: '',                          // optional personal site
};

/**
 * Legal / jurisdiction details used by the policy pages.
 * These are FACTUAL inputs to those pages — if they are wrong, the pages are wrong.
 */
export const LEGAL = {
  /** Where the site operates. Drives governing-law language on the terms page. */
  country: 'the United States',

  /** Your state, for the governing-law clause. */
  state: process.env.STATMETHOD_LEGAL_STATE || 'California',           // e.g. 'California'

  /**
   * Contact address for privacy and correction requests. The privacy page tells
   * people to contact you; without this that instruction goes nowhere.
   */
  contactEmail: process.env.STATMETHOD_CONTACT_EMAIL || 'hello@thestatmethod.com',    // e.g. 'hello@yourdomain.com'

  /** Problem reports — the /report/ page. Routed to the same inbox as
   *  contactEmail, kept separate so reports never bury privacy or legal mail. */
  supportEmail: 'support@thestatmethod.com',

  /** Host, named explicitly in the privacy page. */
  host: 'Cloudflare Pages',
};


/**
 * How weight-category labels are displayed. Pending clinical review (B5).
 *
 *   'label'  — show the band ("Normal weight", "Obesity class I") with caveats.
 *              Current setting, chosen by the site owner before the evidence
 *              review below was available.
 *   'number' — show the BMI figure and no band.
 *   'paired' — show the band only alongside waist-to-height ratio, per the AMA's
 *              recommendation to use BMI in conjunction with another measure.
 *
 * WHAT THE EVIDENCE SAYS, so this is a decision and not a default:
 * The AMA's 2023 position is that BMI loses predictability at the individual
 * level and should not be a sole measure. The harms literature links categorical
 * weight labels to weight stigma, healthcare avoidance and disordered eating.
 * And labels cut BOTH ways — a "normal" band is the false reassurance that
 * delays recognition of restrictive eating disorders at normal weight.
 *
 * Changing this is one line. Pending clinical review.
 */
export const CATEGORY_DISPLAY = 'label';

export const MONETIZATION = {
  /**
   * Amazon storefront slug. Set to null to remove the affiliate block entirely
   * — the component renders nothing when this is null.
   */
  amazonStorefront: null,           // e.g. 'groundtruth' or null

  adsEnabled: false,

  /**
   * Stripe Payment Link for donations. Create it in the Stripe dashboard
   * (Payment links -> New), enable "Let customers choose what they pay", and
   * paste the resulting https://buy.stripe.com/... URL here or set
   * STRIPE_PAYMENT_LINK in the environment.
   *
   * WHY A PAYMENT LINK RATHER THAN A CHECKOUT INTEGRATION. Stripe hosts the
   * entire flow, so this site never receives a name, email, card, or message.
   * That keeps four published claims true — "nothing stored, no signup", "your
   * numbers never leave your device", "no database", and the CCPA statement
   * that we hold no personal information to disclose or delete. A server-side
   * integration with a donations table would falsify all four, which is a
   * bigger cost than the convenience is worth at this stage.
   *
   * Treat it exactly like an affiliate link: outbound, disclosed, no data back.
   */
  donationUrl: process.env.STRIPE_PAYMENT_LINK
    || 'https://donate.stripe.com/4gMfZi2Pa17a8wm1e2bo400',
};

/**
 * Where the Support button goes.
 *
 * Falls back to GitHub Sponsors until a Stripe link exists, so the button is
 * never broken and never points nowhere.
 */
/** Canonical link to the public source repository. */
export const repoUrl = () => `https://github.com/${AUTHOR.handle}/${AUTHOR.repo}`;

export const supportUrl = () =>
  MONETIZATION.donationUrl || `https://github.com/sponsors/${AUTHOR.handle}`;

/** Convenience: "Name, Credentials" or just "Name". */
export const authorLine = () =>
  AUTHOR.credentials ? `${AUTHOR.name}, ${AUTHOR.credentials}` : AUTHOR.name;

/** Absolute URL for a site-relative path. */
export const abs = (path = '/') =>
  `${SITE.url.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
