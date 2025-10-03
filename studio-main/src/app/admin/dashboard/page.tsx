import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System-wide management and overview.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            This is the central control panel for ThesisFlow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            From here, you can manage users, oversee submissions, and configure system settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
