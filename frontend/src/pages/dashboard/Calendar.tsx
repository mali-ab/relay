import { Calendar as CalendarIcon } from "lucide-react";

export default function Calendar() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Календарь</h1>
      <p className="text-slate-500 mt-2">Просматривайте запланированные занятия и события.</p>

      <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <CalendarIcon className="w-8 h-8" />
          <span className="text-lg">На этой неделе нет предстоящих событий.</span>
        </div>
      </div>
    </div>
  );
}

