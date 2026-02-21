'use server';
/**
 * @fileOverview A Genkit flow for the AlphaBot AI assistant.
 *
 * - chatWithAlphaBot - A function that handles the chat interaction with AlphaBot.
 * - ChatWithAlphaBotInput - The input type for the chatWithAlphaBot function.
 * - ChatWithAlphaBotOutput - The return type for the chatWithAlphaBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatWithAlphaBotInputSchema = z.object({
  message: z.string().describe('The user\'s message to AlphaBot.'),
});
export type ChatWithAlphaBotInput = z.infer<typeof ChatWithAlphaBotInputSchema>;

const ChatWithAlphaBotOutputSchema = z.object({
  response: z.string().describe('AlphaBot\'s response.'),
});
export type ChatWithAlphaBotOutput = z.infer<typeof ChatWithAlphaBotOutputSchema>;

// AlphaBot's system prompt to guide its responses and ensure disclaimers.
const ALPHA_BOT_SYSTEM_PROMPT = `You are AlphaBot. You provide concise research-style market commentary and risk-aware explanations.
You do NOT provide financial advice. You focus on probability, risk management, and scenario analysis.
For options, explain bullish/bearish/neutral, defined vs undefined risk (if inferable), and mention key risks like time decay, volatility, assignment when relevant.
Tone: professional, research-note style. Output: short paragraphs + bullet points.
If user requests guaranteed profits or extreme leverage, warn about risks.
Always include the disclaimer: "For educational purposes only. Not financial advice." at the end of your response.`;

const alphaBotChatPrompt = ai.definePrompt({
  name: 'alphaBotChatPrompt',
  input: { schema: ChatWithAlphaBotInputSchema },
  output: { schema: ChatWithAlphaBotOutputSchema },
  system: ALPHA_BOT_SYSTEM_PROMPT,
  prompt: '{{{message}}}',
});

const chatWithAlphaBotFlow = ai.defineFlow(
  {
    name: 'chatWithAlphaBotFlow',
    inputSchema: ChatWithAlphaBotInputSchema,
    outputSchema: ChatWithAlphaBotOutputSchema,
  },
  async (input) => {
    const { output } = await alphaBotChatPrompt(input);
    // The prompt is configured to return an object with a 'response' field.
    return output!;
  }
);

export async function chatWithAlphaBot(input: ChatWithAlphaBotInput): Promise<ChatWithAlphaBotOutput> {
  return chatWithAlphaBotFlow(input);
}
