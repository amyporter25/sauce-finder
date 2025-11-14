# Product Requirements Document  
**Project:** Late Checkout “Greg AI Research Team” Dashboard  
**Date:** 2025-11-13  
**Author:** AI Product Team  

---

## 1  Executive Summary  
Late Checkout wants an internal tool that continuously scouts, analyses and prioritises indie / community-led businesses that could be acquired and plugged into Greg Isenberg’s portfolio.  
The system uses a chain of autonomous Claude agents plus real-time web search & scraping (Perplexity + Firecrawl) to:  

1. Discover promising targets (“Scout”).  
2. Project their financial upside (“Financials Analyzer”).  
3. Score strategic fit with the existing portfolio (“Portfolio Fit Checker”).  
4. Evaluate the founder’s openness & background (“Founder Researcher”).  
5. Compile an acquisition playbook (“Strategy Generator”, phase 2).  

Success = a ranked pipeline of real, acquisition-ready businesses that materially shortens Greg’s deal-sourcing cycle and surfaces at least one qualified LOI candidate per quarter.

---

## 2  Scope Definition  
### In-Scope (MVP)  
1. Next.js 14 App-Router front-end hosted on Vercel.  
2. Tailwind-styled dashboard with:
   • Header, stats row, pipeline section, results list, export/refresh actions.  
3. Five Claude-based agents invoked from a single Next API route.  
4. Real-time data gathering via Perplexity search MCP + Firecrawl scrape MCP.  
5. Type-safe interfaces for all agent payloads.  
6. Environment-variable driven API keys.  
7. Basic CSV / JSON export.  

### Out-of-Scope (MVP)  
- In-app CRUD editing of target data.  
- Multi-user auth & permissions.  
- Deal-tracking Kanban or CRM integration.  
- Payment / Stripe integrations.  
- Mobile-native app.  

### Future Considerations  
- Slack / Discord notifications when new “Strong Buy” targets appear.  
- GPT-4o-mini fine-tuning for cheaper inference.  
- Automated LOI generation & DocuSign integration.  
- Multi-portfolio support (Late Checkout Capital, advisory clients, etc.).  

---

## 3  Target Market & User Analysis  
### 3.1 Ideal Customer Profile (internal)  
*Team:* Greg Isenberg + small acquisitions crew.  
*Need:* Faster, data-backed sourcing of community-first, cash-flowing SaaS / media assets ($50 k – $5 M ARR).  
*Tech maturity:* Comfortable with dashboards & AI outputs; must be one-click simple.  

### 3.2 User Personas  
1. **Greg (Founder/Deal Lead)** – wants top 3 “buy” calls per week, spends <5 min scanning.  
2. **Analyst** – deep-dives each candidate; cares about raw JSON & export.  
3. **Advisor** – occasionally reviews portfolio fit; only needs high-level charts.  

---

## 4  User Stories & Acceptance Criteria  
| Persona | Story | Acceptance Test |  
|---------|-------|-----------------|  
| Greg | *As a founder, I click “Run Agents” and within 60 s see a ranked list of opportunities.* | Dashboard shows status spinner → list ≥ 5 targets with ARR, Growth, Fit, Openness columns. |  
| Analyst | *As an analyst, I export the results to CSV for modelling.* | “Export” button downloads valid CSV with all fields. |  
| Advisor | *As an advisor, I only want to read “Strong Buy” theses.* | Filter defaults to sorted list; strong buys highlighted in green. |  

Edge cases: API key missing → visible error banner. Agents return invalid JSON → graceful fallback / retry once.

---

## 5  Feature Specifications  
### 5.1 Feature Hierarchy  
| Feature | Priority | Complexity | Value |  
|---------|----------|-----------|-------|  
Real-time Scout | Critical | High | 9/10  
Financials & Fit analysis | High | Med | 8/10  
Dashboard UI | High | Med | 8/10  
Export | Medium | Low | 6/10  
Founder Research | Medium | Med | 7/10  

### 5.2 Detailed Requirements  
- **Functional:** Single API route orchestrates agent chain, returns structured thesis array.  
- **UI:** Tailwind; responsive grid; dark mode only.  
- **Data:** TypeScript interfaces (`lib/types.ts`).  
- **Business Rules:** Must ignore VC-backed or >$5 M ARR.  
- **Integrations:** Anthropic SDK, Firecrawl MCP, Perplexity MCP.  
- **Performance:** End-to-end run ≤ 60 s; dashboard FCP < 2 s on broadband.  

---

## 6  Technical Architecture  
### 6.1 Stack  
- **Frontend:** Next.js 14 App Router, React-server components.  
- **Backend:** Next API Routes (Edge runtime where possible).  
- **AI:** Claude 3.5 Sonnet via `@anthropic-ai/sdk`.  
- **Styling:** Tailwind CSS + shadcn/ui primitives.  

### 6.2 Directory  
```text
greg-ai-research-team/
  app/
    api/run-scout/route.ts      # orchestrator route
    layout.tsx, page.tsx
  components/
    ScoutDashboard.tsx
  lib/
    anthropic.ts                # Claude helper
    agents/                     # scout, financials, fit, founder
    types.ts
  public/…
```

### 6.3 Database  
None (MVP). Results held in memory; export generates on demand. Future: Supabase.  

### 6.4 API Design  
`GET /api/run-scout`  
Response `{ success, acquisitionTheses: FullAcquisitionThesis[] }`  

---

## 7  Task Breakdown  
### Frontend  
- Layout skeleton, responsive grid.  
- Hook to call `/api/run-scout` + loading state.  
- CSV export helper.  

### Backend / Agents  
- Build `runAgent` wrapper with retry.  
- Implement each agent prompt & parsing.  
- Data gatherer using Perplexity + Firecrawl tools.  

### QA  
- Unit test parser robustness.  
- Manual UI test on mobile & desktop.  

---

## 8  Roadmap  
| Phase | Duration | Key Deliverables |  
|-------|----------|------------------|  
1 MVP  | 2 weeks  | Working dashboard, Scout + Financials + Fit agents.  
2 Polish| 2 weeks | Founder researcher, CSV export, nicer UI polish.  
3 Scale | 4 weeks | Slack alerts, Supabase persistence, Strategy agent.  

---

## 9  Success Metrics  
- **Pipeline Throughput:** ≥10 new qualified targets/week.  
- **Agent Accuracy:** ≥80 % manual correctness on key fields.  
- **Engagement:** Greg logs in & exports at least once/week.  
- **Latency:** 95th percentile agent run < 60 s.  

---

## 10  QA & Testing  
- Jest unit tests for JSON parsing functions.  
- Cypress smoke test for “Run Agents → results list”.  
- Lighthouse performance check (score > 85).  

---

*This PRD should serve as the north-star spec for rebuilding the Greg AI Research Team dashboard from scratch.*
