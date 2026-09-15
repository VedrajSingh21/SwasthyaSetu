import { Outlet, Link } from "react-router-dom";
import { Activity, Building, LayoutDashboard } from "lucide-react";

export function FacilityLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/facility/dashboard" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight text-slate-800">Facility Hub</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          <Link to="/facility/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/facility/referrals" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
            <Building className="w-5 h-5" />
            Referrals
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
               DH
             </div>
             <div>
               <div className="text-sm font-semibold">District Hospital</div>
               <div className="text-xs text-slate-500">Pune</div>
             </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 lg:px-12 md:hidden">
          <div className="font-bold text-lg text-slate-800">Facility Hub</div>
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
