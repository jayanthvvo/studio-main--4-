
"use client";

import { getSubmissionById } from "@/lib/data";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileSearch, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import type { Submission } from "@/lib/types";

const statusInfo: { [key: string]: { icon: React.ElementType, variant: "default" | "secondary" | "destructive" | "outline" } } = {
  Approved: { icon: CheckCircle, variant: "default" },
  "In Review": { icon: FileSearch, variant: "secondary" },
  "Requires Revisions": { icon: AlertCircle, variant: "destructive" },
  Pending: { icon: Clock, variant: "outline" },
};

export default function StudentSubmissionPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const { id } = params;
    const foundSubmission = getSubmissionById(id);
    if (foundSubmission) {
      setSubmission(foundSubmission);
    } else {
      // In a real app, you might want to show a proper not found page
      notFound();
    }
  }, [params]);

  if (!submission) {
    return null; // or a loading spinner
  }
  
  const StatusIcon = statusInfo[submission.status].icon;

  return (
    <div className="space-y-6">
      <Link href="/student/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">{submission.title}</h1>
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
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Submission Content
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {submission.content}
                    </p>
                </CardContent>
            </Card>

            {submission.feedback && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                           Supervisor Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {submission.feedback}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between"><span>Submitted At:</span> <span className="font-medium">{submission.submittedAt || 'N/A'}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span>Deadline:</span> <span className="font-medium">{submission.deadline}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span>Grade:</span> <span className="font-medium">{submission.grade || 'Not Graded'}</span></div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
