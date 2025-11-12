// src/components/ai/plagiarism-check.tsx
"use client";

import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// We still export this type for the parent component to use
export type { CheckPlagiarismOutput } from "@/ai/flows/check-plagiarism";
import { CheckPlagiarismOutput } from "@/ai/flows/check-plagiarism";
import { cn } from "@/lib/utils"; // Import cn utility

// Define props to accept plagiarism result and loading state
interface PlagiarismCheckProps {
  result: CheckPlagiarismOutput | null;
  isLoading: boolean;
}

export default function PlagiarismCheck({ result, isLoading }: PlagiarismCheckProps) {
  // --- FIX: Add a safe check for the percentage ---
  // This checks that result exists AND that plagiarismPercentage is a number
  const hasPercentage = result && typeof result.plagiarismPercentage === 'number';

  return (
    <div className="space-y-4 min-h-[4rem] flex items-center justify-center">
      {isLoading && (
         <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running plagiarism check...
        </div>
      )}

      {/* This first check is still correct: only render if result is truthy */}
      {result && !isLoading && (
        <Alert variant={result.isPlagiarized ? "destructive" : "default"}>
          {result.isPlagiarized ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          
          <div className="flex justify-between items-center">
            <AlertTitle>
              {result.isPlagiarized ? "Potential Plagiarism Detected" : "No Plagiarism Detected"}
            </AlertTitle>
            
            {/* --- FIX: Use the 'hasPercentage' boolean check before rendering --- */}
            {hasPercentage && (
              <span 
                className={cn(
                  "font-semibold text-sm",
                  result.isPlagiarized ? "text-destructive-foreground" : "text-foreground"
                )}
              >
                {/* We can now safely call .toFixed() */}
                {result.plagiarismPercentage!.toFixed(0)}% Match
              </span>
            )}
            {/* --- END FIX --- */}
          </div>

          <AlertDescription className="max-h-[20vh] overflow-y-auto whitespace-pre-wrap pt-2">
            {/* Added a fallback just in case explanation is also missing */}
            {result.explanation || "No explanation provided."}
          </AlertDescription>
        </Alert>
      )}

      {!result && !isLoading && (
         <p className="text-xs text-muted-foreground text-center">
           Run AI Analysis to check for plagiarism.
         </p>
      )}
    </div>
  );
}