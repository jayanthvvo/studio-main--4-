
"use client";

import { getSubmissionById, submissions as initialSubmissions } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileSearch } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SubmissionSummary from "@/components/ai/submission-summary";
import PlagiarismCheck from "@/components/ai/plagiarism-check";
import ReviewForm from "@/components/submission/review-form";
import React from "react";
import type { Submission } from "@/lib/types";

const statusInfo: { [key: string]: { icon: React.ElementType, variant: "default" | "secondary" | "destructive" | "outline" } } = {
  Approved: { icon: CheckCircle, variant: "default" },
  "In Review": { icon: FileSearch, variant: "secondary" },
  "Requires Revisions": { icon: AlertCircle, variant: "destructive" },
  Pending: { icon: Clock, variant: "outline" },
};

export default function SubmissionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [submission, setSubmission] = React.useState<Submission | null>(null);

  React.useEffect(() => {
    const foundSubmission = getSubmissionById(id);
    if (foundSubmission) {
      setSubmission(foundSubmission);
    }
  }, [id]);

  React.useEffect(() => {
    // This is a workaround to update the submission data since we are using a static data source.
    // In a real app, this would be handled by re-fetching the data or using a state management library.
    if (submission) {
      const updatedSubmission = initialSubmissions.find(s => s.id === id);
      if (updatedSubmission && JSON.stringify(updatedSubmission) !== JSON.stringify(submission)) {
          setSubmission(updatedSubmission);
      }
    }
  }, [id, submission]);

  if (!submission) {
    // Render a loading state or return null until the submission is loaded client-side
    return null; 
  }
  
  const handleReviewSave = (updatedSubmission: Submission) => {
    // Update the submission in our mock data source.
    const index = initialSubmissions.findIndex(s => s.id === updatedSubmission.id);
    if (index !== -1) {
      initialSubmissions[index] = updatedSubmission;
    }
    setSubmission(updatedSubmission);
  };
  
  const StatusIcon = statusInfo[submission.status].icon;

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={submission.student.avatarUrl}
            alt={submission.student.name}
            width={64}
            height={64}
            className="rounded-full"
            data-ai-hint="student portrait"
          />
          <div>
            <h1 className="text-2xl font-bold font-headline">{submission.title}</h1>
            <p className="text-muted-foreground">by {submission.student.name}</p>
          </div>
        </div>
        <Badge variant={statusInfo[submission.status].variant} className="gap-2 text-base px-4 py-2">
            <StatusIcon className="h-4 w-4" />
            {submission.status}
        </Badge>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Submission Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {submission.content}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Supervisor Review</CardTitle>
                    <CardDescription>Provide feedback, a grade, and a new status for this submission.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewForm submission={submission} onSave={handleReviewSave} />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Assistant</CardTitle>
                    <CardDescription>Use AI tools to analyze the submission.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SubmissionSummary submissionContent={submission.content} />
                    <Separator />
                    <PlagiarismCheck text={submission.content} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between"><span>Submitted At:</span> <span className="font-medium">{submission.submittedAt || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Deadline:</span> <span className="font-medium">{submission.deadline}</span></div>
                    <div className="flex justify-between"><span>Current Grade:</span> <span className="font-medium">{submission.grade || 'Not Graded'}</span></div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
