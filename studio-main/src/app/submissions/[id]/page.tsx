"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, UserCircle } from "lucide-react";
import { Submission } from "@/lib/types";
import { ReviewForm } from "@/components/submission/review-form"; // <-- UNCOMMENTED
import { Separator } from "@/components/ui/separator";
// We'll keep these commented for now until we build the AI features
// import { SubmissionSummary } from "@/components/ai/submission-summary";
// import { PlagiarismCheck } from "@/components/ai/plagiarism-check";

export default function SubmissionPage() {
  const params = useParams();
  const id = params.id as string; 
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/submissions/${id}`);
        if (!response.ok) {
          throw new Error('Submission not found');
        }
        const data = await response.json();
        setSubmission({ ...data, id: data._id });
      } catch (error) {
        console.error("Failed to fetch submission:", error);
        router.push('/dashboard/submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, router]);

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
              <CardTitle>{submission.title}</CardTitle>
              <CardDescription>
                Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{submission.content}</p>
            </CardContent>
          </Card>
          <ReviewForm submission={submission} /> {/* <-- UNCOMMENTED */}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
               <UserCircle className="h-10 w-10 text-muted-foreground" />
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
           {/* <SubmissionSummary submission={submission} /> */}
           <Separator />
           {/* <PlagiarismCheck submission={submission} /> */}
        </div>
      </div>
    </div>
  );
}