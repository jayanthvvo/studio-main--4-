// src/app/submissions/[id]/page.tsx
/*
 * MODIFICATION:
 * - Added a single file uploader to the "AI Analysis" card.
 * - This page now manages extracting text from the PDF.
 * - Passes the extracted text as a prop to AI components.
 */
"use client";

import { useEffect, useState, ChangeEvent } from 'react'; // <-- ADDED ChangeEvent
import { useAuth } from '@/contexts/auth-context';
import { Submission } from '@/lib/types';
import { Loader2, ArrowLeft, Download, FileUp, Sparkles } from 'lucide-react'; // <-- ADDED FileUp, Sparkles
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/submission/review-form';
import SubmissionSummary from "@/components/ai/submission-summary";
import PlagiarismCheck from "@/components/ai/plagiarism-check";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label'; // <-- ADDED
import { Input } from '@/components/ui/input'; // <-- ADDED
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // <-- ADDED

// Declare pdfjsLib at the window level for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function SubmissionPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // --- NEW STATE FOR AI ANALYSIS ---
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  // --- END NEW STATE ---

  useEffect(() => {
    // ... (existing useEffect for fetchSubmission) ...
    const constructSubmissionWithUrl = (data: any) => {
        const downloadUrl = data.fileName
         ? `/api/download/${data._id}/${encodeURIComponent(data.fileName)}`
         : null;
        return {
          ...data,
          id: data._id, 
          grade: data.grade !== undefined ? data.grade : null,
          feedback: data.feedback !== undefined ? data.feedback : null,
          downloadUrl
        };
    };

    if (!id || !user) return;

    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch(`/api/submissions/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
           const errorData = await response.json();
          throw new Error(errorData.error || 'Submission not found or you do not have permission.');
        }
        const data = await response.json();
        setSubmission(constructSubmissionWithUrl(data));
      } catch (error: any) {
        console.error("Failed to fetch submission:", error);
        toast({ 
           title: "Error",
           description: error.message || "Could not load submission details.",
           variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id, router, user, toast]);

  const handleDownload = async () => {
    // ... (existing handleDownload function) ...
    if (!submission?.downloadUrl || !submission.fileName || !user) {
      toast({
        title: "Download Error",
        description: "File URL or filename is missing.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true); 

    try {
      const token = await user.getIdToken();
      const response = await fetch(submission.downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to download file (Status: ${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', submission.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // --- NEW PDF EXTRACTION FUNCTIONS ---
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
   * Handles file selection, extraction, and sets the text in state
   */
  const handleFileChangeForAnalysis = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setExtractionError("Please select a file.");
      return;
    }
    if (file.type !== 'application/pdf') {
      setExtractionError('Please select a valid PDF file.');
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractedText(null);

    try {
      const text = await getTextFromPDF(file);
      if (text.trim().length === 0) {
        throw new Error("Could not extract any text from this PDF.");
      }
      setExtractedText(text);
      toast({ title: "File Ready for Analysis" });
    } catch (err: any) {
      setExtractionError(err.message);
    } finally {
      setIsExtracting(false);
      event.target.value = ""; // Clear file input
    }
  };
  // --- END NEW PDF FUNCTIONS ---


  if (loading || !submission) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Submissions
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>{submission.title}</CardTitle>
                      <CardDescription>
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </CardDescription>
                  </div>
                  {submission.fileName && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={downloading}
                    >
                      {downloading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <Download className="mr-2 h-4 w-4" />
                      )}
                      Download File
                    </Button>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{submission.content}</p>
              {submission.fileName && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium">Attached File:</p>
                    <p className="text-sm text-muted-foreground">{submission.fileName} ({submission.fileType})</p>
                </div>
              )}
            </CardContent>
          </Card>
          <ReviewForm submission={submission} />
        </div>

        <div className="space-y-6">
             <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                        <AvatarImage src={submission.student.avatarUrl} alt={submission.student.name} />
                        <AvatarFallback>{submission.student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{submission.student.name}</CardTitle>
                        <CardDescription>Student</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                <Badge>{submission.status}</Badge>
                {submission.grade && <p className="mt-2 font-bold">Grade: {submission.grade}</p>}
                </CardContent>
            </Card>

           <Card>
             <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {/* --- MODIFICATION: ADDED FILE UPLOADER --- */}
                <div className="space-y-2">
                  <Label htmlFor="ai-file-upload" className="font-semibold">
                    Upload PDF for Analysis
                  </Label>
                  <Button asChild variant="outline" className="relative cursor-pointer w-full" disabled={isExtracting}>
                    <Label htmlFor="ai-file-upload" className="cursor-pointer w-full">
                      {isExtracting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileUp className="mr-2 h-4 w-4" />
                      )}
                      {isExtracting ? "Extracting text..." : (extractedText ? "File Loaded" : "Choose file...")}
                    </Label>
                  </Button>
                  <Input
                    id="ai-file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChangeForAnalysis}
                    className="hidden" // Hide the default ugly input
                    disabled={isExtracting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {submission.fileName ? "You can re-upload the downloaded submission here." : "No file attached to this submission."}
                  </p>
                </div>
                
                {extractionError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{extractionError}</AlertDescription>
                  </Alert>
                )}
                
                {extractedText && (
                  <Alert variant="default">
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>File Ready</AlertTitle>
                    <AlertDescription>
                      PDF text extracted. You can now run the AI tools below.
                    </AlertDescription>
                  </Alert>
                )}
                {/* --- END MODIFICATION --- */}

                {/* --- MODIFICATION: Pass extracted text as prop --- */}
                <SubmissionSummary extractedText={extractedText} />
                <Separator />
                <PlagiarismCheck extractedText={extractedText} />
                {/* --- END MODIFICATION --- */}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}