"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, AlertCircle, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Submission } from "@/lib/types";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const statusInfo: { [key: string]: { icon: React.ElementType, variant: "default" | "secondary" | "destructive" | "outline" } } = {
  Approved: { icon: CheckCircle, variant: "default" },
  "In Review": { icon: FileSearch, variant: "secondary" },
  "Requires Revisions": { icon: AlertCircle, variant: "destructive" },
  Pending: { icon: Clock, variant: "outline" },
  Reviewed: { icon: CheckCircle, variant: "default" },
  Complete: { icon: CheckCircle, variant: "default" },
};

export function StudentSubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();

  const handleViewSubmission = (id: string) => {
    router.push(`/student/submissions/${id}`);
  };


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead className="text-right">Grade</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => {
          const statusConfig = statusInfo[submission.status] || { icon: Clock, variant: 'outline' };
          return (
            <TableRow
              key={submission.id}
            >
              <TableCell>
                <div className="font-medium">{submission.title}</div>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig.variant} className="gap-1">
                  {React.createElement(statusConfig.icon, { className: "h-3 w-3" })}
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell>
                {submission.deadline}
              </TableCell>
              <TableCell className="text-right">
                {submission.grade || "-"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => handleViewSubmission(submission.id)}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}