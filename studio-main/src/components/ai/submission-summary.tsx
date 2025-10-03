"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { summarizeSubmission, SummarizeSubmissionOutput } from "@/ai/flows/summarize-submission";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SubmissionSummary({ submissionContent }: { submissionContent: string }) {
  const [summary, setSummary] = useState<SummarizeSubmissionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await summarizeSubmission({ submissionContent });
      setSummary(result);
    } catch (e) {
      setError("Failed to generate summary. Please try again.");
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleSummarize} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate AI Summary
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {summary && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>AI Summary</AlertTitle>
          <AlertDescription>{summary.summary}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
