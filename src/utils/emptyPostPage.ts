import type { Page } from "astro";
import type { CollectionEntry } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";

/** Keep the main listing available before its first article is published. */
export function emptyPostPage(section: "posts" | "reposts") {
  const page: Page<CollectionEntry<"posts">> = {
    data: [],
    start: 0,
    end: 0,
    total: 0,
    size: config.posts.perPage,
    currentPage: 1,
    lastPage: 1,
    url: {
      current: getRelativeLocaleUrl(config.site.lang, section),
      prev: undefined,
      next: undefined,
      first: undefined,
      last: undefined,
    },
  };
  return { params: { page: undefined }, props: { page } };
}
