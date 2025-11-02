'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing student submissions for supervisors.
 *
 * - summarizeSubmission - An asynchronous function that takes student submission content as input and returns a summary.
 * - SummarizeSubmissionInput - The input type for the summarizeSubmission function, which includes the submission content.
 * - SummarizeSubmissionOutput - The output type for the summarizeSubmission function, which includes the summary and a progress message.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSubmissionInputSchema = z.object({
  submissionContent: z
    .string()
    .describe('The content of the student submission to be summarized.'),
});
export type SummarizeSubmissionInput = z.infer<typeof SummarizeSubmissionInputSchema>;

const SummarizeSubmissionOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the submission.'),
  progress: z.string().describe('Progress message indicating the status of the summarization.'),
});
export type SummarizeSubmissionOutput = z.infer<typeof SummarizeSubmissionOutputSchema>;

export async function summarizeSubmission(input: SummarizeSubmissionInput): Promise<SummarizeSubmissionOutput> {
  return summarizeSubmissionFlow(input);
}

const summarizeSubmissionPrompt = ai.definePrompt({
  name: 'summarizeSubmissionPrompt',
  input: {schema: SummarizeSubmissionInputSchema},
  output: {schema: SummarizeSubmissionOutputSchema},
  // --- MODIFICATION: Updated prompt to request bullet points ---
  prompt: `You are an AI assistant tasked with summarizing student dissertation submissions for supervisors. Provide a concise summary of the following submission content as a list of bullet points.

Submission Content:
{{{submissionContent}}}

Focus on the main points, key arguments, and research findings. The summary should be a list of bullet points, enabling the supervisor to quickly grasp the essence of the submission.

Respond with a summary (as bullet points) and a brief message explaining that the summarization is complete.`,
  // --- END MODIFICATION ---
});

const summarizeSubmissionFlow = ai.defineFlow(
  {
    name: 'summarizeSubmissionFlow',
    inputSchema: SummarizeSubmissionInputSchema,
    outputSchema: SummarizeSubmissionOutputSchema,
  },
  async input => {
    const {output} = await summarizeSubmissionPrompt(input);
    return {
      ...output!,
      progress: 'AI summarization of the submission is complete.',
    };
  }
);