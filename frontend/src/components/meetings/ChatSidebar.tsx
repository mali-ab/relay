import { useEffect, useRef, useState } from "react";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

export default function ChatSidebar({ messages, onSendMessage, onClose }: ChatSidebarProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    onSendMessage(inputMessage.trim());
    setInputMessage("");
  };

  return (
    <aside className="w-80 h-full bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden transition-all duration-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200 text-sm">Чат встречи</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 text-center text-xs text-slate-500">
            Пока нет сообщений. Начните разговор.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
            >
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-[11px] font-medium text-slate-400">{msg.sender}</span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                  msg.isSelf
                    ? "rounded-br-none bg-emerald-600 text-white"
                    : "rounded-bl-none border border-slate-700/60 bg-slate-800 text-slate-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Напишите сообщение..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center justify-center"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
}
