# Late Checkout AI Research Team Dashboard

Autonomous agents finding acquisition targets for Greg Isenberg's portfolio.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_key_here
   PERPLEXITY_API_KEY=your_key_here
   FIRECRAWL_API_KEY=your_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
greg-ai-research-team/
  app/
    api/run-scout/     # API route for agent pipeline
    layout.tsx         # Root layout
    page.tsx           # Home page
    globals.css        # Global styles
  components/
    ScoutDashboard.tsx # Main dashboard component
  lib/
    agents/            # AI agent implementations
    anthropic.ts       # Claude client helper
    types.ts           # TypeScript interfaces
  public/              # Static assets
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude 3.5 Sonnet
- **Icons:** Lucide React

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

- `prdgreg.md` - Product Requirements Document
- `BUILD_PLAN.md` - Step-by-step build plan

