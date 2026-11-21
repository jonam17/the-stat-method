/** Food groups in display order (kept free of astro:content so tests can import it). */
export const FOOD_GROUPS = [
  { key: 'fruits', label: 'Fruits' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'meat', label: 'Meat and poultry' },
  { key: 'fish', label: 'Fish' },
  { key: 'eggs-dairy', label: 'Eggs and dairy' },
];
export const FOODS_SOURCE = {
  title: 'USDA FoodData Central, SR Legacy',
  url: 'https://fdc.nal.usda.gov/',
  release: 'April 2018 (final release)',
};
