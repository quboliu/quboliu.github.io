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

export const POST_LLM_ASSESSMENTS: Record<string, PostLlmAssessment> = {};

export function getPostLlmAssessment(id: string): PostLlmAssessment {
  return POST_LLM_ASSESSMENTS[id] ?? NO_EVIDENCE;
}
