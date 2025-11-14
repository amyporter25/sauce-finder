/**
 * The Deal Scout Agent
 * Finds acquisition targets from real-time business data
 */

import { runAgent } from '../anthropic';
import { AcquisitionTarget } from '../types';
import { gatherRealBusinessData } from './dataGatherer';

const SCOUT_SYSTEM_PROMPT = `You are "The Deal Scout" - finding acquisition targets for Late Checkout.

WHAT WE'RE LOOKING FOR:
✅ Indie businesses doing $50k-$5M annual revenue
✅ Solo founders or small teams (1-5 people)
✅ Profitable or breakeven (not burning cash)
✅ Community-based or content-based businesses
✅ Founder willing to sell/partner
✅ Already generating real revenue (not vaporware)
✅ Growing or at least stable

RED FLAGS:
❌ Founder not interested in selling
❌ Burning money, not profitable
❌ Massive overhead costs
❌ One-trick pony, no moat
❌ Declining revenue
❌ Toxic community/brand
❌ VC-backed (we want bootstrap/indie)
❌ Over $5M ARR (too big for our ticket size)

DISCOVERY SOURCES TO MENTION:
- Indie Hackers profiles with revenue claims
- Twitter/X "Year in Review" posts showing revenue
- Product Hunt recent launches with real numbers
- Substack newsletters with sponsorship data
- Discord communities with monetization
- Gumroad creators with sales data

OUTPUT FORMAT:
Return JSON array with this exact structure. You MUST return AT LEAST 5-10 targets (aim for 8-10 if possible):
[
  {
    "companyName": "Company Name",
    "founderName": "Founder Name",
    "founderHandle": "@handle",
    "platform": "Indie Hackers",
    "revenueEstimate": 450000,
    "mrrEstimate": 37500,
    "growthRate": "12% MoM",
    "businessModel": "SaaS Subscription",
    "url": "https://...",
    "description": "What they do in 1-2 sentences",
    "whyInteresting": "Why this is a good acquisition target for Greg",
    "discoverySource": "Twitter Year in Review post"
  }
]

CRITICAL: 
- You MUST return AT LEAST 5-10 acquisition targets (aim for 8-10 if the data supports it)
- Return ONLY a valid JSON array. Do NOT include any markdown code blocks, explanations, or text before/after the JSON. 
- Start your response with [ and end with ]. 
- Return ONLY the JSON array, nothing else.
- Do NOT use markdown formatting. Do NOT wrap in code blocks.
- Example of correct format: [{"companyName":"Example Co","founderName":"John Doe",...}]`;

/**
 * Run the Scout agent to find acquisition targets
 * @returns Array of acquisition targets
 */
export async function runScoutAgent(): Promise<AcquisitionTarget[]> {
  // Get real-time data (or mock data if APIs unavailable)
  const businessData = await gatherRealBusinessData();

  const userMessage = `Find acquisition targets in this real-time data:\n\n${businessData}`;

  const response = await runAgent(SCOUT_SYSTEM_PROMPT, userMessage, 8000);

  try {
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to extract JSON array if there's extra text
    // Look for the first [ and last ] to extract just the JSON array
    const firstBracket = cleanedResponse.indexOf('[');
    const lastBracket = cleanedResponse.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleanedResponse = cleanedResponse.substring(firstBracket, lastBracket + 1);
    }

    const parsed = JSON.parse(cleanedResponse) as Array<Partial<AcquisitionTarget>>;

    // Add IDs and timestamps, ensure all required fields
    return parsed.map((target, index) => ({
      ...target,
      id: target.id ?? `target-${Date.now()}-${index}`,
      discoveredDate: target.discoveredDate ?? new Date().toISOString(),
      dataSource: 'Real-time (Perplexity + Firecrawl)',
    })) as AcquisitionTarget[];
  } catch (error) {
    console.error('Failed to parse Scout response:', error);
    console.error('Raw response (first 500 chars):', response.substring(0, 500));
    console.error('Cleaned response (first 500 chars):', response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().substring(0, 500));
    
    // Return empty array instead of throwing to prevent complete failure
    console.warn('⚠️ Scout agent returned invalid JSON, returning empty array');
    return [];
  }
}

