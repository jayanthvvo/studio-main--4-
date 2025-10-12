// src/app/dashboard/profile/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfilePage() {
  const { user, displayName, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (displayName) {
      setName(displayName);
    }
  }, [displayName]);

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!user) {
      setError("You must be logged in to save changes.");
      setIsSaving(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile.");
      }

      toast({
        title: "Profile Saved",
        description: "Your changes have been saved successfully.",
      });
      // The auth context will update automatically on the next page load or token refresh.
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Could not save your changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveChanges} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings.
        </p>
      </div>
       {error && (
          <Alert variant="destructive">
              <AlertTitle>Update Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled />
            </div>
          </CardContent>
        </Card>
      </div>
       <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Changes
      </Button>
    </form>
  );
}