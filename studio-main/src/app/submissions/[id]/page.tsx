/*
 * src/app/submissions/[id]/page.tsx
 * Corrected handleDownload to use fetch with Authorization header
 */
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Submission } from '@/lib/types';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/submission/review-form';
import SubmissionSummary from "@/components/ai/submission-summary";
import PlagiarismCheck from "@/components/ai/plagiarism-check";
import { useToast } from "@/hooks/use-toast"; // <-- Import useToast

export default function SubmissionPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false); // <-- Add downloading state
  const router = useRouter();
  const { toast } = useToast(); // <-- Initialize toast

  useEffect(() => {
    // --- Construct the download URL on the client-side ---
    // This assumes the API route exists at /api/download/[id]/[filename]
    const constructSubmissionWithUrl = (data: any) => {
        const downloadUrl = data.fileName
         ? `/api/download/${data._id}/${encodeURIComponent(data.fileName)}`
         : null;
        // Ensure grade and feedback are included, defaulting to null if missing
        return {
          ...data,
          id: data._id, // Ensure id is set correctly
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
        // --- Use the helper function to set the state ---
        setSubmission(constructSubmissionWithUrl(data));
      } catch (error: any) {
        console.error("Failed to fetch submission:", error);
        toast({ // <-- Add toast for fetch error
           title: "Error",
           description: error.message || "Could not load submission details.",
           variant: "destructive"
        });
        // Optional: Redirect back or show error state
        // router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  // --- Add toast to dependency array ---
  }, [id, router, user, toast]);

  // --- MODIFICATION: Updated handleDownload function ---
  const handleDownload = async () => {
    if (!submission?.downloadUrl || !submission.fileName || !user) {
      toast({
        title: "Download Error",
        description: "File URL or filename is missing.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true); // Set downloading state

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

      // Get the file content as a Blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', submission.fileName); // Use the original filename
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary link and URL
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
      setDownloading(false); // Reset downloading state
    }
  };
  // --- END MODIFICATION ---

  if (loading || !submission) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // --- (Rest of the component remains the same) ---
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
                      disabled={downloading} // <-- Disable button while downloading
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
                <SubmissionSummary submissionContent={submission.content} />
                <Separator />
                <PlagiarismCheck text={submission.content} />
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

// Keep the type augmentation if you modified types.ts directly
// Otherwise, remove this if fileData is now in types.ts
// declare module '@/lib/types' {
//   interface Submission {
//     downloadUrl?: string | null;
//   }
// }