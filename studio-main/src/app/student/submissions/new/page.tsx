'use client';

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
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function NewSubmissionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth(); // Get the authenticated user

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !user) return;
    
    setIsLoading(true);

    try {
        const token = await user.getIdToken();
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, deadline: "TBD" }), // You can enhance this to get a real deadline
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to create submission.");
        }

        toast({
          title: "Submission Successful!",
          description: `Your draft "${title}" has been submitted.`,
        });

        router.push("/student/dashboard");

    } catch (error: any) {
        toast({
            title: "Submission Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <Link href="/student/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>New Submission</CardTitle>
          <CardDescription>
            Submit your draft for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Chapter 1: Introduction Draft"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit for Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}