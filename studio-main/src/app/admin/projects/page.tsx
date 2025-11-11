// src/app/admin/projects/page.tsx
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, PlusCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
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

interface UserProfile {
    _id: string;
    uid: string;
    email: string;
    displayName: string;
    role: 'student' | 'supervisor' | 'admin';
}

interface DissertationProject {
    _id: string;
    title: string;
    student: {
        _id: string;
        name: string;
    } | null;
    supervisor: {
        _id: string;
        name: string;
    } | null;
    createdAt: string;
}

export default function AdminProjectsPage() {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [supervisors, setSupervisors] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<DissertationProject[]>([]);
  
  const [title, setTitle] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!adminUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await adminUser.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, dissertationsRes] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/dissertations', { headers }),
      ]);

      if (!usersRes.ok) throw new Error("Failed to fetch users.");
      if (!dissertationsRes.ok) throw new Error("Failed to fetch projects.");
      
      const allUsers: UserProfile[] = await usersRes.json();
      setStudents(allUsers.filter(u => u.role === 'student'));
      setSupervisors(allUsers.filter(u => u.role === 'supervisor'));

      const dissertationData: DissertationProject[] = await dissertationsRes.json();
      setProjects(dissertationData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, studentId: selectedStudentId, supervisorId: selectedSupervisorId }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to create project.");
        }
        toast({ title: "Success!", description: "The new dissertation project has been created and assigned." });
        setTitle("");
        setSelectedStudentId("");
        setSelectedSupervisorId("");
        fetchData(); // Refresh the projects list
    } catch (err: any) {
        setError(err.message);
    } finally {
        setSubmitting(false);
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!adminUser) return;
    setDeletingId(projectId);
    setError(null);

    try {
        const token = await adminUser.getIdToken();
        const response = await fetch(`/api/dissertations?id=${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete project.");
        }

        toast({ title: "Project Deleted", description: "The project and its milestones have been removed." });
        fetchData(); // Refresh the projects list
    } catch (err: any) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
        setDeletingId(null);
    }
  };

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
              <Input id="title" placeholder="e.g., A Study on AI-Powered Dissertation Management" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={submitting} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="student">Assign Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId} required disabled={submitting}>
                        <SelectTrigger id="student"><SelectValue placeholder="Select a student..." /></SelectTrigger>
                        <SelectContent>{students.map(student => (<SelectItem key={student._id} value={student._id}>{student.displayName} ({student.email})</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="supervisor">Assign Supervisor</Label>
                    <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId} required disabled={submitting}>
                        <SelectTrigger id="supervisor"><SelectValue placeholder="Select a supervisor..." /></SelectTrigger>
                        <SelectContent>{supervisors.map(supervisor => (<SelectItem key={supervisor._id} value={supervisor._id}>{supervisor.displayName} ({supervisor.email})</SelectItem>))}</SelectContent>
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
      
      <Card>
        <CardHeader>
            <CardTitle>Existing Projects</CardTitle>
            <CardDescription>A list of all dissertation projects currently in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
                // --- MODIFICATION: WRAPPED IN A FRAGMENT <>...</> ---
                <>
                    {/* --- COMMENTS MOVED HERE --- */}
                    {/* --- MODIFICATION: Removed Status Column --- */}
                    {/* --- END MODIFICATION --- */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project._id}>
                                    <TableCell className="font-medium">{project.title}</TableCell>
                                    <TableCell>{project.student?.name || 'Not Assigned'}</TableCell>
                                    <TableCell>{project.supervisor?.name || 'Not Assigned'}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    disabled={deletingId === project._id}
                                                >
                                                    {deletingId === project._id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the project
                                                        <strong className="mx-1">"{project.title}"</strong>
                                                        and all of its associated milestones.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteProject(project._id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}