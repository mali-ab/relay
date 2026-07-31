import { XMarkIcon, MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

interface Participant {
  id: string | number;
  name: string;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isVideoOff?: boolean;
  isAudioMuted?: boolean;
}

interface ParticipantsSidebarProps {
  participants?: Participant[];
  onClose: () => void;
}

export default function ParticipantsSidebar({
  participants = [],
  onClose,
}: ParticipantsSidebarProps) {
  return (
    <aside className="w-80 h-full bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden transition-all duration-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-slate-200 text-sm">Участники</h3>
          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-full font-mono">
            {participants.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-2 overflow-y-auto space-y-1">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/50 transition border border-transparent hover:border-slate-800"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                {p.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                {p.name}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-400">
              <MicrophoneIcon
                className={`w-4 h-4 ${p.isAudioMuted ? "text-rose-500" : "text-slate-400"}`}
              />
              <VideoCameraIcon
                className={`w-4 h-4 ${p.isVideoOff ? "text-rose-500" : "text-slate-400"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
