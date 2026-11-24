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
  basisEn?: string;
};

const NO_EVIDENCE: PostLlmAssessment = {
  kind: "no-evidence",
  estimate: null,
  low: 0,
  high: 100,
  roles: [],
  scope: "本站新增的自然语言正文；第三方原文、代码与图示除外",
  basis: "目前没有可核查的逐稿制作记录，无法判断保留在正文中的模型文字比例。",
  basisEn:
    "There is no draft history to verify how much model-generated prose remains in the source text.",
};

export const POST_LLM_ASSESSMENTS: Record<string, PostLlmAssessment> = {
  "0255": {
    basisEn:
      "The author confirms that they typed the entire source text by hand and that its LLM content is 0%.",
    kind: "estimated",
    estimate: 0,
    low: 0,
    high: 0,
    roles: [],
    scope: "本站新增的自然语言正文；图示除外",
    basis: "作者确认：正文全部由本人手打，LLM 文字含量为 0%。",
  },
  "0256": {
    basisEn:
      "The author confirms that the LLM content of the source text is 0%.",
    kind: "estimated",
    estimate: 0,
    low: 0,
    high: 0,
    roles: [],
    scope: "本站新增的自然语言正文；图示除外",
    basis: "作者确认：正文的 LLM 文字含量为 0%。",
  },
  "0070": {
    basisEn: "The author reports that the source text contains 20% LLM prose.",
    kind: "estimated",
    estimate: 20,
    low: 20,
    high: 20,
    roles: [],
    scope: "本站新增的自然语言正文；图示除外",
    basis: "作者指定本文 LLM 文字含量为 20%。",
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
};

export function getPostLlmAssessment(id: string): PostLlmAssessment {
  return POST_LLM_ASSESSMENTS[id] ?? NO_EVIDENCE;
}
