/** Add a category here to generate its navigation and listing page. */
export const PAPARAZZI_CATEGORIES = [
  {
    slug: "people",
    name: "人物",
    description: "从公开作品出发，追踪创作者的研究、实践与长期影响。",
    types: ["person"],
  },
  {
    slug: "companies-products",
    name: "公司与产品",
    description: "梳理公司的公开资源、产品生态与演变，保留可追溯的资料入口。",
    types: ["company", "product"],
  },
] as const;
export const PAPARAZZI_CATEGORY_SLUGS = PAPARAZZI_CATEGORIES.map(
  category => category.slug
) as [string, ...string[]];
export const PAPARAZZI_SUBJECT_TYPES = [
  "person",
  "company",
  "product",
] as const;
export const SUBJECT_TYPE_NAMES = {
  person: "人物",
  company: "公司",
  product: "产品",
};
export const getPaparazziCategory = (slug: string) =>
  PAPARAZZI_CATEGORIES.find(category => category.slug === slug);
