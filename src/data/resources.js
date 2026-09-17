/**
 * Curated external resources.
 *
 * Inclusion rules (stated publicly on the page):
 *  - Must be genuinely useful to someone using the tools here.
 *  - Must be reasonably rigorous. Where a source is popular but has drawn
 *    credible criticism for overstating evidence, we say so rather than
 *    quietly omitting it or quietly endorsing it.
 *  - Affiliate relationships are labelled inline, per item.
 */
export const RESOURCES = [
  {
    group: 'Tracking & data',
    blurb: 'Software worth the time it takes to set up. All have usable free tiers.',
    items: [
      { name: 'Cronometer', url: 'https://cronometer.com',
        role: 'Food & micronutrient tracking',
        why: 'The most accurate free food database, with verified entries from lab analyses rather than crowd-sourced guesses. Tracks 80+ micronutrients, not just macros — which is the gap most trackers leave.',
        note: 'Freemium' },
      { name: 'MacroFactor', url: 'https://macrofactorapp.com',
        role: 'Adaptive expenditure tracking',
        why: 'Back-calculates your actual TDEE from logged weight and intake over time, instead of relying on a formula. Built by the Stronger by Science team. Paid, no free tier beyond a trial.',
        note: 'Paid' },
      { name: 'Strong', url: 'https://www.strong.app',
        role: 'Workout logging',
        why: 'Simple, fast lift logging with plate maths and rest timers. Free tier covers most people.',
        note: 'Freemium' },
      { name: 'Renaissance Periodization RP Hypertrophy', url: 'https://rpstrength.com',
        role: 'Programme design',
        why: 'Volume-landmark-based programming from Mike Israetel and colleagues. Opinionated, evidence-informed, and unusually explicit about its reasoning.',
        note: 'Paid' },
    ],
  },
  {
    group: 'Primary sources & databases',
    blurb: 'Where the claims actually come from. Go here before trusting a summary — including ours.',
    items: [
      { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov',
        role: 'Research database',
        why: 'The index for biomedical literature. Every numbered citation in our articles links here or to the publisher.',
        note: 'Government' },
      { name: 'Examine.com', url: 'https://examine.com',
        role: 'Supplement evidence summaries',
        why: 'Independent, sells no supplements, and grades evidence strength honestly — including verdicts of "probably does nothing". The rare supplement resource with no incentive to overstate.',
        note: 'Freemium' },
      { name: 'Stronger by Science', url: 'https://www.strongerbyscience.com',
        role: 'Research review & articles',
        why: 'Greg Nuckols and colleagues write the most statistically careful training content available for free. Their meta-analyses are frequently better than the ones they critique.',
        note: 'Free' },
      { name: 'NIH Office of Dietary Supplements', url: 'https://ods.od.nih.gov/factsheets/list-all/',
        role: 'Nutrient fact sheets',
        why: 'Government fact sheets on every vitamin and mineral, with RDAs, upper limits, and interactions. Dry, authoritative, and free of marketing.',
        note: 'Government' },
      { name: 'USDA FoodData Central', url: 'https://fdc.nal.usda.gov',
        role: 'Food composition data',
        why: 'The reference database underlying most nutrition apps. Useful when you want to check what a tracker is telling you.',
        note: 'Government' },
    ],
  },
  {
    group: 'People worth following',
    blurb: 'Signal-to-noise is the only criterion. Where someone is popular but has drawn credible criticism, that is noted — an evidence-based site should not launder reputations.',
    items: [
      { name: 'Dr. Rhonda Patrick — FoundMyFitness', url: 'https://www.foundmyfitness.com',
        role: 'Nutrition & longevity science',
        why: 'PhD in biomedical science. Goes deep on micronutrients, omega-3s, sauna and cold exposure, and reliably links the underlying papers. Long-form and technical rather than tip-driven.',
        note: 'Freemium' },
      { name: 'Jeff Nippard', url: 'https://www.youtube.com/@JeffNippard',
        role: 'Training technique & programme design',
        why: 'Natural bodybuilder with a biochemistry background. Cites studies on screen, updates positions when evidence changes, and is unusually willing to say a popular technique does not work.',
        note: 'Free' },
      { name: 'Dr. Mike Israetel — Renaissance Periodization', url: 'https://www.youtube.com/@RenaissancePeriodization',
        role: 'Hypertrophy programming',
        why: 'PhD in sport physiology. Best available free explanation of volume landmarks, fatigue management and periodisation. Delivery is combative; the underlying reasoning is sound.',
        note: 'Free' },
      { name: 'Dr. Layne Norton — BioLayne', url: 'https://biolayne.com',
        role: 'Nutrition science & myth-checking',
        why: 'PhD in nutritional sciences. Particularly good at dismantling diet claims that outrun their evidence, including popular ones.',
        note: 'Free' },
      { name: 'Dr. Andrew Huberman — Huberman Lab', url: 'https://www.hubermanlab.com',
        role: 'Neuroscience & protocols',
        why: 'Stanford neuroscientist with an enormous audience and genuinely useful episodes on sleep, light exposure and circadian rhythm.',
        note: 'Free',
        caveat: 'Read critically. Huberman has drawn substantive criticism from other scientists for presenting preliminary or mechanistic findings as settled protocols, and for supplement recommendations that outrun the human evidence. Useful as a starting point for topics, not as a final citation — check the underlying studies before acting on a protocol.' },
      { name: 'Dr. Peter Attia', url: 'https://peterattiamd.com',
        role: 'Longevity & metabolic health',
        why: 'Physician focused on healthspan, lipidology and metabolic disease. Detailed and clinically grounded.',
        note: 'Freemium',
        caveat: 'Heavily oriented toward aggressive testing and intervention that may not be warranted, or affordable, for most people. Much of the best material is behind a paid membership.' },
    ],
  },
  {
    group: 'Equipment',
    blurb: 'Only things that make measurement or consistency easier. Nothing here is required to use any calculator on this site.',
    affiliate: true,
    items: [
      // The storefront is intentionally omitted until a real affiliate slug is configured.
      { name: 'Digital kitchen scale (0.1 g)', role: 'Food weighing',
        why: 'The single highest-return purchase for anyone tracking intake. Portion estimates are wrong by a wide margin; a scale removes the guesswork.',
        note: 'Affiliate' },
      { name: 'Flexible tape measure', role: 'Navy method measurements',
        why: 'Needed for the body fat estimator. A retracting tape with a tension button improves repeatability.',
        note: 'Affiliate' },
      { name: 'Body fat calipers', role: 'Skinfold measurements',
        why: 'Only worth it if you will measure consistently. Accuracy depends far more on technique than on the caliper itself.',
        note: 'Affiliate' },
    ],
  },
];
