// src/components/ai/submission-summary.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { summarizeSubmission, SummarizeSubmissionOutput } from "@/ai/flows/summarize-submission";
import { Loader2, Sparkles, FileUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Use Input for file
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

// Declare pdfjsLib at the window level for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// The component no longer needs submissionContent, so we remove it from props
export default function SubmissionSummary() {
  const [summary, setSummary] = useState<SummarizeSubmissionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Extracts text content from a PDF file using client-side pdf.js
   */
  async function getTextFromPDF(file: File): Promise<string> {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js library is not loaded. Please refresh the page.");
    }
    
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdfDoc = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = '';

          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
          }
          resolve(fullText);
        } catch (error: any) {
          reject(new Error(`PDF Parsing Error: ${error.message}`));
        }
      };
      fileReader.onerror = () => reject(new Error('Error reading the file.'));
      fileReader.readAsArrayBuffer(file);
    });
  }

  /**
   * Handles file selection, extraction, and API call
   */
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      setError("Please select a file.");
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // 1. Extract text in the browser (client-side)
      setStatusMessage("Extracting text...");
      const textToSummarize = await getTextFromPDF(file);

      if (textToSummarize.trim().length === 0) {
        throw new Error("Could not extract any text from this PDF.");
      }

      // 2. Get auth token
      const token = await user.getIdToken();

      // 3. Call our secure backend with the *text*
      setStatusMessage("Summarizing with AI...");
      const response = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textToSummarize }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get summary.");

      // 4. Set the result
      setSummary({ summary: data.summary, progress: "Summary complete." });
      toast({ title: "Summary Complete!" });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
      event.target.value = ""; // Clear file input
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-2">
        <Label htmlFor="summary-file-upload" className="text-xs font-semibold">
          Upload PDF to Summarize
        </Label>
        
        {/* This is the file input, styled to look like a button */}
        <Button asChild variant="outline" className="relative cursor-pointer" disabled={isLoading}>
          <Label htmlFor="summary-file-upload" className="cursor-pointer w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-4 w-4" />
            )}
            {isLoading ? statusMessage : "Choose file..."}
          </Label>
        </Button>
        <Input
          id="summary-file-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden" // Hide the default ugly input
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Download the submission, then upload it here for analysis.
        </p>
      </div>

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