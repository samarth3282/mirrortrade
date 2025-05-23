// Risk assessment flow to assess the risk of replicating a friend's trade.
'use server';
/**
 * @fileOverview AI-powered risk assessment for trade replication.
 *
 * - assessTradeRisk - Assesses the risk associated with a trade.
 * - AssessTradeRiskInput - The input type for the assessTradeRisk function.
 * - AssessTradeRiskOutput - The return type for the assessTradeRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessTradeRiskInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  quantity: z.number().describe('The number of shares to trade.'),
  price: z.number().describe('The price per share.'),
  accountBalance: z.number().describe('The current balance of the account.'),
  tradeHistory: z.string().describe('The recent trade history of the account.'),
  marketConditions: z.string().describe('The current market conditions.'),
});
export type AssessTradeRiskInput = z.infer<typeof AssessTradeRiskInputSchema>;

const AssessTradeRiskOutputSchema = z.object({
  riskScore: z.number().describe('A numerical risk score from 0 to 100, with higher values indicating higher risk.'),
  riskLevel: z
    .enum(['Low', 'Medium', 'High'])
    .describe('A qualitative assessment of the risk level (Low, Medium, or High).'),
  justification: z
    .string()
    .describe('A detailed explanation of the risk assessment, including factors considered.'),
  suggestedAction: z
    .string()
    .describe('A suggested action based on the risk assessment (e.g., Approve, Reduce Size, Reject).'),
});
export type AssessTradeRiskOutput = z.infer<typeof AssessTradeRiskOutputSchema>;

export async function assessTradeRisk(input: AssessTradeRiskInput): Promise<AssessTradeRiskOutput> {
  return assessTradeRiskFlow(input);
}

const assessTradeRiskPrompt = ai.definePrompt({
  name: 'assessTradeRiskPrompt',
  input: {schema: AssessTradeRiskInputSchema},
  output: {schema: AssessTradeRiskOutputSchema},
  prompt: `You are an AI-powered risk assessment tool for stock trades.

  Analyze the following information to determine the risk associated with the trade and suggest an action.

  Ticker: {{{ticker}}}
  Quantity: {{{quantity}}}
  Price: {{{price}}}
  Account Balance: {{{accountBalance}}}
  Trade History: {{{tradeHistory}}}
  Market Conditions: {{{marketConditions}}}

  Provide a risk score (0-100), a risk level (Low, Medium, High), a justification for the assessment, and a suggested action (Approve, Reduce Size, Reject).
  Ensure that the risk score, risk level, justification, and suggested action are all well reasoned, based on the trade information, trade history, and overall market conditions.
  Important: Consider how the account balance could be affected if the trade goes wrong.
  Important: The risk score should be based on a combination of possible loss, and the probability of that loss.
  Important: The justification should detail the reasoning to arrive at the risk score.
  Important: The suggested action should be based on the risk level (e.g., a high risk suggests a reject).
  Important: Do not suggest actions that would lead to margin calls.
  Important: Only suggest actions that can be taken within the context of replicating trades.
  `,
});

const assessTradeRiskFlow = ai.defineFlow(
  {
    name: 'assessTradeRiskFlow',
    inputSchema: AssessTradeRiskInputSchema,
    outputSchema: AssessTradeRiskOutputSchema,
  },
  async input => {
    const {output} = await assessTradeRiskPrompt(input);
    return output!;
  }
);
