import { BookOpen } from "lucide-react";

export default function Courses() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Мои курсы</h1>
      <p className="text-slate-500 mt-2">Просматривайте свои курсы и отслеживайте прогресс.</p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Курс {i}</h3>
            <p className="text-sm text-slate-500 mt-1">Описание курса.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

