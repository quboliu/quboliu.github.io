/** Fixed editorial positions for the published post corpus. Review the article before changing a score. */
export const POST_VALUE_REVIEWED_AT = "";

export type PostValueAssessment = {
  score: number;
  reason: string;
};

export const POST_VALUE_ASSESSMENTS: Record<string, PostValueAssessment> = {};
