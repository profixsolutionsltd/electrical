export interface ExplorerCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  count: number;
}

export interface ExplorerService {
  id: string;
  name: string;
  slug: string;
  summary: string;
  priceFrom: number;
  durationMinutes: number;
  featured: boolean;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
}
