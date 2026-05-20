// Long-form, useful writing for prospective buyers, sellers and tenants in Gurgaon.
// Categories reflect the four content pillars we publish under.
export type InsightCategory =
  | 'area-guide'        // Gurgaon area guides (micro-market deep dives)
  | 'rental-insight'    // Rental insights (yields, tenant trends, lease tips)
  | 'buyer-guide'       // Buyer guides (checklists, diligence, finance)
  | 'market-update';    // Market updates (quarterly notes, policy, supply)

export const INSIGHT_CATEGORIES: { id: InsightCategory; label: string }[] = [
  { id: 'area-guide', label: 'Area Guides' },
  { id: 'rental-insight', label: 'Rental Insights' },
  { id: 'buyer-guide', label: 'Buyer Guides' },
  { id: 'market-update', label: 'Market Updates' },
];

export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  category: InsightCategory;
  date: string;       // ISO
  readMinutes: number;
};

// Bodies will live as MDX in /content/insights when authoring begins.
export const INSIGHTS: Insight[] = [];
