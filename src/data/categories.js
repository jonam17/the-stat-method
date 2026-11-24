/**
 * Article categories. Single source of truth for the four category pages, the
 * filter navigation, and the pill colours.
 *
 * Names must match the enum in src/content.config.ts exactly — the build fails
 * on a mismatch rather than silently producing an empty category page.
 *
 * `meta` is the search-result description (120-160 characters); `description` is the line shown on
 * the page. `intro` and `tools` give the categories with few articles some written substance
 * (SEO audit, v2.54.2); drop them once a category has enough articles to stand on its own.
 */
export const CATEGORIES = [
  { name: 'Nutrition', slug: 'nutrition',
    description: 'Protein, calories, macronutrients and what the evidence actually supports about each.',
    meta: 'Articles on protein, calories, macros and creatine, built from primary research, with every claim sourced and the matching calculator linked.' },
  { name: 'Exercise', slug: 'exercise',
    description: 'Strength, cardio and the numbers used to measure both — where each formula came from and what it can tell you.',
    meta: 'Strength and cardio articles on progressive overload, training volume, one-rep max, heart rate zones and VO2 max, built from primary research and cited.' },
  { name: 'Health', slug: 'health',
    description: 'Body composition and weight, and the limits of the measures used to describe them.',
    meta: 'Articles on body composition and weight: which body fat methods to trust, FFMI, and what you should weigh, with the limits of each measure explained.',
    intro: [
      'These articles are about the numbers used to describe a body: weight, body fat percentage and fat-free mass. Each one explains where a measure comes from, what it can tell you and where it breaks down, because no single number describes health on its own.',
      'Three calculators go with them: Healthy Weight Range (BMI and waist-to-height ratio), Body Fat Estimator (several estimation methods side by side) and Lean Mass & FFMI (fat-free mass index).',
    ],
    tools: ['healthy-weight', 'body-fat', 'ffmi'] },
  { name: 'Recovery', slug: 'recovery',
    description: 'Sleep, caffeine and the parts of training that happen when you are not training.',
    meta: 'Articles on sleep and caffeine for people who train: how sleep affects training and recovery, and how caffeine timing affects sleep, every claim sourced.',
    intro: [
      'Much of what training does happens afterwards, while you rest and sleep. This section covers the parts of that you can measure and plan: how sleep affects training and recovery, and how the caffeine that helps you train can cut into the sleep that follows. Each article is built from primary research and links its sources.',
      'Two calculators go with it: the Sleep Cycle Calculator works out bedtimes and wake times, and the Caffeine Half-Life calculator estimates how much caffeine is still in your system at bedtime.',
    ],
    tools: ['sleep-calculator', 'caffeine-half-life'] },
];

export const findCategory = slug => CATEGORIES.find(c => c.slug === slug);
