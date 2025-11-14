'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Download, RefreshCw, TrendingUp, Users, DollarSign } from 'lucide-react';
import type { FullAcquisitionThesis } from '@/lib/types';

export function ScoutDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<FullAcquisitionThesis[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runAgents = async () => {
    setIsRunning(true);
    setError(null);
    try {
      console.log('🚀 Starting agent pipeline...');
      const response = await fetch('/api/run-scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Agent pipeline response:', data);

      if (!data.success) {
        throw new Error(data.details || data.error || 'Failed to run agents');
      }

      setResults(data.acquisitionTheses || []);
      console.log(`✅ Set ${data.acquisitionTheses?.length || 0} results`);
    } catch (err) {
      console.error('❌ Error running agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to run agents');
    } finally {
      setIsRunning(false);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    // Prepare CSV headers
    const headers = [
      'Rank',
      'Company Name',
      'Founder Name',
      'Founder Handle',
      'Platform',
      'Current ARR',
      'Current MRR',
      'Growth Rate',
      'Growth Trajectory',
      'Profitability Score',
      'Recommendation',
      'Culture Fit Score',
      'Acquisition Openness',
      'Estimated Revenue Upside',
      'Integration Complexity',
      'Sauce Score',
      'Community Strength',
      'Unique Positioning',
      'Founder Authenticity',
      'Distribution Moat',
      'Sauce Reasoning',
      'URL',
      'Description',
      'Why Interesting',
      'Strategic Reasoning',
      'Synergies',
      'Discovered Date',
    ];

    // Convert results to CSV rows
    const rows = results.map((thesis, idx) => [
      idx + 1,
      thesis.target.companyName,
      thesis.founder.founderName,
      thesis.target.founderHandle || '',
      thesis.target.platform,
      thesis.financials.currentARR,
      thesis.financials.currentMRR,
      thesis.target.growthRate,
      thesis.financials.growthTrajectory,
      thesis.financials.profitabilityScore,
      thesis.portfolioFit.recommendation,
      thesis.portfolioFit.cultureFitScore,
      thesis.founder.acquisitionOpenness,
      thesis.portfolioFit.estimatedRevenueUpsideAfterAcquisition,
      thesis.portfolioFit.integrationComplexity,
      thesis.sauce?.total || '',
      thesis.sauce?.communityStrength || '',
      thesis.sauce?.uniquePositioning || '',
      thesis.sauce?.founderAuthenticity || '',
      thesis.sauce?.distributionMoat || '',
      `"${(thesis.sauce?.reasoning || '').replace(/"/g, '""')}"`,
      thesis.target.url,
      `"${thesis.target.description.replace(/"/g, '""')}"`,
      `"${thesis.target.whyInteresting.replace(/"/g, '""')}"`,
      `"${thesis.portfolioFit.reasoning.replace(/"/g, '""')}"`,
      `"${thesis.portfolioFit.synergiesWithPortfolio.join('; ').replace(/"/g, '""')}"`,
      thesis.target.discoveredDate,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `acquisition-targets-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary stats
  const totalRevenue = results.reduce(
    (sum, r) => sum + (r.financials.currentARR || 0),
    0
  );
  const avgGrowth = results.length
    ? Math.round(
        results.reduce((sum, r) => {
          // Parse growth from "8% MoM" format
          const match = String(r.financials.growthTrajectory).match(/(\d+)%/);
          return sum + (match ? parseInt(match[1], 10) : 0);
        }, 0) / results.length
      )
    : 0;
  const strongBuys = results.filter(
    (r) => r.portfolioFit.recommendation === 'STRONG_BUY'
  ).length;
  const avgSauceScore = results.length
    ? (results.reduce((sum, r) => sum + (r.sauce?.total || 0), 0) / results.length).toFixed(1)
    : '0.0';

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'BUY':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'WATCH':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'PASS':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 px-6 md:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="Sauce Finder Logo"
              width={80}
              height={80}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 mb-1">
              Late Checkout
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Sauce Finder
            </h1>
          </div>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
          Smart agents sniff out the 'secret sauce' behind businesses worth owning. Instantly scout high-ARR, community-powered companies ready to add flavor to Late Checkout's portfolio.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center shadow-sm">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <span className="text-sm text-slate-500 mb-1">COMBINED ANNUAL REVENUE</span>
          <span className="text-2xl font-bold text-slate-900">
            ${(totalRevenue / 1000000).toFixed(2)}M
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center shadow-sm">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
          <span className="text-sm text-slate-500 mb-1">AVERAGE MOM GROWTH</span>
          <span className="text-2xl font-bold text-slate-900">
            {avgGrowth}% MoM
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center shadow-sm">
          <Users className="w-8 h-8 text-purple-600 mb-2" />
          <span className="text-sm text-slate-500 mb-1">STRONG BUY TARGETS</span>
          <span className="text-2xl font-bold text-slate-900">{strongBuys}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center shadow-sm">
          <span className="text-4xl mb-2">🔥</span>
          <span className="text-sm text-slate-500 mb-1">AVG SAUCE SCORE</span>
          <span className="text-2xl font-bold text-orange-600">
            {avgSauceScore}/10
          </span>
        </div>
      </div>

      {/* Pipeline + Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 lg:p-12 mb-10 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Acquisition Pipeline</h2>
        <p className="text-slate-600 mb-8">
          Launch the multi-agent workflow to scout promising businesses, interrogate the fundamentals, and capture founder readiness signals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          {[
            { title: 'Scout', desc: 'Surface candidates' },
            { title: 'Financials', desc: 'Model revenue & growth' },
            { title: 'Portfolio Fit', desc: 'Score strategic alignment' },
            { title: 'Founder', desc: 'Gauge operator readiness' },
            { title: 'Strategy', desc: 'Draft acquisition playbook' }
          ].map((agent) => (
            <div key={agent.title} className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col justify-between h-full">
              <span className="text-lg font-bold text-slate-900 mb-2">{agent.title}</span>
              <span className="text-sm text-slate-600">{agent.desc}</span>
            </div>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={runAgents}
            disabled={isRunning}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Running Agents...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> Run Pipeline
              </>
            )}
          </button>
          {results.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        {results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 md:p-16 flex flex-col items-center text-center max-w-2xl mx-auto shadow-sm">
            <span className="text-xl md:text-2xl font-bold text-slate-900 mb-3">No results yet</span>
            <span className="text-base md:text-lg text-slate-600 mb-6">Run the pipeline to populate this view.</span>
            <div className="text-center text-slate-500 font-medium">
              <p className="mb-2">Awaiting pipeline run.</p>
              <p className="text-sm text-slate-500">
                When the workflow completes, qualified opportunities will appear here with full financial and strategic context.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {results.map((thesis, idx) => (
              <div
                key={thesis.target.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 lg:p-10 hover:border-slate-300 hover:shadow-md transition-all shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-slate-500">#{idx + 1}</span>
                      <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{thesis.target.companyName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${getRecommendationColor(
                          thesis.portfolioFit.recommendation
                        )}`}
                      >
                        {thesis.portfolioFit.recommendation}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Founder: <span className="text-slate-900 font-medium">{thesis.founder.founderName}</span>
                    </p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-slate-500">ARR</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        ${Number(thesis.financials.currentARR || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Growth</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {thesis.financials.growthTrajectory}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-700 mb-6 leading-relaxed">{thesis.target.description}</p>

                {/* Sauce Score */}
                {thesis.sauce && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🔥</span>
                      <span className="text-lg font-bold text-slate-900">The Sauce Score: {thesis.sauce.total}/10</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-slate-600">Community:</span>
                        <span className="text-slate-900 font-semibold ml-2">{thesis.sauce.communityStrength}/10</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Positioning:</span>
                        <span className="text-slate-900 font-semibold ml-2">{thesis.sauce.uniquePositioning}/10</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Authenticity:</span>
                        <span className="text-slate-900 font-semibold ml-2">{thesis.sauce.founderAuthenticity}/10</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Distribution:</span>
                        <span className="text-slate-900 font-semibold ml-2">{thesis.sauce.distributionMoat}/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{thesis.sauce.reasoning}</p>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <p className="text-xs text-slate-500 mb-2">Profitability</p>
                    <p className="font-bold text-purple-600 text-xl">
                      {thesis.financials.profitabilityScore}/10
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <p className="text-xs text-slate-500 mb-2">Acquisition Openness</p>
                    <p className="font-bold text-orange-600 text-xl">
                      {thesis.founder.acquisitionOpenness}/10
                    </p>
                  </div>
                </div>

                {/* Strategic Fit */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">STRATEGIC FIT</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{thesis.portfolioFit.reasoning}</p>
                </div>

                {/* Synergies */}
                {thesis.portfolioFit.synergiesWithPortfolio?.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">SYNERGIES</p>
                    <ul className="space-y-2">
                      {thesis.portfolioFit.synergiesWithPortfolio.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-600 mt-1 font-bold">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
