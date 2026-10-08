/** Keep navigation labels and paths in one place; add future sections here. */
export const PAPARAZZI_SECTIONS = [
  { slug: "people", name: "人物", path: "paparazzi" },
  {
    slug: "companies-products",
    name: "公司与产品",
    path: "paparazzi/companies-products",
  },
] as const;
export type PaparazziSection = (typeof PAPARAZZI_SECTIONS)[number]["slug"];
export const PAPARAZZI_SECTION_SLUGS = PAPARAZZI_SECTIONS.map(
  section => section.slug
) as [PaparazziSection, ...PaparazziSection[]];
