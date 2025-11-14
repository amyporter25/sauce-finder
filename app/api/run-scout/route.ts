/**
 * API Route: Run Full Agent Pipeline
 * POST /api/run-scout
 * Orchestrates Scout → Financials → Portfolio Fit agents
 * Returns complete acquisition theses ranked by recommendation
 */

import { NextResponse } from 'next/server';

// Increase timeout for long-running agent operations
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';
import { runScoutAgent } from '@/lib/agents/scout';
import { runFinancialsAnalyzer } from '@/lib/agents/financialsAnalyzer';
import { runPortfolioFitChecker } from '@/lib/agents/portfolioFitChecker';
import { scoreSauce } from '@/lib/agents/sauceScorer';
import type { FullAcquisitionThesis } from '@/lib/types';

/**
 * Sort theses by recommendation priority
 * STRONG_BUY > BUY > WATCH > PASS
 */
function sortByRecommendation(
  theses: FullAcquisitionThesis[]
): FullAcquisitionThesis[] {
  const order: Record<string, number> = {
    STRONG_BUY: 1,
    BUY: 2,
    WATCH: 3,
    PASS: 4,
  };

  return [...theses].sort((a, b) => {
    const aRank = order[a.portfolioFit.recommendation] ?? 99;
    const bRank = order[b.portfolioFit.recommendation] ?? 99;
    return aRank - bRank;
  });
}

export async function POST() {
  try {
    console.log('🚀 Starting agent pipeline...');

    // Step 1: Scout finds targets
    const targets = await runScoutAgent();
    console.log(`✅ Scout found ${targets.length} targets`);

    // Step 2-3: Analyze each target (Financials & Portfolio Fit in parallel)
    const enrichedTargets = await Promise.all<FullAcquisitionThesis | null>(
      targets.map(async (target) => {
        try {
          const [financials, portfolioFit, sauce] = await Promise.all([
            runFinancialsAnalyzer(target),
            runPortfolioFitChecker(target),
            scoreSauce(target),
          ]);

          return {
            target,
            financials,
            portfolioFit,
            sauce,
            // Founder will be added in Phase 6
            founder: {
              targetId: target.id,
              founderName: target.founderName,
              founderBackground: 'To be analyzed',
              publicProfile: target.founderHandle || 'N/A',
              acquisitionOpenness: 5,
              motivation: 'To be analyzed',
              bestApproachAngle: 'To be analyzed',
              redFlags: [],
            },
          } satisfies FullAcquisitionThesis;
        } catch (error) {
          console.error(`Error analyzing target ${target.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed analyses
    const successfulAnalyses = enrichedTargets.filter(
      (item): item is FullAcquisitionThesis => item !== null
    );

    // Sort by recommendation
    const sorted = sortByRecommendation(successfulAnalyses);

    console.log(`✅ Pipeline complete: ${successfulAnalyses.length}/${targets.length} targets analyzed`);

    return NextResponse.json({
      success: true,
      targetsFound: targets.length,
      analysisComplete: successfulAnalyses.length,
      acquisitionTheses: sorted,
      timestamp: new Date().toISOString(),
      dataSource: 'Real-time (Perplexity + Firecrawl)',
    });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run agent pipeline',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}
