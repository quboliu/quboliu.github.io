import type { CollectionEntry } from "astro:content";

type PostWithData = Pick<CollectionEntry<"posts">, "data">;

// Some migrated reposts predate `contentType` and therefore retained its
// historical `original` default. Keep the axis corpus true to its editorial
// scope until those posts' frontmatter is normalized.
const NON_ORIGINAL_TITLE =
  /^(?:转载(?:[｜|]|$)|译文(?:[｜|]|$)|论文阅读(?:\s|[｜|：:]|$)|官方文档(?:\s|[｜|：:]|$)|技术演讲(?:\s|[｜|：:]|$)|官方博客(?:\s|[｜|：:]|$)|论文翻译(?:\s|[｜|：:]|$))/;

export function isOriginalPost({ data }: PostWithData) {
  return (
    data.contentType === "original" && !NON_ORIGINAL_TITLE.test(data.title)
  );
}
