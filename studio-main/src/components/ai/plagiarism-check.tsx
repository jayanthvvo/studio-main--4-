// src/components/ai/plagiarism-check.tsx
"use client";

import { useState } from  "react";
import { Button } from "@/components/ui/button";
import { checkPlagiarism, CheckPlagiarismOutput } from "@/ai/flows/check-plagiarism";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

// NEW: Define props to accept extracted text
interface PlagiarismCheckProps {
  extractedText: string | null;
}

export default function PlagiarismCheck({ extractedText }: PlagiarismCheckProps) {
  const [result, setResult] = useState<CheckPlagiarismOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Handles the API call to check for plagiarism
   */
  const handleRunCheck = async () => {
    if (!extractedText || !user) {
      setError("No text available to check. Please upload a PDF first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Get auth token
      const token = await user.getIdToken();

      // 2. Call our secure backend with the *text*
      const response = await fetch('/api/check-plagiarism-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: extractedText }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to run check.");

      // 3. Set the result
      setResult(data);
      toast({ title: "Plagiarism Check Complete!" });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleRunCheck} 
        disabled={isLoading || !extractedText} 
        className="w-full"
        variant="outline"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShieldAlert className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Checking..." : "Run Plagiarism Check"}
      </Button>

      {!extractedText && !isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Upload a PDF above to enable check.
        </p>
      )}
      
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