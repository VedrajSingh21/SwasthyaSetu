import { Outlet, Link } from "react-router-dom";
import { Activity } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white group-hover:bg-teal-700 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-800">SwasthyaSetu</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Login
            </Link>
            <Link to="/login" className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">
              Start as Patient
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-100 py-8 bg-slate-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SwasthyaSetu. Care Orchestration.
        </div>
      </footer>
    </div>
  );
}
