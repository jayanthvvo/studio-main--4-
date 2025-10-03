'use server';

/**
 * @fileOverview Checks the given text for plagiarism using an AI model.
 *
 * - checkPlagiarism - A function that checks for plagiarism in a given text.
 * - CheckPlagiarismInput - The input type for the checkPlagiarism function.
 * - CheckPlagiarismOutput - The return type for the checkPlagiarism function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckPlagiarismInputSchema = z.object({
  text: z
    .string()
    .describe('The text to check for plagiarism.'),
});
export type CheckPlagiarismInput = z.infer<typeof CheckPlagiarismInputSchema>;

const CheckPlagiarismOutputSchema = z.object({
  isPlagiarized: z
    .boolean()
    .describe('Whether or not the text is likely plagiarized.'),
  explanation: z
    .string()
    .describe('Explanation of why the text is plagiarized.'),
});
export type CheckPlagiarismOutput = z.infer<typeof CheckPlagiarismOutputSchema>;

export async function checkPlagiarism(input: CheckPlagiarismInput): Promise<CheckPlagiarismOutput> {
  return checkPlagiarismFlow(input);
}

const checkPlagiarismPrompt = ai.definePrompt({
  name: 'checkPlagiarismPrompt',
  input: {schema: CheckPlagiarismInputSchema},
  output: {schema: CheckPlagiarismOutputSchema},
  prompt: `You are an expert in plagiarism detection.

You will be given a text, and you will determine whether it is likely plagiarized or not.

If the text is plagiarized, provide a detailed explanation of why you think so.

Text: {{{text}}}`,
});

const checkPlagiarismFlow = ai.defineFlow(
  {
    name: 'checkPlagiarismFlow',
    inputSchema: CheckPlagiarismInputSchema,
    outputSchema: CheckPlagiarismOutputSchema,
  },
  async input => {
    const {output} = await checkPlagiarismPrompt(input);
    return output!;
  }
);
