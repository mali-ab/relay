import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useJitsiRoom } from "../contexts/JitsiRoomContext";

import MeetingHeader from "../components/meetings/MeetingHeader";
import MeetingControls from "../components/meetings/MeetingControls";
import ChatSidebar from "../components/meetings/ChatSidebar";
import ParticipantsSidebar from "../components/meetings/ParticipantsSidebar";

interface Participant {
  id: number | string;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff: boolean;
  isAudioMuted: boolean;
  isScreenSharing: boolean;
}

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

export default function MeetingRoom() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    participants: jitsiParticipants,
    localParticipantId,
    isConnected,
    conferenceError,
    kickedOut,
    joinConference,
    leaveConference,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isAudioMuted: jitsiAudioMuted,
    isVideoOff: jitsiVideoOff,
    isScreenSharing: jitsiScreenSharing,
    containerRef,
  } = useJitsiRoom();

  const [activeSidePanel, setActiveSidePanel] = useState<
    "chat" | "participants" | null
  >(null);

  // Local chat state (decoupled from Jitsi)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messageIdCounter = useRef(0);

  const sendChatMessage = useCallback((text: string) => {
    const id = ++messageIdCounter.current;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setChatMessages((prev) => [
      ...prev,
      { id, sender: "You", text, time, isSelf: true },
    ]);
  }, []);
  const [roomName, setRoomName] = useState<string>(
    id ? decodeURIComponent(id) : "Комната Relay",
  );
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const joinAttemptedRef = useRef(false);

  const displayName = useMemo(() => user?.name || "Вы", [user]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setDurationSeconds((prev) => prev + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

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

        if (response.data?.join_url)
          setJoinUrl(response.data.join_url);
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

  // Poll meeting status periodically. If the meeting has ended (410), leave immediately.
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await api.get(`/meetings/${encodeURIComponent(roomName)}/status`);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 410) {
          await api.post(`/meetings/end/${encodeURIComponent(roomName)}`);
          setError("Встреча была завершена организатором.");
          leaveConference();
          setTimeout(() => navigate("/", { replace: true }), 3000);
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

  const currentParticipants = useMemo<Participant[]>(() => {
    return jitsiParticipants.map((jp) => ({
      id: jp.id,
      name:
        jp.displayName ||
        (jp.id === localParticipantId ? displayName : "Гость"),
      isSelf: jp.id === localParticipantId,
      isSpeaking: false,
      isVideoOff: jp.isVideoOff,
      isAudioMuted: jp.isAudioMuted,
      isScreenSharing: jp.isScreenSharing,
    }));
  }, [jitsiParticipants, localParticipantId, displayName]);

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col overflow-hidden select-none">
      <MeetingHeader
        roomName={roomName}
        duration={(() => {
          const m = Math.floor((durationSeconds % 3600) / 60);
          const s = durationSeconds % 60;
          return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        })()}
        participantCount={currentParticipants.length}
        role="Участник"
        isSpeaking={!jitsiAudioMuted}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={containerRef}
          id="jitsi-meet-container"
          className="absolute inset-0 w-full h-full"
        />

        <div className="absolute top-4 left-6 z-10 pointer-events-none flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Relay Logo"
            className="h-20 w-auto object-contain drop-shadow-md"
          />
        </div>

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

        <div className="absolute top-0 right-0 h-full z-30 p-4">
          {activeSidePanel === "chat" && (
            <ChatSidebar
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              onClose={() => setActiveSidePanel(null)}
            />
          )}

          {activeSidePanel === "participants" && (
            <ParticipantsSidebar
              participants={currentParticipants as any}
              onClose={() => setActiveSidePanel(null)}
            />
          )}
        </div>
      </div>

      <MeetingControls
        isAudioMuted={jitsiAudioMuted}
        setIsAudioMuted={toggleAudio}
        isVideoOff={jitsiVideoOff}
        setIsVideoOff={toggleVideo}
        isScreenSharing={jitsiScreenSharing}
        setIsScreenSharing={toggleScreenShare}
        activeSidePanel={activeSidePanel}
        toggleSidePanel={(panel) =>
          setActiveSidePanel((prev) => (prev === panel ? null : panel))
        }
        onLeave={async () => {
          try {
            await api.post(`/meetings/end/${encodeURIComponent(roomName)}`);
          } catch (err) {
            console.error("Failed to end meeting:", err);
          }
          leaveConference();
          navigate("/");
        }}
      />
    </div>
  );
}
