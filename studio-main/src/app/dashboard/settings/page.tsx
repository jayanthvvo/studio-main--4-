"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification settings.
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="new-submission-email">New Submissions</Label>
                    <p className="text-xs text-muted-foreground">
                        Receive an email when a student submits a new draft.
                    </p>
                </div>
                <Switch id="new-submission-email" defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="feedback-reminder-email">Feedback Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                        Get reminded about pending submissions that need your review.
                    </p>
                </div>
                <Switch id="feedback-reminder-email" defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="weekly-summary-email">Weekly Summary</Label>
                    <p className="text-xs text-muted-foreground">
                        Receive a weekly summary of all submission activities.
                    </p>
                </div>
                <Switch id="weekly-summary-email" />
            </div>
          </CardContent>
        </Card>
      </div>
       <Button onClick={handleSaveChanges}>
        <Save className="mr-2" />
        Save Changes
      </Button>
    </div>
  );
}
