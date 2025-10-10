"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Milestone } from "@/lib/types";
import { useState, useEffect } from "react";
import { CheckCircle, Clock, Circle, Loader2, CalendarPlus, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const statusInfo = {
  Complete: { icon: CheckCircle, color: 'text-green-500' },
  'In Progress': { icon: Loader2, color: 'text-blue-500' },
  Pending: { icon: Clock, color: 'text-yellow-500' },
  Upcoming: { icon: Circle, color: 'text-muted-foreground' },
};

interface StudentProfile {
    _id: string;
    displayName: string;
    avatarUrl?: string;
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const selectedStudent = students.find(s => s._id === selectedStudentId);
  const firstIncompleteIndex = milestones.findIndex(m => m.status !== 'Complete');

  useEffect(() => {
    if (!user) return;
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/my-students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Could not fetch your students.");
            const data = await response.json();
            setStudents(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchStudents();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedStudentId) {
        setMilestones([]);
        return;
    };

    const fetchMilestones = async () => {
      try {
        setLoadingMilestones(true);
        setError(null);
        const token = await user.getIdToken();
        const response = await fetch(`/api/milestones?studentId=${selectedStudentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch milestones");
        }
        
        const data = await response.json();
        setMilestones(data.map((m: any) => ({ ...m, id: m._id.toString() })));

      } catch (error: any) {
        console.error(error);
        setError(error.message);
        toast({ title: "Error", description: "Could not load timeline data.", variant: "destructive" });
      } finally {
        setLoadingMilestones(false);
      }
    };

    fetchMilestones();
  }, [user, selectedStudentId, toast]);

  const handleUpdateDueDate = async (milestoneId: string) => {
    if (!selectedDate || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ milestoneId, dueDate: format(selectedDate, 'yyyy-MM-dd') }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update due date.");
      }
      
      toast({
        title: "Due Date Updated",
        description: `The milestone due date has been successfully set.`,
      });
      
      const refetchResponse = await fetch(`/api/milestones?studentId=${selectedStudentId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const refetchedData = await refetchResponse.json();
      setMilestones(refetchedData.map((m: any) => ({ ...m, id: m._id.toString() })));
      
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setOpenPopoverId(null);
      setSelectedDate(undefined);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Dissertation Timeline</h1>
                <p className="text-muted-foreground">Select a student to view and manage their progress.</p>
            </div>
            <div className="w-full sm:w-auto min-w-64">
                <Label htmlFor="student-select" className="sr-only">Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger id="student-select" className="w-full">
                        <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {loading ? (
                             <SelectItem value="loading" disabled>Loading students...</SelectItem>
                        ) : students.length > 0 ? (
                            students.map(student => (
                                <SelectItem key={student._id} value={student._id}>
                                    {student.displayName}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="none" disabled>No students assigned.</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
       </div>

      {selectedStudent && (
        <>
            <div className="flex items-center gap-4 pt-4">
                <Image 
                    src={selectedStudent.avatarUrl || `https://picsum.photos/seed/${selectedStudent._id}/100/100`} 
                    alt={selectedStudent.displayName} 
                    width={64} 
                    height={64} 
                    className="rounded-full" 
                />
                <div>
                    <h2 className="text-2xl font-bold font-headline">{selectedStudent.displayName}</h2>
                    <p className="text-muted-foreground">Managing Timeline</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                    <CardDescription>
                    Set due dates for the student's upcoming milestones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                {loadingMilestones ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 p-4 text-center">{error}</div>
                ) : (
                    <div className="relative pl-6">
                        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-border"></div>
                        <div className="space-y-8">
                            {milestones.map((milestone, index) => {
                                const StatusIcon = statusInfo[milestone.status]?.icon || Circle;
                                const statusColor = statusInfo[milestone.status]?.color || 'text-muted-foreground';
                                const isNextActionableItem = index === firstIncompleteIndex;

                                // --- THIS IS THE CRUCIAL SECTION THAT RENDERS THE BUTTONS ---
                                return (
                                    <div key={milestone.id} className="relative flex items-start">
                                        <div className="absolute left-0 top-1 flex items-center justify-center -translate-x-1/2">
                                            <div className={cn("h-6 w-6 rounded-full bg-background flex items-center justify-center")}>
                                                <StatusIcon className={cn("h-8 w-8 p-1 rounded-full bg-background", statusColor, milestone.status === 'In Progress' && 'animate-spin')} />
                                            </div>
                                        </div>
                                        <div className="ml-12 w-full">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-lg">{milestone.title}</p>
                                                    <p className="text-sm text-muted-foreground">Due: {milestone.dueDate}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {milestone.submissionId ? (
                                                        <Button variant="outline" size="sm" onClick={() => router.push(`/submissions/${milestone.submissionId}`)}>View Submission</Button>
                                                    ) : (
                                                        <Button variant="secondary" size="sm" disabled>Not Submitted</Button>
                                                    )}
                                                    
                                                    <Popover open={openPopoverId === milestone.id} onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? milestone.id : null)}>
                                                        <PopoverTrigger asChild>
                                                            <Button size="sm" disabled={!isNextActionableItem}>Set Due Date</Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                                                            <div className="p-2 border-t flex justify-end">
                                                                <Button size="sm" onClick={() => handleUpdateDueDate(milestone.id)} disabled={!selectedDate}>Update</Button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                                // --- END OF CRUCIAL SECTION ---
                            })}
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}