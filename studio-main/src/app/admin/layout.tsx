import AdminAppSidebar from "@/components/layout/admin/sidebar";
import AdminHeader from "@/components/layout/admin/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/contexts/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminAppSidebar />
          <SidebarInset className="bg-background">
              <AdminHeader />
              <main className="flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
