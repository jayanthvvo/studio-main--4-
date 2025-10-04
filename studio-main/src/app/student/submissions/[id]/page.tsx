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
import { ArrowLeft, Loader2, MessageSquareQuote } from "lucide-react";
import { Submission } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

export default function StudentSubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth(); // Get user for auth token

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id || !user) return;

    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        // We can reuse the same API endpoint, just need to secure it
        const response = await fetch(`/api/submissions/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Submission not found or you do not have permission.');
        }
        const data = await response.json();
        setSubmission({ ...data, id: data._id });
      } catch (error) {
        console.error("Failed to fetch submission:", error);
        router.push('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, router, user]);

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
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{submission.status}</Badge>
              {submission.grade && <p className="mt-4 text-2xl font-bold">Grade: {submission.grade}</p>}
            </CardContent>
          </Card>
          
          {submission.feedback && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquareQuote className="h-5 w-5" />
                        Supervisor Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{submission.feedback}</p>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}