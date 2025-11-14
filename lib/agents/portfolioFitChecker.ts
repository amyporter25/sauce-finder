/**
 * The Portfolio Fit Checker Agent
 * Evaluates strategic alignment with Late Checkout portfolio
 */

import { runAgent } from '../anthropic';
import { AcquisitionTarget, PortfolioFitAnalysis } from '../types';

const PORTFOLIO_FIT_PROMPT = `You are "The Portfolio Fit Checker" for Late Checkout.

LATE CHECKOUT PORTFOLIO:
- Idea Browser (startup idea validation, $150k+/mo)
- LCA (design agency for AI companies, $700k+/mo)
- Boring Marketing (marketing agency, $200k+/mo)
- Boring Ads (advertising productized service)
- Ready4Remodel (renovation/real estate community)
- Other AI-native businesses

WHAT MAKES GOOD FIT:
✅ Community-based business model
✅ Can cross-promote with existing portfolio
✅ Uses AI or could use AI
✅ Creator economy or B2D focus
✅ Founder open to collaboration
✅ Can bundle with other portfolio products
✅ Shared audience with portfolio

ANALYZE:
1. How well does this fit the portfolio?
2. What specific synergies exist?
3. Could we cross-promote effectively?
4. Integration complexity (technical debt, culture clash)
5. Could it merge with existing portfolio company?
6. Estimated revenue upside post-acquisition
7. Make recommendation: STRONG_BUY, BUY, WATCH, or PASS

OUTPUT FORMAT:
{
  "cultureFitScore": 8,
  "synergiesWithPortfolio": [
    "Can integrate with Idea Browser for market validation",
    "LCA could design premium tier UI",
    "Cross-promote through existing communities"
  ],
  "potentialCrossPromo": [
    "Bundle SaaS with LCA design service",
    "Cross-promote to each portfolio community"
  ],
  "integrationComplexity": "Easy",
  "canMergeWithExisting": null,
  "estimatedRevenueUpsideAfterAcquisition": 50000,
  "recommendation": "STRONG_BUY",
  "reasoning": "Strong founder, profitable, natural fit with portfolio, clear cross-promotion opportunities. Should be easy to integrate."
}

Return ONLY valid JSON, no markdown code blocks.`;

/**
 * Analyze portfolio fit for an acquisition target
 * @param target - The acquisition target to analyze
 * @returns Portfolio fit analysis with recommendation
 */
export async function runPortfolioFitChecker(
  target: AcquisitionTarget
): Promise<PortfolioFitAnalysis> {
  const userMessage = `Analyze portfolio fit for this acquisition:\n\n${JSON.stringify(target, null, 2)}`;

  const response = await runAgent(PORTFOLIO_FIT_PROMPT, userMessage, 3000);

  try {
    // Clean up response - remove markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const analysis = JSON.parse(cleanedResponse);

    return {
      targetId: target.id,
      ...analysis,
    };
  } catch (error) {
    console.error('Failed to parse Portfolio Fit response:', error);
    console.error('Raw response:', response);
    throw new Error('Portfolio Fit agent returned invalid JSON');
  }
}

