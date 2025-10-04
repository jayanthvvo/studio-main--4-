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
import { CheckCircle, Clock, Circle, Loader2, CalendarPlus } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const statusInfo = {
  Complete: { icon: CheckCircle, color: 'text-green-500' },
  'In Progress': { icon: Loader2, color: 'text-blue-500' },
  Pending: { icon: Clock, color: 'text-yellow-500' },
  Upcoming: { icon: Circle, color: 'text-muted-foreground' },
};

// This is the static template of milestones that will always be displayed.
const milestoneTemplate: Omit<Milestone, 'id'>[] = [
    { title: 'Dissertation Proposal', dueDate: 'TBD', status: 'Upcoming' },
    { title: 'Chapter 1: Introduction', dueDate: 'TBD', status: 'Upcoming' },
    { title: 'Chapter 2: Literature Review', dueDate: 'TBD', status: 'Upcoming' },
    { title: 'Chapter 3: Methodology', dueDate: 'TBD', status: 'Upcoming' },
    { title: 'Chapter 4: Results & Analysis', dueDate: 'TBD', status: 'Upcoming' },
    { title: 'Final Draft Submission', dueDate: 'TBD', status: 'Upcoming' },
];

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const studentName = "Alice Johnson"; // This would become dynamic
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/milestones');
      if (!response.ok) throw new Error("Failed to fetch milestones");
      const dbMilestones = await response.json();

      // Merge the static template with the dynamic data from the database
      const mergedMilestones = milestoneTemplate.map((templateItem, index) => {
        const dbItem = dbMilestones.find((db_item: any) => db_item.title === templateItem.title);
        if (dbItem) {
          // If a matching milestone is found in the DB, use its data
          return { ...templateItem, ...dbItem, id: dbItem._id.toString() };
        }
        // Otherwise, use the template item with a unique key
        return { ...templateItem, id: `template-${index}` };
      });

      setMilestones(mergedMilestones);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load timeline data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateDueDate = async (milestoneId: string, title: string) => {
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

      fetchMilestones(); 
      
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setOpenPopoverId(null);
      setSelectedDate(undefined);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
          <Image src="https://picsum.photos/seed/1/100/100" alt={studentName} width={64} height={64} className="rounded-full" />
          <div>
            <h1 className="text-3xl font-bold font-headline">Dissertation Timeline</h1>
            <p className="text-muted-foreground">For {studentName}</p>
          </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            A complete timeline of the dissertation process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-border"></div>
              <div className="space-y-8">
                {milestones.map((milestone) => {
                  const StatusIcon = statusInfo[milestone.status]?.icon || Circle;
                  const statusColor = statusInfo[milestone.status]?.color || 'text-muted-foreground';

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
                            {milestone.status !== 'Complete' && (
                              <Popover open={openPopoverId === milestone.id} onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? milestone.id : null)}>
                                <PopoverTrigger asChild>
                                  <Button size="sm" disabled={!milestone._id}>Set Due Date</Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                                  <div className="p-2 border-t flex justify-end">
                                    <Button size="sm" onClick={() => handleUpdateDueDate(milestone.id, milestone.title)} disabled={!selectedDate}>Update</Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}