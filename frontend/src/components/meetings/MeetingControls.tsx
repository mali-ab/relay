import { useState } from "react";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhoneXMarkIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface MeetingControlsProps {
  isAudioMuted: boolean;
  setIsAudioMuted: () => void;
  isVideoOff: boolean;
  setIsVideoOff: () => void;
  isScreenSharing: boolean;
  setIsScreenSharing: () => void;
  activeSidePanel: "chat" | "participants" | null;
  toggleSidePanel: (panel: "chat" | "participants") => void;
  onLeave?: () => void;
}

export default function MeetingControls({
  isAudioMuted,
  setIsAudioMuted,
  isVideoOff,
  setIsVideoOff,
  isScreenSharing,
  setIsScreenSharing,
  activeSidePanel,
  toggleSidePanel,
  onLeave,
}: MeetingControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Не удалось скопировать URL: ", err);
    }
  };

  const buttonClass =
    "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <footer className="flex h-20 items-center justify-between border-t border-slate-800/60 bg-[#020617]/90 px-4 backdrop-blur-lg sm:px-6 z-10">
      <div className="hidden w-1/4 items-center md:flex">
        <span className="font-mono text-xs text-slate-500">Relay v1.0</span>
      </div>

      <div className="mx-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleCopyUrl}
          aria-label="Копировать ссылку"
          title={copied ? "Скопировано!" : "Копировать ссылку"}
          className={`${buttonClass} ${
            copied
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800"
          }`}
        >
          {copied ? (
            <CheckIcon className="h-5 w-5 text-emerald-400" />
          ) : (
            <LinkIcon className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={setIsAudioMuted}
          aria-label={isAudioMuted ? "Включить микрофон" : "Выключить микрофон"}
          className={`${buttonClass} ${
            isAudioMuted
              ? "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              : "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={setIsVideoOff}
          aria-label={isVideoOff ? "Включить камеру" : "Выключить камеру"}
          className={`${buttonClass} ${
            isVideoOff
              ? "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              : "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <VideoCameraIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={setIsScreenSharing}
          aria-label={isScreenSharing ? "Остановить демонстрацию" : "Демонстрация экрана"}
          className={`${buttonClass} ${
            isScreenSharing
              ? "border-blue-500 bg-blue-600 text-white"
              : "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <ComputerDesktopIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-950/40 transition-all hover:bg-rose-700"
        >
          <PhoneXMarkIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Покинуть</span>
        </button>
      </div>

      <div className="flex w-1/4 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => toggleSidePanel("participants")}
          aria-label="Участники"
          className={`rounded-xl border p-3 transition ${
            activeSidePanel === "participants"
              ? "border-blue-500 bg-blue-600/20 text-blue-400"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserGroupIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => toggleSidePanel("chat")}
          aria-label="Чат"
          className={`rounded-xl border p-3 transition ${
            activeSidePanel === "chat"
              ? "border-blue-500 bg-blue-600/20 text-blue-400"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
}
