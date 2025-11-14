# Sauce Finder 🔥

Smart agents sniff out the 'secret sauce' behind businesses worth owning. Instantly scout high-ARR, community-powered companies ready to add flavor to Late Checkout's portfolio.

## Features

- **Multi-Agent Pipeline**: Scout → Financials → Portfolio Fit → Sauce Score
- **Real-Time Data**: Uses Perplexity and Firecrawl APIs for live business intelligence
- **Sauce Score**: Quantifies what makes businesses special (Community, Positioning, Authenticity, Distribution)
- **Smart Recommendations**: STRONG_BUY, BUY, WATCH, PASS classifications
- **CSV Export**: Download full acquisition theses for analysis

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Claude Sonnet 4.5** (via Anthropic API)
- **Perplexity API** (for search)
- **Firecrawl API** (for web scraping)

## Environment Variables

Create a `.env.local` file with the following:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deployment to Vercel

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import the `sauce-finder` repository from GitHub

2. **Configure Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add all three API keys:
     - `ANTHROPIC_API_KEY`
     - `PERPLEXITY_API_KEY`
     - `FIRECRAWL_API_KEY`

3. **Deploy**:
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your app will be live in minutes!

## Project Structure

```
├── app/
│   ├── api/run-scout/    # Main agent pipeline API route
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard page
├── components/
│   └── ScoutDashboard.tsx # Main dashboard component
├── lib/
│   ├── agents/           # AI agent implementations
│   │   ├── scout.ts
│   │   ├── financialsAnalyzer.ts
│   │   ├── portfolioFitChecker.ts
│   │   ├── sauceScorer.ts
│   │   └── dataGatherer.ts
│   ├── anthropic.ts      # Claude client wrapper
│   └── types.ts          # TypeScript interfaces
└── public/
    └── images/
        └── logo.png      # Dashboard logo
```

## License

Private - Late Checkout Portfolio
