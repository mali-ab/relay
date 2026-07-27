import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Video,
  FileText,
  Settings,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const mainNavItems = [
  { name: "Главная", icon: LayoutDashboard, path: "/" },
  // { name: "Курсы", icon: BookOpen, path: "/courses" },
  // { name: "Календарь", icon: Calendar, path: "/calendar" },
  // { name: "Живые классы", icon: Video, path: "/live" },
  // { name: "Задания", icon: FileText, path: "/assignments" },
];

const secondaryNavItems = [
  { name: "Подписка", icon: Sparkles, path: "/pricing", badge: "Pro" },
  { name: "Настройки", icon: Settings, path: "/settings" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isPro = user?.subscription === "pro";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen bg-white border-r border-slate-200 text-slate-600 transition-transform duration-300 ease-in-out select-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Relay Logo" className="w-9 h-9" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              <span className="text-blue-600">Relay</span>
            </span>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition-colors"
            aria-label="Закрыть меню"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Меню
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Аккаунт
            </p>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          active
                            ? "text-blue-600"
                            : item.badge
                            ? "text-amber-500"
                            : "text-slate-400"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && !isPro && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide bg-amber-50 text-amber-600 border border-amber-200/60 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {!isPro && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-amber-50/40 border border-blue-100/80">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Премиум-доступ</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Получите неограниченный доступ к живым классам, записям лекций и обратной связи от преподавателей.
              </p>
              <Link
                to="/pricing"
                onClick={onCloseMobile}
                className="block text-center w-full py-1.5 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
              >
                Улучшить тариф
              </Link>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || "Студент"}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.email || "student@relay.com"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Выйти"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
