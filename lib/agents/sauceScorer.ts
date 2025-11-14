/**
 * The Sauce Scorer Agent
 * Evaluates what makes businesses special and defensible
 */

import { runAgent } from '../anthropic';
import { AcquisitionTarget, SauceScore } from '../types';

const SAUCE_SCORER_PROMPT = `You are "The Sauce Scorer" - evaluating what makes businesses special and defensible.

Greg Isenberg's definition of "the sauce":
- The unique differentiator that can't be easily copied
- Unfair advantages (special access, unique insight, authentic community)
- What makes people choose this business over alternatives
- Authenticity + consistent value delivery

SCORING CRITERIA (each 1-10):

1. COMMUNITY STRENGTH (30% weight)
   - Engagement rate (not just follower count)
   - Organic growth vs. paid
   - Retention/churn
   - "Fanatic" users who evangelize
   - User-generated content
   
2. UNIQUE POSITIONING (25% weight)
   - Category of one? Or crowded space?
   - Unique format/approach?
   - How hard to replicate?
   - Brand distinctiveness
   
3. FOUNDER AUTHENTICITY (25% weight)
   - Do they build in public?
   - Share revenue/metrics transparently?
   - Give away "the sauce" freely?
   - Community trusts them?
   - Personal brand strength
   
4. DISTRIBUTION MOAT (20% weight)
   - Owned audience size
   - Organic vs. paid reach
   - Network effects
   - Platform independence
   - Content/SEO moat

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
{
  "communityStrength": 8,
  "uniquePositioning": 7,
  "founderAuthenticity": 9,
  "distributionMoat": 6,
  "total": 7.5,
  "reasoning": "Strong community engagement with 45% engagement rate. Founder shares revenue openly and builds in public. Unique positioning in renovation lending niche. Distribution primarily organic through content. Overall: solid sauce."
}

CRITICAL: 
- Calculate total as weighted average: (communityStrength * 0.3) + (uniquePositioning * 0.25) + (founderAuthenticity * 0.25) + (distributionMoat * 0.2)
- Round total to 1 decimal place
- Return ONLY valid JSON. Do NOT include any markdown code blocks, explanations, or text before/after the JSON.`;

/**
 * Score "the sauce" for an acquisition target
 * @param target - The acquisition target to score
 * @returns SauceScore with all components and total
 */
export async function scoreSauce(target: AcquisitionTarget): Promise<SauceScore> {
  const userMessage = `Score "the sauce" for this business:\n\n${JSON.stringify(target, null, 2)}`;

  const response = await runAgent(SAUCE_SCORER_PROMPT, userMessage, 2000);

  try {
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to extract JSON object if there's extra text
    const firstBrace = cleanedResponse.indexOf('{');
    const lastBrace = cleanedResponse.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleanedResponse) as SauceScore;

    // Validate and ensure total is calculated correctly
    const calculatedTotal = 
      parsed.communityStrength * 0.3 +
      parsed.uniquePositioning * 0.25 +
      parsed.founderAuthenticity * 0.25 +
      parsed.distributionMoat * 0.2;

    return {
      ...parsed,
      total: Math.round(calculatedTotal * 10) / 10, // Round to 1 decimal
    };
  } catch (error) {
    console.error('Failed to parse Sauce Score:', error);
    console.error('Raw response:', response);
    throw new Error('Sauce Scorer returned invalid JSON');
  }
}

