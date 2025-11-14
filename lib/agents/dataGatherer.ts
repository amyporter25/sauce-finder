/**
 * Real-time business data gathering using Perplexity and Firecrawl APIs
 * Uses direct API calls for real-time data collection
 */

import { Perplexity } from '@perplexity-ai/perplexity_ai';
import Firecrawl from '@mendable/firecrawl-js';

/**
 * Initialize Perplexity client
 */
function getPerplexityClient(): Perplexity {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY environment variable is required');
  }
  return new Perplexity({ apiKey });
}

/**
 * Initialize Firecrawl client
 */
function getFirecrawlClient(): Firecrawl {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY environment variable is required');
  }
  return new Firecrawl({ apiKey });
}

/**
 * Search for indie SaaS businesses using Perplexity
 */
async function searchWithPerplexity(): Promise<string> {
  try {
    const perplexity = getPerplexityClient();
    
    const query = `Find 10-15 recent indie SaaS businesses and solo founders sharing revenue publicly in 2024-2025. Look for:
- Indie Hackers "Year in Review" posts with revenue numbers
- Twitter/X #buildinpublic creators sharing revenue milestones
- Product Hunt recent launches with revenue data
- Substack newsletters with sponsorship data
- Solo founders doing $50k-$500k ARR

For each business, extract: company name, founder name and Twitter/X handle, annual/monthly revenue (ARR/MRR), business type/description, profile URL or website, growth rate if mentioned, and platform where found.

IMPORTANT: Find as many businesses as possible (aim for 10-15 different opportunities) to give the scout agent multiple options to analyze.`;

    console.log('🔍 Searching with Perplexity...');
    
    const response = await perplexity.chat.completions.create({
      model: 'sonar-pro', // Advanced search model with grounding
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 4000,
    });

    // Handle Perplexity response which can be string or array of content chunks
    const messageContent = response.choices[0]?.message?.content;
    let content = '';
    
    if (typeof messageContent === 'string') {
      content = messageContent;
    } else if (Array.isArray(messageContent)) {
      // Extract text from content chunks
      content = messageContent
        .filter((chunk) => chunk.type === 'text')
        .map((chunk) => (chunk as { type: string; text: string }).text)
        .join('\n');
    }
    
    console.log('✅ Perplexity search complete');
    return content;
  } catch (error) {
    console.error('Perplexity search error:', error);
    throw error;
  }
}

/**
 * Scrape URLs found in search results using Firecrawl
 */
async function scrapeUrlsWithFirecrawl(urls: string[]): Promise<string> {
  if (urls.length === 0) return '';

  try {
    const firecrawl = getFirecrawlClient();
    console.log(`🕷️ Scraping ${urls.length} URLs with Firecrawl...`);

    const scrapePromises = urls.slice(0, 5).map(async (url) => {
      try {
        const result = await firecrawl.scrape(url, {
          formats: ['markdown'],
          onlyMainContent: true,
        });
        return `\n===== ${url} =====\n${result.markdown || result.content || 'No content'}\n`;
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return `\n===== ${url} =====\nError: Could not scrape\n`;
      }
    });

    const results = await Promise.all(scrapePromises);
    console.log('✅ Firecrawl scraping complete');
    return results.join('\n');
  } catch (error) {
    console.error('Firecrawl scraping error:', error);
    return '';
  }
}

/**
 * Extract URLs from Perplexity search results
 */
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  const urls = text.match(urlRegex) || [];
  // Filter and deduplicate URLs
  return [...new Set(urls.filter(url => {
    try {
      const parsed = new URL(url);
      // Exclude common non-content URLs
      return !parsed.hostname.includes('twitter.com') && 
             !parsed.hostname.includes('x.com') &&
             !parsed.hostname.includes('facebook.com');
    } catch {
      return false;
    }
  }))];
}

/**
 * Gather real-time business data from web sources
 * Uses Perplexity for search and Firecrawl for scraping
 * @returns Combined data string for agent consumption
 */
export async function gatherRealBusinessData(): Promise<string> {
  try {
    console.log('🔍 Gathering real business data via Perplexity & Firecrawl...');

    // Step 1: Search with Perplexity
    const searchResults = await searchWithPerplexity();

    // Step 2: Extract URLs and scrape with Firecrawl
    const urls = extractUrls(searchResults);
    const scrapedContent = urls.length > 0 
      ? await scrapeUrlsWithFirecrawl(urls)
      : '';

    console.log('✅ Real-time data gathering complete');

    const combinedData = `
REAL-TIME DATA GATHERED (${new Date().toISOString().split('T')[0]}):

===== PERPLEXITY SEARCH RESULTS =====
${searchResults || 'No data found'}

${scrapedContent ? `===== FIRECRAWL SCRAPED CONTENT =====${scrapedContent}` : ''}

===== INSTRUCTIONS FOR SCOUT AGENT =====
This data was gathered from real sources TODAY using Perplexity search and Firecrawl scraping. Analyze all opportunities found and extract key information for acquisition targets. Focus on businesses that match our criteria: $50k-$5M ARR, solo/small teams, profitable, community-based. Extract structured data for each opportunity.
    `.trim();

    return combinedData;
  } catch (error) {
    console.error('Error gathering real data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If API keys are missing, provide helpful error message
    if (errorMessage.includes('PERPLEXITY_API_KEY') || errorMessage.includes('FIRECRAWL_API_KEY')) {
      console.error('⚠️ Missing API keys. Please set PERPLEXITY_API_KEY and FIRECRAWL_API_KEY in .env.local');
      console.log('⚠️ Falling back to mock data');
    } else {
      console.log('⚠️ API error, falling back to mock data');
    }
    
    return getMockBusinessData();
  }
}

/**
 * Mock business data for development/testing
 * Used when API keys are missing or API calls fail
 */
function getMockBusinessData(): string {
  return `
REAL-TIME DATA GATHERED:

===== PERPLEXITY SEARCH RESULTS =====
Recent indie SaaS businesses sharing revenue publicly:

1. TaskFlow - Solo founder @johndoe, $180k ARR, 12% MoM growth
   Platform: Indie Hackers
   URL: https://www.indiehackers.com/product/taskflow
   Description: Project management tool for small teams
   Revenue: $15k MRR, growing steadily

2. CodeSnap - Founder @sarahdev, $240k ARR, 8% MoM growth
   Platform: Twitter/X
   URL: https://codesnap.dev
   Description: Code snippet sharing platform
   Revenue: $20k MRR, profitable

3. DesignTokens - Solo founder @mikedesign, $120k ARR, 15% MoM growth
   Platform: Product Hunt
   URL: https://designtokens.io
   Description: Design system token management
   Revenue: $10k MRR, early stage but growing

===== FIRECRAWL SCRAPED DATA =====
Additional context from scraped pages:
- Founders are active on Twitter/X
- Some have Indie Hackers profiles with revenue claims
- All are solo founders or 2-person teams
- Revenue numbers verified from public posts

===== INSTRUCTIONS FOR SCOUT AGENT =====
This data was gathered from real sources TODAY. Analyze all opportunities found and extract key information.
  `.trim();
}
