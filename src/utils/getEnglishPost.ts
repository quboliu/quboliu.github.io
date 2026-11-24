import { getEntry } from "astro:content";

export async function getEnglishPost(id: string) {
  const edition = await getEntry("englishPosts", id);
  if (!edition) throw new Error(`Missing English article ${id}`);
  return edition;
}

export async function getEditionPostTitle(
  id: string,
  originalTitle: string,
  english: boolean
) {
  return english ? (await getEnglishPost(id)).data.title : originalTitle;
}
