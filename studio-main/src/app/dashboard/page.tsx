// src/app/dashboard/page.tsx
"use client";
// ... imports
import { useAuth } from "@/contexts/auth-context";

export default function Dashboard() {
  const { user, displayName } = useAuth(); // Destructure displayName
  // ... other state declarations
  
  // ... useEffect
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-headline">Submissions Dashboard</h1>
          {/* MODIFICATION: Use the displayName */}
          <p className="text-muted-foreground">
            Welcome, {displayName || 'Supervisor'}. Track and manage all student dissertations.
          </p>
        </div>
      </div>
      {/* ... rest of the component */}
    </div>
  );
}