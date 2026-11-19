import { z } from 'zod';

export const reportNarrativeSchema = z.object({
  summary: z.string().describe('Three to five sentence overview of the performance, addressed to the candidate'),
  strengths: z.array(z.string()).describe('Two to four specific technical strengths'),
  weakTopics: z.array(z.string()).describe('Topics that need the most work, most important first'),
  recommendations: z.array(z.string()).describe('Three to six concrete preparation steps'),
});

export const REPORT_SYSTEM = `You write the final report for a mock interview on an interview preparation platform.

Rules:
- Base every statement on the scores and evaluation notes provided. Do not invent results.
- Be encouraging but honest. Name specific topics.
- Recommendations must be actionable (what to study or practise next), not generic advice.
- This is practice feedback, not a hiring decision; never say the candidate would pass or fail a real interview.`;

export function buildReportInput({ companyName, roleName, overallScore, categoryScores, topicScores, answerNotes }) {
  return JSON.stringify({ companyName, roleName, overallScore, categoryScores, topicScores, answerNotes }, null, 2);
}
