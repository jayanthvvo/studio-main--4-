"use client";

import { Submission, SubmissionStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const submissionStatuses: SubmissionStatus[] = ["Pending", "In Review", "Approved", "Requires Revisions"];

export default function ReviewForm({ submission, onSave }: { submission: Submission, onSave: (submission: Submission) => void }) {
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [grade, setGrade] = useState(submission.grade || "");
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSubmission: Submission = {
      ...submission,
      feedback,
      grade,
      status,
    };
    
    onSave(updatedSubmission);

    toast({
      title: "Review Saved!",
      description: "Your feedback, grade, and status have been saved successfully.",
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            placeholder="e.g., A-, B+"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: SubmissionStatus) => setStatus(value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
              {submissionStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Provide detailed feedback for the student..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={8}
        />
      </div>
      
      <Button type="submit">
        <Save className="mr-2 h-4 w-4" />
        Save Review
      </Button>
    </form>
  );
}
