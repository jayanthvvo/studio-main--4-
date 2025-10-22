/*
 * src/app/student/submissions/new/page.tsx
 * Added missing imports for UI components and event types
 */
"use client";

import { Button } from "@/components/ui/button";
// --- MODIFICATION: Added missing imports ---
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added Label import
import { Textarea } from "@/components/ui/textarea"; // Added Textarea import
// --- End Modification ---
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Milestone } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
// --- MODIFICATION: Import ChangeEvent type ---
import { useState, FormEvent, useEffect, ChangeEvent } from "react";
// --- End Modification ---


// Define max file size (10MB in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function NewSubmissionPage() {
  const [actionableMilestone, setActionableMilestone] = useState<Milestone | null>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // ... (fetchActionableMilestone logic remains the same) ...
     if (!user) return;

    const fetchActionableMilestone = async () => {
        setLoadingMilestones(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/milestones', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || "Could not fetch your current milestone.");
            }
            const allMilestones: Milestone[] = await response.json();
            const nextMilestone = allMilestones.find(m => m.status === 'In Progress' || m.status === 'Pending');

            if (nextMilestone) {
                if (nextMilestone.status === 'Pending') {
                     setError(`Milestone "${nextMilestone.title}" is pending. Please wait for your supervisor to set a due date.`);
                     setActionableMilestone(null);
                } else {
                    setActionableMilestone(nextMilestone);
                }
            } else {
                 const completed = allMilestones.every(m => m.status === 'Complete');
                 if (completed && allMilestones.length > 0) {
                     setError("Congratulations! All milestones are complete.");
                 } else if (allMilestones.length === 0) {
                     setError("No dissertation project assigned yet.");
                 }
                 else {
                    setError("You have no active or pending milestones awaiting submission.");
                 }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingMilestones(false);
        }
    };

    fetchActionableMilestone();
  }, [user]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadStatus(null);

    if (!user || !actionableMilestone) {
      setError("Cannot submit: No active milestone or user session found.");
      return;
    }

    if (file) {
      if (file.type !== "application/pdf") {
        setError("Invalid file type. Only PDF files are allowed.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("content", content);
      if (file) {
        formData.append("file", file);
        setUploadStatus("Uploading file and submitting details...");
      } else {
         setUploadStatus("Submitting details...");
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create submission.');
      }

      toast({
        title: "Submission Successful",
        description: `Your submission for "${actionableMilestone.title}" has been received.`,
      });
      router.push('/student/dashboard');

    } catch (error: any) {
      console.error("Submission Error:", error);
      setError(`Submission failed: ${error.message}`);
      setUploadStatus(null);
    } finally {
      setIsLoading(false);
    }
  };


    if (loadingMilestones) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

   if (!loadingMilestones && !actionableMilestone && error) {
      return (
         <div className="space-y-6">
              <Alert variant="destructive">
                  <AlertTitle>Cannot Submit</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
         </div>
      );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Submission</CardTitle>
          <CardDescription>
             Submit your work for the milestone: <span className="font-semibold">{actionableMilestone?.title || '...'}</span>
          </CardDescription>
        </CardHeader>
        {/* --- MODIFICATION: Added CardContent wrapper --- */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && !isLoading && (
                <Alert variant="destructive">
                    <AlertTitle>Submission Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
             {uploadStatus && isLoading && (
                 <Alert variant="default">
                    <AlertTitle>Status</AlertTitle>
                    <AlertDescription>{uploadStatus}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="milestone-title">Milestone</Label>
                <Input
                    id="milestone-title"
                    type="text"
                    readOnly
                    value={actionableMilestone?.title || 'Loading...'}
                    className="font-semibold"
                />
                 <p className="text-sm text-muted-foreground">
                    Due Date: {actionableMilestone?.dueDate || 'Not Set'}
                 </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Your Comments / Content</Label>
              {/* --- MODIFICATION: Added explicit type to 'e' --- */}
              <Textarea
                id="content"
                placeholder="Add any comments for your supervisor here, or paste text content if not attaching a file..."
                required={!file}
                value={content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                disabled={isLoading || !actionableMilestone}
                rows={10}
              />
               <p className="text-xs text-muted-foreground">
                    Required if not attaching a PDF file.
                </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload PDF File (Optional, Max 10MB)</Label>
               <div className="flex items-center gap-2">
                    {/* --- MODIFICATION: Added explicit type to 'e' --- */}
                    <Input
                        id="file"
                        type="file"
                        accept="application/pdf"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null)}
                        disabled={isLoading || !actionableMilestone}
                        className="flex-grow"
                    />
               </div>
               {file && <p className="text-sm text-muted-foreground">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                <p className="text-xs text-muted-foreground">
                    If you upload a file, its content will be used for AI analysis (if applicable).
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !actionableMilestone}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Milestone
            </Button>
          </form>
        </CardContent>
        {/* --- End Modification --- */}
      </Card>
    </div>
  );
}