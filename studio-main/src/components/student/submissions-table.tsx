// src/components/student/submissions-table.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Submission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// MODIFICATION: Add onDelete prop
interface SubmissionsTableProps {
  submissions: Submission[];
  onDelete: (submissionId: string) => Promise<void>;
}

export function StudentSubmissionsTable({ submissions, onDelete }: SubmissionsTableProps) {
  const router = useRouter();

  if (submissions.length === 0) {
    return <p className="text-center text-muted-foreground p-4">You have not made any submissions yet.</p>;
  }

  return (
    <AlertDialog>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted On</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {submissions.map((submission) => (
            <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.title}</TableCell>
                <TableCell>
                <Badge variant={submission.status === "Reviewed" ? "default" : "secondary"}>
                    {submission.status}
                </Badge>
                </TableCell>
                <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell>{submission.grade ?? "N/A"}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/student/submissions/${submission.id}`)}>
                            View Details
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            submission and revert the milestone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(submission.id)}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </AlertDialog>
  );
}