import StudentHeader from "@/components/layout/student/header";
import { ProtectedRoute } from "@/contexts/auth-context";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex min-h-screen w-full flex-col">
          <StudentHeader />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
