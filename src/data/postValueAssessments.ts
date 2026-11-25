/** Fixed editorial positions for the published post corpus. Review the article before changing a score. */
export const POST_VALUE_REVIEWED_AT = "2026-09-27";

export type PostValueAssessment = {
  score: number;
  reason: string;
  reasonEn?: string;
};

export const POST_VALUE_ASSESSMENTS: Record<string, PostValueAssessment> = {
  "0071": {
    reasonEn:
      "Collects classic statements on first principles alongside their sources for easy reference. Offers little original analysis or technical application.",
    score: 60,
    reason:
      "把第一性原理的经典说法和来源集中对照，便于查阅；原创分析与技术应用较少。",
  },
  "0255": {
    reasonEn:
      "Documents work assignments, communication, cost, and human intervention on a game mod built with multiple agents. The findings come from one project.",
    score: 70,
    reason:
      "记录多 agent 开发游戏模组的分工、通信、成本与人工介入，提供具体实践经验；结论主要来自单个项目。",
  },
  "0256": {
    reasonEn:
      "Documents how the author chose source material, evaluated voices, and produced an English literature podcast. Includes a sample from the project.",
    score: 60,
    reason:
      "记录英文原著播客的素材选择、音色调研与制作过程，并附有试听案例；经验主要来自单个项目。",
  },
  "0257": {
    reasonEn:
      "Reflects on account access, isolated environments, and the cost of splitting attention based on personal experience with a podcast and a game mod.",
    score: 66,
    reason:
      "结合播客和游戏模组项目，记录账号授权、环境隔离和注意力开销等具体问题。判断来自作者的个人实践。",
  },
  "0070": {
    reasonEn:
      "Introduces coding agents through tool comparisons and examples of what went wrong. Useful for team discussion. Product details change quickly.",
    score: 73,
    reason:
      "以实际工具对比与失败经历讲解 Coding Agent 入门，适合团队交流；产品细节更新很快。",
  },
  "0119": {
    score: 72,
    reason:
      "Paxos 魔法比喻有助于形成直觉，附加评价指出多处技术边界；原文不宜单作实现依据。",
  },
  "0128": {
    score: 74,
    reason:
      "完整双语演讲逐字稿把 Agent 的远程调用、幂等与权限连到分布式系统，偏经验性介绍。",
  },
  "0186": {
    score: 80,
    reason:
      "完整双语转载 DDIA 阅读回顾和评论，保留多视角材料；本站原创判断相对有限。",
  },
  "0198": {
    score: 86,
    reason:
      "Jepsen 的模型关系图和基础定义具有长期参考价值，本站完整中英对照并保留地图。",
  },
};
