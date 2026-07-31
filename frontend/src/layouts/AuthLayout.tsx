import { type ReactNode } from "react";
import { Video, VideoOff } from "lucide-react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center">
        <div className="text-center px-8">
          <img src="/logo.svg" className="w-40 p-4 inline-block" />
          <h1 className="text-4xl sm:text-5xl font-bold mt-6 tracking-tight">
            Relay
          </h1>
          <p className="mt-4 text-blue-100 text-lg sm:text-xl font-medium">
            Платформа для видеоконференций и онлайн-обучения
          </p>
          <div className="mt-8 flex justify-center gap-3 text-sm text-blue-200">
            <span className="bg-white/10 px-4 py-2 rounded-full">🚀 Видеосвязь</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">📚 Обучение</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🤝 Совместная работа</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        {children}
      </div>
    </div>
  );
}
