import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";
import { AREA_SLUGS } from "@/data/areas";
import { CONTENT_TYPE_SLUGS } from "@/data/contentTypes";
import {
  PAPARAZZI_CATEGORY_SLUGS,
  PAPARAZZI_SUBJECT_TYPES,
} from "@/data/paparazziCategories";
import { PAPARAZZI_TIER_SLUGS } from "@/data/paparazziTiers";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      lang: z.string().optional(),
      bilingual: z.boolean().default(false),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      contentType: z.enum(CONTENT_TYPE_SLUGS).default("original"),
      area: z.enum(AREA_SLUGS),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    subjectName: z.string().optional(),
    paparazziCategory: z.enum(PAPARAZZI_CATEGORY_SLUGS).default("people"),
    subjectType: z.enum(PAPARAZZI_SUBJECT_TYPES).default("person"),
    verifiedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    website: z.url().optional(),
    relatedProducts: z.array(z.string()).default([]),
    paparazziTier: z.enum(PAPARAZZI_TIER_SLUGS).optional(),
    avatarCandidates: z
      .array(
        z.object({
          url: z.url(),
          source: z.string(),
          profileUrl: z.url().optional(),
        })
      )
      .default([]),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, pages };
