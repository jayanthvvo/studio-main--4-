"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentSubmissionsTable } from "@/components/student/submissions-table";
import { useState, useEffect } from "react";
import type { Submission, Milestone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, BookCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Separator } from "@/components/ui/separator";

export default function StudentDashboardPage() {
  const { user, displayName } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch both milestones and submissions
        const [milestonesRes, submissionsRes] = await Promise.all([
            fetch("/api/milestones", { headers }),
            fetch("/api/my-submissions", { headers })
        ]);

        if (!milestonesRes.ok) {
          const errorData = await milestonesRes.json();
          throw new Error(errorData.error || "Failed to fetch milestones.");
        }
        const milestonesData = await milestonesRes.json();
        setMilestones(
          milestonesData.map((m: any) => ({ ...m, id: m._id.toString() }))
        );

        if (!submissionsRes.ok) {
          const errorData = await submissionsRes.json();
          throw new Error(errorData.error || "Failed to fetch submissions.");
        }
        const submissionsData = await submissionsRes.json();
        setSubmissions(
          submissionsData.map((s: any) => ({ ...s, id: s._id.toString() }))
        );

      } catch (error: any)
      {
        console.error("Failed to fetch dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- MODIFICATION: New filtering logic ---
  // An actionable milestone is one that is 'In Progress' and has a set due date.
  const actionableMilestone = milestones.find(
    (m) => m.status === "In Progress" && m.dueDate !== "TBD"
  );

  // Completed milestones are those with a 'Complete' status.
  const completedMilestones = milestones.filter(
    (m) => m.status === "Complete"
  );
  // --- END MODIFICATION ---

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {displayName || "Student"}. Track and manage your
            dissertation.
          </p>
        </div>
      </div>

      {/* --- MODIFICATION: This card now ONLY shows the current actionable milestone --- */}
      {actionableMilestone && (
        <Card className="bg-primary/10 border-primary/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                    <BookCheck className="h-6 w-6" />
                    Next Milestone
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-semibold">{actionableMilestone.title}</p>
                        <p className="text-lg text-muted-foreground">
                            Due by {actionableMilestone.dueDate}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/student/submissions/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Submit Now
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}
      {/* --- END MODIFICATION --- */}


      {/* --- MODIFICATION: New card for COMPLETED milestones --- */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Completed Milestones
            </CardTitle>
            <CardDescription>
                You have successfully submitted the following milestones.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : completedMilestones.length > 0 ? (
                <div className="space-y-4">
                    {completedMilestones.map((milestone, index) => (
                        <div key={milestone.id}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-green-600">{milestone.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Submitted and accepted.
                                    </p>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href={`/student/submissions/${milestone.submissionId}`}>
                                        View Submission
                                    </Link>
                                </Button>
                            </div>
                            {index < completedMilestones.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground p-4">
                    You have not submitted any milestones yet.
                </p>
            )}
        </CardContent>
      </Card>
      {/* --- END MODIFICATION --- */}


      <Card>
        <CardHeader>
          <CardTitle>Your Submission History</CardTitle>
          <CardDescription>
            An overview of all your past dissertation drafts and proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">
              <p>Could not load your submissions.</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <StudentSubmissionsTable submissions={submissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}