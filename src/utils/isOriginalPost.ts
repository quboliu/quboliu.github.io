import type { CollectionEntry } from "astro:content";
import { getRepostKind } from "@/utils/getRepostKind";

type PostWithData = Pick<CollectionEntry<"posts">, "data">;

export function isOriginalPost(post: PostWithData) {
  return getRepostKind(post) === null;
}
