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

export default function AdminSettingsPage() {
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
        <h1 className="text-3xl font-bold font-headline">System Settings</h1>
        <p className="text-muted-foreground">
          Configure application-wide settings.
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage system-level configurations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">
                        Temporarily disable access to the application for all users except administrators.
                    </p>
                </div>
                <Switch id="maintenance-mode" />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="new-registrations">Allow New Registrations</Label>
                    <p className="text-xs text-muted-foreground">
                       Enable or disable new student and supervisor sign-ups.
                    </p>
                </div>
                <Switch id="new-registrations" defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                        Turn on or off all outgoing email notifications from the system.
                    </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
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
