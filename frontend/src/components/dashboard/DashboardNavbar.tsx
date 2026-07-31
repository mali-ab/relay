import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardNavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export default function DashboardNavbar({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}: DashboardNavbarProps) {
  const { user } = useAuth();
  const isPro = user?.subscription === "pro";

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Открыть меню"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск курсов, занятий..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/70 border border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div> */}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
              isPro
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:opacity-95"
                : "bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPro ? "PRO" : "Улучшить"}</span>
          </Link>

          {/* <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            aria-label="Уведомления"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button> */}
        </div>
      </div>
    </header>
  );
}
