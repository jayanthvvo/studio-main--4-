"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submissions as initialSubmissions } from "@/lib/data";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { useState } from "react";
import type { Submission } from "@/lib/types";

export default function Dashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

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
            An overview of the latest dissertation drafts and proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionsTable submissions={submissions} />
        </CardContent>
      </Card>
    </div>
  );
}
