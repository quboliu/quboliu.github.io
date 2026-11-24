const englishTags: Record<string, string> = {
  分享: "Talk",
  思维模型: "Mental Models",
  播客: "Podcast",
  游戏开发: "Game Development",
  第一性原理: "First Principles",
  英语: "English",
};

export function getTagLabel(name: string, english: boolean) {
  return english ? (englishTags[name] ?? name) : name;
}
