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
import { PlusCircle, CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch student-specific submissions from the new API route
        const submissionsRes = await fetch('/api/my-submissions', { headers });
        const submissionsData = await submissionsRes.json();
        // **FIX: Map _id to id**
        setSubmissions(submissionsData.map((s: any) => ({ ...s, id: s._id.toString() })));
        
        // Fetch student-specific milestones
        const milestonesRes = await fetch('/api/milestones', { headers }); // Assuming /api/milestones is also secured
        const milestonesData = await milestonesRes.json();
        // **FIX: Map _id to id**
        setMilestones(milestonesData.map((m: any) => ({ ...m, id: m._id.toString() })));

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);
  
  const upcomingMilestone = milestones.find(m => m.status === 'In Progress' || m.status === 'Pending');
  const showUpcomingDeadline = upcomingMilestone && (upcomingMilestone.status === 'In Progress' || (upcomingMilestone.status === 'Pending' && upcomingMilestone.dueDate !== 'TBD')) && !upcomingMilestone.submissionId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Track and manage your dissertation.
          </p>
        </div>
      </div>

       {showUpcomingDeadline && upcomingMilestone && (
        <Card className="bg-primary/10 border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <CalendarClock className="h-6 w-6" />
              Upcoming Deadline
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold">{upcomingMilestone.title}</p>
              <p className="text-lg text-muted-foreground">Due by {upcomingMilestone.dueDate}</p>
            </div>
            <Button asChild>
              <Link href="/student/submissions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Submission
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
          <CardDescription>
            An overview of your dissertation drafts and proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <StudentSubmissionsTable submissions={submissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}