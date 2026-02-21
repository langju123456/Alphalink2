'use server';
/**
 * @fileOverview A Genkit flow for summarizing a trade idea using AI.
 *
 * - summarizeTradeIdea - A function that handles the generation of AI summaries for trade ideas.
 * - SummarizeTradeIdeaInput - The input type for the summarizeTradeIdea function.
 * - SummarizeTradeIdeaOutput - The return type for the summarizeTradeIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockTradeIdeaSchema = z.object({
  instrumentType: z.literal('STOCK'),
  note: z.string().describe('Creator raw note for the stock trade idea.'),
  ticker: z.string().describe('Stock ticker symbol.'),
  direction: z.enum(['LONG', 'SHORT']).describe('Direction of the trade.'),
  action: z.enum(['BUY', 'SELL', 'HOLD']).describe('Recommended action.'),
  timeframe: z.enum(['SCALP', 'SWING', 'LONG']).describe('Timeframe of the trade.'),
  entryPlan: z.string().optional().describe('Plan for entry into the trade.'),
  stopLoss: z.string().optional().describe('Stop loss level.'),
  invalidation: z.string().optional().describe('Invalidation criteria for the trade.'),
});

const OptionLegSchema = z.object({
  side: z.enum(['BUY', 'SELL']).describe('Side of the option leg.'),
  type: z.enum(['CALL', 'PUT']).describe('Type of the option (CALL or PUT).'),
  strike: z.number().describe('Strike price of the option.'),
  expiration: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Expiration date in YYYY-MM-DD format.'),
  contracts: z.number().int().positive().describe('Number of contracts.'),
});

const OptionsTradeIdeaSchema = z.object({
  instrumentType: z.literal('OPTIONS'),
  note: z.string().describe('Creator raw note for the options trade idea.'),
  underlying: z.string().describe('Underlying asset ticker symbol.'),
  strategyType: z.enum(['SINGLE', 'VERTICAL_SPREAD']).describe('Type of options strategy.'),
  legs: z.array(OptionLegSchema).min(1).max(2).describe('Array of option legs.'),
});

const SummarizeTradeIdeaInputSchema = z.discriminatedUnion('instrumentType', [
  StockTradeIdeaSchema,
  OptionsTradeIdeaSchema,
]).describe('Input for summarizing a trade idea.');
export type SummarizeTradeIdeaInput = z.infer<typeof SummarizeTradeIdeaInputSchema>;

const SummarizeTradeIdeaOutputSchema = z.object({
  aiSummaryBullets: z.array(z.string()).length(3).describe('Three concise bullet-point summaries of the trade idea.'),
  riskLine: z.string().describe('A concise statement about the primary risks of the trade.'),
  payoffHint: z.string().describe('A concise hint about the potential payoff scenario.'),
  disclaimerLine: z.string().describe('A disclaimer line, always "For educational purposes only. Not financial advice."'),
}).describe('Output for summarizing a trade idea.');
export type SummarizeTradeIdeaOutput = z.infer<typeof SummarizeTradeIdeaOutputSchema>;

export async function summarizeTradeIdea(input: SummarizeTradeIdeaInput): Promise<SummarizeTradeIdeaOutput> {
  return summarizeTradeIdeaFlow(input);
}

const summarizeTradeIdeaPrompt = ai.definePrompt({
  name: 'summarizeTradeIdeaPrompt',
  input: {schema: SummarizeTradeIdeaInputSchema},
  output: {schema: SummarizeTradeIdeaOutputSchema},
  system: `You are AlphaBot. You provide concise research-style market commentary and risk-aware explanations.
You do NOT provide financial advice. You focus on probability, risk management, and scenario analysis.
For options, explain bullish/bearish/neutral, defined vs undefined risk (if inferable), and mention key risks like time decay, volatility, assignment when relevant.
Tone: professional, research-note style. Output: short paragraphs + bullet points.
If user requests guaranteed profits or extreme leverage, warn about risks.`,
  prompt: `Summarize the following trade idea. Provide exactly 3 bullet points for the summary, a single risk line, and a single payoff hint. Ensure the disclaimer line is always 'For educational purposes only. Not financial advice.'.

Trade Idea:
Instrument Type: {{{instrumentType}}}
Note: {{{note}}}

{{#if (eq instrumentType 'STOCK')}}
Stock Ticker: {{{ticker}}}
Direction: {{{direction}}}
Action: {{{action}}}
Timeframe: {{{timeframe}}}
{{#if entryPlan}}Entry Plan: {{{entryPlan}}}{{/if}}
{{#if stopLoss}}Stop Loss: {{{stopLoss}}}{{/if}}
{{#if invalidation}}Invalidation: {{{invalidation}}}{{/if}}
{{/if}}

{{#if (eq instrumentType 'OPTIONS')}}
Underlying: {{{underlying}}}
Strategy Type: {{{strategyType}}}
Option Legs:
{{#each legs}}
- Side: {{{side}}}, Type: {{{type}}}, Strike: {{{strike}}}, Expiration: {{{expiration}}}, Contracts: {{{contracts}}}
{{/each}}
{{/if}}
`,
});

const summarizeTradeIdeaFlow = ai.defineFlow(
  {
    name: 'summarizeTradeIdeaFlow',
    inputSchema: SummarizeTradeIdeaInputSchema,
    outputSchema: SummarizeTradeIdeaOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeTradeIdeaPrompt(input);
    if (!output) {
      throw new Error('Failed to generate trade idea summary.');
    }
    // Ensure the disclaimer line is always the same, as requested.
    output.disclaimerLine = 'For educational purposes only. Not financial advice.';
    return output;
  }
);
