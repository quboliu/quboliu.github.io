/**
 * Paparazzi ranks describe the public evidence for a subject's body of work.
 * They are editorial classifications, not a measure of personal worth.
 */
export const PAPARAZZI_TIERS = [
  {
    slug: "top",
    name: "第一档 · 顶尖",
    description: "开创或系统化了跨领域沿用的方法，并留下长期可核验的代表作品。",
  },
  {
    slug: "eminent",
    name: "第二档 · 领域标杆",
    description:
      "在明确领域建立了广泛使用的方法、工具或知识体系，影响持续多年。",
  },
  {
    slug: "star",
    name: "第三档 · 明星创作者",
    description:
      "拥有多项独立可验证的代表作品，形成稳定的专业读者或使用者群体。",
  },
  {
    slug: "notable",
    name: "第四档 · 值得关注",
    description: "有持续、成体系的公开作品，影响主要集中在特定社区或主题。",
  },
  {
    slug: "indie",
    name: "第五档 · 独立探索",
    description: "公开作品仍在积累，或现有资料不足以核实更高档位。",
  },
] as const;

export type PaparazziTier = (typeof PAPARAZZI_TIERS)[number]["slug"];

export const PAPARAZZI_TIER_SLUGS = PAPARAZZI_TIERS.map(({ slug }) => slug) as [
  PaparazziTier,
  ...PaparazziTier[],
];
