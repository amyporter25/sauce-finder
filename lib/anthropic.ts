/**
 * Anthropic Claude client helper with retry logic and error handling
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

/**
 * Get or create the Anthropic client instance
 * @returns Anthropic client instance
 * @throws Error if ANTHROPIC_API_KEY is not set
 */
export function getAnthropicClient(): Anthropic {
  if (anthropicClient) {
    return anthropicClient;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is required to call Claude. Update your environment configuration.'
    );
  }

  anthropicClient = new Anthropic({
    apiKey,
    maxRetries: 3,
  });

  console.info('[anthropic] Initialized Claude client with retry support.');

  return anthropicClient;
}

/**
 * Run an AI agent using Claude
 * @param systemPrompt - System prompt defining the agent's role and behavior
 * @param userMessage - User message/query for the agent
 * @param maxTokens - Maximum tokens in response (default: 4000)
 * @returns Agent response text
 * @throws Error if API call fails
 */
export async function runAgent(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4000
): Promise<string> {
  const client = getAnthropicClient();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = message.content[0];

    if (content && content.type === 'text') {
      return content.text;
    }

    console.warn('[anthropic] Received unexpected content payload from Claude.', {
      content,
    });

    return '';
  } catch (error) {
    console.error('[anthropic] Agent invocation failed.', error);
    throw error;
  }
}

