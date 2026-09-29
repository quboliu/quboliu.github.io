import type { CollectionEntry } from "astro:content";
import { getTagGroups } from "./getTagGroups";

type Tag = {
  tag: string;
  tagName: string;
};

/**
 * Builds a de-duplicated, sorted tag list from posts.
 *
 * - Drafts and scheduled posts are excluded via `postFilter()`
 * - `tag` is the slug used in URLs; `tagName` is the original label for display
 * - Uniqueness is based on the slug (so differently-cased labels collapse)
 */
export function getUniqueTags(posts: CollectionEntry<"posts">[]) {
  return getTagGroups(posts).map(({ tag, tagName }): Tag => ({
    tag,
    tagName,
  }));
}
