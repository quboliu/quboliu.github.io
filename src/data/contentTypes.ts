export const CONTENT_TYPES = {
  original: {
    label: "原创",
    description: "原创文章",
  },
  repost: {
    label: "转载",
    description: "转载文章",
  },
  "paper-translation": {
    label: "论文译",
    description: "论文翻译",
  },
  "docs-translation": {
    label: "文档译",
    description: "文档翻译",
  },
} as const;

export type ContentType = keyof typeof CONTENT_TYPES;

export const CONTENT_TYPE_SLUGS = Object.keys(CONTENT_TYPES) as [
  ContentType,
  ...ContentType[],
];

export function getContentTypeMeta(contentType: ContentType) {
  return CONTENT_TYPES[contentType];
}
