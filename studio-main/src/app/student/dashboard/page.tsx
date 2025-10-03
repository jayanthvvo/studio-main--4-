
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submissions as initialSubmissions, getMilestonesByStudent } from "@/lib/data";
import { StudentSubmissionsTable } from "@/components/student/submissions-table";
import { useState, useEffect } from "react";
import type { Submission, Milestone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  // For this example, we'll filter submissions for a specific student.
  // In a real app, this would be based on the logged-in user.
  const studentName = "Alice Johnson";
  const [submissions, setSubmissions] = useState<Submission[]>(
    initialSubmissions.filter((s) => s.student.name === studentName)
  );
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  
  useEffect(() => {
    setMilestones(getMilestonesByStudent(studentName));
  }, [studentName]);
  
  const upcomingMilestone = milestones.find(m => m.status === 'In Progress' || m.status === 'Pending');
  const showUpcomingDeadline = upcomingMilestone && (upcomingMilestone.status === 'In Progress' || (upcomingMilestone.status === 'Pending' && upcomingMilestone.dueDate !== 'TBD')) && !upcomingMilestone.submissionId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {studentName}. Track and manage your dissertation.
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
          <StudentSubmissionsTable submissions={submissions} />
        </CardContent>
      </Card>
    </div>
  );
}
