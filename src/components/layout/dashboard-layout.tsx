
import { Outlet } from "react-router";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Navegación lateral */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Contenido principal */}
        <div className="min-w-0">
          <DashboardHeader />

          <main className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
