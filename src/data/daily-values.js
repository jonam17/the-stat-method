/**
 * Daily Values for adults and children 4 years and older: the Reference Daily
 * Intakes in 21 CFR 101.9(c)(8)(iv), the table food labels use. Read in full in the
 * official text (Code of Federal Regulations, 2025 edition, revised as of
 * 1 April 2025, govinfo.gov) on 2026-11-21, and checked against a second copy of
 * the same section.
 *
 * Units match USDA FoodData Central's: vitamin A in mcg RAE, folate in mcg DFE,
 * vitamin E as alpha-tocopherol. Niacin's Daily Value is in mg niacin equivalents;
 * USDA lists preformed niacin only, so the share shown can understate it.
 * `slug` is the nutrient's Library page.
 */
export const DV_SOURCE = {
  title: '21 CFR 101.9(c)(8)(iv), Reference Daily Intakes, adults and children 4 years and older',
  url: 'https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol2/xml/CFR-2025-title21-vol2-sec101-9.xml',
  edition: 'Code of Federal Regulations, revised as of April 1, 2025',
  checked: '2026-11-21',
};

export const DAILY_VALUES = {
  'vitamin-a': { name: 'Vitamin A', dv: 900, unit: 'mcg' },
  'vitamin-c': { name: 'Vitamin C', dv: 90, unit: 'mg' },
  'vitamin-d': { name: 'Vitamin D', dv: 20, unit: 'mcg' },
  'vitamin-e': { name: 'Vitamin E', dv: 15, unit: 'mg' },
  'vitamin-k': { name: 'Vitamin K', dv: 120, unit: 'mcg' },
  'thiamin': { name: 'Thiamin', dv: 1.2, unit: 'mg' },
  'riboflavin': { name: 'Riboflavin', dv: 1.3, unit: 'mg' },
  'niacin': { name: 'Niacin', dv: 16, unit: 'mg' },
  'vitamin-b6': { name: 'Vitamin B6', dv: 1.7, unit: 'mg' },
  'folate': { name: 'Folate', dv: 400, unit: 'mcg' },
  'vitamin-b12': { name: 'Vitamin B12', dv: 2.4, unit: 'mcg' },
  'pantothenic-acid': { name: 'Pantothenic acid', dv: 5, unit: 'mg' },
  'choline': { name: 'Choline', dv: 550, unit: 'mg' },
  'calcium': { name: 'Calcium', dv: 1300, unit: 'mg' },
  'iron': { name: 'Iron', dv: 18, unit: 'mg' },
  'magnesium': { name: 'Magnesium', dv: 420, unit: 'mg' },
  'phosphorus': { name: 'Phosphorus', dv: 1250, unit: 'mg' },
  'potassium': { name: 'Potassium', dv: 4700, unit: 'mg' },
  'zinc': { name: 'Zinc', dv: 11, unit: 'mg' },
  'copper': { name: 'Copper', dv: 0.9, unit: 'mg' },
  'manganese': { name: 'Manganese', dv: 2.3, unit: 'mg' },
  'selenium': { name: 'Selenium', dv: 55, unit: 'mcg' },
};
