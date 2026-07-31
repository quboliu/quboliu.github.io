import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://quboliu.github.io/",
    title: "quboliu",
    description: "Notes on software, tools, and ideas.",
    author: "quboliu",
    profile: "https://github.com/quboliu",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "America/New_York",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/quboliu/quboliu.github.io/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    {
      name: "github",
      url: "https://github.com/quboliu",
      linkTitle: "quboliu on GitHub",
    },
    {
      name: "link",
      url: "https://jvzi.notion.site/",
      linkTitle: "Orange Garden on Notion",
    },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    {
      name: "mail",
      url: "mailto:?subject=See%20this%20post&body=",
    },
  ],
});
