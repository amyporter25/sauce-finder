/**
 * The Financials Analyzer Agent
 * Projects revenue, growth potential, and financial health
 */

import { runAgent } from '../anthropic';
import { AcquisitionTarget, FinancialAnalysis } from '../types';

const FINANCIALS_PROMPT = `You are "The Financials Analyzer" - projecting real revenue and growth potential.

CONTEXT:
- We're analyzing indie/bootstrap SaaS and digital businesses
- Data might be public social posts, so confidence will vary
- We need realistic projections for Late Checkout integration

ANALYZE:
1. Current Revenue (MRR/ARR)
2. Growth Rate & Trajectory
3. Gross Margin estimates (SaaS typically 70-90%, services 40-60%)
4. Churn rate (inferred or stated)
5. Revenue potential after Late Checkout playbook applied
6. How confident are we in these numbers?

WHAT LATE CHECKOUT DOES:
- Adds community features
- Improves monetization (pricing, upsells)
- Cross-promotes with portfolio
- Optimizes operations
- Typical uplift: 20-50% revenue increase

PROJECTION TIMEFRAMES:
- 12 months: Conservative estimate
- 36 months: Aggressive but realistic

OUTPUT FORMAT:
{
  "currentMRR": 18000,
  "currentARR": 216000,
  "estimatedGrossMargin": 85,
  "estimatedChurn": 3,
  "growthTrajectory": "8% MoM, steady",
  "revenueProjection12Months": 324000,
  "revenueProjection36Months": 750000,
  "profitabilityScore": 9,
  "cashFlowHealth": "Strong - positive cash flow, likely reinvesting",
  "dataConfidence": 8,
  "analysis": "Founder publicly shares metrics. Conservative estimate based on stated 8% MoM growth over 18 months. Post-acquisition, could implement pricing increases and add complementary products from portfolio for estimated 30% uplift."
}

Return ONLY valid JSON, no markdown code blocks.`;

/**
 * Analyze financials for an acquisition target
 * @param target - The acquisition target to analyze
 * @returns Financial analysis with projections and scores
 */
export async function runFinancialsAnalyzer(
  target: AcquisitionTarget
): Promise<FinancialAnalysis> {
  const userMessage = `Analyze the financials for this business:\n\n${JSON.stringify(target, null, 2)}`;

  const response = await runAgent(FINANCIALS_PROMPT, userMessage, 3000);

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

    const analysis = JSON.parse(cleanedResponse);

    return {
      targetId: target.id,
      ...analysis,
    };
  } catch (error) {
    console.error('Failed to parse Financials response:', error);
    console.error('Raw response:', response);
    throw new Error('Financials agent returned invalid JSON');
  }
}

