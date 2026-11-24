// Library nutrient sections (moved here from nutrients.js in v2.54.2 so tests can import them).
// `noun` is the singular shown on share cards ("Library · vitamin"). Choline is
// neither a vitamin nor a mineral — its fact sheet calls it "an essential
// nutrient" — so it has a kind of its own rather than a label it does not carry.
export const KINDS = [
  // `meta`: the section page's search-result description (SEO audit, v2.54.2). `intro`: written
  // substance for a section with few entries; drop it once the section has more.
  { key: 'vitamin', slug: 'vitamins', label: 'Vitamins', noun: 'vitamin',
    meta: 'All 13 vitamins: what each does, how much adults need, the best food sources, upper limits and deficiency signs, from NIH Office of Dietary Supplements sheets.' },
  { key: 'mineral', slug: 'minerals', label: 'Minerals', noun: 'mineral',
    meta: 'Fifteen dietary minerals: what each does, how much adults need, the best food sources, upper limits and signs of deficiency, each from an official source.' },
  { key: 'other', slug: 'other-nutrients', label: 'Other nutrients', noun: 'nutrient',
    meta: 'Choline and the essential amino acids: what they do, how much adults need, where they come from in food, and what the evidence supports, from official sources.',
    intro: [
      'Nutrients that are neither vitamins nor minerals but still have official intake recommendations. Choline is an essential nutrient the body makes some of, but not enough; the essential amino acids are the nine building blocks of protein that must come from food.',
      'Each page gives the recommended amount from an official source, the main food sources and what the evidence supports. Vitamins and minerals have their own sections in the Library.',
    ] },
];

