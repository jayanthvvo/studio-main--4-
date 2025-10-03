
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreHorizontal, CheckCircle, Clock, AlertCircle, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Submission } from "@/lib/types";
import { useMessaging } from "@/contexts/messaging-context";

const statusInfo: { [key: string]: { icon: React.ElementType, variant: "default" | "secondary" | "destructive" | "outline" } } = {
  Approved: { icon: CheckCircle, variant: "default" },
  "In Review": { icon: FileSearch, variant: "secondary" },
  "Requires Revisions": { icon: AlertCircle, variant: "destructive" },
  Pending: { icon: Clock, variant: "outline" },
};

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const { openChat } = useMessaging();

  const handleViewSubmission = (id: string) => {
    router.push(`/submissions/${id}`);
  };

  const handleMessageStudent = (e: React.MouseEvent) => {
    e.stopPropagation();
    openChat();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">Avatar</span>
          </TableHead>
          <TableHead>Student & Title</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Deadline</TableHead>
          <TableHead className="text-right">Grade</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow
            key={submission.id}
            className="cursor-pointer"
            onClick={() => handleViewSubmission(submission.id)}
          >
            <TableCell className="hidden sm:table-cell">
              <Image
                alt="Student avatar"
                className="aspect-square rounded-full object-cover"
                height="64"
                src={submission.student.avatarUrl}
                width="64"
                data-ai-hint="student portrait"
              />
            </TableCell>
            <TableCell>
              <div className="font-medium">{submission.student.name}</div>
              <div className="text-sm text-muted-foreground">
                {submission.title}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant={statusInfo[submission.status].variant} className="gap-1">
                {React.createElement(statusInfo[submission.status].icon, { className: "h-3 w-3" })}
                {submission.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {submission.deadline}
            </TableCell>
            <TableCell className="text-right">
              {submission.grade || "-"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() => handleViewSubmission(submission.id)}
                  >
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMessageStudent}>Message Student</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
