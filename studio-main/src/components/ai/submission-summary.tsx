// src/components/ai/submission-summary.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { summarizeSubmission, SummarizeSubmissionOutput } from "@/ai/flows/summarize-submission";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

// NEW: Define props to accept extracted text
interface SubmissionSummaryProps {
  extractedText: string | null;
}

export default function SubmissionSummary({ extractedText }: SubmissionSummaryProps) {
  const [summary, setSummary] = useState<SummarizeSubmissionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Handles the API call to generate a summary
   */
  const handleGenerateSummary = async () => {
    if (!extractedText || !user) {
      setError("No text available to summarize. Please upload a PDF first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // 1. Get auth token
      const token = await user.getIdToken();

      // 2. Call our secure backend with the *text*
      const response = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: extractedText }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get summary.");

      // 3. Set the result
      setSummary({ summary: data.summary, progress: "Summary complete." });
      toast({ title: "Summary Complete!" });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGenerateSummary} 
        disabled={isLoading || !extractedText} 
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Summarizing..." : "Generate Summary"}
      </Button>

      {!extractedText && !isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Upload a PDF above to enable summary.
        </p>
      )}

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
          <AlertDescription>
            <div className="max-h-[20vh] overflow-y-auto whitespace-pre-wrap">
              {summary.summary}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}