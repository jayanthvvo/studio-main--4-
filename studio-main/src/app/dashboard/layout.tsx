// src/app/dashboard/layout.tsx
import SupervisorAppSidebar from "@/components/layout/supervisor/sidebar";
import SupervisorHeader from "@/components/layout/supervisor/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/contexts/auth-context";
import Script from "next/script"; // <-- 1. Import the Script component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="supervisor">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <SupervisorAppSidebar />
          <SidebarInset className="bg-background">
              <SupervisorHeader />
              <main className="flex-1 p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* --- 2. ADD THESE SCRIPT TAGS --- */}
      {/* This loads the main pdf.js library */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js" 
        strategy="afterInteractive" 
      />
      {/* This sets the worker path, just like in your HTML file */}
      <Script id="pdf-worker-setup" strategy="afterInteractive">
        {`
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
          }
        `}
      </Script>
      {/* --- END OF ADDITION --- */}

    </ProtectedRoute>
  );
}