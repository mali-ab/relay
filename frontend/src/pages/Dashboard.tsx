import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import api from "../lib/axios";
import { useAuth } from "../contexts/AuthContext";

import {
  VideoCameraIcon,
  PlusIcon,
  LinkIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export type ActivityType =
  | "join"
  | "leave"
  | "completed"
  | "scheduled"
  | "cancelled";

export interface ActivityItem {
  id: string | number;
  title: string;
  roomName: string;
  time: string;
  type: ActivityType;
}

interface RawMeetingResponse {
  id?: number | string;
  title?: string;
  room_name?: string;
  created_at?: string;
  Type?: ActivityType;
}

interface RawMeetingsListResponse {
  meetings: RawMeetingResponse[];
}

const getActivityConfig = (type: ActivityType) => {
  switch (type) {
    case "join":
      return {
        icon: VideoCameraIcon,
        bg: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      };
    case "leave":
      return {
        icon: ArrowLeftOnRectangleIcon,
        bg: "bg-rose-50 text-rose-600 border-rose-200/60",
      };
    case "scheduled":
      return {
        icon: ClockIcon,
        bg: "bg-amber-50 text-amber-600 border-amber-200/60",
      };
    default:
      return {
        icon: VideoCameraIcon,
        bg: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
      };
  }
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.name ?? "Преподаватель";

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (signal?: AbortSignal) => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<RawMeetingsListResponse>(`/meetings/my`, {
          signal,
        });
        const items = response.data?.meetings || [];

        const mapped: ActivityItem[] = items.map((item, index) => ({
          id: item.id ?? `meeting-${index}`,
          title: item.title || item.room_name || "Классная встреча",
          roomName: item.room_name || "Основная комната",
          time: item.created_at
            ? new Date(item.created_at).toLocaleDateString("ru-RU", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Недавно",
          type: item.Type || "completed",
        }));

        setRecentActivities(mapped);
      } catch (err: any) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          setError("Не удалось загрузить историю активности.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchActivities(controller.signal);
    return () => controller.abort();
  }, [fetchActivities]);

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10 -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Панель управления
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              С возвращением, {displayName}
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Создавайте встречи, приглашайте студентов и управляйте своим
              онлайн-классом без усилий.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <NavLink
                to="/create-meeting"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm hover:shadow transition duration-200 active:scale-95"
              >
                <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                Создать встречу
              </NavLink>

              <NavLink
                to="/join-meeting"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 px-5 py-3 rounded-xl font-semibold transition duration-200 active:scale-95"
              >
                <LinkIcon className="w-5 h-5 stroke-[2]" />
                Присоединиться
              </NavLink>
            </div>
          </div>

          <div className="hidden sm:flex shrink-0 items-center justify-center p-5">
            <img
              src="/logo.svg"
              alt="Логотип"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Недавняя активность
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Сводка последних занятий в классе
            </p>
          </div>

          {recentActivities.length > 0 && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
              {recentActivities.length} записей
            </span>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-100/80 rounded-2xl w-full animate-pulse border border-slate-100"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 p-4 text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && recentActivities.length === 0 && (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/40">
            <div className="w-12 h-12 bg-white rounded-full border border-slate-200/80 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ClockIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Нет недавней активности
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Встречи и живые занятия будут автоматически отображаться здесь
              после их начала.
            </p>
          </div>
        )}

        {!isLoading && !error && recentActivities.length > 0 && (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {recentActivities.map((activity) => {
              const config = getActivityConfig(activity.type);
              const IconComponent = config.icon;

              return (
                <div
                  key={activity.id}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className={`p-3 rounded-xl border shrink-0 ${config.bg}`}
                  >
                    <IconComponent className="w-5 h-5 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-semibold text-slate-900 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">
                        {activity.title}
                      </p>
                      <span className="text-xs text-slate-400 font-medium shrink-0">
                        {activity.time}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate">
                      Комната:{" "}
                      <span className="text-slate-700 font-semibold">
                        {activity.roomName}
                      </span>
                    </p>
                  </div>

                  <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
