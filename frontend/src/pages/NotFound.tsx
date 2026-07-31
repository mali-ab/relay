import { Link } from "react-router-dom";
import { HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 selection:bg-blue-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-md w-full text-center bg-white/80 backdrop-blur-xl border border-slate-200/80 p-8 md:p-12 rounded-2xl shadow-xl shadow-slate-200/50 transition-all duration-300 hover:border-slate-300">
        <div className="mx-auto w-16 h-16 bg-amber-50 border border-amber-200/80 flex items-center justify-center rounded-2xl mb-6 shadow-sm animate-pulse">
          <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
        </div>

        <h1 className="text-7xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-900 tracking-wide mb-3">
          Страница или встреча не найдена
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          Возможно, ссылка устарела, была повреждена или сессия была завершена организатором. Проверьте URL-адрес комнаты и попробуйте снова.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition duration-200 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
