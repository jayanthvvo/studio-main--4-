"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { summarizeSubmission, SummarizeSubmissionOutput } from "@/ai/flows/summarize-submission";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// --- NEW IMPORTS ---
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SubmissionSummary({ submissionContent }: { submissionContent: string }) {
  const [summary, setSummary] = useState<SummarizeSubmissionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for the text area, pre-filled with submission content
  const [textContent, setTextContent] = useState(submissionContent);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      // Summarize the content *from the text area*
      const result = await summarizeSubmission({ submissionContent: textContent });
      setSummary(result);
    } catch (e) {
      setError("Failed to generate summary. Please try again.");
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* --- TEXT AREA ADDED DIRECTLY --- */}
      <div className="grid w-full gap-2">
        <Label htmlFor="summary-text" className="text-xs font-semibold">
          Text to Summarize
        </Label>
        <Textarea
          id="summary-text"
          placeholder="Paste text here..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="min-h-[150px] max-h-[25vh] text-sm"
          disabled={isLoading}
        />
      </div>
      {/* --- END TEXT AREA --- */}

      <Button onClick={handleSummarize} disabled={isLoading || !textContent.trim()} className="w-full">
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