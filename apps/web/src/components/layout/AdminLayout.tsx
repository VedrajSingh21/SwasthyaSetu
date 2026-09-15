import { Outlet, Link } from "react-router-dom";
import { Activity, BarChart3, AlertTriangle } from "lucide-react";

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold tracking-tight text-white">District Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/admin/bottlenecks" className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white font-medium">
            <AlertTriangle className="w-5 h-5" />
            Bottlenecks
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
