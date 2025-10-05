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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export default function NewSubmissionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 16MB.",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the file input
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file || !user) return;
    
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const token = await user.getIdToken();
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content: base64String, deadline: "TBD", fileName: file.name, fileType: file.type }),
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
      };

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
            Upload your draft for review. The maximum file size is 16MB.
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
              <Label htmlFor="file">Submission File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                disabled={isLoading}
                accept=".pdf,.doc,.docx"
              />
            </div>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Submit for Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}