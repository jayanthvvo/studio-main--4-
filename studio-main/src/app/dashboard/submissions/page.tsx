"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { useState, useEffect } from "react";
import type { Submission } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/submissions');
        const data = await response.json();
        // **FIX: Map _id to id for the frontend components**
        setSubmissions(data.map((s: any) => ({ ...s, id: s._id.toString() })));
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold font-headline">All Submissions</h1>
        <p className="text-muted-foreground">Track and manage all student dissertations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            An overview of all dissertation drafts and proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SubmissionsTable submissions={submissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}