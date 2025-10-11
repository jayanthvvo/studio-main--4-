"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { Submission } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function StudentSubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { user } = useAuth(); // Get the user from the auth context
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // --- MODIFICATION: Make sure we have a user before fetching ---
    if (user && id) {
      const fetchSubmission = async () => {
        try {
          const token = await user.getIdToken(); // Get the auth token
          const response = await fetch(`/api/submissions/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}` // Add the token to the request
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch submission details.');
          }
          const data = await response.json();
          setSubmission(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchSubmission();
    }
  }, [user, id]); // Add user to dependency array

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!submission) {
    return <div className="text-center mt-8">Submission not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{submission.title}</CardTitle>
          <CardDescription>
            Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <p className="font-medium text-lg">Status</p>
                <Badge variant={submission.status === 'Reviewed' ? 'default' : 'secondary'}>{submission.status}</Badge>
            </div>
            <Separator />
             <div>
                <p className="font-medium text-lg">Your Submission</p>
                <p className="whitespace-pre-wrap text-muted-foreground">{submission.content}</p>
            </div>
        </CardContent>
      </Card>

       {submission.feedback && (
         <Card>
            <CardHeader>
                <CardTitle>Supervisor Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                 <Alert>
                    <AlertTitle className="font-semibold">Grade: {submission.grade ?? 'Not Graded'}</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap mt-2">
                        {submission.feedback}
                    </AlertDescription>
                </Alert>
            </CardContent>
         </Card>
      )}

    </div>
  );
}