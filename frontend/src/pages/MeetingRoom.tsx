import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useJitsiRoom } from "../contexts/JitsiRoomContext";

export default function MeetingRoom() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const endMeetingCalledRef = useRef(false);

  const {
    isConnected,
    conferenceError,
    kickedOut,
    joinConference,
    leaveConference,
    containerRef,
    setOnLeaveConference,
  } = useJitsiRoom();

  const [roomName, setRoomName] = useState<string>(
    id ? decodeURIComponent(id) : "Комната Relay",
  );
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => user?.name || "Вы", [user]);

  useEffect(() => {
    const roomId = id ? decodeURIComponent(id) : "";
    if (!roomId) {
      setError("Не указан идентификатор комнаты.");
      return;
    }
    let isActive = true;

    const loadMeeting = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/meetings/join/${roomId}`);
        if (!isActive) return;

        if (response.data?.join_url) setJoinUrl(response.data.join_url);
        if (response.data?.meeting?.room_name)
          setRoomName(response.data.meeting.room_name);
        else if (response.data?.server_url)
          setJoinUrl(response.data.server_url + "/" + roomId);
      } catch (err: unknown) {
        if (!isActive) return;

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            navigate("/404", { replace: true });
            return;
          }
          if (err.response?.status === 410) {
            setError("Эта встреча уже завершена.");
            return;
          }
        }

        setError("Не удалось подключиться к серверу видеоконференций.");
        setJoinUrl("https://meet.jit.si");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadMeeting();
    return () => {
      isActive = false;
      leaveConference();
    };
  }, [id, leaveConference]);

  useEffect(() => {
    if (!joinUrl || isConnected) return;
    joinConference({ roomName, displayName, url: joinUrl });
  }, [joinUrl, isConnected, roomName, displayName, joinConference]);

  // Register callback for when user clicks Jitsi's native hangup button
  useEffect(() => {
    setOnLeaveConference(() => {
      // Prevent double-call
      if (endMeetingCalledRef.current) return;
      endMeetingCalledRef.current = true;

      api
        .post(`/meetings/end/${encodeURIComponent(roomName)}`)
        .catch((err) => console.error("Failed to end meeting:", err))
        .finally(() => {
          navigate("/", { replace: true });
        });
    });

    return () => setOnLeaveConference(null);
  }, [roomName, navigate, setOnLeaveConference]);

  // Poll meeting status periodically. If the meeting has ended (410), leave immediately.
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await api.get(`/meetings/${encodeURIComponent(roomName)}/status`);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 410) {
          try {
            await api.post(`/meetings/end/${encodeURIComponent(roomName)}`);
          } finally {
            setError("Встреча была завершена организатором.");
            leaveConference();
            setTimeout(() => navigate("/", { replace: true }), 3000);
          }
        }
      }
    };

    const interval = window.setInterval(checkStatus, 5000);
    return () => window.clearInterval(interval);
  }, [roomName, leaveConference, navigate]);

  useEffect(() => {
    if (kickedOut) {
      navigate("/", { replace: true });
    }
  }, [kickedOut, navigate]);

  return (
    <div className="h-screen w-screen bg-[#020617] overflow-hidden">
      <div className="relative w-full h-full">
        <div
          ref={containerRef}
          id="jitsi-meet-container"
          className="absolute inset-0 w-full h-full"
        />

        {error && (
          <div className="absolute top-4 left-4 right-4 z-30 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}
        {conferenceError && (
          <div className="absolute top-4 left-4 right-4 z-30 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {conferenceError}
          </div>
        )}

        {loading && !isConnected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm">
            <div className="text-sm text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Подключение к комнате...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

