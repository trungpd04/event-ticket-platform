// ==============================|| PUBLIC - STATIC CATEGORIES ||============================== //

export interface StaticCategory {
  id: number;
  nameKey: string;
  defaultName: string;
  slug: string;
}

export const STATIC_CATEGORIES: StaticCategory[] = [
  { id: 1, nameKey: 'category.sports', defaultName: 'Sports', slug: 'sports' },
  { id: 2, nameKey: 'category.music', defaultName: 'Music', slug: 'music' },
  { id: 3, nameKey: 'category.theater', defaultName: 'Theater', slug: 'theater' },
  { id: 5, nameKey: 'category.exhibitions', defaultName: 'Exhibitions', slug: 'exhibitions' }
];
