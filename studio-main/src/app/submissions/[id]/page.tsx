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
import { ArrowLeft, Loader2, UserCircle, Download } from "lucide-react";
import { Submission } from "@/lib/types";
import { ReviewForm } from "@/components/submission/review-form";
import { Separator } from "@/components/ui/separator";
// AI feature components are commented out as they are not the focus of this change.
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
        // In a real app, this fetch should also be authenticated
        const response = await fetch(`/api/submissions/${id}`);
        if (!response.ok) {
          throw new Error('Submission not found or you do not have permission.');
        }
        const data = await response.json();
        setSubmission({ ...data, id: data._id });
      } catch (error) {
        console.error("Failed to fetch submission:", error);
        router.push('/dashboard'); // Redirect on error
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
              <Button asChild>
                <a 
                  href={submission.content} 
                  download={submission.fileName}
                  className="inline-flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Submitted File
                </a>
              </Button>
            </CardContent>
          </Card>
          <ReviewForm submission={submission} />
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
           {/* <SubmissionSummary submissionContent={submission.content} /> */}
           <Separator />
           {/* <PlagiarismCheck text={submission.content} /> */}
        </div>
      </div>
    </div>
  );
}