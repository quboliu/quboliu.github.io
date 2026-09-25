/**
 * This register describes retained site-added natural-language prose. The
 * original text of reposts, quotations, code, images, and attribution notes
 * are outside the denominator. Absence from this register means no basis for
 * a point estimate, never an implied 0% or 50%.
 */
export type PostLlmAssessment = {
  kind: "estimated" | "no-evidence" | "no-added-prose";
  estimate: number | null;
  low: number;
  high: number;
  roles: string[];
  scope: string;
  basis: string;
};

const NO_EVIDENCE: PostLlmAssessment = {
  kind: "no-evidence",
  estimate: null,
  low: 0,
  high: 100,
  roles: [],
  scope: "本站新增的自然语言正文；第三方原文、代码与图示除外",
  basis: "目前没有可核查的逐稿制作记录，无法判断保留在正文中的模型文字比例。",
};

const NO_ADDED_PROSE: PostLlmAssessment = {
  kind: "no-added-prose",
  estimate: 0,
  low: 0,
  high: 0,
  roles: [],
  scope: "无本站新增正文；转载说明不计入分母",
  basis:
    "正文为第三方原文，未发现本站新增的实质正文。分母为零，按本站展示约定放在 0% 点位；这不表示原作者未使用 LLM。",
};

export const POST_LLM_ASSESSMENTS: Record<string, PostLlmAssessment> = {
  "0017": NO_ADDED_PROSE,
  "0018": NO_ADDED_PROSE,
  "0023": {
    kind: "estimated",
    estimate: 85,
    low: 75,
    high: 95,
    roles: ["起草"],
    scope: "本站正文中的 TTY/PTY 场景说明；外链和参考文献除外",
    basis:
      "正文在第一场景的长篇解释后明确标注“以上内容来自 ChatGPT”；估计按保留的自然语言篇幅计算。",
  },
  "0040": {
    kind: "estimated",
    estimate: 20,
    low: 10,
    high: 35,
    roles: ["问答", "起草"],
    scope: "本站关于上下文切换的自然语言正文",
    basis:
      "正文明确以“下面是 GPT 说的”标识一段模型回答，其余提问和批评未标为模型生成。",
  },
  "0061": NO_ADDED_PROSE,
  "0064": {
    ...NO_EVIDENCE,
    roles: ["代码辅助"],
    basis:
      "文章说明推送脚本由 ChatGPT 和 Claude 联合调整；代码不计入文字分母，正文写作比例仍无依据。",
  },
  "0065": NO_ADDED_PROSE,
  "0066": {
    kind: "estimated",
    estimate: 22,
    low: 10,
    high: 40,
    roles: ["问答", "代码辅助", "起草"],
    scope: "本站安装说明和附录中的自然语言正文；脚本代码除外",
    basis:
      "附录有两段明确署名 Claude 的解释，脚本段落标明 DeepSeek 与 ChatGPT 输出；代码未计入比例。",
  },
  "0119": {
    kind: "estimated",
    estimate: 80,
    low: 65,
    high: 95,
    roles: ["评价", "起草"],
    scope: "转载说明与评价摘要中的本站新增自然语言；canonical 原文除外",
    basis:
      "页面明确标注评价摘要来自 GPT-5.6-sol；估计只看本站新增的摘要与说明，原作不计。",
  },
  "0156": {
    ...NO_EVIDENCE,
    roles: ["插图"],
    basis:
      "文末注明七幅中文插图使用 Image Gen 制作；图示不计入文字比例，正文制作记录不足。",
  },
  "0196": NO_ADDED_PROSE,
  "0198": {
    kind: "estimated",
    estimate: 90,
    low: 75,
    high: 100,
    roles: ["翻译", "排版", "核查"],
    scope: "本站中文译文和地图文字说明；Jepsen 英文原文除外",
    basis:
      "依据本站本次双语转载的制作会话，LLM 参与中文翻译和整理；未保留逐句编辑轨迹，范围较宽。",
  },
  "0202": {
    kind: "estimated",
    estimate: 98,
    low: 95,
    high: 100,
    roles: ["起草", "翻译", "技术校注", "插图"],
    scope: "本站自然语言正文；引用、代码、提交记录与图示文字除外",
    basis:
      "英文研究稿由 Claude 起草，中文直译、补充校注与排版由 Codex 完成，Image Gen 生成插图。",
  },
};

export function getPostLlmAssessment(id: string): PostLlmAssessment {
  return POST_LLM_ASSESSMENTS[id] ?? NO_EVIDENCE;
}
