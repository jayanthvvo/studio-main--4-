
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

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

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
          <SubmissionsTable submissions={submissions} />
        </CardContent>
      </Card>
    </div>
  );
}
