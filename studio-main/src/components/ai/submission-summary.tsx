// src/components/ai/submission-summary.tsx
"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// We still export this type for the parent component to use
export type { SummarizeSubmissionOutput } from "@/ai/flows/summarize-submission";
import { SummarizeSubmissionOutput } from "@/ai/flows/summarize-submission";

// NEW: Define props to accept summary result and loading state
interface SubmissionSummaryProps {
  summary: SummarizeSubmissionOutput | null;
  isLoading: boolean;
}

export default function SubmissionSummary({ summary, isLoading }: SubmissionSummaryProps) {
  return (
    <div className="space-y-4 min-h-[4rem] flex items-center justify-center">
      {isLoading && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating summary...
        </div>
      )}
      
      {summary && !isLoading && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>AI Summary</AlertTitle>
          <AlertDescription>
            <div className="max-h-[20vh] overflow-y-auto whitespace-pre-wrap">
              {summary.summary}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!summary && !isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Run AI Analysis to generate a summary.
        </p>
      )}
    </div>
  );
}