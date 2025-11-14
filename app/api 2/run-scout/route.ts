import { NextResponse } from 'next/server';
import { runScoutAgent } from '@/lib/agents/scout';
import { runFinancialsAnalyzer } from '@/lib/agents/financialsAnalyzer';
import { runPortfolioFitChecker } from '@/lib/agents/portfolioFitChecker';
import { runFounderResearcher } from '@/lib/agents/founderResearcher';
import type {
  AcquisitionTarget,
  FinancialAnalysis,
  PortfolioFitAnalysis,
  FounderProfile,
} from '@/lib/types';

type AnalysisResult = {
  target: AcquisitionTarget;
  financials: FinancialAnalysis;
  portfolioFit: PortfolioFitAnalysis;
  founder: FounderProfile;
};

const sortByRecommendation = (collection: AnalysisResult[]): AnalysisResult[] => {
  const order: Record<string, number> = {
    STRONG_BUY: 1,
    BUY: 2,
    WATCH: 3,
    PASS: 4,
  };

  return [...collection].sort((a, b) => {
    const aRank = order[a.portfolioFit.recommendation] ?? 99;
    const bRank = order[b.portfolioFit.recommendation] ?? 99;
    return aRank - bRank;
  });
};

export async function GET() {
  try {
    console.log('🚀 Starting agent pipeline with REAL DATA...');

    // Step 1: Scout finds targets (using real data from Perplexity + Firecrawl)
    const targets = await runScoutAgent();
    console.log(`✅ Scout found ${targets.length} real targets`);

    const enrichedTargets = await Promise.all<AnalysisResult | null>(
      targets.map(async (target) => {
        try {
          const [financials, portfolioFit, founder] = await Promise.all([
            runFinancialsAnalyzer(target),
            runPortfolioFitChecker(target),
            runFounderResearcher(target),
          ]);

          return {
            target,
            financials,
            portfolioFit,
            founder,
          } satisfies AnalysisResult;
        } catch (error) {
          console.error(`Error analyzing target ${target.id}:`, error);
          return null;
        }
      })
    );

    const successfulAnalyses = enrichedTargets.filter((item): item is AnalysisResult => item !== null);
    const sorted = sortByRecommendation(successfulAnalyses);

    return NextResponse.json({
      success: true,
      targetsFound: targets.length,
      analysisComplete: successfulAnalyses.length,
      acquisitionTheses: sorted,
      timestamp: new Date().toISOString(),
      dataSource: 'Real-time (Perplexity + Firecrawl MCPs)',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run agent pipeline' },
      { status: 500 }
    );
  }
}
