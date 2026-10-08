import { getCollection, type CollectionEntry } from "astro:content";
import { getPaparazziCategory } from "@/data/paparazziCategories";
export const dossierSlug = (page: CollectionEntry<"pages">) =>
  page.id.split("/").at(-1)!;
export async function getPaparazziDossiers() {
  const pages = await getCollection("pages", ({ id }) =>
    id.startsWith("paparazzi/")
  );
  const slugs = new Set<string>();
  for (const page of pages) {
    const category = getPaparazziCategory(page.data.paparazziCategory);
    if (
      !category ||
      !(category.types as readonly string[]).includes(page.data.subjectType)
    ) {
      throw new Error(`Invalid Paparazzi category / subject type: ${page.id}`);
    }
    if (page.data.subjectType === "person" && !page.data.paparazziTier) {
      throw new Error(`Person dossier must declare paparazziTier: ${page.id}`);
    }
    const slug = dossierSlug(page);
    if (slugs.has(slug)) throw new Error(`Duplicate Paparazzi slug: ${slug}`);
    slugs.add(slug);
  }
  return pages.sort((a, b) =>
    (a.data.subjectName ?? a.data.title).localeCompare(
      b.data.subjectName ?? b.data.title
    )
  );
}
