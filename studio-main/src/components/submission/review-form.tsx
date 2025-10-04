"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Submission } from "@/lib/types";
import { useRouter } from "next/navigation";

// Define the props for the component, including the submission object
interface ReviewFormProps {
  submission: Submission;
}

export function ReviewForm({ submission }: ReviewFormProps) {
  const { user } = useAuth(); // Get the logged-in supervisor
  const { toast } = useToast();
  const router = useRouter();

  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [grade, setGrade] = useState(submission.grade || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if the submission has already been reviewed
  const isReviewed = submission.status === 'Reviewed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback || !grade || !user) {
      toast({
        title: "Missing Fields",
        description: "Please provide both feedback and a grade.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback, grade }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback.");
      }

      toast({
        title: "Feedback Submitted!",
        description: "The student has been notified of your review.",
      });
      
      // Refresh the page to show the updated status
      router.refresh();

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supervisor Review</CardTitle>
        <CardDescription>
          Provide feedback and a grade for this submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              rows={10}
              placeholder="Provide constructive feedback on the submission..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              disabled={isReviewed || isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select value={grade} onValueChange={setGrade} required disabled={isReviewed || isSubmitting}>
              <SelectTrigger id="grade" className="w-[180px]">
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                <SelectItem value="Unsatisfactory">Unsatisfactory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isReviewed || isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isReviewed ? 'Feedback Submitted' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}