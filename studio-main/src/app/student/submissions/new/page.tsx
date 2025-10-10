// src/app/student/submissions/new/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Milestone } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";

export default function NewSubmissionPage() {
  const [actionableMilestone, setActionableMilestone] = useState<Milestone | null>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMilestones, setLoadingMilestones] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    const fetchActionableMilestone = async () => {
        setLoadingMilestones(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/milestones', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error("Could not fetch your current milestone.");
            }
            const allMilestones: Milestone[] = await response.json();
            const nextMilestone = allMilestones.find(m => m.status === 'In Progress');

            if (nextMilestone) {
                setActionableMilestone(nextMilestone);
            } else {
                setError("You have no active milestones awaiting submission.");
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
    if (!user || !actionableMilestone) {
      setError("Cannot submit: No active milestone found.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // --- MODIFICATION: Title is no longer sent to the backend ---
        body: JSON.stringify({
          content,
          fileName: file?.name,
          fileType: file?.type,
        }),
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
      setError(error.message);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Submission</CardTitle>
          <CardDescription>
            Submit your work for the next milestone in your dissertation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Submission Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="milestone-title">Milestone</Label>
                <Input
                    id="milestone-title"
                    type="text"
                    readOnly
                    value={actionableMilestone?.title || 'No active milestone'}
                    className="font-semibold"
                />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Your Comments</Label>
              <Textarea
                id="content"
                placeholder="Add any comments for your supervisor here..."
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading || !actionableMilestone}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File (Optional)</Label>
               <div className="flex items-center gap-2">
                    <Input
                        id="file"
                        type="file"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        disabled={isLoading || !actionableMilestone}
                        className="flex-grow"
                    />
               </div>
               {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !actionableMilestone}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Milestone
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}