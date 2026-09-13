import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";
import { slugifyStr } from "./slugify";

export type TagGroup = {
  tag: string;
  tagName: string;
  posts: CollectionEntry<"posts">[];
};

const byPubDatetimeDesc = (
  a: CollectionEntry<"posts">,
  b: CollectionEntry<"posts">
) =>
  Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
  Math.floor(new Date(a.data.pubDatetime).getTime() / 1000);

/**
 * Builds the canonical tag index in one pass.
 *
 * A post is counted at most once per slug, even if it contains two labels that
 * normalize to the same slug. The first display label remains canonical until
 * the tag vocabulary is explicitly renamed.
 */
export function getTagGroups(posts: CollectionEntry<"posts">[]) {
  const groups = new Map<string, TagGroup>();

  for (const post of posts.filter(postFilter)) {
    const seen = new Set<string>();

    for (const rawTag of post.data.tags) {
      const tag = slugifyStr(rawTag);
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);

      const group = groups.get(tag);
      if (group) {
        group.posts.push(post);
      } else {
        groups.set(tag, { tag, tagName: rawTag, posts: [post] });
      }
    }
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      posts: group.posts.sort(byPubDatetimeDesc),
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
