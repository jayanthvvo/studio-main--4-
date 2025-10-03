"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { submissions, milestones } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function NewSubmissionPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const upcomingMilestone = milestones.find(m => m.status === 'In Progress');

  const [title, setTitle] = useState(upcomingMilestone?.title || "");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!upcomingMilestone) {
        toast({
            title: "No Upcoming Milestone",
            description: "There is no pending milestone to submit for.",
            variant: "destructive",
        });
        return;
    }

    const newSubmission = {
      id: (submissions.length + 1).toString(),
      student: {
        name: "Alice Johnson",
        avatarUrl: "https://picsum.photos/seed/1/100/100",
      },
      title,
      content,
      status: "In Review" as const,
      deadline: upcomingMilestone.dueDate,
      grade: null,
      submittedAt: new Date().toLocaleDateString('en-CA'),
      feedback: null,
    };

    submissions.unshift(newSubmission);

    const milestoneIndex = milestones.findIndex(m => m.id === upcomingMilestone.id);
    if(milestoneIndex !== -1) {
        milestones[milestoneIndex].status = "Complete";
        milestones[milestoneIndex].submissionId = newSubmission.id;
        
        // Make the next 'Upcoming' milestone 'Pending'
        const nextMilestoneIndex = milestones.findIndex(m => m.status === 'Upcoming');
        if(nextMilestoneIndex !== -1) {
            milestones[nextMilestoneIndex].status = 'Pending';
        }
    }


    toast({
      title: "Submission Successful!",
      description: `Your draft "${title}" has been submitted.`,
    });

    router.push("/student/dashboard");
  };

  return (
    <div className="space-y-6">
        <Link href="/student/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>New Submission for "{upcomingMilestone?.title}"</CardTitle>
          <CardDescription>
            Submit your draft for the deadline on {upcomingMilestone?.dueDate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter the title of your submission"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Paste the content of your dissertation draft here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={15}
              />
            </div>
            <Button type="submit" disabled={!upcomingMilestone}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
