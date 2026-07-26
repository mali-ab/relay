import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import MeetingForm from "../components/meetings/MeetingForm";
import api from "../lib/axios";
import type { CreateMeetingPayload, MeetingResponse, ApiErrorResponse } from "../types/meeting";

export default function CreateMeeting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMeeting = async (formData: CreateMeetingPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<MeetingResponse>("/meetings/create", formData);
      const roomName = response.data.meeting.room_name;
      navigate(`/meeting/${encodeURIComponent(roomName)}`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          "Не удалось создать встречу. Проверьте подключение к интернету и попробуйте снова."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-4">
          {error && (
            <div 
              role="alert" 
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-top-1"
            >
              <svg 
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 font-medium leading-relaxed">
                {error}
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 p-1 -mr-1 -mt-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                aria-label="Закрыть"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <MeetingForm onSubmit={handleCreateMeeting} isLoading={loading} />
        </div>
      </main>
    </div>
  );
}