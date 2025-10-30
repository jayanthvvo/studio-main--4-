"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkPlagiarism, CheckPlagiarismOutput } from "@/ai/flows/check-plagiarism";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// --- NEW IMPORTS ---
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function PlagiarismCheck({ text }: { text: string }) {
  const [result, setResult] = useState<CheckPlagiarismOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for the text area, pre-filled
  const [textContent, setTextContent] = useState(text);

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      // Check the content from the text area
      const checkResult = await checkPlagiarism({ text: textContent });
      setResult(checkResult);
    } catch (e) {
      setError("Failed to perform plagiarism check. Please try again.");
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* --- TEXT AREA ADDED DIRECTLY --- */}
      <div className="grid w-full gap-2">
        <Label htmlFor="plagiarism-text" className="text-xs font-semibold">
          Text to Check
        </Label>
        <Textarea
          id="plagiarism-text"
          placeholder="Paste text here..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="min-h-[150px] max-h-[25vh] text-sm"
          disabled={isLoading}
        />
      </div>
      {/* --- END TEXT AREA --- */}

      <Button onClick={handleCheck} disabled={isLoading || !textContent.trim()} variant="outline" className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShieldAlert className="mr-2 h-4 w-4" />
        )}
        Check for Plagiarism
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && (
        <Alert variant={result.isPlagiarized ? "destructive" : "default"}>
          {result.isPlagiarized ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          <AlertTitle>
            {result.isPlagiarized ? "Potential Plagiarism Detected" : "No Plagiarism Detected"}
          </AlertTitle>
          <AlertDescription className="max-h-[20vh] overflow-y-auto whitespace-pre-wrap">
            {result.isPlagiarized ? result.explanation : "The text appears to be original."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}