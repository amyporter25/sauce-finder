# Build Plan: Greg AI Research Team Dashboard
**Based on:** PRD (prdgreg.md)  
**Estimated Total Duration:** 4 weeks (MVP + Polish phases)

---

## Phase 0: Project Setup & Foundation (Days 1-2)

### Step 0.1: Initialize Next.js Project
- [ ] Run `npx create-next-app@14` with TypeScript, Tailwind, App Router
- [ ] Configure `tsconfig.json` with path aliases (`@/` → `./`)
- [ ] Set up `.env.local` structure (keep existing API keys)
- [ ] Install core dependencies:
  ```bash
  npm install @anthropic-ai/sdk
  npm install lucide-react  # for icons
  ```

### Step 0.2: Project Structure
- [ ] Create directory structure:
  ```
  app/
    api/run-scout/
    layout.tsx
    page.tsx
    globals.css
  components/
  lib/
    agents/
    types.ts
    anthropic.ts
  public/
  ```
- [ ] Set up `.gitignore` (exclude `.env.local`, `.next`, `node_modules`)

### Step 0.3: Base Configuration
- [ ] Configure Tailwind in `tailwind.config.ts` (dark mode only)
- [ ] Set up `globals.css` with base styles
- [ ] Create `app/layout.tsx` with Inter font (via `next/font/google`)
- [ ] Verify dev server runs: `npm run dev`

**Deliverable:** Working Next.js skeleton with Tailwind, TypeScript, and proper folder structure.

---

## Phase 1: Core Infrastructure (Days 3-5)

### Step 1.1: Type Definitions
- [ ] Create `lib/types.ts` with all interfaces:
  - `AcquisitionTarget`
  - `FinancialAnalysis`
  - `PortfolioFitAnalysis`
  - `FounderProfile`
  - `AcquisitionStrategy` (optional for MVP)
  - `FullAcquisitionThesis`
- [ ] Export all types for use across the app

### Step 1.2: Anthropic Client Helper
- [ ] Create `lib/anthropic.ts`:
  - `getAnthropicClient()` - singleton client with retry logic
  - `runAgent(systemPrompt, userMessage, maxTokens)` - wrapper function
  - Error handling for missing API keys
  - Logging for debugging
- [ ] Test with a simple prompt to verify Claude connection

### Step 1.3: Data Gathering Infrastructure
- [ ] Create `lib/agents/dataGatherer.ts`:
  - `gatherRealBusinessData()` function
  - Use Perplexity MCP for web search
  - Use Firecrawl MCP for scraping
  - Fallback to mock data if APIs fail
- [ ] Test data gathering independently

**Deliverable:** Core infrastructure ready - types, Claude client, data gathering.

---

## Phase 2: Agent Implementation - Scout (Days 6-8)

### Step 2.1: Scout Agent
- [ ] Create `lib/agents/scout.ts`:
  - Import `gatherRealBusinessData` and `runAgent`
  - Define `SCOUT_SYSTEM_PROMPT` with criteria:
    - Target: $50k-$5M ARR, solo/small teams, profitable
    - Red flags: VC-backed, >$5M ARR, burning cash
    - Discovery sources: Indie Hackers, Twitter, Product Hunt, etc.
  - `runScoutAgent()` function:
    - Calls `gatherRealBusinessData()`
    - Passes data to Claude with scout prompt
    - Parses JSON response (handle markdown code blocks)
    - Adds IDs and timestamps
    - Returns `AcquisitionTarget[]`
- [ ] Test with mock data first, then real data

### Step 2.2: API Route - Basic Scout
- [ ] Create `app/api/run-scout/route.ts`:
  - `GET` handler
  - Calls `runScoutAgent()`
  - Returns `{ success, targets, timestamp }`
  - Error handling with proper HTTP status codes
- [ ] Test API route with `curl` or Postman

**Deliverable:** Scout agent finds and returns acquisition targets from real-time data.

---

## Phase 3: Agent Implementation - Financials & Fit (Days 9-12)

### Step 3.1: Financials Analyzer Agent
- [ ] Create `lib/agents/financialsAnalyzer.ts`:
  - `FINANCIALS_PROMPT` system prompt:
    - Analyze MRR/ARR, growth trajectory
    - Estimate gross margins (SaaS: 70-90%, services: 40-60%)
    - Project 12mo and 36mo revenue
    - Calculate profitability score (1-10)
    - Assess cash flow health
    - Data confidence score
  - `runFinancialsAnalyzer(target)` function:
    - Takes `AcquisitionTarget` as input
    - Returns `FinancialAnalysis`
- [ ] Test with sample target data

### Step 3.2: Portfolio Fit Checker Agent
- [ ] Create `lib/agents/portfolioFitChecker.ts`:
  - `PORTFOLIO_FIT_PROMPT` system prompt:
    - List Late Checkout portfolio companies
    - Analyze synergies and cross-promotion opportunities
    - Score culture fit (1-10)
    - Assess integration complexity
    - Make recommendation: STRONG_BUY, BUY, WATCH, PASS
  - `runPortfolioFitChecker(target)` function:
    - Takes `AcquisitionTarget` as input
    - Returns `PortfolioFitAnalysis`
- [ ] Test with sample target data

### Step 3.3: Update API Route - Full Pipeline
- [ ] Update `app/api/run-scout/route.ts`:
  - After Scout finds targets, run Financials & Fit in parallel:
    ```typescript
    const [financials, portfolioFit] = await Promise.all([
      runFinancialsAnalyzer(target),
      runPortfolioFitChecker(target)
    ]);
    ```
  - Combine into `FullAcquisitionThesis` objects
  - Sort by recommendation (STRONG_BUY first)
  - Return `{ success, acquisitionTheses, timestamp }`
- [ ] Test full pipeline end-to-end

**Deliverable:** Three-agent pipeline (Scout → Financials → Fit) working end-to-end.

---

## Phase 4: Frontend Dashboard - MVP (Days 13-16)

### Step 4.1: Basic Layout
- [ ] Create `app/page.tsx`:
  - Dark background (`bg-slate-950`)
  - Header with title and description
  - Container with max-width and padding
  - Import and render `ScoutDashboard` component

### Step 4.2: Dashboard Component - Structure
- [ ] Create `components/ScoutDashboard.tsx`:
  - Client component (`'use client'`)
  - State: `isRunning`, `results`
  - `runAgents()` async function to call `/api/run-scout`
  - Basic layout structure:
    - Stats row (3 cards - placeholder for now)
    - Pipeline section with "Run Agents" button
    - Results section (empty state initially)

### Step 4.3: Stats Cards
- [ ] Implement summary stats:
  - Combined Annual Revenue (sum of all ARR)
  - Average MoM Growth (parse from growthTrajectory)
  - Strong Buy Targets count
- [ ] Style cards with Tailwind (dark theme, rounded corners)

### Step 4.4: Pipeline Section
- [ ] Display 5 agent stages (Scout, Financials, Portfolio Fit, Founder, Strategy)
- [ ] "Run Pipeline" button:
  - Shows loading state when `isRunning === true`
  - Calls `runAgents()`
  - Displays spinner/loading indicator
- [ ] Visual feedback during agent execution

### Step 4.5: Results Display
- [ ] Empty state:
  - Centered message
  - "Awaiting pipeline run" text
  - Call-to-action to run pipeline
- [ ] Results list:
  - Map over `acquisitionTheses` array
  - Display key info: company name, ARR, growth, recommendation badge
  - Color-code recommendation badges (green=STRONG_BUY, etc.)

**Deliverable:** Functional dashboard that can run agents and display results.

---

## Phase 5: Frontend Polish & Details (Days 17-19)

### Step 5.1: Result Cards - Full Details
- [ ] Expand result cards to show:
  - Company name, founder name, URL link
  - Description
  - Key metrics grid (Revenue, Growth, Profitability, Openness)
  - Strategic Fit reasoning
  - Synergies list (if available)
- [ ] Responsive grid layout (1 column mobile, 2 columns desktop)

### Step 5.2: Recommendation Badges
- [ ] Create `getRecommendationColor()` helper function
- [ ] Style badges with appropriate colors:
  - STRONG_BUY: Green
  - BUY: Blue
  - WATCH: Yellow/Amber
  - PASS: Red
- [ ] Add border and background opacity for visual hierarchy

### Step 5.3: Loading States & Error Handling
- [ ] Loading spinner during agent execution
- [ ] Error banner if API call fails
- [ ] Graceful handling of missing data fields
- [ ] Retry button on errors

### Step 5.4: Responsive Design
- [ ] Test on mobile viewport (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Ensure all cards stack properly on mobile
- [ ] Fix any overflow or spacing issues

**Deliverable:** Polished, responsive dashboard with full result details.

---

## Phase 6: Founder Researcher Agent (Days 20-22)

### Step 6.1: Founder Researcher Agent
- [ ] Create `lib/agents/founderResearcher.ts`:
  - `FOUNDER_RESEARCH_PROMPT` system prompt:
    - Analyze founder background and track record
    - Assess acquisition openness signals (1-10)
    - Identify motivation for selling/partnering
    - Suggest best approach angle
    - List any red flags
  - `runFounderResearcher(target)` function:
    - Takes `AcquisitionTarget` as input
    - Returns `FounderProfile`
- [ ] Test with sample target data

### Step 6.2: Integrate Founder Agent
- [ ] Update `app/api/run-scout/route.ts`:
  - Add Founder Researcher to parallel execution:
    ```typescript
    const [financials, portfolioFit, founder] = await Promise.all([
      runFinancialsAnalyzer(target),
      runPortfolioFitChecker(target),
      runFounderResearcher(target)
    ]);
    ```
- [ ] Update `FullAcquisitionThesis` to include founder data

### Step 6.3: Display Founder Data
- [ ] Update dashboard to show:
  - Founder name and background
  - Acquisition Openness score
  - Best approach angle
  - Red flags (if any)

**Deliverable:** Four-agent pipeline complete (Scout → Financials → Fit → Founder).

---

## Phase 7: Export Functionality (Days 23-24)

### Step 7.1: CSV Export Helper
- [ ] Create `lib/utils/export.ts`:
  - `exportToCSV(theses)` function:
    - Converts `FullAcquisitionThesis[]` to CSV format
    - Includes all relevant fields
    - Handles nested objects (flatten or stringify)
  - `exportToJSON(theses)` function (bonus)

### Step 7.2: Export Button
- [ ] Add "Export Report" button to dashboard
- [ ] Only show when `results.length > 0`
- [ ] On click, trigger CSV download
- [ ] Use browser download API (`Blob`, `URL.createObjectURL`)

### Step 7.3: Export Format
- [ ] CSV columns:
  - Company Name, Founder Name, ARR, MRR, Growth Rate
  - Profitability Score, Acquisition Openness
  - Recommendation, Strategic Fit Reasoning
  - Key Synergies (comma-separated)
- [ ] Test CSV opens correctly in Excel/Google Sheets

**Deliverable:** Users can export results to CSV for external analysis.

---

## Phase 8: Testing & Bug Fixes (Days 25-26)

### Step 8.1: Manual Testing
- [ ] Test "Run Pipeline" button:
  - Verify loading state appears
  - Verify results display correctly
  - Verify error handling works
- [ ] Test with 0 results (empty state)
- [ ] Test with 1 result
- [ ] Test with 5+ results (pagination if needed)

### Step 8.2: Edge Case Testing
- [ ] Missing API keys → show error banner
- [ ] Invalid JSON from agents → graceful fallback
- [ ] Network timeout → retry mechanism
- [ ] Missing data fields → show "N/A" or default values

### Step 8.3: Performance Testing
- [ ] Measure agent execution time (target: < 60s)
- [ ] Check Lighthouse score (target: > 85)
- [ ] Optimize if needed (lazy loading, code splitting)

### Step 8.4: UI/UX Polish
- [ ] Consistent spacing throughout (use Tailwind spacing scale)
- [ ] Consistent typography (font sizes, weights)
- [ ] Consistent colors (use Tailwind color palette)
- [ ] Smooth transitions and hover states
- [ ] Accessibility: keyboard navigation, ARIA labels

**Deliverable:** Tested, polished MVP ready for demo.

---

## Phase 9: Documentation & Deployment Prep (Days 27-28)

### Step 9.1: README
- [ ] Update `README.md` with:
  - Project description
  - Setup instructions
  - Environment variables needed
  - How to run locally
  - How to deploy

### Step 9.2: Code Comments
- [ ] Add JSDoc comments to all exported functions
- [ ] Add inline comments for complex logic
- [ ] Document agent prompts and their purposes

### Step 9.3: Deployment
- [ ] Set up Vercel project
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy and test production build
- [ ] Verify API routes work in production

**Deliverable:** Production-ready application deployed to Vercel.

---

## Phase 10: Future Enhancements (Post-MVP)

### Phase 10.1: Strategy Generator Agent (Week 5-6)
- [ ] Create `lib/agents/strategyGenerator.ts`
- [ ] Generate acquisition playbook:
  - Valuation estimates
  - Suggested deal structure
  - Outreach message draft
  - Integration plan
  - Quick wins (first 90 days)
- [ ] Integrate into pipeline

### Phase 10.2: Persistence Layer (Week 7-8)
- [ ] Set up Supabase project
- [ ] Create tables for:
  - `acquisition_targets`
  - `analyses` (financials, fit, founder)
  - `runs` (timestamp, status)
- [ ] Save results to database after each run
- [ ] Add "View History" page

### Phase 10.3: Notifications (Week 9-10)
- [ ] Set up Slack webhook
- [ ] Send notification when STRONG_BUY found
- [ ] Include key metrics in notification
- [ ] Add notification preferences

---

## Key Dependencies & Blockers

### Critical Path
1. **Phase 0** → **Phase 1** → **Phase 2** (Foundation must be solid)
2. **Phase 2** → **Phase 3** (Scout must work before other agents)
3. **Phase 3** → **Phase 4** (Backend must work before frontend)
4. **Phase 4** → **Phase 5** (Basic UI before polish)

### External Dependencies
- Anthropic API key (required)
- Perplexity MCP access (required)
- Firecrawl MCP access (required)
- Vercel account (for deployment)

### Risk Mitigation
- **API failures**: Implement fallback to mock data
- **Slow agent responses**: Add timeout handling, show progress
- **Invalid JSON**: Robust parsing with error recovery
- **Missing data**: Graceful degradation, show "N/A"

---

## Success Criteria (Per Phase)

- **Phase 0**: Dev server runs, Tailwind works, project structure exists
- **Phase 1**: Types compile, Claude client connects, data gathering works
- **Phase 2**: Scout agent returns 3+ targets from real data
- **Phase 3**: Full pipeline returns complete theses with financials & fit
- **Phase 4**: Dashboard displays results, button triggers pipeline
- **Phase 5**: Dashboard looks polished, responsive, accessible
- **Phase 6**: Founder data appears in results
- **Phase 7**: CSV export downloads correctly
- **Phase 8**: All tests pass, no critical bugs
- **Phase 9**: Deployed to production, documented

---

## Estimated Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| 0: Setup | 2 days | Project initialized |
| 1: Infrastructure | 3 days | Core types & Claude client ready |
| 2: Scout Agent | 3 days | First agent working |
| 3: Financials & Fit | 4 days | Three-agent pipeline |
| 4: Dashboard MVP | 4 days | Working UI |
| 5: Polish | 3 days | Polished UI |
| 6: Founder Agent | 3 days | Four-agent pipeline |
| 7: Export | 2 days | CSV export working |
| 8: Testing | 2 days | Bug-free MVP |
| 9: Deploy | 2 days | Production ready |
| **Total MVP** | **28 days** | **~4 weeks** |

---

*This plan assumes 1 developer working full-time. Adjust timeline based on team size and availability.*

