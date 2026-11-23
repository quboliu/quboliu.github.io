/** Fixed editorial positions for the published post corpus. Review the article before changing a score. */
export const POST_VALUE_REVIEWED_AT = "2026-09-27";

export type PostValueAssessment = {
  score: number;
  reason: string;
};

export const POST_VALUE_ASSESSMENTS: Record<string, PostValueAssessment> = {
  "0071": {
    score: 60,
    reason:
      "把第一性原理的经典说法和来源集中对照，便于查阅；原创分析与技术应用较少。",
  },
  "0255": {
    score: 70,
    reason: "记录多 agent 开发游戏模组的分工、通信、成本与人工介入，提供具体实践经验；结论主要来自单个项目。",
  },
};
