/**
 * TypeScript interfaces for the acquisition thesis system
 */

export interface AcquisitionTarget {
  id: string;
  companyName: string;
  founderName: string;
  founderHandle?: string;
  platform: string; // "Indie Hackers", "Twitter", "Product Hunt", etc
  revenueEstimate: number; // Annual
  mrrEstimate: number; // Monthly Recurring
  growthRate: string; // "15% MoM", "$500/mo growth", etc
  businessModel: string; // "Subscriptions", "SaaS", "Digital Products", etc
  url: string;
  description: string;
  whyInteresting: string;
  discoveredDate: string;
  discoverySource: string; // Where we found this
  dataSource?: string; // "Real-time (Perplexity + Firecrawl)" or "Mock"
}

export interface FinancialAnalysis {
  targetId: string;
  currentMRR: number;
  currentARR: number;
  estimatedGrossMargin: number; // Percentage
  estimatedChurn: number; // Percentage
  growthTrajectory: string;
  revenueProjection12Months: number;
  revenueProjection36Months: number;
  profitabilityScore: number; // 1-10
  cashFlowHealth: string;
  dataConfidence: number; // 1-10 (how sure are we?)
  analysis: string;
}

export interface PortfolioFitAnalysis {
  targetId: string;
  cultureFitScore: number; // 1-10
  synergiesWithPortfolio: string[];
  potentialCrossPromo: string[];
  integrationComplexity: string; // "Easy", "Medium", "Hard"
  canMergeWithExisting?: string; // Which portfolio company?
  estimatedRevenueUpsideAfterAcquisition: number; // Potential additional revenue
  recommendation: "STRONG_BUY" | "BUY" | "WATCH" | "PASS";
  reasoning: string;
}

export interface FounderProfile {
  targetId: string;
  founderName: string;
  founderBackground: string;
  previousExits?: string[];
  otherBusinesses?: string[];
  publicProfile: string; // Twitter bio, IH bio, etc
  acquisitionOpenness: number; // 1-10 (likelihood they'd sell)
  motivation: string; // Why might they want to partner/sell?
  bestApproachAngle: string;
  redFlags: string[];
  context?: string;
}

export interface AcquisitionStrategy {
  targetId: string;
  companyName: string;
  valuationEstimateMin: number;
  valuationEstimateMax: number;
  suggestedStructure: string; // "Cash", "Earnout", "Equity", "Hybrid"
  approachStrategy: string;
  outreachMessage: string;
  integrationPlan: string;
  quickWins: string[]; // First 90 days
  risks: string[];
  nextSteps: string[];
}

export interface FullAcquisitionThesis {
  target: AcquisitionTarget;
  financials: FinancialAnalysis;
  portfolioFit: PortfolioFitAnalysis;
  founder: FounderProfile;
  strategy?: AcquisitionStrategy; // Optional for MVP
}

