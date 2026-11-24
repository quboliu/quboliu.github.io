import type { CollectionEntry } from "astro:content";

export type RepostKind = "essays" | "papers" | "documentation";

type PostWithData = Pick<CollectionEntry<"posts">, "data">;

const PAPER_TITLE = /^(?:论文阅读|论文翻译)(?:\s|[｜|：:]|$)/;
const DOCUMENTATION_TITLE = /^官方文档(?:\s|[｜|：:]|$)/;
const REPOST_TITLE =
  /^(?:转载(?:[｜|]|$)|译文(?:[｜|]|$)|官方博客(?:\s|[｜|：:]|$)|技术演讲(?:\s|[｜|：:]|$))/;

export function getRepostKind({ data }: PostWithData): RepostKind | null {
  if (
    data.contentType === "paper-translation" ||
    PAPER_TITLE.test(data.title)
  ) {
    return "papers";
  }

  if (
    data.contentType === "docs-translation" ||
    DOCUMENTATION_TITLE.test(data.title)
  ) {
    return "documentation";
  }

  if (data.contentType === "repost" || REPOST_TITLE.test(data.title)) {
    return "essays";
  }

  return null;
}

export function isRepostPost(post: PostWithData) {
  return getRepostKind(post) !== null;
}

const REPOST_EYEBROW_LABELS: Record<RepostKind, string> = {
  essays: "Repost",
  papers: "Paper",
  documentation: "Documentation",
};

export function getPostEyebrow(post: PostWithData): string | null {
  const kind = getRepostKind(post);
  const parts: string[] = [];
  if (kind) parts.push(REPOST_EYEBROW_LABELS[kind]);
  if (post.data.bilingual) parts.push("Bilingual");
  return parts.length ? parts.join(" · ") : null;
}
