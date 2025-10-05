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
import { useAuth } from "@/contexts/auth-context";

export default function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const response = await fetch('/api/submissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // If response is not ok, throw an error to be caught by the catch block
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch submissions');
        }
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : []; // Handle empty response
        setSubmissions(data.map((s: any) => ({ ...s, id: s._id.toString() })));
      } catch (error: any) {
        console.error("Failed to fetch submissions for dashboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-headline">Submissions Dashboard</h1>
          <p className="text-muted-foreground">Track and manage all student dissertations.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            An overview of the latest dissertation drafts and proposals from your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-8">
              <p>Error loading submissions:</p>
              <p>{error}</p>
            </div>
          ) : (
            <SubmissionsTable submissions={submissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}