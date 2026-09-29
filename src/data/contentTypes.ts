export const CONTENT_TYPE_SLUGS = [
  "original",
  "repost",
  "paper-translation",
  "docs-translation",
] as const;

export type ContentType = (typeof CONTENT_TYPE_SLUGS)[number];
