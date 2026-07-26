import { useState } from "react";
import {
  ArrowPathIcon,
  SparklesIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import type { CreateMeetingPayload } from "../../types/meeting";
import { useAuth } from "../../contexts/AuthContext";

interface MeetingFormProps {
  onSubmit: (data: CreateMeetingPayload) => void;
  isLoading?: boolean;
}

export default function MeetingForm({
  onSubmit,
  isLoading = false,
}: MeetingFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState<string>("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");

  const isPro = user?.subscription === "pro";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: CreateMeetingPayload = {
      creator_id: Number(user!.id),
      title: title.trim(),
    };

    if (isScheduled && scheduledDate && scheduledTime) {
      payload.scheduled_at = new Date(
        `${scheduledDate}T${scheduledTime}`
      ).toISOString();
    }

    onSubmit(payload);
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <img className="h-18" src="/logo.svg" alt="Logo" />
          <h1 className="text-3xl font-bold text-gray-900">Создать встречу</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Создайте новую онлайн-встречу за несколько секунд
          </p>
        </div>

        <div className="bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl border border-blue-100/50 overflow-hidden mb-6">
          <div className="bg-blue-600/5 px-4 py-2 border-b border-blue-100/30">
            <span className="text-xs font-semibold text-blue-700 tracking-wide">
              ТАРИФ
            </span>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-slate-200 p-1.5 rounded-lg">
                    <BoltIcon className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800">
                  {isPro ? "Pro-тариф" : "Бесплатный тариф"}
                </span>
              </div>

              {!isPro && (
                <Link
                  to="/pricing"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Улучшить
                </Link>
              )}
              {isPro && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Активен
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs">
                <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Длительность</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  {isPro ? (
                    <>
                      <span className="text-slate-400 line-through text-[11px]">30 мин</span>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                        Безлимитно
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-slate-700">Макс. 30 мин</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <UserGroupIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Участники</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  {isPro ? (
                    <>
                      <span className="text-slate-400 line-through text-[11px]">5</span>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                        До 30
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-slate-700">До 5</span>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Участники</span>
                  <span>{isPro ? "Макс. 30" : "Макс. 5"}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPro ? "w-full bg-blue-500" : "w-1/6 bg-slate-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Название встречи
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="Например: Урок математики"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          {isPro && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span>Длительность встречи</span>
                </div>
              </label>
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 px-4 py-3 flex items-center gap-2.5">
                <div className="bg-blue-100 p-1 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-700">
                    Безлимитная длительность
                  </span>
                  <p className="text-[11px] text-blue-500/70">
                    Без ограничений по времени на Pro-тарифе
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                  <span>Запланировать</span>
                </div>
              </label>
              <button
                type="button"
                disabled={isLoading}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isScheduled ? "bg-blue-600" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={isScheduled}
                onClick={() => setIsScheduled(!isScheduled)}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    isScheduled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isScheduled ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Дата
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={isLoading}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Время
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-2.5 mt-2">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <BoltIcon className="w-3.5 h-3.5" />
                  Встреча начнётся сразу
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Создание...</span>
              </>
            ) : (
              <span>{isScheduled ? "Запланировать встречу" : "Создать встречу"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
