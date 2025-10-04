
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Define a type for the user data we expect from the API
interface UserProfile {
    _id: string;
    uid: string;
    email: string;
    displayName: string;
    role: 'student' | 'supervisor' | 'admin';
}

export default function AdminProjectsPage() {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [supervisors, setSupervisors] = useState<UserProfile[]>([]);
  
  const [title, setTitle] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!adminUser) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await adminUser.getIdToken();
        const response = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch users.");
        }

        const allUsers: UserProfile[] = await response.json();
        setStudents(allUsers.filter(u => u.role === 'student'));
        setSupervisors(allUsers.filter(u => u.role === 'supervisor'));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [adminUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !selectedStudentId || !selectedSupervisorId || !adminUser) {
        toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive" });
        return;
    }

    setSubmitting(true);
    setError(null);

    try {
        const token = await adminUser.getIdToken();
        const response = await fetch('/api/dissertations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                studentId: selectedStudentId,
                supervisorId: selectedSupervisorId,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to create project.");
        }

        toast({ title: "Success!", description: "The new dissertation project has been created and assigned." });
        
        // Reset form
        setTitle("");
        setSelectedStudentId("");
        setSelectedSupervisorId("");

    } catch (err: any) {
        setError(err.message);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create & Assign New Project</CardTitle>
          <CardDescription>
            Create a new dissertation project and assign it to a student and a supervisor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>An Error Occurred</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Dissertation Title</Label>
              <Input
                id="title"
                placeholder="e.g., A Study on AI-Powered Dissertation Management"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="student">Assign Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId} required disabled={submitting}>
                        <SelectTrigger id="student">
                            <SelectValue placeholder="Select a student..." />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map(student => (
                                <SelectItem key={student._id} value={student._id}>
                                    {student.displayName} ({student.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="supervisor">Assign Supervisor</Label>
                    <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId} required disabled={submitting}>
                        <SelectTrigger id="supervisor">
                            <SelectValue placeholder="Select a supervisor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {supervisors.map(supervisor => (
                                <SelectItem key={supervisor._id} value={supervisor._id}>
                                    {supervisor.displayName} ({supervisor.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Create and Assign Project
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
