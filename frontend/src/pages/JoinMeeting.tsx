import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/axios";
import type { AxiosError } from "axios";
import type { MeetingResponse, ApiErrorResponse } from "../types/meeting";
import {
  VideoCameraIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function JoinMeeting() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [meetingId, setMeetingId] = useState<string>(id || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to clean up raw input. Extracts room ID from full URLs if pasted.
   */
  const extractMeetingId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return "";

    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        const pathSegments = url.pathname.split("/").filter(Boolean);
        return pathSegments[pathSegments.length - 1] || trimmed;
      }
    } catch {
      // Fall through if URL parsing fails
    }

    return trimmed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingId(e.target.value);
    if (error) setError(null);
  };

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanId = extractMeetingId(meetingId);

    if (!cleanId) {
      setError("Пожалуйста, введите ID встречи или ссылку.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<MeetingResponse>(
        `/meetings/join/${cleanId}`,
      );
      const roomName = response.data.room.room_name;
      navigate(`/meeting/${encodeURIComponent(roomName)}`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status;
      const serverMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Не удалось подключиться к встрече.";

      setError(serverMessage);

      // If meeting is not found (404) or has ended (410), don't navigate to the room
      if (status === 404 || status === 410) {
        return;
      }

      // For other errors, fallback to direct room navigation
      navigate(`/meeting/${encodeURIComponent(cleanId)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50/50 flex flex-col justify-between selection:bg-blue-500 selection:text-white py-12">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
          {/* Header Icon & Titles */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-blue-500/10">
              <VideoCameraIcon className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              Присоединиться к встрече
            </h1>

            <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs">
              Введите ID встречи или вставьте прямую ссылку для подключения.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="meeting-id-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
              >
                ID встречи или ссылка
              </label>

              <div
                className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 transition-all duration-150 ${
                  error
                    ? "border-red-300 bg-red-50/30 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
                    : "border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
                }`}
              >
                <LinkIcon className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 shrink-0 transition-colors" />

                <input
                  id="meeting-id-input"
                  type="text"
                  value={meetingId}
                  onChange={handleInputChange}
                  disabled={loading}
                  aria-invalid={!!error}
                  aria-describedby={error ? "meeting-id-error" : undefined}
                  placeholder="например: math-class-101"
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium text-sm disabled:opacity-50"
                />

                {meetingId && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingId("");
                      setError(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    title="Очистить"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {error && (
                <div
                  id="meeting-id-error"
                  className="mt-2.5 flex items-start gap-2 text-red-600 text-xs font-medium animate-fadeIn"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !meetingId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all text-white py-3.5 px-6 rounded-2xl font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Подключение...</span>
                </div>
              ) : (
                <>
                  <span>Присоединиться</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Нужно создать новую встречу?{" "}
              <Link
                to="/create-meeting"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                Создать сессию
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
