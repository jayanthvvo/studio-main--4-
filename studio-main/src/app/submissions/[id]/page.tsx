"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { Submission } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from '@/components/submission/review-form';
import SubmissionSummary from "@/components/ai/submission-summary";
import PlagiarismCheck from "@/components/ai/plagiarism-check";

export default function SubmissionPage() {
  const params = useParams();
  const id = params.id as string; 
  
  const { user } = useAuth(); // Get the user from the auth context
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // --- MODIFICATION: Make sure we have a user before fetching ---
    if (!id || !user) return;

    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken(); // Get the auth token
        const response = await fetch(`/api/submissions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the token to the request
            }
        });
        if (!response.ok) {
          throw new Error('Submission not found or you do not have permission.');
        }
        const data = await response.json();
        setSubmission({ ...data, id: data._id });
      } catch (error) {
        console.error("Failed to fetch submission:", error);
        router.push('/dashboard'); 
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, router, user]); // Add user to dependency array

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