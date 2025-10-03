"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkPlagiarism, CheckPlagiarismOutput } from "@/ai/flows/check-plagiarism";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PlagiarismCheck({ text }: { text: string }) {
  const [result, setResult] = useState<CheckPlagiarismOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const checkResult = await checkPlagiarism({ text });
      setResult(checkResult);
    } catch (e) {
      setError("Failed to perform plagiarism check. Please try again.");
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCheck} disabled={isLoading} variant="outline" className="w-full">
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
          <AlertDescription>
            {result.isPlagiarized ? result.explanation : "The text appears to be original."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
